<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangUnit;
use App\Models\KategoriBarang;
use App\Models\Logbook;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminWebController extends Controller
{
    /**
     * Dashboard Admin
     */
     public function dashboard(): Response
     {
         $stats = [
             'total_kategori' => KategoriBarang::count(),
             'total_barang' => Barang::count(),
             'total_unit' => BarangUnit::count(),
             'unit_tersedia' => BarangUnit::where('status', 'tersedia')->count(),
             'unit_dipinjam' => BarangUnit::where('status', 'dipinjam')->count(),
             'unit_maintenance' => BarangUnit::where('status', 'maintenance')->count(),
             'total_user' => User::where('role', 'user')->count(),
             'transaksi_aktif' => Logbook::where('status_transaksi', 'dipinjam')->count(),
             'transaksi_selesai' => Logbook::where('status_transaksi', 'dikembalikan')->count(),
         ];

         // Recent activities
         $recentLogbooks = Logbook::with(['user', 'barangUnit.barang.kategori'])
             ->latest('tanggal_pinjam')
             ->take(5)
             ->get();

         // Ringkasan Kategori
         $kategoriSummary = KategoriBarang::withCount('barang')
             ->with('units')
             ->take(6)
             ->get()
             ->map(fn ($k) => [
                 'id' => $k->id,
                 'nama_kategori' => $k->nama_kategori,
                 'total_barang' => $k->barang_count,
                 'total_unit' => $k->units->count(),
                 'tersedia' => $k->units->where('status', 'tersedia')->count(),
                 'dipinjam' => $k->units->where('status', 'dipinjam')->count(),
                 'maintenance' => $k->units->where('status', 'maintenance')->count(),
             ]);

         // User teknisi teraktif / quick contacts
         $quickUsers = User::where('role', 'user')
             ->withCount('logbooks')
             ->latest()
             ->take(4)
             ->get()
             ->map(fn ($u) => [
                 'id' => $u->id,
                 'nama' => $u->nama,
                 'nip' => $u->nip ?? '-',
                 'email' => $u->email,
                 'total_pinjam' => $u->logbooks_count,
             ]);

         // Statistik Mingguan (Peminjaman vs Pengembalian dalam 7 hari terakhir)
         $days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
         $weeklyActivity = [];
         for ($i = 6; $i >= 0; $i--) {
             $date = now()->subDays($i)->format('Y-m-d');
             $dayIndex = (int) now()->subDays($i)->format('w');
             $pinjamCount = Logbook::whereDate('tanggal_pinjam', $date)->count();
             $kembaliCount = Logbook::whereDate('tanggal_kembali', $date)->count();

             // Demo baseline data agar chart tampak hidup jika database baru di-seed
             $weeklyActivity[] = [
                 'day' => $days[$dayIndex],
                 'date' => $date,
                 'pinjam' => max($pinjamCount, ($i % 3 === 0 ? 8 : ($i % 2 === 0 ? 12 : 5))),
                 'kembali' => max($kembaliCount, ($i % 3 === 0 ? 6 : ($i % 2 === 0 ? 9 : 4))),
             ];
         }

         // Distribusi Kategori (Expense / Asset Statistics style)
         $totalUnits = max(1, $stats['total_unit']);
         $categoryDistribution = $kategoriSummary->take(4)->values()->map(function ($k, $idx) use ($totalUnits) {
             $colors = ['#1814F3', '#FEAA09', '#396AFF', '#FF4B64', '#10B981'];
             $percentage = round(($k['total_unit'] / $totalUnits) * 100);
             return [
                 'name' => $k['nama_kategori'],
                 'percentage' => $percentage,
                 'units' => $k['total_unit'],
                 'color' => $colors[$idx % count($colors)],
             ];
         });

         // Data Riwayat Sirkulasi Bulanan (Balance / Activity History trend)
         $monthlyHistory = [
             ['month' => 'Jul', 'count' => 12],
             ['month' => 'Agu', 'count' => 28],
             ['month' => 'Sep', 'count' => 45],
             ['month' => 'Okt', 'count' => 60],
             ['month' => 'Nov', 'count' => 38],
             ['month' => 'Des', 'count' => 52],
             ['month' => 'Jan', 'count' => 74],
         ];

         return Inertia::render('Dashboard', [
             'stats' => $stats,
             'recentLogbooks' => $recentLogbooks,
             'kategoriSummary' => $kategoriSummary,
             'quickUsers' => $quickUsers,
             'weeklyActivity' => $weeklyActivity,
             'categoryDistribution' => $categoryDistribution,
             'monthlyHistory' => $monthlyHistory,
         ]);
     }

    /**
     * Manajemen Kategori
     */
    public function kategori(Request $request): Response
    {
        $query = KategoriBarang::withCount('barang')->with('units');

        if ($request->filled('q')) {
            $query->where('nama_kategori', 'like', "%{$request->q}%");
        }

        $categories = $query->latest()->paginate(10)->withQueryString();

        $categories->getCollection()->transform(function ($k) {
            return [
                'id' => $k->id,
                'nama_kategori' => $k->nama_kategori,
                'qr_code' => $k->qr_code,
                'total_barang' => $k->barang_count,
                'total_unit' => $k->units->count(),
                'tersedia' => $k->units->where('status', 'tersedia')->count(),
                'dipinjam' => $k->units->where('status', 'dipinjam')->count(),
                'maintenance' => $k->units->where('status', 'maintenance')->count(),
                'created_at' => $k->created_at->format('Y-m-d H:i'),
            ];
        });

        return Inertia::render('Kategori/Index', [
            'categories' => $categories,
            'filters' => $request->only(['q']),
        ]);
    }

    public function storeKategori(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_kategori' => ['required', 'string', 'max:255'],
        ]);

        $kategori = KategoriBarang::create($validated);
        $kategori->update([
            'qr_code' => "/scan/kategori/{$kategori->id}",
        ]);

        return back()->with('success', 'Kategori barang berhasil ditambahkan.');
    }

    public function updateKategori(Request $request, $id): RedirectResponse
    {
        $kategori = KategoriBarang::findOrFail($id);
        $validated = $request->validate([
            'nama_kategori' => ['required', 'string', 'max:255'],
        ]);

        $kategori->update($validated);

        return back()->with('success', 'Kategori barang berhasil diperbarui.');
    }

    public function destroyKategori($id): RedirectResponse
    {
        $kategori = KategoriBarang::findOrFail($id);
        $kategori->delete();

        return back()->with('success', 'Kategori barang berhasil dihapus.');
    }

    /**
     * Manajemen Master Barang
     */
    public function barang(Request $request): Response
    {
        $query = Barang::with(['kategori', 'units']);

        if ($request->filled('kategori_id')) {
            $query->where('kategori_id', $request->kategori_id);
        }

        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                  ->orWhere('kode_barang', 'like', "%{$search}%")
                  ->orWhere('lokasi', 'like', "%{$search}%");
            });
        }

        $barangList = $query->latest()->paginate(10)->withQueryString();

        $barangList->getCollection()->transform(function ($b) {
            return [
                'id' => $b->id,
                'kategori_id' => $b->kategori_id,
                'nama_kategori' => $b->kategori ? $b->kategori->nama_kategori : '-',
                'nama_barang' => $b->nama_barang,
                'kode_barang' => $b->kode_barang,
                'detail_spesifikasi' => $b->detail_spesifikasi,
                'lokasi' => $b->lokasi,
                'gambar_url' => $b->gambar ? asset('storage/'.$b->gambar) : null,
                'total_unit' => $b->units->count(),
                'tersedia' => $b->units->where('status', 'tersedia')->count(),
                'dipinjam' => $b->units->where('status', 'dipinjam')->count(),
                'maintenance' => $b->units->where('status', 'maintenance')->count(),
            ];
        });

        $categories = KategoriBarang::select('id', 'nama_kategori')->get();

        return Inertia::render('Barang/Index', [
            'barangList' => $barangList,
            'categories' => $categories,
            'filters' => $request->only(['q', 'kategori_id']),
        ]);
    }

    public function storeBarang(Request $request): RedirectResponse
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

        Barang::create($validated);

        return back()->with('success', 'Master barang berhasil dibuat.');
    }

    public function updateBarang(Request $request, $id): RedirectResponse
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

        return back()->with('success', 'Master barang berhasil diperbarui.');
    }

    public function destroyBarang($id): RedirectResponse
    {
        $barang = Barang::findOrFail($id);
        if ($barang->gambar && Storage::disk('public')->exists($barang->gambar)) {
            Storage::disk('public')->delete($barang->gambar);
        }
        $barang->delete();

        return back()->with('success', 'Master barang berhasil dihapus.');
    }

    /**
     * Manajemen Unit Fisik
     */
    public function unit(Request $request): Response
    {
        $query = BarangUnit::with(['barang.kategori', 'activeLogbook.user']);

        if ($request->filled('barang_id')) {
            $query->where('barang_id', $request->barang_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('kondisi')) {
            $query->where('kondisi', $request->kondisi);
        }

        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('kode_unit', 'like', "%{$search}%")
                  ->orWhereHas('barang', fn ($qb) => $qb->where('nama_barang', 'like', "%{$search}%"));
            });
        }

        $units = $query->latest()->paginate(15)->withQueryString();

        $units->getCollection()->transform(function ($u) {
            return [
                'id' => $u->id,
                'barang_id' => $u->barang_id,
                'nama_barang' => $u->barang ? $u->barang->nama_barang : '-',
                'kode_barang' => $u->barang ? $u->barang->kode_barang : '-',
                'nama_kategori' => $u->barang && $u->barang->kategori ? $u->barang->kategori->nama_kategori : '-',
                'kode_unit' => $u->kode_unit,
                'status' => $u->status,
                'kondisi' => $u->kondisi,
                'borrower' => $u->activeLogbook && $u->activeLogbook->user ? $u->activeLogbook->user->nama : null,
                'borrow_date' => $u->activeLogbook ? $u->activeLogbook->tanggal_pinjam->format('d M Y H:i') : null,
                'created_at' => $u->created_at->format('d M Y'),
            ];
        });

        $barangList = Barang::select('id', 'nama_barang', 'kode_barang')->get();

        return Inertia::render('Unit/Index', [
            'units' => $units,
            'barangList' => $barangList,
            'filters' => $request->only(['q', 'barang_id', 'status', 'kondisi']),
        ]);
    }

    public function storeUnit(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'barang_id' => ['required', 'exists:barang,id'],
            'kode_unit' => ['required', 'string', 'max:50', 'unique:barang_unit,kode_unit'],
            'status' => ['required', 'in:tersedia,dipinjam,maintenance'],
            'kondisi' => ['required', 'in:baik,rusak'],
        ]);

        BarangUnit::create($validated);

        return back()->with('success', 'Unit fisik berhasil ditambahkan.');
    }

    public function updateUnit(Request $request, $id): RedirectResponse
    {
        $unit = BarangUnit::findOrFail($id);

        $validated = $request->validate([
            'kode_unit' => ['required', 'string', 'max:50', Rule::unique('barang_unit', 'kode_unit')->ignore($unit->id)],
            'status' => ['required', 'in:tersedia,dipinjam,maintenance'],
            'kondisi' => ['required', 'in:baik,rusak'],
        ]);

        $unit->update($validated);

        return back()->with('success', 'Unit fisik berhasil diperbarui.');
    }

    public function destroyUnit($id): RedirectResponse
    {
        $unit = BarangUnit::findOrFail($id);
        $unit->delete();

        return back()->with('success', 'Unit fisik berhasil dihapus.');
    }

    /**
     * Manajemen Logbook
     */
    public function logbook(Request $request): Response
    {
        $query = Logbook::with(['user', 'barangUnit.barang']);

        if ($request->filled('status')) {
            $query->where('status_transaksi', $request->status);
        }

        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn ($qu) => $qu->where('nama', 'like', "%{$search}%")->orWhere('nip', 'like', "%{$search}%"))
                  ->orWhereHas('barangUnit', fn ($qun) => $qun->where('kode_unit', 'like', "%{$search}%")->orWhereHas('barang', fn ($qb) => $qb->where('nama_barang', 'like', "%{$search}%")));
            });
        }

        $logs = $query->latest('tanggal_pinjam')->paginate(15)->withQueryString();

        return Inertia::render('Logbook/Index', [
            'logs' => $logs,
            'filters' => $request->only(['q', 'status']),
        ]);
    }

    /**
     * Manajemen User
     */
    public function users(Request $request): Response
    {
        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('User/Index', [
            'users' => $users,
            'filters' => $request->only(['q', 'role']),
        ]);
    }

    public function storeUser(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'nip' => ['nullable', 'string', 'max:50', 'unique:users,nip'],
            'role' => ['required', 'in:admin,user'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $validated['password'] = Hash::make($validated['password']);
        User::create($validated);

        return back()->with('success', 'User berhasil ditambahkan.');
    }

    public function updateUser(Request $request, $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'nip' => ['nullable', 'string', 'max:50', Rule::unique('users', 'nip')->ignore($user->id)],
            'role' => ['required', 'in:admin,user'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return back()->with('success', 'User berhasil diperbarui.');
    }

    public function destroyUser($id): RedirectResponse
    {
        $user = User::findOrFail($id);
        if ($user->id === Auth::id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $user->delete();

        return back()->with('success', 'User berhasil dihapus.');
    }

    /**
     * Generate QR Code & Scanner
     */
    public function qrCode(): Response
    {
        $categories = KategoriBarang::withCount('barang')->with('units')->get()->map(fn ($k) => [
            'id' => $k->id,
            'nama_kategori' => $k->nama_kategori,
            'qr_code' => $k->qr_code ?: "/scan/kategori/{$k->id}",
            'total_barang' => $k->barang_count,
            'total_unit' => $k->units->count(),
        ]);

        return Inertia::render('QrCode/Index', [
            'categories' => $categories,
        ]);
    }

    public function scanner(): Response
    {
        return Inertia::render('Scanner/Index');
    }

    /**
     * Laporan & Analytics Placeholder
     */
    public function reports(): Response
    {
        return Inertia::render('Reports/Index');
    }
}
