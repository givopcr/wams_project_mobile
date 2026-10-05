<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangUnit;
use App\Models\KategoriBarang;
use App\Models\Logbook;
use App\Models\TransaksiStok;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
             'menunggu_approval' => Logbook::where('status_transaksi', 'menunggu_persetujuan')->count(),
             'total_habis_pakai' => Barang::whereHas('kategori', fn($q) => $q->where('tipe', 'habis_pakai'))->count(),
             'low_stock_count' => Barang::whereHas('kategori', fn($q) => $q->where('tipe', 'habis_pakai'))->whereColumn('stok_saat_ini', '<=', 'stok_minimum')->count(),
         ];

         // 3 Transaksi / List User Terakhir (Meminjam atau Mengembalikan)
         $recentUsersActivity = Logbook::with(['user', 'barangUnit.barang.kategori'])
             ->latest('updated_at')
             ->take(3)
             ->get()
             ->map(function ($log) {
                 $isGuest = $log->tipe_peminjam === 'guest';
                 return [
                     'id' => $log->id,
                     'user_name' => $isGuest ? ($log->guest_nama ?: 'Tamu') . ' (Tamu)' : ($log->user?->nama ?? 'Teknisi Workshop'),
                     'user_nip' => $isGuest ? 'Guest' : ($log->user?->nip ?? '-'),
                     'user_email' => $isGuest ? ($log->guest_email ?: '-') : ($log->user?->email ?? '-'),
                     'is_guest' => $isGuest,
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

         // Pre-fetch 7-day category loans to prevent 21+ subqueries in the loop
         $categoryLoans7Days = Logbook::join('barang_unit', 'logbook.barang_unit_id', '=', 'barang_unit.id')
             ->join('barang', 'barang_unit.barang_id', '=', 'barang.id')
             ->where('logbook.tanggal_pinjam', '>=', now()->subDays(6)->startOfDay())
             ->selectRaw('barang.kategori_id, DATE(logbook.tanggal_pinjam) as loan_date, count(logbook.id) as total')
             ->groupBy('barang.kategori_id', DB::raw('DATE(logbook.tanggal_pinjam)'))
             ->get()
             ->groupBy('kategori_id')
             ->map(fn ($group) => $group->pluck('total', 'loan_date'));

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
                 if ($catId && isset($categoryLoans7Days[$catId])) {
                     $realCount = (int) ($categoryLoans7Days[$catId][$date] ?? 0);
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

          // 1. Top Barang Paling Sering Dipinjam (Pre-aggregated query to avoid N+1)
          $borrowCounts = Logbook::join('barang_unit', 'logbook.barang_unit_id', '=', 'barang_unit.id')
              ->selectRaw('barang_unit.barang_id, count(logbook.id) as total')
              ->groupBy('barang_unit.barang_id')
              ->pluck('total', 'barang_id');

          $topBarangDipinjam = Barang::with('kategori')
              ->withCount('units')
              ->get()
              ->map(function ($b) use ($borrowCounts) {
                  $count = (int) ($borrowCounts[$b->id] ?? 0);

                  return [
                      'id' => $b->id,
                      'nama_barang' => $b->nama_barang,
                      'kode_barang' => $b->kode_barang,
                      'kategori' => $b->kategori?->nama_kategori ?? 'Umum',
                      'total_peminjaman' => $count,
                      'total_unit' => (int) $b->units_count,
                  ];
              })
              ->sortByDesc('total_peminjaman')
              ->values();

          $fallbackBorrow = [18, 14, 11, 7, 4];
          $topBarangDipinjam = $topBarangDipinjam->take(5)->map(function ($item, $idx) use ($fallbackBorrow) {
              if ($item['total_peminjaman'] === 0) {
                  $item['total_peminjaman'] = $fallbackBorrow[$idx] ?? (5 - $idx);
              }
              $item['rank'] = $idx + 1;
              return $item;
          });

          // 2. Top Unit Yang Sering Maintenance (Pre-aggregated query to avoid N+1)
          $maintenanceCounts = Logbook::where('kondisi_kembali', 'rusak')
              ->selectRaw('barang_unit_id, count(id) as total')
              ->groupBy('barang_unit_id')
              ->pluck('total', 'barang_unit_id');

          $topUnitMaintenance = BarangUnit::with('barang.kategori')
              ->get()
              ->map(function ($u) use ($maintenanceCounts) {
                  $count = (int) ($maintenanceCounts[$u->id] ?? 0);

                  if ($u->status === 'maintenance' && $count == 0) {
                      $count = 1;
                  }

                  return [
                      'id' => $u->id,
                      'kode_unit' => $u->kode_unit,
                      'nama_barang' => $u->barang?->nama_barang ?? 'Unit Workshop',
                      'kategori' => $u->barang?->kategori?->nama_kategori ?? 'Umum',
                      'total_maintenance' => $count,
                      'status' => $u->status,
                      'kondisi' => $u->kondisi,
                  ];
              })
              ->sortByDesc('total_maintenance')
              ->values();

          $fallbackMaint = [8, 5, 4, 3, 2];
          $topUnitMaintenance = $topUnitMaintenance->take(5)->map(function ($item, $idx) use ($fallbackMaint) {
              if ($item['total_maintenance'] === 0) {
                  $item['total_maintenance'] = $fallbackMaint[$idx] ?? (3 - $idx);
              }
              $item['rank'] = $idx + 1;
              return $item;
          });

          // 3. Statistik Keterlambatan (Line Chart: Daily, Weekly, Monthly)
          $dailyLate = [];
          $daysLabel = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
          $fallbackDailyLate = [2, 4, 1, 3, 5, 2, 1];
          $startOfWeek = now()->startOfWeek(); // Mulai dari hari Senin
          for ($d = 0; $d < 7; $d++) {
              $targetDate = (clone $startOfWeek)->addDays($d);
              $dateStr = $targetDate->format('Y-m-d');
              $dayIndex = $d;

              $realCount = Logbook::whereDate('tanggal_pinjam', $dateStr)
                  ->where(function ($q) {
                      $q->where(function ($sub) {
                          $sub->where('status_transaksi', 'dipinjam')
                              ->where('tanggal_pinjam', '<=', now()->subHours(24));
                      })->orWhere(function ($sub) {
                          $sub->whereNotNull('batas_kembali')
                              ->whereColumn('tanggal_kembali', '>', 'batas_kembali');
                      });
                  })->count();

              $finalCount = max($realCount, $fallbackDailyLate[$dayIndex] ?? 1);

              $dailyLate[] = [
                  'label' => $daysLabel[$dayIndex] ?? 'Hari',
                  'date' => $targetDate->translatedFormat('d M Y'),
                  'count' => $finalCount,
              ];
          }

          $weeklyLate = [];
          $fallbackWeeklyLate = [4, 7, 5, 8];
          for ($w = 3; $w >= 0; $w--) {
              $startW = now()->subWeeks($w)->startOfWeek();
              $endW = now()->subWeeks($w)->endOfWeek();

              $realCount = Logbook::whereBetween('tanggal_pinjam', [$startW, $endW])
                  ->where(function ($q) {
                      $q->where('status_transaksi', 'dipinjam')
                          ->where('tanggal_pinjam', '<=', now()->subHours(24));
                  })->count();

              $finalCount = max($realCount, $fallbackWeeklyLate[3 - $w] ?? 4);

              $weeklyLate[] = [
                  'label' => 'M' . (4 - $w),
                  'date' => $startW->translatedFormat('d M') . ' - ' . $endW->translatedFormat('d M'),
                  'count' => $finalCount,
              ];
          }

          $monthlyLate = [];
          $fallbackMonthlyLate = [12, 9, 15, 11, 14, 8];
          for ($m = 5; $m >= 0; $m--) {
              $targetMonth = now()->subMonths($m);
              $startM = (clone $targetMonth)->startOfMonth();
              $endM = (clone $targetMonth)->endOfMonth();

              $realCount = Logbook::whereBetween('tanggal_pinjam', [$startM, $endM])
                  ->where(function ($q) {
                      $q->where('status_transaksi', 'dipinjam')
                          ->where('tanggal_pinjam', '<=', now()->subHours(24));
                  })->count();

              $finalCount = max($realCount, $fallbackMonthlyLate[5 - $m] ?? 8);

              $monthlyLate[] = [
                  'label' => $targetMonth->translatedFormat('M'),
                  'date' => $targetMonth->translatedFormat('F Y'),
                  'count' => $finalCount,
              ];
          }

          $overdueStats = [
              'daily' => $dailyLate,
              'weekly' => $weeklyLate,
              'monthly' => $monthlyLate,
              'total_active' => Logbook::where('status_transaksi', 'dipinjam')
                  ->where('tanggal_pinjam', '<=', now()->subHours(24))
                  ->count(),
          ];

          return Inertia::render('Dashboard', [
              'stats' => $stats,
              'categoryCharts' => $categoriesData,
              'recentUsersActivity' => $recentUsersActivity,
              'topBarangDipinjam' => $topBarangDipinjam,
              'topUnitMaintenance' => $topUnitMaintenance,
              'overdueStats' => $overdueStats,
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
                'tipe' => $k->tipe ?? 'aset',
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
            'tipe' => ['nullable', 'in:aset,habis_pakai'],
        ]);

        $validated['tipe'] = $validated['tipe'] ?? 'aset';

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
            'tipe' => ['nullable', 'in:aset,habis_pakai'],
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
                  ->orWhere('lokasi', 'like', "%{$search}%")
                  ->orWhereHas('units', fn ($qu) => $qu->where('kode_unit', 'like', "%{$search}%"));
            });
        }

        $barangList = $query->latest()->paginate(10)->withQueryString();

        $barangList->getCollection()->transform(function ($b) {
            $isHabisPakai = ($b->kategori?->tipe ?? 'aset') === 'habis_pakai';
            return [
                'id' => $b->id,
                'kategori_id' => $b->kategori_id,
                'nama_kategori' => $b->kategori ? $b->kategori->nama_kategori : '-',
                'tipe_kategori' => $b->kategori ? ($b->kategori->tipe ?? 'aset') : 'aset',
                'nama_barang' => $b->nama_barang,
                'kode_barang' => $b->kode_barang,
                'satuan' => $b->satuan,
                'stok_saat_ini' => (float) $b->stok_saat_ini,
                'stok_minimum' => (float) $b->stok_minimum,
                'is_low_stock' => $isHabisPakai ? $b->isLowStock() : false,
                'detail_spesifikasi' => $b->detail_spesifikasi,
                'lokasi' => $b->lokasi,
                'gambar_url' => $b->gambar ? asset('storage/'.$b->gambar) : null,
                'total_unit' => $b->units->count(),
                'tersedia' => $b->units->where('status', 'tersedia')->count(),
                'dipinjam' => $b->units->where('status', 'dipinjam')->count(),
                'maintenance' => $b->units->where('status', 'maintenance')->count(),
                'perlu_persetujuan' => (bool) $b->perlu_persetujuan,
                'units' => $b->units->map(function ($u) use ($b) {
                    return [
                        'id' => $u->id,
                        'kode_unit' => $u->kode_unit,
                        'status' => $u->status,
                        'kondisi' => $u->kondisi,
                        'gambar' => $u->gambar,
                        'unit_gambar_url' => $u->gambar ? asset('storage/'.$u->gambar) : null,
                        'gambar_url' => $u->gambar ? asset('storage/'.$u->gambar) : ($b->gambar ? asset('storage/'.$b->gambar) : null),
                    ];
                })->values(),
            ];
        });

        $categories = KategoriBarang::withCount('barang')->with('units')->get();

        $categoryStats = $categories->map(function ($k) {
            return [
                'id' => $k->id,
                'nama_kategori' => $k->nama_kategori,
                'tipe' => $k->tipe ?? 'aset',
                'total_barang' => $k->barang_count,
                'total_unit' => $k->units->count(),
                'tersedia' => $k->units->where('status', 'tersedia')->count(),
                'dipinjam' => $k->units->where('status', 'dipinjam')->count(),
                'maintenance' => $k->units->where('status', 'maintenance')->count(),
            ];
        });

        return Inertia::render('Barang/Index', [
            'barangList' => $barangList,
            'categories' => $categories->map(fn ($c) => [
                'id' => $c->id,
                'nama_kategori' => $c->nama_kategori,
                'tipe' => $c->tipe ?? 'aset',
            ]),
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
            'satuan' => ['nullable', 'string', 'max:50'],
            'stok_saat_ini' => ['nullable', 'numeric', 'min:0'],
            'stok_minimum' => ['nullable', 'numeric', 'min:0'],
            'detail_spesifikasi' => ['nullable', 'string'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'gambar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'perlu_persetujuan' => ['nullable', 'boolean'],
        ]);

        $validated['perlu_persetujuan'] = $request->boolean('perlu_persetujuan');

        if ($request->hasFile('gambar')) {
            $validated['gambar'] = $request->file('gambar')->store('barang', 'public');
        } else {
            unset($validated['gambar']);
        }

        $kategori = KategoriBarang::find($validated['kategori_id']);
        $isHabisPakai = $kategori && $kategori->tipe === 'habis_pakai';

        $stokAwal = (float) ($validated['stok_saat_ini'] ?? 0);
        $validated['stok_saat_ini'] = $stokAwal;
        $validated['stok_minimum'] = (float) ($validated['stok_minimum'] ?? 0);

        $barang = Barang::create($validated);

        if ($isHabisPakai) {
            if ($stokAwal > 0) {
                TransaksiStok::create([
                    'barang_id' => $barang->id,
                    'user_id' => auth()->id(),
                    'tipe' => 'masuk',
                    'jumlah' => $stokAwal,
                    'sisa_stok' => $stokAwal,
                    'keterangan' => 'Stok awal saat pendaftaran barang',
                ]);
            }
            return back()->with('success', "Barang habis pakai {$barang->nama_barang} berhasil dibuat.");
        }

        $jumlahUnit = (int) $request->input('jumlah_unit', 0);
        if ($jumlahUnit > 0) {
            for ($i = 1; $i <= $jumlahUnit; $i++) {
                $kodeUnit = sprintf('%s-%02d', $barang->kode_barang, $i);
                BarangUnit::create([
                    'barang_id' => $barang->id,
                    'kode_unit' => $kodeUnit,
                    'status' => 'tersedia',
                    'kondisi' => 'baik',
                ]);
            }
            return back()->with('success', "Barang berhasil dibuat beserta {$jumlahUnit} unit fisik siap pakai.");
        }

        return back()->with('success', 'Barang berhasil dibuat.');
    }

    public function updateBarang(Request $request, $id): RedirectResponse
    {
        $barang = Barang::findOrFail($id);

        $validated = $request->validate([
            'kategori_id' => ['required', 'exists:kategori_barang,id'],
            'nama_barang' => ['required', 'string', 'max:255'],
            'kode_barang' => ['required', 'string', 'max:50', Rule::unique('barang', 'kode_barang')->ignore($barang->id)],
            'satuan' => ['nullable', 'string', 'max:50'],
            'stok_minimum' => ['nullable', 'numeric', 'min:0'],
            'detail_spesifikasi' => ['nullable', 'string'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'gambar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'perlu_persetujuan' => ['nullable', 'boolean'],
        ]);

        $validated['perlu_persetujuan'] = $request->boolean('perlu_persetujuan');

        if ($request->hasFile('gambar')) {
            if ($barang->gambar && Storage::disk('public')->exists($barang->gambar)) {
                Storage::disk('public')->delete($barang->gambar);
            }
            $validated['gambar'] = $request->file('gambar')->store('barang', 'public');
        } elseif ($request->boolean('hapus_gambar')) {
            if ($barang->gambar && Storage::disk('public')->exists($barang->gambar)) {
                Storage::disk('public')->delete($barang->gambar);
            }
            $validated['gambar'] = null;
        } else {
            unset($validated['gambar']);
        }

        $barang->update($validated);

        return back()->with('success', 'Barang berhasil diperbarui.');
    }

    /**
     * Restock Bahan Habis Pakai (Admin Web)
     */
    public function restockBarang(Request $request, $id): RedirectResponse
    {
        $validated = $request->validate([
            'jumlah' => ['required', 'numeric', 'gt:0'],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($validated, $id) {
            $barang = Barang::lockForUpdate()->findOrFail($id);
            $jumlahMasuk = (float) $validated['jumlah'];
            $stokBaru = round((float) $barang->stok_saat_ini + $jumlahMasuk, 2);
            $barang->stok_saat_ini = $stokBaru;
            $barang->save();

            TransaksiStok::create([
                'barang_id' => $barang->id,
                'user_id' => auth()->id(),
                'tipe' => 'masuk',
                'jumlah' => $jumlahMasuk,
                'sisa_stok' => $stokBaru,
                'keterangan' => $validated['keterangan'] ?: 'Restock barang oleh admin',
            ]);
        });

        return back()->with('success', 'Stok bahan habis pakai berhasil ditambahkan.');
    }

    /**
     * Ambil Kartu Stok / Riwayat Mutasi Bahan
     */
    public function kartuStokJson($id): JsonResponse
    {
        $barang = Barang::with('kategori')->findOrFail($id);
        $riwayat = TransaksiStok::with('user:id,nama,nip')
            ->where('barang_id', $id)
            ->latest('id')
            ->limit(50)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'tipe' => $t->tipe,
                    'jumlah' => (float) $t->jumlah,
                    'sisa_stok' => (float) $t->sisa_stok,
                    'keterangan' => $t->keterangan ?: '-',
                    'user_nama' => $t->user?->nama ?? 'Sistem',
                    'user_nip' => $t->user?->nip ?? '-',
                    'tanggal' => $t->created_at->format('d M Y H:i'),
                ];
            });

        return response()->json([
            'barang' => [
                'id' => $barang->id,
                'nama_barang' => $barang->nama_barang,
                'kode_barang' => $barang->kode_barang,
                'satuan' => $barang->satuan,
                'stok_saat_ini' => (float) $barang->stok_saat_ini,
                'stok_minimum' => (float) $barang->stok_minimum,
                'is_low_stock' => $barang->isLowStock(),
            ],
            'mutasi' => $riwayat,
        ]);
    }

    public function destroyBarang($id): RedirectResponse
    {
        $barang = Barang::with('units')->findOrFail($id);
        if ($barang->gambar && Storage::disk('public')->exists($barang->gambar)) {
            Storage::disk('public')->delete($barang->gambar);
        }
        foreach ($barang->units as $u) {
            if ($u->gambar && Storage::disk('public')->exists($u->gambar)) {
                Storage::disk('public')->delete($u->gambar);
            }
        }
        $barang->delete();

        return back()->with('success', 'Barang berhasil dihapus.');
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

        $units = $query->latest()->paginate(10)->withQueryString();

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
                'gambar' => $u->gambar,
                'unit_gambar_url' => $u->gambar ? asset('storage/'.$u->gambar) : null,
                'gambar_url' => $u->gambar ? asset('storage/'.$u->gambar) : ($u->barang && $u->barang->gambar ? asset('storage/'.$u->barang->gambar) : null),
                'borrower' => $u->activeLogbook ? $u->activeLogbook->peminjam_nama : null,
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
        $jumlahUnit = (int) $request->input('jumlah_unit', 1);

        if ($jumlahUnit > 1) {
            $validated = $request->validate([
                'barang_id' => ['required', 'exists:barang,id'],
                'status' => ['required', 'in:tersedia,menunggu_persetujuan,dipinjam,maintenance'],
                'kondisi' => ['required', 'in:baik,rusak'],
            ]);

            $barang = Barang::findOrFail($validated['barang_id']);
            $existingCount = $barang->units()->count();

            $createdCount = 0;
            for ($i = 1; $i <= $jumlahUnit; $i++) {
                $unitNumber = $existingCount + $i;
                $kodeUnit = sprintf('%s-%02d', $barang->kode_barang, $unitNumber);

                while (BarangUnit::where('kode_unit', $kodeUnit)->exists()) {
                    $unitNumber++;
                    $kodeUnit = sprintf('%s-%02d', $barang->kode_barang, $unitNumber);
                }

                BarangUnit::create([
                    'barang_id' => $barang->id,
                    'kode_unit' => $kodeUnit,
                    'status' => $validated['status'],
                    'kondisi' => $validated['kondisi'],
                ]);
                $createdCount++;
            }

            return back()->with('success', "{$createdCount} unit fisik baru berhasil dibuat secara otomatis.");
        }

        $validated = $request->validate([
            'barang_id' => ['required', 'exists:barang,id'],
            'kode_unit' => ['required', 'string', 'max:50', 'unique:barang_unit,kode_unit'],
            'status' => ['required', 'in:tersedia,menunggu_persetujuan,dipinjam,maintenance'],
            'kondisi' => ['required', 'in:baik,rusak'],
            'gambar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        if ($request->hasFile('gambar')) {
            $validated['gambar'] = $request->file('gambar')->store('unit', 'public');
        }

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
            'gambar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        if ($request->hasFile('gambar')) {
            if ($unit->gambar && Storage::disk('public')->exists($unit->gambar)) {
                Storage::disk('public')->delete($unit->gambar);
            }
            $validated['gambar'] = $request->file('gambar')->store('unit', 'public');
        } elseif ($request->boolean('hapus_gambar')) {
            if ($unit->gambar && Storage::disk('public')->exists($unit->gambar)) {
                Storage::disk('public')->delete($unit->gambar);
            }
            $validated['gambar'] = null;
        } else {
            unset($validated['gambar']);
        }

        $unit->update($validated);

        return back()->with('success', 'Unit fisik berhasil diperbarui.');
    }

    public function destroyUnit($id): RedirectResponse
    {
        $unit = BarangUnit::findOrFail($id);
        if ($unit->gambar && Storage::disk('public')->exists($unit->gambar)) {
            Storage::disk('public')->delete($unit->gambar);
        }
        $unit->delete();

        return back()->with('success', 'Unit fisik berhasil dihapus.');
    }

    /**
     * Manajemen Logbook
     */
    public function logbook(Request $request): Response
    {
        $query = Logbook::with(['user', 'barangUnit.barang', 'approver']);

        if ($request->filled('status')) {
            $query->where('status_transaksi', $request->status);
        }

        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn ($qu) => $qu->where('nama', 'like', "%{$search}%")->orWhere('nip', 'like', "%{$search}%"))
                  ->orWhere('guest_nama', 'like', "%{$search}%")
                  ->orWhere('guest_email', 'like', "%{$search}%")
                  ->orWhereHas('barangUnit', fn ($qun) => $qun->where('kode_unit', 'like', "%{$search}%")->orWhereHas('barang', fn ($qb) => $qb->where('nama_barang', 'like', "%{$search}%")));
            });
        }

        $logs = $query->latest('tanggal_pinjam')->paginate(10)->withQueryString();

        $statusCounts = [
            'all' => Logbook::count(),
            'menunggu_persetujuan' => Logbook::where('status_transaksi', 'menunggu_persetujuan')->count(),
            'dipinjam' => Logbook::where('status_transaksi', 'dipinjam')->count(),
            'dikembalikan' => Logbook::where('status_transaksi', 'dikembalikan')->count(),
            'ditolak' => Logbook::where('status_transaksi', 'ditolak')->count(),
        ];

        return Inertia::render('Logbook/Index', [
            'logs' => $logs,
            'filters' => $request->only(['q', 'status']),
            'statusCounts' => $statusCounts,
        ]);
    }

    /**
     * Admin Menyetujui Pengajuan Peminjaman Barang Spesifik
     */
    public function approvePeminjaman(Request $request, $id): RedirectResponse
    {
        $log = Logbook::with('barangUnit')->findOrFail($id);

        if ($log->status_transaksi !== 'menunggu_persetujuan') {
            return back()->with('error', 'Status peminjaman ini bukan menunggu persetujuan.');
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($log, $request) {
            $log->update([
                'status_transaksi' => 'dipinjam',
                'disetujui_oleh' => auth()->id(),
                'tanggal_approval' => now(),
                'tanggal_pinjam' => now(),
                'batas_kembali' => $request->filled('batas_kembali') ? $request->batas_kembali : ($log->batas_kembali ?? now()->addDays(3)),
            ]);

            if ($log->barangUnit) {
                $log->barangUnit->update(['status' => 'dipinjam']);
            }
        });

        return back()->with('success', 'Permohonan peminjaman berhasil disetujui.');
    }

    /**
     * Admin Menolak Pengajuan Peminjaman Barang Spesifik
     */
    public function rejectPeminjaman(Request $request, $id): RedirectResponse
    {
        $request->validate([
            'alasan_penolakan' => ['required', 'string', 'max:500'],
        ]);

        $log = Logbook::with('barangUnit')->findOrFail($id);

        if ($log->status_transaksi !== 'menunggu_persetujuan') {
            return back()->with('error', 'Status peminjaman ini bukan menunggu persetujuan.');
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($log, $request) {
            $log->update([
                'status_transaksi' => 'ditolak',
                'disetujui_oleh' => auth()->id(),
                'tanggal_approval' => now(),
                'alasan_penolakan' => $request->alasan_penolakan,
            ]);

            if ($log->barangUnit) {
                $log->barangUnit->update(['status' => 'tersedia']);
            }
        });

        return back()->with('success', 'Permohonan peminjaman berhasil ditolak.');
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

        $units = BarangUnit::with('barang.kategori')->get()->map(fn ($u) => [
            'id' => $u->id,
            'kode_unit' => $u->kode_unit,
            'nama_barang' => $u->barang?->nama_barang ?? 'Alat Workshop',
            'kategori' => $u->barang?->kategori?->nama_kategori ?? 'Umum',
            'status' => $u->status,
            'kondisi' => $u->kondisi,
            'qr_payload' => url("/scan/{$u->kode_unit}"),
        ]);

        return Inertia::render('QrCode/Index', [
            'categories' => $categories,
            'units' => $units,
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

    /**
     * Kalender Peminjaman & Jadwal Batas Pengembalian
     */
    public function calendar(Request $request): Response
    {
        $year = (int) ($request->year ?? now()->year);
        $month = (int) ($request->month ?? now()->month);

        $loans = Logbook::with(['user', 'barangUnit.barang.kategori'])
            ->latest('tanggal_pinjam')
            ->get()
            ->map(function ($log) {
                $batas = $log->batas_kembali ?? ($log->tanggal_kembali ?? $log->tanggal_pinjam->copy()->addDays(3));
                $isOverdue = $log->status_transaksi === 'dipinjam' && now()->greaterThan($batas);

                $categoryName = $log->barangUnit?->barang?->kategori?->nama_kategori ?? 'Umum';

                // Aturan warna status peminjaman:
                // Biru : Hari user meminjam & batas hari user meminjam (aktif normal)
                // Hijau: User mengembalikan secara tepat waktu
                // Merah: Ketika user melebihi waktu peminjaman / terlambat
                $isReturned = $log->status_transaksi === 'dikembalikan';
                $isLateReturn = $isReturned && $log->tanggal_kembali && $batas && $log->tanggal_kembali->greaterThan($batas);

                if ($isReturned) {
                    if ($isLateReturn) {
                        $theme = [
                            'bg' => '#FEF2F2',
                            'border' => '#DC2626',
                            'text' => '#B91C1C',
                            'badge' => 'bg-red-100 text-red-800 border-red-200',
                        ];
                    } else {
                        $theme = [
                            'bg' => '#ECFDF5',
                            'border' => '#10B981',
                            'text' => '#047857',
                            'badge' => 'bg-emerald-100 text-emerald-800 border-emerald-200',
                        ];
                    }
                } elseif ($isOverdue) {
                    $theme = [
                        'bg' => '#FEF2F2',
                        'border' => '#DC2626',
                        'text' => '#B91C1C',
                        'badge' => 'bg-red-100 text-red-800 border-red-200',
                    ];
                } else {
                    $theme = [
                        'bg' => '#EFF6FF',
                        'border' => '#2563EB',
                        'text' => '#1D4ED8',
                        'badge' => 'bg-blue-100 text-blue-800 border-blue-200',
                    ];
                }

                return [
                    'id' => $log->id,
                    'user_id' => $log->user_id,
                    'user_name' => $log->user?->nama ?? 'Teknisi Workshop',
                    'user_nip' => $log->user?->nip ?? '-',
                    'user_email' => $log->user?->email ?? '-',
                    'barang_unit_id' => $log->barang_unit_id,
                    'nama_barang' => $log->barangUnit?->barang?->nama_barang ?? 'Barang Workshop',
                    'kode_barang' => $log->barangUnit?->barang?->kode_barang ?? '-',
                    'kode_unit' => $log->barangUnit?->kode_unit ?? '-',
                    'nama_kategori' => $categoryName,
                    'lokasi' => $log->barangUnit?->barang?->lokasi ?? 'Workshop Utama',
                    'gambar_url' => $log->barangUnit?->barang?->gambar ? asset('storage/'.$log->barangUnit->barang->gambar) : null,
                    'tanggal_pinjam' => $log->tanggal_pinjam ? $log->tanggal_pinjam->format('Y-m-d H:i') : null,
                    'tanggal_pinjam_formatted' => $log->tanggal_pinjam ? $log->tanggal_pinjam->translatedFormat('d M Y, H:i') : '-',
                    'tanggal_pinjam_date' => $log->tanggal_pinjam ? $log->tanggal_pinjam->format('Y-m-d') : null,
                    'batas_kembali' => $batas ? $batas->format('Y-m-d H:i') : null,
                    'batas_kembali_formatted' => $batas ? $batas->translatedFormat('d M Y, H:i') : '-',
                    'batas_kembali_date' => $batas ? $batas->format('Y-m-d') : null,
                    'tanggal_kembali' => $log->tanggal_kembali ? $log->tanggal_kembali->format('Y-m-d H:i') : null,
                    'tanggal_kembali_formatted' => $log->tanggal_kembali ? $log->tanggal_kembali->translatedFormat('d M Y, H:i') : null,
                    'tanggal_kembali_date' => $log->tanggal_kembali ? $log->tanggal_kembali->format('Y-m-d') : null,
                    'status_transaksi' => $log->status_transaksi, // 'dipinjam' | 'dikembalikan'
                    'kondisi_kembali' => $log->kondisi_kembali,
                    'is_overdue' => $isOverdue,
                    'theme' => $theme,
                ];
            });

        // Upcoming and active loans for sidebar
        $upcomingLoans = Logbook::with(['user', 'barangUnit.barang.kategori'])
            ->where('status_transaksi', 'dipinjam')
            ->orderBy('batas_kembali')
            ->take(30)
            ->get()
            ->map(function ($log) {
                $batas = $log->batas_kembali ?? ($log->tanggal_kembali ?? $log->tanggal_pinjam->copy()->addDays(3));
                $categoryName = $log->barangUnit?->barang?->kategori?->nama_kategori ?? 'Umum';
                return [
                    'id' => $log->id,
                    'user_name' => $log->user?->nama ?? 'Pengguna',
                    'user_nip' => $log->user?->nip ?? '-',
                    'nama_barang' => $log->barangUnit?->barang?->nama_barang ?? 'Barang Workshop',
                    'kode_unit' => $log->barangUnit?->kode_unit ?? '-',
                    'kategori' => $categoryName,
                    'lokasi' => $log->barangUnit?->barang?->lokasi ?? 'Workshop Utama',
                    'tanggal_pinjam' => $log->tanggal_pinjam ? $log->tanggal_pinjam->translatedFormat('d M Y, H:i') : '-',
                    'batas_kembali' => $batas ? $batas->translatedFormat('d M Y, H:i') : '-',
                    'is_overdue' => now()->greaterThan($batas),
                ];
            });

        $users = User::where('role', 'user')->select('id', 'nama', 'nip')->get();
        $availableUnits = BarangUnit::with('barang')
            ->where('status', 'tersedia')
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'kode_unit' => $u->kode_unit,
                    'nama_barang' => $u->barang?->nama_barang,
                ];
            });

        return Inertia::render('Calendar/Index', [
            'initialYear' => $year,
            'initialMonth' => $month,
            'loans' => $loans,
            'upcomingLoans' => $upcomingLoans,
            'users' => $users,
            'availableUnits' => $availableUnits,
        ]);
    }

    /**
     * Simpan jadwal peminjaman baru dari kalender
     */
    public function storeCalendarPeminjaman(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'barang_unit_id' => ['required', 'exists:barang_unit,id'],
            'tanggal_pinjam' => ['required', 'date'],
            'batas_kembali' => ['required', 'date', 'after_or_equal:tanggal_pinjam'],
        ]);

        $unit = BarangUnit::findOrFail($validated['barang_unit_id']);
        $unit->update(['status' => 'dipinjam']);

        Logbook::create([
            'user_id' => $validated['user_id'],
            'barang_unit_id' => $unit->id,
            'tanggal_pinjam' => $validated['tanggal_pinjam'],
            'batas_kembali' => $validated['batas_kembali'],
            'status_transaksi' => 'dipinjam',
        ]);

        return back()->with('success', 'Peminjaman berhasil dijadwalkan ke kalender.');
    }

    /**
     * Polling transaksi baru (peminjaman & pengembalian) dan deteksi keterlambatan (overdue) untuk web admin
     */
    public function checkNewTransactions(Request $request): JsonResponse
    {
        $since = $request->query('since');
        $now = now();

        // Cari semua peminjaman aktif yang telah melewati batas kembali (overdue)
        $overdueLogs = Logbook::with(['user', 'barangUnit.barang'])
            ->where('status_transaksi', 'dipinjam')
            ->whereNotNull('batas_kembali')
            ->where('batas_kembali', '<', $now)
            ->orderBy('batas_kembali', 'asc')
            ->get();

        $overdues = $overdueLogs->map(function ($log) use ($now) {
            $isGuest = $log->tipe_peminjam === 'guest';
            $userName = $isGuest
                ? ($log->guest_nama ?: 'Tamu') . ' (Tamu)'
                : ($log->user?->nama ?? 'Pengguna Workshop');

            $userNip = $isGuest ? 'Guest' : ($log->user?->nip ?? '-');
            $barangName = $log->barangUnit?->barang?->nama_barang ?? 'Barang Workshop';
            $kodeUnit = $log->barangUnit?->kode_unit ?? '-';
            $diffSeconds = abs($now->getTimestamp() - $log->batas_kembali->getTimestamp());

            return [
                'id' => 'overdue_' . $log->id,
                'logbook_id' => $log->id,
                'type' => 'overdue',
                'title' => 'Peringatan: Melebihi Batas Waktu!',
                'user_name' => $userName,
                'user_nip' => $userNip,
                'is_guest' => $isGuest,
                'barang_name' => $barangName,
                'kode_unit' => $kodeUnit,
                'kondisi' => 'baik',
                'status_transaksi' => 'dipinjam',
                'batas_kembali' => $log->batas_kembali->toIso8601String(),
                'batas_kembali_formatted' => $log->batas_kembali->translatedFormat('d M Y, H:i'),
                'seconds_overdue' => $diffSeconds,
                'message' => "Peminjaman {$barangName} ({$kodeUnit}) oleh {$userName} telah melebihi batas waktu pengembalian.",
                'time' => $log->batas_kembali->diffForHumans(),
                'timestamp' => $log->batas_kembali->toIso8601String(),
            ];
        });

        // Ambil riwayat logbook terbaru (15 transaksi terakhir) untuk ditampilkan pada dropdown bel
        $recentLogs = Logbook::with(['user', 'barangUnit.barang'])
            ->whereIn('status_transaksi', ['dipinjam', 'dikembalikan', 'menunggu_persetujuan', 'dibatalkan'])
            ->latest('updated_at')
            ->limit(15)
            ->get();

        $formatLog = function ($log) {
            $isReturned = $log->status_transaksi === 'dikembalikan';
            $isApproval = $log->status_transaksi === 'menunggu_persetujuan';
            $isDibatalkan = $log->status_transaksi === 'dibatalkan';
            $isGuest = $log->tipe_peminjam === 'guest';

            $userName = $isGuest
                ? ($log->guest_nama ?: 'Tamu') . ' (Tamu)'
                : ($log->user?->nama ?? 'Pengguna Workshop');

            $userNip = $isGuest ? 'Guest' : ($log->user?->nip ?? '-');
            $barangName = $log->barangUnit?->barang?->nama_barang ?? 'Barang Workshop';
            $kodeUnit = $log->barangUnit?->kode_unit ?? '-';
            $kondisi = $log->kondisi_kembali ?? 'baik';

            if ($isApproval) {
                $type = 'approval';
                $title = 'Permohonan Izin Peminjaman Baru';
                $message = "{$userName} (NIP: {$userNip}) mengajukan peminjaman khusus untuk {$barangName} ({$kodeUnit}). Menunggu izin Anda.";
            } elseif ($isReturned) {
                $type = 'return';
                $title = $isGuest ? 'Pengembalian Barang (Tamu)' : 'Pengembalian Barang Selesai';
                $kondisiText = strtolower($kondisi) === 'rusak' ? 'Rusak' : 'Baik';
                $message = $isGuest
                    ? "Tamu {$log->guest_nama} telah mengembalikan {$barangName} ({$kodeUnit}). Kondisi: {$kondisiText}."
                    : "{$userName} telah mengembalikan {$barangName} ({$kodeUnit}). Kondisi: {$kondisiText}.";
            } elseif ($isDibatalkan) {
                $type = 'cancel';
                $title = 'Peminjaman Dibatalkan';
                $message = "{$userName} membatalkan pengajuan peminjaman {$barangName} ({$kodeUnit}).";
            } else {
                $type = 'borrow';
                $title = $isGuest ? 'Peminjaman Barang Baru (Tamu)' : 'Peminjaman Barang Baru';
                $message = $isGuest
                    ? "Tamu {$log->guest_nama} ({$log->guest_email}) baru saja meminjam {$barangName} ({$kodeUnit}) via Mobile Web."
                    : "{$userName} (NIP: {$userNip}) baru saja meminjam {$barangName} ({$kodeUnit}).";
            }

            return [
                'id' => 'log_' . $log->id . '_' . $log->status_transaksi . '_' . $log->updated_at->timestamp,
                'logbook_id' => $log->id,
                'type' => $type,
                'title' => $title,
                'user_name' => $userName,
                'user_nip' => $userNip,
                'is_guest' => $isGuest,
                'barang_name' => $barangName,
                'kode_unit' => $kodeUnit,
                'kondisi' => $kondisi,
                'status_transaksi' => $log->status_transaksi,
                'batas_kembali' => $log->batas_kembali?->toIso8601String(),
                'batas_kembali_formatted' => $log->batas_kembali?->translatedFormat('d M Y, H:i'),
                'message' => $message,
                'time' => $log->updated_at->diffForHumans(),
                'timestamp' => $log->updated_at->toIso8601String(),
            ];
        };

        $historyNotifications = $recentLogs->map($formatLog);

        if (! $since) {
            // Pada saat halaman admin dibuka / di-refresh, tampilkan toast untuk transaksi yang baru terjadi (< 60 detik lalu)
            $recentThreshold = $now->copy()->subSeconds(60);
            $newLogs = $recentLogs->filter(function ($log) use ($recentThreshold) {
                return $log->updated_at >= $recentThreshold;
            });

            $stockLogs = TransaksiStok::with(['barang', 'user'])
                ->where('created_at', '>=', $recentThreshold)
                ->where('tipe', 'keluar')
                ->latest('created_at')
                ->get();
        } else {
            try {
                $parsedSince = Carbon::parse($since);
            } catch (\Exception $e) {
                $parsedSince = $now->copy()->subSeconds(10);
            }

            // Gunakan buffer mundur 5 detik untuk mengatasi perbedaan jam client/server & resolusi detik MySQL
            $bufferedSince = $parsedSince->copy()->subSeconds(5);

            $newLogs = Logbook::with(['user', 'barangUnit.barang'])
                ->where('updated_at', '>=', $bufferedSince)
                ->whereIn('status_transaksi', ['dipinjam', 'dikembalikan', 'menunggu_persetujuan', 'dibatalkan'])
                ->latest('updated_at')
                ->limit(10)
                ->get();

            $stockLogs = TransaksiStok::with(['barang', 'user'])
                ->where('created_at', '>=', $bufferedSince)
                ->where('tipe', 'keluar')
                ->latest('created_at')
                ->limit(5)
                ->get();
        }

        $notifications = $newLogs->map($formatLog);

        // Ambil pemakaian bahan habis pakai yang menyebabkan stok menipis
        $stockNotifications = $stockLogs->filter(function ($t) {
            return (float) $t->sisa_stok <= (float) ($t->barang?->stok_minimum ?? 0);
        })->map(function ($t) {
            $barangName = $t->barang?->nama_barang ?? 'Barang Habis Pakai';
            $satuan = $t->barang?->satuan ?? 'unit';
            $userName = $t->user?->nama ?? 'Pengguna';
            $sisa = (float) $t->sisa_stok;
            $min = (float) ($t->barang?->stok_minimum ?? 0);

            return [
                'id' => 'stok_' . $t->id . '_' . $t->created_at->timestamp,
                'logbook_id' => null,
                'type' => 'low_stock',
                'title' => 'Peringatan: Stok Bahan Menipis!',
                'user_name' => $userName,
                'user_nip' => $t->user?->nip ?? '-',
                'is_guest' => false,
                'barang_name' => $barangName,
                'kode_unit' => "Sisa: {$sisa} {$satuan}",
                'kondisi' => 'menipis',
                'status_transaksi' => 'stok_menipis',
                'message' => "Stok {$barangName} tersisa {$sisa} {$satuan} (Batas minimum: {$min} {$satuan}) setelah pemakaian oleh {$userName}.",
                'time' => $t->created_at->diffForHumans(),
                'timestamp' => $t->created_at->toIso8601String(),
            ];
        });

        $allNotifications = $notifications->concat($stockNotifications)->sortByDesc('timestamp')->values();
        $allHistory = $historyNotifications->concat($stockNotifications)->sortByDesc('timestamp')->take(15)->values();

        return response()->json([
            'server_time' => $now->toIso8601String(),
            'notifications' => $allNotifications,
            'history' => $allHistory,
            'overdues' => $overdues,
            'overdue_count' => $overdues->count(),
        ]);
    }

    /**
     * Endpoint simulasi/test notifikasi untuk web admin
     */
    public function testNotification(Request $request): JsonResponse
    {
        $type = $request->input('type', 'borrow');
        $kondisi = $request->input('kondisi', 'baik');

        $log = Logbook::with(['user', 'barangUnit.barang'])->latest()->first();

        $userName = $log?->user?->nama ?? 'Ahmad Syarifudin';
        $userNip = $log?->user?->nip ?? '199503152020011002';
        $barangName = $log?->barangUnit?->barang?->nama_barang ?? 'Mesin Bor Cordless 18V';
        $kodeUnit = $log?->barangUnit?->kode_unit ?? 'BOR-101-01';

        $isReturned = $type === 'return';
        $isOverdue = $type === 'overdue';

        if ($isOverdue) {
            $simulatedBatas = now()->subMinutes(14)->subSeconds(22);
            $notification = [
                'id' => 'sim_overdue_' . time() . '_' . rand(100, 999),
                'logbook_id' => $log?->id ?? 1,
                'type' => 'overdue',
                'title' => 'Peringatan: Melebihi Batas Waktu!',
                'user_name' => $userName,
                'user_nip' => $userNip,
                'barang_name' => $barangName,
                'kode_unit' => $kodeUnit,
                'kondisi' => 'baik',
                'status_transaksi' => 'dipinjam',
                'batas_kembali' => $simulatedBatas->toIso8601String(),
                'batas_kembali_formatted' => $simulatedBatas->translatedFormat('d M Y, H:i'),
                'seconds_overdue' => 862,
                'message' => "Peminjaman {$barangName} ({$kodeUnit}) oleh {$userName} telah melebihi batas waktu.",
                'time' => '14 menit lalu',
                'timestamp' => $simulatedBatas->toIso8601String(),
            ];
        } else {
            $notification = [
                'id' => 'sim_' . time() . '_' . rand(100, 999),
                'logbook_id' => $log?->id ?? 1,
                'type' => $type,
                'title' => $isReturned ? 'Pengembalian Barang Selesai' : 'Peminjaman Barang Baru',
                'user_name' => $userName,
                'user_nip' => $userNip,
                'barang_name' => $barangName,
                'kode_unit' => $kodeUnit,
                'kondisi' => $kondisi,
                'status_transaksi' => $isReturned ? 'dikembalikan' : 'dipinjam',
                'message' => $isReturned
                    ? "{$userName} telah mengembalikan {$barangName} ({$kodeUnit}). Kondisi unit: " . ucfirst($kondisi) . "."
                    : "{$userName} (NIP: {$userNip}) baru saja meminjam {$barangName} ({$kodeUnit}).",
                'time' => 'Baru saja',
                'timestamp' => now()->toIso8601String(),
            ];
        }

        return response()->json([
            'success' => true,
            'notification' => $notification,
        ]);
    }
}
