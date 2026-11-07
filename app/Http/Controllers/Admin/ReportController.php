<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangUnit;
use App\Models\KategoriBarang;
use App\Models\Logbook;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Tampilan Laporan & Statistik Berkala
     */
    public function index(Request $request): Response
    {
        $data = $this->getReportsData($request);
        return Inertia::render('Reports/Index', $data);
    }

    /**
     * Ekspor Laporan ke Excel (.xls)
     */
    public function exportExcel(Request $request)
    {
        $data = $this->getReportsData($request);
        $periodSlug = $data['filters']['period'] ?? 'all';
        $filename = 'Laporan-WAMS-' . strtoupper($periodSlug) . '-' . now()->timezone('Asia/Jakarta')->format('Ymd-His') . '.xls';

        return response()
            ->view('reports.excel', $data)
            ->header('Content-Type', 'application/vnd.ms-excel; charset=UTF-8')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"")
            ->header('Pragma', 'no-cache')
            ->header('Cache-Control', 'must-revalidate, post-check=0, pre-check=0')
            ->header('Expires', '0');
    }

    /**
     * Ekspor Laporan ke Word Document (.doc)
     */
    public function exportDoc(Request $request)
    {
        $data = $this->getReportsData($request);
        $periodSlug = $data['filters']['period'] ?? 'all';
        $filename = 'Laporan-WAMS-' . strtoupper($periodSlug) . '-' . now()->timezone('Asia/Jakarta')->format('Ymd-His') . '.doc';

        return response()
            ->view('reports.doc', $data)
            ->header('Content-Type', 'application/msword; charset=UTF-8')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"")
            ->header('Pragma', 'no-cache')
            ->header('Cache-Control', 'must-revalidate, post-check=0, pre-check=0')
            ->header('Expires', '0');
    }

    /**
     * Ekspor Laporan Langsung Unduh PDF (.pdf)
     */
    public function exportPdf(Request $request)
    {
        $data = $this->getReportsData($request);
        $periodSlug = $data['filters']['period'] ?? 'all';
        $filename = 'Laporan-WAMS-' . strtoupper($periodSlug) . '-' . now()->timezone('Asia/Jakarta')->format('Ymd-His') . '.pdf';

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.pdf', $data)
            ->setPaper('a4', 'landscape')
            ->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'sans-serif',
            ]);

        return $pdf->download($filename);
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

        // Keterlambatan: berdasarkan batas_kembali (fallback 24 jam jika batas_kembali kosong)
        $thresholdTime = Carbon::now()->subHours(24);
        $isLogLate = function ($log) use ($thresholdTime): bool {
            $tglPinjam = Carbon::parse($log->tanggal_pinjam);
            $tglKembali = $log->tanggal_kembali ? Carbon::parse($log->tanggal_kembali) : null;
            $batasKembali = $log->batas_kembali ? Carbon::parse($log->batas_kembali) : null;

            if ($log->status_transaksi === 'dipinjam') {
                return $batasKembali ? Carbon::now()->gt($batasKembali) : $tglPinjam->lte($thresholdTime);
            }

            if ($log->status_transaksi === 'dikembalikan' && $tglKembali && $batasKembali) {
                return $tglKembali->gt($batasKembali);
            }

            return false;
        };

        $totalKeterlambatan = $allLogbooks->filter($isLogLate)->count();

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
        $logbookList = $allLogbooks->map(function ($log) use ($isLogLate) {
            $tglPinjam = Carbon::parse($log->tanggal_pinjam);
            $tglKembali = $log->tanggal_kembali ? Carbon::parse($log->tanggal_kembali) : null;

            $isLate = $isLogLate($log);

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

            $isGuest = $log->tipe_peminjam === 'guest';
            $userNama = $isGuest
                ? ($log->guest_nama ?: 'Tamu') . ' (Tamu)'
                : ($log->user?->nama ?? 'Unknown User');
            $userNip = $isGuest ? 'Guest' : ($log->user?->nip ?? '-');

            return [
                'id' => $log->id,
                'user_nama' => $userNama,
                'user_nip' => $userNip,
                'user_role' => $isGuest ? 'guest' : ($log->user?->role ?? 'user'),
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

        // 4. Utilisasi Aset
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

        // 5. Laporan Maintenance (Optimasi Eager-loading latestUsageLogbook untuk hilangkan N+1)
        $maintenanceUnits = BarangUnit::with(['barang.kategori', 'latestUsageLogbook.user'])
            ->where(function ($q) {
                $q->where('status', 'maintenance')
                  ->orWhere('kondisi', 'rusak');
            })
            ->get()
            ->map(function ($u) {
                $lastLog = $u->latestUsageLogbook;
                $defaultNote = $u->kondisi === 'rusak'
                    ? 'Unit mengalami kerusakan fisik / perlu perbaikan'
                    : 'Pemeliharaan rutin berkala unit workshop';

                return [
                    'id' => $u->id,
                    'kode_unit' => $u->kode_unit,
                    'nama_barang' => $u->barang?->nama_barang ?? '-',
                    'kode_barang' => $u->barang?->kode_barang ?? '-',
                    'kategori' => $u->barang?->kategori?->nama_kategori ?? 'Umum',
                    'status' => $u->status,
                    'kondisi' => $u->kondisi,
                    'tanggal_update' => $u->updated_at->format('d M Y, H:i'),
                    'pelapor_terakhir' => $lastLog ? ($lastLog->peminjam_nama ?: 'Staff Workshop') : 'Staff Workshop',
                    'catatan' => ($lastLog && !empty($lastLog->catatan_kembali)) ? $lastLog->catatan_kembali : $defaultNote,
                ];
            });

        // 6. Kondisi Aset Breakdown
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

