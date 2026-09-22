<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\TransaksiStok;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransaksiStokController extends Controller
{
    /**
     * Catat pemakaian bahan habis pakai oleh user/praktikan
     */
    public function pakai(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'barang_id' => ['required', 'exists:barang,id'],
            'jumlah' => ['required', 'numeric', 'gt:0'],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ]);

        $userId = $request->user()->id;

        return DB::transaction(function () use ($validated, $userId) {
            $barang = Barang::with('kategori')->lockForUpdate()->findOrFail($validated['barang_id']);

            if ($barang->kategori && $barang->kategori->tipe !== 'habis_pakai') {
                return response()->json([
                    'success' => false,
                    'message' => 'Barang ini bukan kategori barang sekali pakai / bahan habis pakai.',
                ], 422);
            }

            $jumlahPakai = (float) $validated['jumlah'];
            $stokTersedia = (float) $barang->stok_saat_ini;

            if ($stokTersedia < $jumlahPakai) {
                return response()->json([
                    'success' => false,
                    'message' => "Stok tidak mencukupi. Sisa stok saat ini hanya {$stokTersedia} {$barang->satuan}.",
                ], 422);
            }

            $sisaStok = round($stokTersedia - $jumlahPakai, 2);
            $barang->stok_saat_ini = $sisaStok;
            $barang->save();

            $transaksi = TransaksiStok::create([
                'barang_id' => $barang->id,
                'user_id' => $userId,
                'tipe' => 'keluar',
                'jumlah' => $jumlahPakai,
                'sisa_stok' => $sisaStok,
                'keterangan' => $validated['keterangan'] ?? 'Pemakaian bahan praktikum',
            ]);

            $isLowStock = $sisaStok <= (float) $barang->stok_minimum;

            return response()->json([
                'success' => true,
                'message' => "Pemakaian {$jumlahPakai} {$barang->satuan} {$barang->nama_barang} berhasil dicatat.",
                'data' => [
                    'transaksi_id' => $transaksi->id,
                    'barang_id' => $barang->id,
                    'nama_barang' => $barang->nama_barang,
                    'jumlah' => $jumlahPakai,
                    'satuan' => $barang->satuan,
                    'sisa_stok' => $sisaStok,
                    'is_low_stock' => $isLowStock,
                    'created_at' => $transaksi->created_at->toIso8601String(),
                ],
            ]);
        });
    }

    /**
     * Admin Restock Bahan
     */
    public function restock(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'jumlah' => ['required', 'numeric', 'gt:0'],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ]);

        $userId = $request->user()->id;

        return DB::transaction(function () use ($validated, $userId, $id) {
            $barang = Barang::with('kategori')->lockForUpdate()->findOrFail($id);

            $jumlahMasuk = (float) $validated['jumlah'];
            $stokBaru = round((float) $barang->stok_saat_ini + $jumlahMasuk, 2);
            $barang->stok_saat_ini = $stokBaru;
            $barang->save();

            $transaksi = TransaksiStok::create([
                'barang_id' => $barang->id,
                'user_id' => $userId,
                'tipe' => 'masuk',
                'jumlah' => $jumlahMasuk,
                'sisa_stok' => $stokBaru,
                'keterangan' => $validated['keterangan'] ?? 'Restock pengadaan barang',
            ]);

            return response()->json([
                'success' => true,
                'message' => "Restock {$jumlahMasuk} {$barang->satuan} {$barang->nama_barang} berhasil ditambahkan.",
                'data' => [
                    'transaksi_id' => $transaksi->id,
                    'barang_id' => $barang->id,
                    'nama_barang' => $barang->nama_barang,
                    'jumlah' => $jumlahMasuk,
                    'satuan' => $barang->satuan,
                    'sisa_stok' => $stokBaru,
                    'created_at' => $transaksi->created_at->toIso8601String(),
                ],
            ]);
        });
    }

    /**
     * Kartu Stok / Mutasi Barang
     */
    public function kartuStok(Request $request, $id): JsonResponse
    {
        $barang = Barang::with('kategori')->findOrFail($id);

        $riwayat = TransaksiStok::with('user:id,nama,nip')
            ->where('barang_id', $id)
            ->latest('id')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'barang' => [
                'id' => $barang->id,
                'nama_barang' => $barang->nama_barang,
                'kode_barang' => $barang->kode_barang,
                'satuan' => $barang->satuan,
                'stok_saat_ini' => (float) $barang->stok_saat_ini,
                'stok_minimum' => (float) $barang->stok_minimum,
                'is_low_stock' => $barang->isLowStock(),
            ],
            'data' => $riwayat,
        ]);
    }

    /**
     * Riwayat Pemakaian oleh User yang sedang login
     */
    public function riwayatUser(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $riwayat = TransaksiStok::with('barang:id,nama_barang,kode_barang,satuan')
            ->where('user_id', $userId)
            ->where('tipe', 'keluar')
            ->latest('id')
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $riwayat,
        ]);
    }
}
