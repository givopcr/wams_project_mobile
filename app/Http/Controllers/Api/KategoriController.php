<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KategoriBarang;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KategoriController extends Controller
{
    /**
     * List all categories with item and unit summary
     */
    public function index(): JsonResponse
    {
        $kategori = KategoriBarang::withCount('barang')
            ->with(['units'])
            ->get()
            ->map(function ($kat) {
                $totalUnits = $kat->units->count();
                $tersedia = $kat->units->where('status', 'tersedia')->count();
                $dipinjam = $kat->units->where('status', 'dipinjam')->count();
                $maintenance = $kat->units->where('status', 'maintenance')->count();

                return [
                    'id' => $kat->id,
                    'nama_kategori' => $kat->nama_kategori,
                    'qr_code' => $kat->qr_code,
                    'total_barang' => $kat->barang_count,
                    'total_unit' => $totalUnits,
                    'tersedia' => $tersedia,
                    'dipinjam' => $dipinjam,
                    'maintenance' => $maintenance,
                    'created_at' => $kat->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $kategori,
        ]);
    }

    /**
     * Show Category detail
     */
    public function show($id): JsonResponse
    {
        $kategori = KategoriBarang::withCount('barang')
            ->with(['units'])
            ->findOrFail($id);

        $totalUnits = $kategori->units->count();
        $tersedia = $kategori->units->where('status', 'tersedia')->count();
        $dipinjam = $kategori->units->where('status', 'dipinjam')->count();
        $maintenance = $kategori->units->where('status', 'maintenance')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $kategori->id,
                'nama_kategori' => $kategori->nama_kategori,
                'qr_code' => $kategori->qr_code,
                'total_barang' => $kategori->barang_count,
                'total_unit' => $totalUnits,
                'tersedia' => $tersedia,
                'dipinjam' => $dipinjam,
                'maintenance' => $maintenance,
            ],
        ]);
    }

    /**
     * List barang within category (used by QR scanner & browsing)
     */
    public function barang(Request $request, $id): JsonResponse
    {
        $kategori = KategoriBarang::findOrFail($id);

        $query = $kategori->barang()->with(['units']);

        if ($request->has('q') && ! empty($request->q)) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                  ->orWhere('kode_barang', 'like', "%{$search}%");
            });
        }

        $barang = $query->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'kategori_id' => $item->kategori_id,
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
            'kategori' => [
                'id' => $kategori->id,
                'nama_kategori' => $kategori->nama_kategori,
                'qr_code' => $kategori->qr_code,
            ],
            'data' => $barang,
        ]);
    }
}
