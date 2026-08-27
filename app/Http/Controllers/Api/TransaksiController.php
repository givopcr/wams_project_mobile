<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\PeminjamanRequest;
use App\Http\Requests\Api\PengembalianRequest;
use App\Models\Barang;
use App\Models\BarangUnit;
use App\Models\Logbook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransaksiController extends Controller
{
    /**
     * Peminjaman Barang (Atomic DB Transaction)
     */
    public function pinjam(PeminjamanRequest $request): JsonResponse
    {
        $user = $request->user();
        $barangId = $request->barang_id;
        $requestedUnitId = $request->barang_unit_id;

        return DB::transaction(function () use ($user, $barangId, $requestedUnitId) {
            // Lock row untuk mencegah race condition (2 user meminjam unit yang sama bersamaan)
            if ($requestedUnitId) {
                $unit = BarangUnit::where('id', $requestedUnitId)
                    ->where('barang_id', $barangId)
                    ->where('status', 'tersedia')
                    ->lockForUpdate()
                    ->first();
            } else {
                $unit = BarangUnit::where('barang_id', $barangId)
                    ->where('status', 'tersedia')
                    ->lockForUpdate()
                    ->first();
            }

            if (! $unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'Maaf, unit barang tidak tersedia untuk dipinjam saat ini.',
                ], 422);
            }

            // 1. Update status unit
            $unit->update([
                'status' => 'dipinjam',
            ]);

            // 2. Buat logbook peminjaman
            $logbook = Logbook::create([
                'user_id' => $user->id,
                'barang_unit_id' => $unit->id,
                'tanggal_pinjam' => now(),
                'tanggal_kembali' => null,
                'kondisi_kembali' => null,
                'status_transaksi' => 'dipinjam',
            ]);

            $barang = Barang::find($barangId);

            return response()->json([
                'success' => true,
                'message' => 'Peminjaman berhasil dikonfirmasi.',
                'data' => [
                    'logbook_id' => $logbook->id,
                    'barang_nama' => $barang->nama_barang,
                    'kode_unit' => $unit->kode_unit,
                    'tanggal_pinjam' => $logbook->tanggal_pinjam->toIso8601String(),
                    'status_transaksi' => $logbook->status_transaksi,
                ],
            ], 201);
        });
    }

    /**
     * Pengembalian Barang (Atomic DB Transaction)
     */
    public function kembali(PengembalianRequest $request): JsonResponse
    {
        $user = $request->user();
        $logbookId = $request->logbook_id;
        $kondisiKembali = $request->kondisi_kembali; // 'baik' atau 'rusak'

        return DB::transaction(function () use ($user, $logbookId, $kondisiKembali) {
            // Validasi: Logbook harus milik user bersangkutan (kecuali admin) dan status masih dipinjam
            $query = Logbook::where('id', $logbookId)->lockForUpdate();

            if ($user->role !== 'admin') {
                $query->where('user_id', $user->id);
            }

            $logbook = $query->first();

            if (! $logbook) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi peminjaman tidak ditemukan atau tidak memiliki akses.',
                ], 404);
            }

            if ($logbook->status_transaksi === 'dikembalikan') {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi ini sudah selesai dikembalikan sebelumnya.',
                ], 422);
            }

            // 1. Update Logbook
            $logbook->update([
                'tanggal_kembali' => now(),
                'kondisi_kembali' => $kondisiKembali,
                'status_transaksi' => 'dikembalikan',
            ]);

            // 2. Update status & kondisi unit fisik
            $unit = BarangUnit::where('id', $logbook->barang_unit_id)->lockForUpdate()->first();
            if ($unit) {
                if ($kondisiKembali === 'rusak') {
                    $unit->update([
                        'status' => 'maintenance',
                        'kondisi' => 'rusak',
                    ]);
                } else {
                    $unit->update([
                        'status' => 'tersedia',
                        'kondisi' => 'baik',
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Pengembalian barang berhasil dicatat.',
                'data' => [
                    'logbook_id' => $logbook->id,
                    'status_transaksi' => $logbook->status_transaksi,
                    'kondisi_kembali' => $logbook->kondisi_kembali,
                    'tanggal_kembali' => $logbook->tanggal_kembali->toIso8601String(),
                    'unit_status_now' => $unit ? $unit->status : null,
                ],
            ]);
        });
    }

    /**
     * Riwayat Peminjaman User
     */
    public function riwayat(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Logbook::with(['barangUnit.barang.kategori'])
            ->where('user_id', $user->id)
            ->latest('tanggal_pinjam');

        if ($request->has('status') && in_array($request->status, ['dipinjam', 'dikembalikan'])) {
            $query->where('status_transaksi', $request->status);
        }

        if ($request->has('q') && ! empty($request->q)) {
            $search = $request->q;
            $query->whereHas('barangUnit', function ($qUnit) use ($search) {
                $qUnit->where('kode_unit', 'like', "%{$search}%")
                      ->orWhereHas('barang', function ($qBarang) use ($search) {
                          $qBarang->where('nama_barang', 'like', "%{$search}%");
                      });
            });
        }

        $riwayat = $query->paginate($request->input('per_page', 15));

        $riwayat->getCollection()->transform(function ($log) {
            $unit = $log->barangUnit;
            $barang = $unit ? $unit->barang : null;

            return [
                'id' => $log->id,
                'nama_barang' => $barang ? $barang->nama_barang : 'N/A',
                'kode_barang' => $barang ? $barang->kode_barang : 'N/A',
                'nama_kategori' => $barang && $barang->kategori ? $barang->kategori->nama_kategori : 'N/A',
                'kode_unit' => $unit ? $unit->kode_unit : 'N/A',
                'tanggal_pinjam' => $log->tanggal_pinjam ? $log->tanggal_pinjam->toIso8601String() : null,
                'tanggal_kembali' => $log->tanggal_kembali ? $log->tanggal_kembali->toIso8601String() : null,
                'kondisi_kembali' => $log->kondisi_kembali,
                'status_transaksi' => $log->status_transaksi,
                'gambar_url' => ($barang && $barang->gambar) ? asset('storage/'.$barang->gambar) : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $riwayat,
        ]);
    }
}
