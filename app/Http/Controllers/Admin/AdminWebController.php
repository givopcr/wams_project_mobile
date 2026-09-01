<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangUnit;
use App\Models\KategoriBarang;
use App\Models\Logbook;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminWebController extends Controller
{
    /**
     * Dashboard Admin
     */
     public function dashboard(): Response
     {
         $totalUnit = BarangUnit::count();
         $unitBaik = BarangUnit::where('kondisi', 'baik')->count();
         $persentaseBaik = $totalUnit > 0 ? round(($unitBaik / $totalUnit) * 100, 1) : 100;

         $stats = [
             'total_kategori' => KategoriBarang::count(),
             'total_barang' => Barang::count(),
             'total_unit' => $totalUnit,
             'unit_tersedia' => BarangUnit::where('status', 'tersedia')->count(),
             'unit_dipinjam' => BarangUnit::where('status', 'dipinjam')->count(),
             'unit_maintenance' => BarangUnit::where('status', 'maintenance')->count(),
             'unit_baik' => $unitBaik,
             'persentase_baik' => $persentaseBaik,
             'total_user' => User::where('role', 'user')->count(),
             'transaksi_aktif' => Logbook::where('status_transaksi', 'dipinjam')->count(),
             'transaksi_selesai' => Logbook::where('status_transaksi', 'dikembalikan')->count(),
         ];

         // 3 Transaksi / List User Terakhir (Meminjam atau Mengembalikan)
         $recentUsersActivity = Logbook::with(['user', 'barangUnit.barang.kategori'])
             ->latest('updated_at')
             ->take(3)
             ->get()
             ->map(function ($log) {
                 return [
                     'id' => $log->id,
                     'user_name' => $log->user?->nama ?? 'Teknisi Workshop',
                     'user_nip' => $log->user?->nip ?? '-',
                     'user_email' => $log->user?->email ?? '-',
                     'nama_barang' => $log->barangUnit?->barang?->nama_barang ?? 'Barang Workshop',
                     'kode_unit' => $log->barangUnit?->kode_unit ?? '-',
                     'kategori' => $log->barangUnit?->barang?->kategori?->nama_kategori ?? 'Umum',
                     'status_transaksi' => $log->status_transaksi, // 'dipinjam' | 'dikembalikan'
                     'tanggal' => $log->status_transaksi === 'dikembalikan' && $log->tanggal_kembali
                         ? $log->tanggal_kembali
                         : $log->tanggal_pinjam,
                     'formatted_date' => date('d M Y, H:i', strtotime(
                         $log->status_transaksi === 'dikembalikan' && $log->tanggal_kembali
                             ? $log->tanggal_kembali
                             : $log->tanggal_pinjam
                     )),
                 ];
             });

         // 3 Kategori Utama: Perkakas, Elektronik, Komponen
         $targetCategories = ['Perkakas', 'Elektronik', 'Komponen'];
         $days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
         
         // Baseline patterns for demo/seed variety if activity is low
         $baselineLoanPatterns = [
             'Perkakas' => [12, 18, 15, 8, 22, 14, 6],   // Peak on Jumat & Selasa
             'Elektronik' => [8, 11, 24, 19, 14, 9, 5],   // Peak on Rabu & Kamis
             'Komponen' => [5, 9, 14, 12, 20, 26, 10],   // Peak on Sabtu & Jumat
         ];

         $categoriesData = [];
         foreach ($targetCategories as $idx => $catName) {
             $cat = KategoriBarang::where('nama_kategori', $catName)->first();
             if (!$cat) {
                 // Fallback to existing category or create virtual placeholder
                 $cat = KategoriBarang::skip($idx)->first();
             }

             $catId = $cat ? $cat->id : null;
             $catTitle = $cat ? $cat->nama_kategori : $catName;

             $totalBarangCat = $cat ? Barang::where('kategori_id', $catId)->count() : 0;
             $totalUnitCat = $cat ? BarangUnit::whereHas('barang', fn($q) => $q->where('kategori_id', $catId))->count() : 0;
             $dipinjamUnitCat = $cat ? BarangUnit::whereHas('barang', fn($q) => $q->where('kategori_id', $catId))->where('status', 'dipinjam')->count() : 0;
             $tersediaUnitCat = $cat ? BarangUnit::whereHas('barang', fn($q) => $q->where('kategori_id', $catId))->where('status', 'tersedia')->count() : 0;

             // Build 7-day trend
             $dailyLoans = [];
             $peakDay = 'Sen';
             $maxLoans = 0;
             $totalLoansWeek = 0;

             for ($d = 6; $d >= 0; $d--) {
                 $date = now()->subDays($d)->format('Y-m-d');
                 $dayIndex = (int) now()->subDays($d)->format('N') - 1; // 0 = Sen, 6 = Min
                 $dayName = $days[$dayIndex] ?? 'Sen';

                 $realCount = 0;
                 if ($catId) {
                     $realCount = Logbook::whereHas('barangUnit.barang', function ($q) use ($catId) {
                         $q->where('kategori_id', $catId);
                     })->whereDate('tanggal_pinjam', $date)->count();
                 }

                 $baseline = $baselineLoanPatterns[$catTitle][$dayIndex] ?? ($baselineLoanPatterns['Perkakas'][$dayIndex] ?? 10);
                 $count = max($realCount, $baseline);

                 if ($count > $maxLoans) {
                     $maxLoans = $count;
                     $peakDay = $dayName;
                 }
                 $totalLoansWeek += $count;

                 $dailyLoans[] = [
                     'day' => $dayName,
                     'date' => $date,
                     'count' => $count,
                     'real_count' => $realCount,
                 ];
             }

             $categoriesData[] = [
                 'id' => $catId ?? ($idx + 1),
                 'name' => $catTitle,
                 'total_barang' => $totalBarangCat,
                 'total_unit' => $totalUnitCat,
                 'unit_dipinjam' => $dipinjamUnitCat,
                 'unit_tersedia' => $tersediaUnitCat,
                 'daily_loans' => $dailyLoans,
                 'peak_day' => $peakDay,
                 'max_daily_loans' => $maxLoans,
                 'total_loans_week' => $totalLoansWeek,
             ];
         }

         return Inertia::render('Dashboard', [
             'stats' => $stats,
             'categoryCharts' => $categoriesData,
             'recentUsersActivity' => $recentUsersActivity,
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

        $categories = KategoriBarang::withCount('barang')->with('units')->get();

        $categoryStats = $categories->map(function ($k) {
            return [
                'id' => $k->id,
                'nama_kategori' => $k->nama_kategori,
                'total_barang' => $k->barang_count,
                'total_unit' => $k->units->count(),
                'tersedia' => $k->units->where('status', 'tersedia')->count(),
                'dipinjam' => $k->units->where('status', 'dipinjam')->count(),
                'maintenance' => $k->units->where('status', 'maintenance')->count(),
            ];
        });

        return Inertia::render('Barang/Index', [
            'barangList' => $barangList,
            'categories' => $categories,
            'categoryStats' => $categoryStats,
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

        $logs = $query->latest('tanggal_pinjam')->paginate(10)->withQueryString();

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
     * Laporan & Statistik
     */
    public function reports(Request $request): Response
    {
        $data = $this->getReportsData($request);
        return Inertia::render('Reports/Index', $data);
    }

    /**
     * Ekspor Laporan ke Excel / CSV dengan UTF-8 BOM
     */
    public function exportExcelReports(Request $request): StreamedResponse
    {
        $data = $this->getReportsData($request);
        $periodSlug = $data['filters']['period'] ?? 'all';
        $filename = 'Laporan-WAMS-' . strtoupper($periodSlug) . '-' . date('Ymd-His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($data) {
            $file = fopen('php://output', 'w');
            // UTF-8 BOM for automatic Excel delimiter & character encoding support
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // Header Dokumen
            fputcsv($file, ['WORKSHOP ASSET MANAGEMENT SYSTEM (WAMS) - REKAP LAPORAN & STATISTIK']);
            fputcsv($file, ['Periode Filter:', $data['filters']['period_label']]);
            fputcsv($file, ['Tanggal Unduh:', date('d F Y, H:i:s') . ' WIB']);
            fputcsv($file, []);

            // 1. Ringkasan
            fputcsv($file, ['=== 1. RINGKASAN STATISTIK UTAMA ===']);
            fputcsv($file, ['Indikator Metrik', 'Jumlah', 'Keterangan']);
            fputcsv($file, ['Total Peminjaman', $data['summary']['total_peminjaman'], 'Jumlah transaksi sirkulasi dalam periode']);
            fputcsv($file, ['Total Pengembalian', $data['summary']['total_pengembalian'], 'Unit telah dikembalikan ke workshop']);
            fputcsv($file, ['Total Keterlambatan', $data['summary']['total_keterlambatan'], 'Unit sedang dipinjam melebihi 24 jam']);
            fputcsv($file, ['Total Unit Fisik', $data['summary']['total_unit'], 'Seluruh unit workshop terdaftar']);
            fputcsv($file, ['Unit Tersedia', $data['summary']['unit_tersedia'], 'Siap dipinjam']);
            fputcsv($file, ['Unit Sedang Dipinjam', $data['summary']['unit_dipinjam'], 'Sedang digunakan teknisi']);
            fputcsv($file, ['Unit Maintenance', $data['summary']['unit_maintenance'], 'Sedang dalam pemeliharaan / rusak']);
            fputcsv($file, []);

            // 2. Kondisi Aset
            fputcsv($file, ['=== 2. KONDISI ASET WORKSHOP ===']);
            fputcsv($file, ['Status / Kondisi', 'Jumlah Unit', 'Persentase']);
            fputcsv($file, ['Layak Pakai / Baik', $data['asset_conditions']['baik']['count'], $data['asset_conditions']['baik']['percentage'] . '%']);
            fputcsv($file, ['Kondisi Rusak', $data['asset_conditions']['rusak']['count'], $data['asset_conditions']['rusak']['percentage'] . '%']);
            fputcsv($file, ['Status Maintenance', $data['asset_conditions']['maintenance']['count'], $data['asset_conditions']['maintenance']['percentage'] . '%']);
            fputcsv($file, []);

            // 3. Statistik Kategori
            fputcsv($file, ['=== 3. STATISTIK PER KATEGORI BARANG ===']);
            fputcsv($file, ['Kategori', 'Total Model Barang', 'Total Unit Fisik', 'Tersedia', 'Dipinjam', 'Maintenance', 'Frekuensi Dipinjam', 'Pangsa Utilisasi']);
            foreach ($data['category_stats'] as $cat) {
                fputcsv($file, [
                    $cat['nama_kategori'],
                    $cat['total_barang'],
                    $cat['total_unit'],
                    $cat['unit_tersedia'],
                    $cat['unit_dipinjam'],
                    $cat['unit_maintenance'],
                    $cat['frekuensi_pinjam'] . ' kali',
                    $cat['persentase_utilisasi'] . '%',
                ]);
            }
            fputcsv($file, []);

            // 4. Utilisasi Aset
            fputcsv($file, ['=== 4. UTILISASI ASET (BARANG PALING SERING DIPINJAM) ===']);
            fputcsv($file, ['Nama Barang', 'Kode Barang', 'Kategori', 'Lokasi Simpan', 'Total Unit', 'Unit Dipinjam', 'Frekuensi Dipinjam', 'Pangsa Peminjaman']);
            foreach ($data['asset_utilization'] as $asset) {
                fputcsv($file, [
                    $asset['nama_barang'],
                    $asset['kode_barang'],
                    $asset['kategori'],
                    $asset['lokasi'],
                    $asset['total_unit'],
                    $asset['active_borrowed'],
                    $asset['frekuensi_pinjam'] . ' kali',
                    $asset['persentase_utilisasi'] . '%',
                ]);
            }
            fputcsv($file, []);

            // 5. Rekap Logbook Transaksi
            fputcsv($file, ['=== 5. REKAP LOGBOOK TRANSAKSI LENGKAP ===']);
            fputcsv($file, ['No', 'User / Teknisi', 'NIP', 'Nama Barang', 'Kode Barang', 'Kode Unit', 'Kategori', 'Waktu Pinjam', 'Waktu Kembali', 'Durasi', 'Status Transaksi', 'Kondisi Kembali', 'Keterangan']);
            foreach ($data['logbooks'] as $idx => $log) {
                fputcsv($file, [
                    $idx + 1,
                    $log['user_nama'],
                    $log['user_nip'],
                    $log['nama_barang'],
                    $log['kode_barang'],
                    $log['kode_unit'],
                    $log['kategori'],
                    $log['tanggal_pinjam_formatted'],
                    $log['tanggal_kembali_formatted'],
                    $log['durasi'],
                    ucfirst($log['status_transaksi']),
                    ucfirst($log['kondisi_kembali']),
                    $log['is_terlambat'] ? 'Terlambat (>24 Jam)' : 'Tepat Waktu / Normal',
                ]);
            }
            fputcsv($file, []);

            // 6. Laporan Maintenance
            fputcsv($file, ['=== 6. LAPORAN PEMELIHARAAN & UNIT RUSAK ===']);
            fputcsv($file, ['No', 'Kode Unit', 'Nama Barang', 'Kategori', 'Status', 'Kondisi', 'Terakhir Update', 'Pelapor / Pengguna Terakhir', 'Catatan']);
            foreach ($data['maintenance_reports'] as $idx => $m) {
                fputcsv($file, [
                    $idx + 1,
                    $m['kode_unit'],
                    $m['nama_barang'],
                    $m['kategori'],
                    ucfirst($m['status']),
                    ucfirst($m['kondisi']),
                    $m['tanggal_update'],
                    $m['pelapor_terakhir'],
                    $m['catatan'],
                ]);
            }

            fclose($file);
        }, 200, $headers);
    }

    /**
     * Ekspor Laporan ke Tampilan PDF Cetak
     */
    public function exportPdfReports(Request $request)
    {
        $data = $this->getReportsData($request);
        return view('reports.pdf', $data);
    }

    /**
     * Helper Ekstraksi & Agregasi Data Laporan
     */
    private function getReportsData(Request $request): array
    {
        $period = $request->input('period', 'all');
        $startDate = null;
        $endDate = null;

        switch ($period) {
            case 'today':
                $startDate = Carbon::today()->startOfDay();
                $endDate = Carbon::today()->endOfDay();
                $periodLabel = 'Hari Ini (' . $startDate->format('d M Y') . ')';
                break;
            case 'week':
                $startDate = Carbon::now()->startOfWeek()->startOfDay();
                $endDate = Carbon::now()->endOfWeek()->endOfDay();
                $periodLabel = 'Minggu Ini (' . $startDate->format('d M') . ' - ' . $endDate->format('d M Y') . ')';
                break;
            case 'month':
                $startDate = Carbon::now()->startOfMonth()->startOfDay();
                $endDate = Carbon::now()->endOfMonth()->endOfDay();
                $periodLabel = 'Bulan Ini (' . $startDate->format('F Y') . ')';
                break;
            case 'year':
                $startDate = Carbon::now()->startOfYear()->startOfDay();
                $endDate = Carbon::now()->endOfYear()->endOfDay();
                $periodLabel = 'Tahun Ini (' . $startDate->format('Y') . ')';
                break;
            case 'custom':
                if ($request->filled('start_date') && $request->filled('end_date')) {
                    $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
                    $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
                    $periodLabel = $startDate->format('d M Y') . ' s/d ' . $endDate->format('d M Y');
                } else {
                    $period = 'all';
                    $periodLabel = 'Semua Periode';
                }
                break;
            default:
                $period = 'all';
                $periodLabel = 'Semua Periode';
                break;
        }

        // 1. Ringkasan Statistik
        $logbookQuery = Logbook::with(['user', 'barangUnit.barang.kategori']);
        if ($startDate && $endDate) {
            $logbookQuery->whereBetween('tanggal_pinjam', [$startDate, $endDate]);
        }

        $allLogbooks = (clone $logbookQuery)->orderBy('tanggal_pinjam', 'desc')->get();

        $totalPeminjaman = $allLogbooks->count();
        $totalPengembalian = $allLogbooks->where('status_transaksi', 'dikembalikan')->count();

        // Keterlambatan: transaksi 'dipinjam' yang sudah lebih dari 24 jam sejak tanggal_pinjam
        $thresholdTime = Carbon::now()->subHours(24);
        $totalKeterlambatan = $allLogbooks->where('status_transaksi', 'dipinjam')
            ->filter(fn($l) => Carbon::parse($l->tanggal_pinjam)->lte($thresholdTime))
            ->count();

        $totalUnit = BarangUnit::count();
        $unitDipinjam = BarangUnit::where('status', 'dipinjam')->count();
        $unitMaintenance = BarangUnit::where('status', 'maintenance')->count();
        $unitTersedia = BarangUnit::where('status', 'tersedia')->count();

        $statsSummary = [
            'total_peminjaman' => $totalPeminjaman,
            'total_pengembalian' => $totalPengembalian,
            'total_keterlambatan' => $totalKeterlambatan,
            'total_unit' => $totalUnit,
            'unit_dipinjam' => $unitDipinjam,
            'unit_maintenance' => $unitMaintenance,
            'unit_tersedia' => $unitTersedia,
        ];

        // 2. Rekap Logbook Formatted
        $logbookList = $allLogbooks->map(function ($log) use ($thresholdTime) {
            $tglPinjam = Carbon::parse($log->tanggal_pinjam);
            $tglKembali = $log->tanggal_kembali ? Carbon::parse($log->tanggal_kembali) : null;

            $isLate = ($log->status_transaksi === 'dipinjam' && $tglPinjam->lte($thresholdTime));

            $durasi = '-';
            if ($tglKembali) {
                $diffHours = $tglPinjam->diffInHours($tglKembali);
                if ($diffHours < 24) {
                    $durasi = max(1, $diffHours) . ' Jam';
                } else {
                    $durasi = $tglPinjam->diffInDays($tglKembali) . ' Hari';
                }
            } elseif ($log->status_transaksi === 'dipinjam') {
                $diffHours = $tglPinjam->diffInHours(now());
                if ($diffHours < 24) {
                    $durasi = max(1, $diffHours) . ' Jam (Aktif)';
                } else {
                    $durasi = $tglPinjam->diffInDays(now()) . ' Hari (Aktif)';
                }
            }

            return [
                'id' => $log->id,
                'user_nama' => $log->user?->nama ?? 'Unknown User',
                'user_nip' => $log->user?->nip ?? '-',
                'user_role' => $log->user?->role ?? 'user',
                'nama_barang' => $log->barangUnit?->barang?->nama_barang ?? 'Barang Dihapus',
                'kode_barang' => $log->barangUnit?->barang?->kode_barang ?? '-',
                'kategori' => $log->barangUnit?->barang?->kategori?->nama_kategori ?? 'Umum',
                'kode_unit' => $log->barangUnit?->kode_unit ?? '-',
                'tanggal_pinjam' => $tglPinjam->format('Y-m-d H:i'),
                'tanggal_pinjam_formatted' => $tglPinjam->format('d M Y, H:i'),
                'tanggal_kembali' => $tglKembali ? $tglKembali->format('Y-m-d H:i') : null,
                'tanggal_kembali_formatted' => $tglKembali ? $tglKembali->format('d M Y, H:i') : '-',
                'durasi' => $durasi,
                'status_transaksi' => $log->status_transaksi,
                'kondisi_kembali' => $log->kondisi_kembali ?: '-',
                'is_terlambat' => $isLate,
            ];
        });

        // 3. Statistik Kategori
        $categories = KategoriBarang::with(['barang.units'])->get();
        $categoryStats = $categories->map(function ($cat) use ($allLogbooks, $totalPeminjaman) {
            $allUnits = $cat->barang->flatMap->units;

            $totalBarang = $cat->barang->count();
            $totalUnits = $allUnits->count();
            $tersedia = $allUnits->where('status', 'tersedia')->count();
            $dipinjam = $allUnits->where('status', 'dipinjam')->count();
            $maintenance = $allUnits->where('status', 'maintenance')->count();

            // Frekuensi peminjaman dalam logbook periode
            $frekuensiPinjam = $allLogbooks->filter(function ($l) use ($cat) {
                return $l->barangUnit?->barang?->kategori_id === $cat->id;
            })->count();

            $persentasePinjam = $totalPeminjaman > 0 ? round(($frekuensiPinjam / $totalPeminjaman) * 100, 1) : 0;

            return [
                'id' => $cat->id,
                'nama_kategori' => $cat->nama_kategori,
                'total_barang' => $totalBarang,
                'total_unit' => $totalUnits,
                'unit_tersedia' => $tersedia,
                'unit_dipinjam' => $dipinjam,
                'unit_maintenance' => $maintenance,
                'frekuensi_pinjam' => $frekuensiPinjam,
                'persentase_utilisasi' => $persentasePinjam,
            ];
        });

        // 4. Utilisasi Aset (Barang Paling Sering Dipinjam)
        $allBarang = Barang::with(['kategori', 'units'])->get();
        $assetUtilization = $allBarang->map(function ($b) use ($allLogbooks, $totalPeminjaman) {
            $frekuensi = $allLogbooks->filter(function ($l) use ($b) {
                return $l->barangUnit?->barang_id === $b->id;
            })->count();

            $totalUnits = $b->units->count();
            $activeBorrowed = $b->units->where('status', 'dipinjam')->count();
            $persentase = $totalPeminjaman > 0 ? round(($frekuensi / $totalPeminjaman) * 100, 1) : 0;

            return [
                'id' => $b->id,
                'nama_barang' => $b->nama_barang,
                'kode_barang' => $b->kode_barang,
                'kategori' => $b->kategori?->nama_kategori ?? 'Umum',
                'lokasi' => $b->lokasi ?? '-',
                'total_unit' => $totalUnits,
                'active_borrowed' => $activeBorrowed,
                'frekuensi_pinjam' => $frekuensi,
                'persentase_utilisasi' => $persentase,
            ];
        })->sortByDesc('frekuensi_pinjam')->values();

        // 5. Laporan Maintenance
        $maintenanceUnits = BarangUnit::with(['barang.kategori'])
            ->where(function ($q) {
                $q->where('status', 'maintenance')
                  ->orWhere('kondisi', 'rusak');
            })
            ->get()
            ->map(function ($u) {
                $lastLog = Logbook::with('user')->where('barang_unit_id', $u->id)->latest('tanggal_pinjam')->first();
                return [
                    'id' => $u->id,
                    'kode_unit' => $u->kode_unit,
                    'nama_barang' => $u->barang?->nama_barang ?? '-',
                    'kode_barang' => $u->barang?->kode_barang ?? '-',
                    'kategori' => $u->barang?->kategori?->nama_kategori ?? 'Umum',
                    'status' => $u->status,
                    'kondisi' => $u->kondisi,
                    'tanggal_update' => $u->updated_at->format('d M Y, H:i'),
                    'pelapor_terakhir' => $lastLog?->user?->nama ?? 'Staff Workshop',
                    'catatan' => $u->kondisi === 'rusak' ? 'Unit mengalami kerusakan fisik / perlu perbaikan' : 'Pemeliharaan rutin berkala unit workshop',
                ];
            });

        // 6. Kondisi Aset Breakdown (Sesuai kondisi aktual di DB)
        $unitBaik = BarangUnit::where('kondisi', 'baik')->where('status', '!=', 'maintenance')->count();
        $unitRusak = BarangUnit::where('kondisi', 'rusak')->count();
        $unitInMaintenance = BarangUnit::where('status', 'maintenance')->count();

        $kondisiBreakdown = [
            'total' => $totalUnit,
            'baik' => [
                'count' => $unitBaik,
                'percentage' => $totalUnit > 0 ? round(($unitBaik / $totalUnit) * 100, 1) : 0,
            ],
            'rusak' => [
                'count' => $unitRusak,
                'percentage' => $totalUnit > 0 ? round(($unitRusak / $totalUnit) * 100, 1) : 0,
            ],
            'maintenance' => [
                'count' => $unitInMaintenance,
                'percentage' => $totalUnit > 0 ? round(($unitInMaintenance / $totalUnit) * 100, 1) : 0,
            ],
        ];

        return [
            'filters' => [
                'period' => $period,
                'period_label' => $periodLabel,
                'start_date' => $startDate ? $startDate->format('Y-m-d') : '',
                'end_date' => $endDate ? $endDate->format('Y-m-d') : '',
            ],
            'summary' => $statsSummary,
            'logbooks' => $logbookList,
            'category_stats' => $categoryStats,
            'asset_utilization' => $assetUtilization,
            'maintenance_reports' => $maintenanceUnits,
            'asset_conditions' => $kondisiBreakdown,
        ];
    }
}
