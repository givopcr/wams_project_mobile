<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangUnit;
use App\Models\KategoriBarang;
use App\Models\Logbook;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Tampilan Dashboard Utama Admin
     */
    public function index(): Response
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
            'total_habis_pakai' => Barang::where('tipe', 'habis_pakai')->count(),
            'low_stock_count' => Barang::where('tipe', 'habis_pakai')->whereColumn('stok_saat_ini', '<=', 'stok_minimum')->count(),
        ];

        // 3 Transaksi / List User Terakhir (Meminjam atau Mengembalikan)
        $recentUsersActivity = Logbook::with(['user', 'barangUnit.barang.kategori'])
            ->latest('updated_at')
            ->take(3)
            ->get()
            ->map(function ($log) {
                $isGuest = $log->tipe_peminjam === 'guest';
                $tgl = $log->status_transaksi === 'dikembalikan' && $log->tanggal_kembali
                    ? $log->tanggal_kembali
                    : $log->tanggal_pinjam;

                return [
                    'id' => $log->id,
                    'user_name' => $isGuest ? ($log->guest_nama ?: 'Tamu') . ' (Tamu)' : ($log->user?->nama ?? 'Teknisi Workshop'),
                    'user_nip' => $isGuest ? 'Guest' : ($log->user?->nip ?? '-'),
                    'user_email' => $isGuest ? ($log->guest_email ?: '-') : ($log->user?->email ?? '-'),
                    'is_guest' => $isGuest,
                    'nama_barang' => $log->barangUnit?->barang?->nama_barang ?? 'Barang Workshop',
                    'kode_unit' => $log->barangUnit?->kode_unit ?? '-',
                    'kategori' => $log->barangUnit?->barang?->kategori?->nama_kategori ?? 'Umum',
                    'status_transaksi' => $log->status_transaksi,
                    'tanggal' => $tgl,
                    'formatted_date' => $tgl ? date('d M Y, H:i', strtotime($tgl)) : '-',
                ];
            });

        // 3 Kategori Utama: Perkakas, Elektronik, Komponen
        $targetCategories = ['Perkakas', 'Elektronik', 'Komponen'];
        $days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

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
                $cat = KategoriBarang::skip($idx)->first();
            }

            $catId = $cat ? $cat->id : null;
            $catTitle = $cat ? $cat->nama_kategori : $catName;

            $totalBarangCat = $cat ? Barang::where('kategori_id', $catId)->count() : 0;
            $totalUnitCat = $cat ? BarangUnit::whereHas('barang', fn($q) => $q->where('kategori_id', $catId))->count() : 0;
            $dipinjamUnitCat = $cat ? BarangUnit::whereHas('barang', fn($q) => $q->where('kategori_id', $catId))->where('status', 'dipinjam')->count() : 0;
            $tersediaUnitCat = $cat ? BarangUnit::whereHas('barang', fn($q) => $q->where('kategori_id', $catId))->where('status', 'tersedia')->count() : 0;

            // Build 7-day trend (100% real database figures)
            $dailyLoans = [];
            $peakDay = '-';
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

                $count = $realCount;

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

        // 1. Top Barang Paling Sering Dipinjam
        $borrowCounts = Logbook::join('barang_unit', 'logbook.barang_unit_id', '=', 'barang_unit.id')
            ->selectRaw('barang_unit.barang_id, count(logbook.id) as total')
            ->groupBy('barang_unit.barang_id')
            ->pluck('total', 'barang_id');

        $allRankedBarang = Barang::with('kategori')
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
            ->values()
            ->map(function ($item, $idx) {
                $item['rank'] = $idx + 1;
                return $item;
            });

        $topBarangDipinjam = $allRankedBarang->take(5)->values();

        // 2. Top Unit Yang Sering Maintenance
        $maintenanceCounts = Logbook::where('kondisi_kembali', 'rusak')
            ->selectRaw('barang_unit_id, count(id) as total')
            ->groupBy('barang_unit_id')
            ->pluck('total', 'barang_unit_id');

        $allRankedUnits = BarangUnit::with('barang.kategori')
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
            ->values()
            ->map(function ($item, $idx) {
                $item['rank'] = $idx + 1;
                return $item;
            });

        $topUnitMaintenance = $allRankedUnits->take(5)->values();

        // Helper filter untuk transaksi yang terlambat
        $applyOverdueFilter = function ($q) {
            $q->where(function ($sub) {
                $sub->where('status_transaksi', 'dipinjam')
                    ->where(function ($overdueCond) {
                        $overdueCond->where(function ($hasBatas) {
                            $hasBatas->whereNotNull('batas_kembali')
                                ->where('batas_kembali', '<', now());
                        })->orWhere(function ($noBatas) {
                            $noBatas->whereNull('batas_kembali')
                                ->where('tanggal_pinjam', '<=', now()->subHours(24));
                        });
                    });
            })->orWhere(function ($sub) {
                $sub->where('status_transaksi', 'dikembalikan')
                    ->whereNotNull('batas_kembali')
                    ->whereColumn('tanggal_kembali', '>', 'batas_kembali');
            });
        };

        // 3. Statistik Keterlambatan (Daily, Weekly, Monthly)
        $dailyLate = [];
        $daysLabel = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        $startOfWeek = now()->startOfWeek();
        for ($d = 0; $d < 7; $d++) {
            $targetDate = (clone $startOfWeek)->addDays($d);
            $dateStr = $targetDate->format('Y-m-d');

            $realCount = Logbook::whereDate('tanggal_pinjam', $dateStr)
                ->where($applyOverdueFilter)
                ->count();

            $dailyLate[] = [
                'label' => $daysLabel[$d] ?? 'Hari',
                'date' => $targetDate->translatedFormat('d M Y'),
                'count' => $realCount,
            ];
        }

        $weeklyLate = [];
        for ($w = 3; $w >= 0; $w--) {
            $startW = now()->subWeeks($w)->startOfWeek();
            $endW = now()->subWeeks($w)->endOfWeek();

            $realCount = Logbook::whereBetween('tanggal_pinjam', [$startW, $endW])
                ->where($applyOverdueFilter)
                ->count();

            $weeklyLate[] = [
                'label' => 'M' . (4 - $w),
                'date' => $startW->translatedFormat('d M') . ' - ' . $endW->translatedFormat('d M'),
                'count' => $realCount,
            ];
        }

        $monthlyLate = [];
        for ($m = 5; $m >= 0; $m--) {
            $targetMonth = now()->subMonths($m);
            $startM = (clone $targetMonth)->startOfMonth();
            $endM = (clone $targetMonth)->endOfMonth();

            $realCount = Logbook::whereBetween('tanggal_pinjam', [$startM, $endM])
                ->where($applyOverdueFilter)
                ->count();

            $monthlyLate[] = [
                'label' => $targetMonth->translatedFormat('M'),
                'date' => $targetMonth->translatedFormat('F Y'),
                'count' => $realCount,
            ];
        }

        $overdueStats = [
            'daily' => $dailyLate,
            'weekly' => $weeklyLate,
            'monthly' => $monthlyLate,
            'total_active' => Logbook::where('status_transaksi', 'dipinjam')
                ->where(function ($q) {
                    $q->where(function ($hasBatas) {
                        $hasBatas->whereNotNull('batas_kembali')
                            ->where('batas_kembali', '<', now());
                    })->orWhere(function ($noBatas) {
                        $noBatas->whereNull('batas_kembali')
                            ->where('tanggal_pinjam', '<=', now()->subHours(24));
                    });
                })
                ->count(),
        ];

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'categoryCharts' => $categoriesData,
            'recentUsersActivity' => $recentUsersActivity,
            'topBarangDipinjam' => $topBarangDipinjam,
            'allTopBarang' => $allRankedBarang,
            'topUnitMaintenance' => $topUnitMaintenance,
            'allTopUnitMaintenance' => $allRankedUnits,
            'overdueStats' => $overdueStats,
        ]);
    }
}

