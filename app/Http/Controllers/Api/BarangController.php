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
            return [
                'id' => $item->id,
                'kategori_id' => $item->kategori_id,
                'nama_kategori' => $item->kategori ? $item->kategori->nama_kategori : null,
                'nama_barang' => $item->nama_barang,
                'kode_barang' => $item->kode_barang,
                'detail_spesifikasi' => $item->detail_spesifikasi,
                'lokasi' => $item->lokasi,
                'gambar_url' => $item->gambar ? asset('storage/'.$item->gambar) : null,
                'total_unit' => $item->units->count(),
                'tersedia' => $item->units->where('status', 'tersedia')->count(),
                'dipinjam' => $item->units->where('status', 'dipinjam')->count(),
                'maintenance' => $item->units->where('status', 'maintenance')->count(),
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

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $barang->id,
                'kategori_id' => $barang->kategori_id,
                'nama_kategori' => $barang->kategori ? $barang->kategori->nama_kategori : null,
                'nama_barang' => $barang->nama_barang,
                'kode_barang' => $barang->kode_barang,
                'detail_spesifikasi' => $barang->detail_spesifikasi,
                'lokasi' => $barang->lokasi,
                'gambar_url' => $barang->gambar ? asset('storage/'.$barang->gambar) : null,
                'total_unit' => $barang->units->count(),
                'tersedia' => $tersediaCount,
                'dipinjam' => $barang->units->where('status', 'dipinjam')->count(),
                'maintenance' => $barang->units->where('status', 'maintenance')->count(),
                'can_borrow' => $tersediaCount > 0,
            ],
        ]);
    }

    /**
     * List all units of a specific barang
     */
    public function units($id): JsonResponse
    {
        $barang = Barang::findOrFail($id);
        $units = $barang->units()->get();

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
