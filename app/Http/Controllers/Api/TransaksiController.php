<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\PeminjamanRequest;
use App\Http\Requests\Api\PengembalianRequest;
use App\Models\Barang;
use App\Models\BarangUnit;
use App\Models\Logbook;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

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
        $requestedUnitIds = $request->barang_unit_ids;
        $keperluan = $request->keperluan;

        $tanggalPinjam = $request->filled('tanggal_pinjam')
            ? Carbon::parse($request->tanggal_pinjam)
            : now();
        $batasKembali = $request->filled('batas_kembali')
            ? Carbon::parse($request->batas_kembali)
            : $tanggalPinjam->copy()->addDays(3);

        if ($batasKembali->lt($tanggalPinjam)) {
            return response()->json([
                'success' => false,
                'message' => 'Batas waktu pengembalian tidak boleh kurang dari tanggal peminjaman.',
            ], 422);
        }

        // Batasi kuota peminjaman aktif per user maksimal 5 unit
        $activeLoansCount = Logbook::where('user_id', $user->id)
            ->whereIn('status_transaksi', ['dipinjam', 'menunggu_persetujuan'])
            ->count();
        $requestedCount = (is_array($requestedUnitIds) && count($requestedUnitIds) > 0) ? count($requestedUnitIds) : 1;

        if (($activeLoansCount + $requestedCount) > 5) {
            return response()->json([
                'success' => false,
                'message' => 'Batas maksimum peminjaman aktif adalah 5 unit per pengguna.',
            ], 422);
        }

        $barang = Barang::with('kategori')->findOrFail($barangId);
        if ($barang->isHabisPakai()) {
            return response()->json([
                'success' => false,
                'message' => 'Barang habis pakai tidak dapat dipinjam sebagai unit aset.',
            ], 422);
        }
        $requiresApproval = (bool) $barang->perlu_persetujuan;
        $targetStatus = $requiresApproval ? 'menunggu_persetujuan' : 'dipinjam';

        $fotoPinjamPath = null;
        if ($request->filled('foto_pinjam')) {
            $fotoData = $request->input('foto_pinjam');
            if (preg_match('/^data:image\/(\w+);base64,/', $fotoData, $typeMatch)) {
                $ext = strtolower($typeMatch[1]);
                if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
                    $decoded = base64_decode(substr($fotoData, strpos($fotoData, ',') + 1), true);
                    if ($decoded !== false && strlen($decoded) > 0 && strlen($decoded) <= 5 * 1024 * 1024) {
                        $fotoPinjamPath = 'peminjaman/' . uniqid('bor_') . '.' . $ext;
                        Storage::disk('public')->put($fotoPinjamPath, $decoded);
                    }
                }
            }
        }

        // Multiple units handling
        if (is_array($requestedUnitIds) && count($requestedUnitIds) > 0) {
            return DB::transaction(function () use ($user, $barang, $requestedUnitIds, $targetStatus, $requiresApproval, $keperluan, $tanggalPinjam, $batasKembali, $fotoPinjamPath) {
                $units = BarangUnit::whereIn('id', $requestedUnitIds)
                    ->where('barang_id', $barang->id)
                    ->where('status', 'tersedia')
                    ->lockForUpdate()
                    ->get();

                if ($units->count() !== count($requestedUnitIds)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Satu atau lebih unit barang tidak tersedia untuk dipinjam saat ini.',
                    ], 422);
                }

                $logbooks = [];
                foreach ($units as $unit) {
                    $unit->update(['status' => $targetStatus]);

                    $logbooks[] = Logbook::create([
                        'user_id' => $user->id,
                        'barang_unit_id' => $unit->id,
                        'tipe_peminjam' => 'user',
                        'keperluan' => $keperluan,
                        'foto_pinjam' => $fotoPinjamPath,
                        'batas_kembali' => $batasKembali,
                        'tanggal_pinjam' => $tanggalPinjam,
                        'tanggal_kembali' => null,
                        'kondisi_kembali' => null,
                        'status_transaksi' => $targetStatus,
                    ]);
                }

                $firstLogbook = $logbooks[0] ?? null;
                $msg = $requiresApproval
                    ? count($units) . ' unit berhasil diajukan. Menunggu persetujuan langsung dari Admin.'
                    : count($units) . ' unit berhasil dipinjam.';

                return response()->json([
                    'success' => true,
                    'message' => $msg,
                    'data' => [
                        'logbook_id' => $firstLogbook ? $firstLogbook->id : null,
                        'total_unit' => count($units),
                        'kode_unit' => $units->pluck('kode_unit')->implode(', '),
                        'kode_units' => $units->pluck('kode_unit')->toArray(),
                        'barang_nama' => $barang->nama_barang,
                        'tanggal_pinjam' => $tanggalPinjam->toIso8601String(),
                        'status_transaksi' => $targetStatus,
                        'requires_approval' => $requiresApproval,
                    ],
                ], 201);
            });
        }

        return DB::transaction(function () use ($user, $barang, $requestedUnitId, $targetStatus, $requiresApproval, $keperluan, $tanggalPinjam, $batasKembali, $fotoPinjamPath) {
            // Lock row untuk mencegah race condition
            if ($requestedUnitId) {
                $unit = BarangUnit::where('id', $requestedUnitId)
                    ->where('barang_id', $barang->id)
                    ->where('status', 'tersedia')
                    ->lockForUpdate()
                    ->first();
            } else {
                $unit = BarangUnit::where('barang_id', $barang->id)
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
                'status' => $targetStatus,
            ]);

            // 2. Buat logbook peminjaman
            $logbook = Logbook::create([
                'user_id' => $user->id,
                'barang_unit_id' => $unit->id,
                'tipe_peminjam' => 'user',
                'keperluan' => $keperluan,
                'foto_pinjam' => $fotoPinjamPath,
                'batas_kembali' => $batasKembali,
                'tanggal_pinjam' => $tanggalPinjam,
                'tanggal_kembali' => null,
                'kondisi_kembali' => null,
                'status_transaksi' => $targetStatus,
            ]);

            $msg = $requiresApproval
                ? 'Pengajuan peminjaman berhasil dikirim. Menunggu persetujuan langsung dari Admin.'
                : 'Peminjaman berhasil dikonfirmasi.';

            return response()->json([
                'success' => true,
                'message' => $msg,
                'data' => [
                    'logbook_id' => $logbook->id,
                    'barang_nama' => $barang->nama_barang,
                    'kode_unit' => $unit->kode_unit,
                    'tanggal_pinjam' => $logbook->tanggal_pinjam->toIso8601String(),
                    'status_transaksi' => $logbook->status_transaksi,
                    'requires_approval' => $requiresApproval,
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
        $rawKondisi = $request->kondisi_kembali;
        $kondisiKembali = in_array($rawKondisi, ['rusak', 'rusak_ringan', 'rusak_berat']) ? 'rusak' : 'baik';

        return DB::transaction(function () use ($user, $logbookId, $kondisiKembali, $request) {
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

            if ($logbook->status_transaksi !== 'dipinjam') {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi ini tidak berstatus dipinjam atau sudah dikembalikan sebelumnya.',
                ], 422);
            }

            $updatePayload = [
                'tanggal_kembali' => now(),
                'kondisi_kembali' => $kondisiKembali,
                'status_transaksi' => 'dikembalikan',
            ];

            if ($request->filled('catatan') && Schema::hasColumn('logbook', 'catatan_kembali')) {
                $updatePayload['catatan_kembali'] = $request->input('catatan');
            }

            if ($request->filled('foto_kondisi') && Schema::hasColumn('logbook', 'foto_kembali')) {
                $fotoData = $request->input('foto_kondisi');
                if (preg_match('/^data:image\/(\w+);base64,/', $fotoData, $typeMatch)) {
                    $ext = strtolower($typeMatch[1]);
                    if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
                        $decoded = base64_decode(substr($fotoData, strpos($fotoData, ',') + 1), true);
                        if ($decoded !== false && strlen($decoded) > 0 && strlen($decoded) <= 5 * 1024 * 1024) {
                            $filename = 'pengembalian/' . uniqid('ret_') . '.' . $ext;
                            Storage::disk('public')->put($filename, $decoded);
                            $updatePayload['foto_kembali'] = $filename;
                        }
                    }
                }
            }

            // 1. Update Logbook
            $logbook->update($updatePayload);

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
     * User Membatalkan Pengajuan Peminjaman (yang masih menunggu persetujuan)
     */
    public function batalkan(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        return DB::transaction(function () use ($user, $id) {
            $logbook = Logbook::where('id', $id)
                ->where('user_id', $user->id)
                ->where('status_transaksi', 'menunggu_persetujuan')
                ->lockForUpdate()
                ->first();

            if (! $logbook) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengajuan peminjaman tidak ditemukan atau tidak dapat dibatalkan.',
                ], 404);
            }

            $logbook->update([
                'status_transaksi' => 'dibatalkan',
            ]);

            // Kembalikan status unit ke 'tersedia'
            $unit = BarangUnit::where('id', $logbook->barang_unit_id)->lockForUpdate()->first();
            if ($unit && $unit->status === 'menunggu_persetujuan') {
                $unit->update(['status' => 'tersedia']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan peminjaman berhasil dibatalkan.',
            ]);
        });
    }

    /**
     * Riwayat Peminjaman User
     */
    public function riwayat(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Logbook::with(['barangUnit.barang.kategori', 'approver'])
            ->where('user_id', $user->id)
            ->latest('tanggal_pinjam');

        if ($request->has('status') && in_array($request->status, ['menunggu_persetujuan', 'dipinjam', 'dikembalikan', 'ditolak', 'dibatalkan'])) {
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
                'barang_id' => $barang ? $barang->id : null,
                'unit_id' => $unit ? $unit->id : null,
                'nama_barang' => $barang ? $barang->nama_barang : 'N/A',
                'kode_barang' => $barang ? $barang->kode_barang : 'N/A',
                'nama_kategori' => $barang && $barang->kategori ? $barang->kategori->nama_kategori : 'N/A',
                'kode_unit' => $unit ? $unit->kode_unit : 'N/A',
                'tanggal_pinjam' => $log->tanggal_pinjam ? $log->tanggal_pinjam->toIso8601String() : null,
                'tanggal_kembali' => $log->tanggal_kembali ? $log->tanggal_kembali->toIso8601String() : null,
                'batas_kembali' => $log->batas_kembali ? $log->batas_kembali->toIso8601String() : null,
                'kondisi_kembali' => $log->kondisi_kembali,
                'status_transaksi' => $log->status_transaksi,
                'keperluan' => $log->keperluan,
                'alasan_penolakan' => $log->alasan_penolakan,
                'tanggal_approval' => $log->tanggal_approval ? $log->tanggal_approval->toIso8601String() : null,
                'nama_approver' => $log->approver?->nama,
                'gambar_url' => $unit?->gambar_url ?? ($barang?->gambar_url),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $riwayat,
        ]);
    }
}
