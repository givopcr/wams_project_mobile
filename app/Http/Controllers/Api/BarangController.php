<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BarangController extends Controller
{
    /**
     * List all barang with optional category filter & search
     */
    public function index(Request $request): JsonResponse
    {
        $query = Barang::with(['kategori', 'units']);

        if ($request->has('kategori_id') && ! empty($request->kategori_id)) {
            $query->where('kategori_id', $request->kategori_id);
        }

        if ($request->has('q') && ! empty($request->q)) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                  ->orWhere('kode_barang', 'like', "%{$search}%");
            });
        }

        $barang = $query->paginate($request->input('per_page', 15));

        $barang->getCollection()->transform(function ($item) {
            $isHabisPakai = $item->isHabisPakai();
            $tipe = $isHabisPakai ? 'habis_pakai' : 'aset';

            return [
                'id' => $item->id,
                'kategori_id' => $item->kategori_id,
                'nama_kategori' => $item->kategori ? $item->kategori->nama_kategori : null,
                'tipe' => $tipe,
                'is_habis_pakai' => $isHabisPakai,
                'nama_barang' => $item->nama_barang,
                'kode_barang' => $item->kode_barang,
                'satuan' => $item->satuan,
                'stok_saat_ini' => (float) $item->stok_saat_ini,
                'stok_minimum' => (float) $item->stok_minimum,
                'is_low_stock' => $isHabisPakai ? $item->isLowStock() : false,
                'detail_spesifikasi' => $item->detail_spesifikasi,
                'lokasi' => $item->lokasi,
                'gambar_url' => $item->gambar_url,
                'total_unit' => $item->units->count(),
                'tersedia' => $item->units->where('status', 'tersedia')->count(),
                'dipinjam' => $item->units->where('status', 'dipinjam')->count(),
                'maintenance' => $item->units->where('status', 'maintenance')->count(),
                'perlu_persetujuan' => (bool) $item->perlu_persetujuan,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $barang,
        ]);
    }

    /**
     * Show detail barang
     */
    public function show($id): JsonResponse
    {
        $barang = Barang::with(['kategori', 'units'])->findOrFail($id);

        $tersediaCount = $barang->units->where('status', 'tersedia')->count();
        $isHabisPakai = $barang->isHabisPakai();
        $tipe = $isHabisPakai ? 'habis_pakai' : 'aset';

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $barang->id,
                'kategori_id' => $barang->kategori_id,
                'nama_kategori' => $barang->kategori ? $barang->kategori->nama_kategori : null,
                'tipe' => $tipe,
                'is_habis_pakai' => $isHabisPakai,
                'nama_barang' => $barang->nama_barang,
                'kode_barang' => $barang->kode_barang,
                'satuan' => $barang->satuan,
                'stok_saat_ini' => (float) $barang->stok_saat_ini,
                'stok_minimum' => (float) $barang->stok_minimum,
                'is_low_stock' => $isHabisPakai ? $barang->isLowStock() : false,
                'detail_spesifikasi' => $barang->detail_spesifikasi,
                'lokasi' => $barang->lokasi,
                'gambar_url' => $barang->gambar_url,
                'total_unit' => $barang->units->count(),
                'tersedia' => $tersediaCount,
                'dipinjam' => $barang->units->where('status', 'dipinjam')->count(),
                'maintenance' => $barang->units->where('status', 'maintenance')->count(),
                'perlu_persetujuan' => (bool) $barang->perlu_persetujuan,
                'can_borrow' => $isHabisPakai ? ((float) $barang->stok_saat_ini > 0) : ($tersediaCount > 0),
            ],
        ]);
    }

    /**
     * List all units of a specific barang
     */
    public function units($id): JsonResponse
    {
        $barang = Barang::findOrFail($id);
        $units = $barang->units()->with('barang')->get();

        return response()->json([
            'success' => true,
            'barang' => [
                'id' => $barang->id,
                'nama_barang' => $barang->nama_barang,
                'kode_barang' => $barang->kode_barang,
            ],
            'data' => $units,
        ]);
    }
}
