<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BarangUnit;
use App\Models\Logbook;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LogbookController extends Controller
{
    /**
     * Manajemen Riwayat Logbook Peminjaman & Pengembalian
     */
    public function index(Request $request): Response
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
    public function approve(Request $request, $id): RedirectResponse
    {
        return DB::transaction(function () use ($request, $id) {
            $log = Logbook::where('id', $id)->lockForUpdate()->firstOrFail();

            if ($log->status_transaksi !== 'menunggu_persetujuan') {
                return back()->with('error', 'Status peminjaman ini bukan menunggu persetujuan.');
            }

            $log->update([
                'status_transaksi' => 'dipinjam',
                'disetujui_oleh' => auth()->id(),
                'tanggal_approval' => now(),
                'tanggal_pinjam' => now(),
                'batas_kembali' => $request->filled('batas_kembali') ? $request->batas_kembali : ($log->batas_kembali ?? now()->addDays(3)),
            ]);

            if ($log->barang_unit_id) {
                $unit = BarangUnit::where('id', $log->barang_unit_id)->lockForUpdate()->first();
                if ($unit) {
                    $unit->update(['status' => 'dipinjam']);
                }
            }

            return back()->with('success', 'Permohonan peminjaman berhasil disetujui.');
        });
    }

    /**
     * Admin Menolak Pengajuan Peminjaman Barang Spesifik
     */
    public function reject(Request $request, $id): RedirectResponse
    {
        $request->validate([
            'alasan_penolakan' => ['required', 'string', 'max:500'],
        ]);

        return DB::transaction(function () use ($request, $id) {
            $log = Logbook::where('id', $id)->lockForUpdate()->firstOrFail();

            if ($log->status_transaksi !== 'menunggu_persetujuan') {
                return back()->with('error', 'Status peminjaman ini bukan menunggu persetujuan.');
            }

            $log->update([
                'status_transaksi' => 'ditolak',
                'disetujui_oleh' => auth()->id(),
                'tanggal_approval' => now(),
                'alasan_penolakan' => $request->alasan_penolakan,
            ]);

            if ($log->barang_unit_id) {
                $unit = BarangUnit::where('id', $log->barang_unit_id)->lockForUpdate()->first();
                if ($unit) {
                    $unit->update(['status' => 'tersedia']);
                }
            }

            return back()->with('success', 'Permohonan peminjaman berhasil ditolak.');
        });
    }

    /**
     * Tampilan Kalender Penjadwalan Peminjaman
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
                    'status_transaksi' => $log->status_transaksi,
                    'kondisi_kembali' => $log->kondisi_kembali,
                    'is_overdue' => $isOverdue,
                    'theme' => $theme,
                ];
            });

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
    public function storeCalendar(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'barang_unit_id' => ['required', 'exists:barang_unit,id'],
            'tanggal_pinjam' => ['required', 'date'],
            'batas_kembali' => ['required', 'date', 'after_or_equal:tanggal_pinjam'],
        ]);

        return DB::transaction(function () use ($validated) {
            $unit = BarangUnit::where('id', $validated['barang_unit_id'])
                ->where('status', '!=', 'maintenance')
                ->lockForUpdate()
                ->first();

            if (!$unit) {
                return back()->with('error', 'Unit barang sedang dalam perbaikan atau tidak tersedia.');
            }

            $tglPinjam = Carbon::parse($validated['tanggal_pinjam'])->startOfDay();
            $batasKembali = Carbon::parse($validated['batas_kembali'])->endOfDay();

            $hasConflict = Logbook::where('barang_unit_id', $unit->id)
                ->whereIn('status_transaksi', ['dipinjam', 'menunggu_persetujuan'])
                ->where(function ($q) use ($tglPinjam, $batasKembali) {
                    $q->where('tanggal_pinjam', '<=', $batasKembali)
                      ->where(function ($sub) use ($tglPinjam) {
                          $sub->whereNull('batas_kembali')
                              ->orWhere('batas_kembali', '>=', $tglPinjam);
                      });
                })
                ->exists();

            if ($hasConflict) {
                return back()->with('error', 'Unit barang sudah memiliki jadwal peminjaman aktif pada rentang tanggal tersebut.');
            }

            if ($tglPinjam->lte(now()->endOfDay())) {
                if ($unit->status !== 'tersedia') {
                    return back()->with('error', 'Unit barang sedang dipinjam atau tidak tersedia hari ini.');
                }
                $unit->update(['status' => 'dipinjam']);
            }

            Logbook::create([
                'user_id' => $validated['user_id'],
                'barang_unit_id' => $unit->id,
                'tipe_peminjam' => 'user',
                'tanggal_pinjam' => $validated['tanggal_pinjam'],
                'batas_kembali' => $validated['batas_kembali'],
                'status_transaksi' => 'dipinjam',
            ]);

            return back()->with('success', 'Peminjaman berhasil dijadwalkan ke kalender.');
        });
    }
}

