<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangUnit;
use App\Models\KategoriBarang;
use App\Models\Logbook;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AdminApiController extends Controller
{
    /**
     * Dashboard Summary Stats
     */
    public function stats(): JsonResponse
    {
        $totalKategori = KategoriBarang::count();
        $totalBarang = Barang::count();
        $totalUnit = BarangUnit::count();
        $unitTersedia = BarangUnit::where('status', 'tersedia')->count();
        $unitDipinjam = BarangUnit::where('status', 'dipinjam')->count();
        $unitMaintenance = BarangUnit::where('status', 'maintenance')->count();
        $totalUser = User::where('role', 'user')->count();
        $transaksiAktif = Logbook::where('status_transaksi', 'dipinjam')->count();
        $transaksiSelesai = Logbook::where('status_transaksi', 'dikembalikan')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_kategori' => $totalKategori,
                'total_barang' => $totalBarang,
                'total_unit' => $totalUnit,
                'unit_tersedia' => $unitTersedia,
                'unit_dipinjam' => $unitDipinjam,
                'unit_maintenance' => $unitMaintenance,
                'total_user' => $totalUser,
                'transaksi_aktif' => $transaksiAktif,
                'transaksi_selesai' => $transaksiSelesai,
            ],
        ]);
    }

    /**
     * Store Kategori
     */
    public function storeKategori(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama_kategori' => ['required', 'string', 'max:255'],
        ]);

        $kategori = KategoriBarang::create([
            'nama_kategori' => $validated['nama_kategori'],
        ]);

        $kategori->update([
            'qr_code' => "/scan/kategori/{$kategori->id}",
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dibuat',
            'data' => $kategori,
        ], 201);
    }

    /**
     * Update Kategori
     */
    public function updateKategori(Request $request, $id): JsonResponse
    {
        $kategori = KategoriBarang::findOrFail($id);

        $validated = $request->validate([
            'nama_kategori' => ['required', 'string', 'max:255'],
        ]);

        $kategori->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil diperbarui',
            'data' => $kategori,
        ]);
    }

    /**
     * Delete Kategori
     */
    public function destroyKategori($id): JsonResponse
    {
        $kategori = KategoriBarang::findOrFail($id);
        $kategori->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dihapus',
        ]);
    }

    /**
     * Store Master Barang
     */
    public function storeBarang(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kategori_id' => ['required', 'exists:kategori_barang,id'],
            'nama_barang' => ['required', 'string', 'max:255'],
            'kode_barang' => ['required', 'string', 'max:50', 'unique:barang,kode_barang'],
            'detail_spesifikasi' => ['nullable', 'string'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'gambar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        if ($request->hasFile('gambar')) {
            $validated['gambar'] = $request->file('gambar')->store('barang', 'public');
        }

        $barang = Barang::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Master barang berhasil dibuat',
            'data' => $barang,
        ], 201);
    }

    /**
     * Update Master Barang
     */
    public function updateBarang(Request $request, $id): JsonResponse
    {
        $barang = Barang::findOrFail($id);

        $validated = $request->validate([
            'kategori_id' => ['required', 'exists:kategori_barang,id'],
            'nama_barang' => ['required', 'string', 'max:255'],
            'kode_barang' => ['required', 'string', 'max:50', Rule::unique('barang', 'kode_barang')->ignore($barang->id)],
            'detail_spesifikasi' => ['nullable', 'string'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'gambar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        if ($request->hasFile('gambar')) {
            if ($barang->gambar && Storage::disk('public')->exists($barang->gambar)) {
                Storage::disk('public')->delete($barang->gambar);
            }
            $validated['gambar'] = $request->file('gambar')->store('barang', 'public');
        }

        $barang->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Master barang berhasil diperbarui',
            'data' => $barang,
        ]);
    }

    /**
     * Delete Master Barang
     */
    public function destroyBarang($id): JsonResponse
    {
        $barang = Barang::findOrFail($id);

        if ($barang->gambar && Storage::disk('public')->exists($barang->gambar)) {
            Storage::disk('public')->delete($barang->gambar);
        }

        $barang->delete();

        return response()->json([
            'success' => true,
            'message' => 'Master barang berhasil dihapus',
        ]);
    }

    /**
     * Store Unit Fisik untuk Barang
     */
    public function storeUnit(Request $request, $barangId): JsonResponse
    {
        $barang = Barang::findOrFail($barangId);

        $validated = $request->validate([
            'kode_unit' => ['required', 'string', 'max:50', 'unique:barang_unit,kode_unit'],
            'status' => ['required', 'in:tersedia,dipinjam,maintenance'],
            'kondisi' => ['required', 'in:baik,rusak'],
        ]);

        $unit = $barang->units()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Unit fisik berhasil ditambahkan',
            'data' => $unit,
        ], 201);
    }

    /**
     * Update Unit Fisik
     */
    public function updateUnit(Request $request, $id): JsonResponse
    {
        $unit = BarangUnit::findOrFail($id);

        $validated = $request->validate([
            'kode_unit' => ['required', 'string', 'max:50', Rule::unique('barang_unit', 'kode_unit')->ignore($unit->id)],
            'status' => ['required', 'in:tersedia,dipinjam,maintenance'],
            'kondisi' => ['required', 'in:baik,rusak'],
        ]);

        $unit->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Unit fisik berhasil diperbarui',
            'data' => $unit,
        ]);
    }

    /**
     * Delete Unit Fisik
     */
    public function destroyUnit($id): JsonResponse
    {
        $unit = BarangUnit::findOrFail($id);
        $unit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Unit fisik berhasil dihapus',
        ]);
    }

    /**
     * List all Logbooks (Admin)
     */
    public function logbooks(Request $request): JsonResponse
    {
        $query = Logbook::with(['user', 'barangUnit.barang']);

        if ($request->has('status') && in_array($request->status, ['dipinjam', 'dikembalikan'])) {
            $query->where('status_transaksi', $request->status);
        }

        if ($request->has('q') && ! empty($request->q)) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($qu) use ($search) {
                    $qu->where('nama', 'like', "%{$search}%")
                       ->orWhere('nip', 'like', "%{$search}%");
                })->orWhereHas('barangUnit', function ($qun) use ($search) {
                    $qun->where('kode_unit', 'like', "%{$search}%")
                        ->orWhereHas('barang', function ($qb) use ($search) {
                            $qb->where('nama_barang', 'like', "%{$search}%");
                        });
                });
            });
        }

        $logs = $query->latest('tanggal_pinjam')->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    /**
     * List & Manage Users (Admin)
     */
    public function users(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->has('role') && in_array($request->role, ['admin', 'user'])) {
            $query->where('role', $request->role);
        }

        if ($request->has('q') && ! empty($request->q)) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Store new User (Admin)
     */
    public function storeUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'nip' => ['nullable', 'string', 'max:50', 'unique:users,nip'],
            'role' => ['required', 'in:admin,user'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dibuat',
            'data' => $user,
        ], 201);
    }
}
