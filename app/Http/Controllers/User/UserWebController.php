<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangUnit;
use App\Models\KategoriBarang;
use App\Models\Logbook;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UserWebController extends Controller
{
    /**
     * Dashboard Mobile Pengguna (Beranda)
     */
    public function dashboard(): Response
    {
        $user = auth()->user();

        // 1. Hitung Statistik Cepat Pengguna (Persis seperti kartu KPI admin)
        $stats = [
            'dipinjam' => Logbook::where('user_id', $user->id)->where('status_transaksi', 'dipinjam')->count(),
            'menunggu' => Logbook::where('user_id', $user->id)->where('status_transaksi', 'menunggu_persetujuan')->count(),
            'selesai' => Logbook::where('user_id', $user->id)->where('status_transaksi', 'dikembalikan')->count(),
        ];

        // 2. Daftar Pinjaman Berjalan / Aktif Saat Ini
        $activeLoans = Logbook::with(['barangUnit.barang.kategori', 'approver'])
            ->where('user_id', $user->id)
            ->whereIn('status_transaksi', ['menunggu_persetujuan', 'dipinjam'])
            ->latest('tanggal_pinjam')
            ->get()
            ->map(function ($log) {
                return $this->formatLogbookItem($log);
            });

        // 3. Kategori dengan info jumlah barang
        $categories = KategoriBarang::withCount('barang')->get()->map(function ($kat) {
            return [
                'id' => $kat->id,
                'nama_kategori' => $kat->nama_kategori,
                'qr_code' => $kat->qr_code,
                'total_barang' => $kat->barang_count ?? $kat->barangs_count ?? 0,
            ];
        });

        // 4. Rekomendasi Barang Tersedia untuk Dipinjam
        $availableItems = Barang::with(['kategori', 'units' => function ($q) {
            $q->where('status', 'tersedia');
        }])
            ->withCount([
                'units as total_units',
                'units as available_units' => function ($q) {
                    $q->where('status', 'tersedia');
                },
            ])
            ->latest()
            ->take(8)
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'nama_barang' => $b->nama_barang,
                    'kode_barang' => $b->kode_barang,
                    'kategori_id' => $b->kategori_id,
                    'kategori' => $b->kategori?->nama_kategori ?? 'Umum',
                    'perlu_persetujuan' => (bool) $b->perlu_persetujuan,
                    'total_units' => $b->total_units,
                    'available_units' => $b->available_units,
                    'gambar_url' => $b->gambar ? asset('storage/' . $b->gambar) : null,
                    'units_sample' => $b->units->take(5)->map(fn ($u) => [
                        'id' => $u->id,
                        'kode_unit' => $u->kode_unit,
                        'kondisi' => $u->kondisi,
                    ]),
                ];
            });

        return Inertia::render('User/MobileDashboard', [
            'stats' => $stats,
            'activeLoans' => $activeLoans,
            'categories' => $categories,
            'availableItems' => $availableItems,
            'user' => [
                'id' => $user->id,
                'nama' => $user->nama,
                'email' => $user->email,
                'nip' => $user->nip,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Katalog Peralatan & Mesin Workshop
     */
    public function katalog(Request $request): Response
    {
        $query = Barang::with(['kategori', 'units' => function ($q) {
            $q->where('status', 'tersedia');
        }])
            ->withCount([
                'units as total_units',
                'units as available_units' => function ($q) {
                    $q->where('status', 'tersedia');
                },
            ]);

        // Filter Kategori
        if ($request->filled('kategori_id')) {
            $query->where('kategori_id', $request->kategori_id);
        }

        // Pencarian Nama / Kode Barang
        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                  ->orWhere('kode_barang', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%");
            });
        }

        $barangs = $query->orderBy('nama_barang')->get()->map(function ($b) {
            return [
                'id' => $b->id,
                'nama_barang' => $b->nama_barang,
                'kode_barang' => $b->kode_barang,
                'kategori_id' => $b->kategori_id,
                'kategori' => $b->kategori?->nama_kategori ?? 'Umum',
                'deskripsi' => $b->deskripsi,
                'perlu_persetujuan' => (bool) $b->perlu_persetujuan,
                'total_units' => $b->total_units,
                'available_units' => $b->available_units,
                'gambar_url' => $b->gambar ? asset('storage/' . $b->gambar) : null,
                'available_unit_list' => $b->units->map(fn ($u) => [
                    'id' => $u->id,
                    'kode_unit' => $u->kode_unit,
                    'kondisi' => $u->kondisi,
                ]),
            ];
        });

        $categories = KategoriBarang::withCount('barang')->get();

        return Inertia::render('User/MobileKatalog', [
            'barangs' => $barangs,
            'categories' => $categories,
            'filters' => [
                'kategori_id' => $request->kategori_id,
                'q' => $request->q,
            ],
        ]);
    }

    /**
     * Halaman Peminjaman Aktif & Sedang Berjalan
     */
    public function peminjaman(): Response
    {
        $user = auth()->user();

        $activeLoans = Logbook::with(['barangUnit.barang.kategori', 'approver'])
            ->where('user_id', $user->id)
            ->whereIn('status_transaksi', ['menunggu_persetujuan', 'dipinjam'])
            ->latest('tanggal_pinjam')
            ->get()
            ->map(function ($log) {
                return $this->formatLogbookItem($log);
            });

        return Inertia::render('User/MobilePeminjaman', [
            'loans' => $activeLoans,
        ]);
    }

    /**
     * Proses Pengajuan Peminjaman Barang
     */
    public function storePinjam(Request $request)
    {
        $request->validate([
            'barang_id' => ['required', 'exists:barang,id'],
            'barang_unit_id' => ['nullable', 'exists:barang_unit,id'],
            'keperluan' => ['required', 'string', 'max:500'],
            'batas_kembali' => ['required', 'date'],
        ]);

        $user = auth()->user();
        $barang = Barang::findOrFail($request->barang_id);
        $requiresApproval = (bool) $barang->perlu_persetujuan;
        $targetStatus = $requiresApproval ? 'menunggu_persetujuan' : 'dipinjam';

        return DB::transaction(function () use ($user, $barang, $request, $targetStatus, $requiresApproval) {
            // Pilih unit spesifik atau unit pertama yang tersedia
            $unitQuery = BarangUnit::where('barang_id', $barang->id)
                ->where('status', 'tersedia')
                ->lockForUpdate();

            if ($request->filled('barang_unit_id')) {
                $unit = $unitQuery->where('id', $request->barang_unit_id)->first();
            } else {
                $unit = $unitQuery->first();
            }

            if (!$unit) {
                return back()->with('error', 'Maaf, unit untuk barang ini sedang tidak tersedia atau baru saja dipinjam.');
            }

            // Update status unit fisik
            $unit->update([
                'status' => $targetStatus,
            ]);

            // Catat logbook peminjaman
            $logbook = Logbook::create([
                'user_id' => $user->id,
                'barang_unit_id' => $unit->id,
                'tipe_peminjam' => 'user',
                'keperluan' => $request->keperluan,
                'batas_kembali' => Carbon::parse($request->batas_kembali),
                'tanggal_pinjam' => now(),
                'status_transaksi' => $targetStatus,
            ]);

            $message = $requiresApproval
                ? "Pengajuan peminjaman unit {$unit->kode_unit} berhasil diajukan. Menunggu persetujuan Administrator."
                : "Unit {$unit->kode_unit} ({$barang->nama_barang}) berhasil dipinjam! Silakan ambil alat di workshop.";

            return redirect()->route('user.peminjaman')->with('success', $message);
        });
    }

    /**
     * Proses Pengembalian Barang
     */
    public function storeKembali(Request $request, $id)
    {
        $request->validate([
            'kondisi_kembali' => ['required', 'in:baik,rusak_ringan,rusak_berat'],
            'catatan' => ['nullable', 'string', 'max:500'],
        ]);

        $user = auth()->user();

        return DB::transaction(function () use ($user, $id, $request) {
            $logbook = Logbook::where('id', $id)
                ->where('user_id', $user->id)
                ->where('status_transaksi', 'dipinjam')
                ->lockForUpdate()
                ->first();

            if (!$logbook) {
                return back()->with('error', 'Data peminjaman aktif tidak ditemukan atau sudah selesai.');
            }

            $unit = BarangUnit::where('id', $logbook->barang_unit_id)->lockForUpdate()->first();

            // Update Logbook
            $logbook->update([
                'status_transaksi' => 'dikembalikan',
                'tanggal_kembali' => now(),
                'kondisi_kembali' => $request->kondisi_kembali,
            ]);

            // Update Unit status: jika kondisi baik -> tersedia, jika rusak -> maintenance
            if ($unit) {
                $newUnitStatus = $request->kondisi_kembali === 'baik' ? 'tersedia' : 'maintenance';
                $unit->update([
                    'status' => $newUnitStatus,
                    'kondisi' => $request->kondisi_kembali,
                ]);
            }

            $kodeUnit = $unit?->kode_unit ?? 'Unit';
            return redirect()->route('user.peminjaman')->with(
                'success',
                "Alat ({$kodeUnit}) telah berhasil dikembalikan. Terima kasih!"
            );
        });
    }

    /**
     * Batalkan Pengajuan Peminjaman yang masih menunggu persetujuan
     */
    public function cancelPinjam(Request $request, $id)
    {
        $user = auth()->user();

        return DB::transaction(function () use ($user, $id) {
            $logbook = Logbook::where('id', $id)
                ->where('user_id', $user->id)
                ->where('status_transaksi', 'menunggu_persetujuan')
                ->lockForUpdate()
                ->first();

            if (!$logbook) {
                return back()->with('error', 'Pengajuan tidak dapat dibatalkan atau sudah diproses admin.');
            }

            $logbook->update([
                'status_transaksi' => 'dibatalkan',
            ]);

            $unit = BarangUnit::where('id', $logbook->barang_unit_id)->lockForUpdate()->first();
            if ($unit && $unit->status === 'menunggu_persetujuan') {
                $unit->update(['status' => 'tersedia']);
            }

            return back()->with('success', 'Pengajuan peminjaman berhasil dibatalkan.');
        });
    }

    /**
     * Halaman Riwayat Transaksi Lengkap
     */
    public function riwayat(Request $request): Response
    {
        $user = auth()->user();

        $query = Logbook::with(['barangUnit.barang.kategori', 'approver'])
            ->where('user_id', $user->id)
            ->latest('tanggal_pinjam');

        if ($request->filled('status')) {
            $query->where('status_transaksi', $request->status);
        }

        if ($request->filled('q')) {
            $search = $request->q;
            $query->whereHas('barangUnit', function ($qUnit) use ($search) {
                $qUnit->where('kode_unit', 'like', "%{$search}%")
                      ->orWhereHas('barang', function ($qBarang) use ($search) {
                          $qBarang->where('nama_barang', 'like', "%{$search}%");
                      });
            });
        }

        $riwayat = $query->paginate(15)->through(function ($log) {
            return $this->formatLogbookItem($log);
        });

        return Inertia::render('User/MobileRiwayat', [
            'riwayat' => $riwayat,
            'filters' => [
                'status' => $request->status,
                'q' => $request->q,
            ],
        ]);
    }

    /**
     * Halaman Scanner QR Code Mobile
     */
    public function scanner(): Response
    {
        $categories = KategoriBarang::all();
        $recentUnits = BarangUnit::with('barang')
            ->where('status', 'tersedia')
            ->take(6)
            ->get()
            ->map(fn ($u) => [
                'kode_unit' => $u->kode_unit,
                'nama_barang' => $u->barang?->nama_barang,
            ]);

        return Inertia::render('User/MobileScanner', [
            'categories' => $categories,
            'recentUnits' => $recentUnits,
        ]);
    }

    /**
     * Lookup Cepat Unit Fisik saat Scan QR Code
     */
    public function lookupUnit(string $kode_unit): JsonResponse
    {
        $user = auth()->user();

        // Normalisasi format QR code jika membawa awalan URL
        $cleanKode = trim($kode_unit);
        if (preg_match('/scan\/([A-Za-z0-9_\-]+)/', $cleanKode, $matches)) {
            $cleanKode = $matches[1];
        }

        $unit = BarangUnit::with(['barang.kategori', 'activeLogbook'])
            ->where('kode_unit', $cleanKode)
            ->first();

        if (!$unit) {
            return response()->json([
                'success' => false,
                'message' => "Kode unit '{$cleanKode}' tidak ditemukan di sistem WAMS.",
            ], 404);
        }

        $isBorrowedByCurrentUser = false;
        $activeLogbookId = null;

        if ($unit->status === 'dipinjam' && $unit->activeLogbook && $unit->activeLogbook->user_id === $user->id) {
            $isBorrowedByCurrentUser = true;
            $activeLogbookId = $unit->activeLogbook->id;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $unit->id,
                'kode_unit' => $unit->kode_unit,
                'nomor_seri' => $unit->nomor_seri,
                'kondisi' => $unit->kondisi,
                'status' => $unit->status,
                'is_borrowed_by_me' => $isBorrowedByCurrentUser,
                'active_logbook_id' => $activeLogbookId,
                'barang' => [
                    'id' => $unit->barang?->id,
                    'nama_barang' => $unit->barang?->nama_barang,
                    'kode_barang' => $unit->barang?->kode_barang,
                    'kategori' => $unit->barang?->kategori?->nama_kategori,
                    'perlu_persetujuan' => (bool) $unit->barang?->perlu_persetujuan,
                    'gambar_url' => $unit->barang?->gambar ? asset('storage/' . $unit->barang->gambar) : null,
                ],
            ],
        ]);
    }

    /**
     * Profil Pengguna & Ringkasan Aktivitas
     */
    public function profile(): Response
    {
        $user = auth()->user();

        $stats = [
            'total_pinjam' => Logbook::where('user_id', $user->id)->count(),
            'selesai' => Logbook::where('user_id', $user->id)->where('status_transaksi', 'dikembalikan')->count(),
            'aktif' => Logbook::where('user_id', $user->id)->where('status_transaksi', 'dipinjam')->count(),
            'menunggu' => Logbook::where('user_id', $user->id)->where('status_transaksi', 'menunggu_persetujuan')->count(),
        ];

        return Inertia::render('User/MobileProfile', [
            'user' => [
                'id' => $user->id,
                'nama' => $user->nama,
                'email' => $user->email,
                'nip' => $user->nip,
                'role' => $user->role,
                'joined_at' => $user->created_at?->translatedFormat('d F Y') ?? 'Member Workshop',
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Helper formatting Logbook item
     */
    private function formatLogbookItem(Logbook $log): array
    {
        $unit = $log->barangUnit;
        $barang = $unit?->barang;

        $now = now();
        $isOverdue = false;
        $remainingText = '';

        if ($log->batas_kembali && $log->status_transaksi === 'dipinjam') {
            $isOverdue = $now->greaterThan($log->batas_kembali);
            $diff = $now->diff($log->batas_kembali);
            if ($isOverdue) {
                $remainingText = 'Terlambat ' . ($diff->days > 0 ? "{$diff->days} hari " : '') . "{$diff->h} jam";
            } else {
                $remainingText = 'Sisa ' . ($diff->days > 0 ? "{$diff->days}h " : '') . sprintf('%02d:%02d', $diff->h, $diff->i);
            }
        }

        return [
            'id' => $log->id,
            'user_id' => $log->user_id,
            'barang_id' => $barang?->id,
            'unit_id' => $unit?->id,
            'nama_barang' => $barang?->nama_barang ?? 'Peralatan Workshop',
            'kode_barang' => $barang?->kode_barang ?? '-',
            'kode_unit' => $unit?->kode_unit ?? '-',
            'kategori' => $barang?->kategori?->nama_kategori ?? 'Umum',
            'keperluan' => $log->keperluan,
            'status_transaksi' => $log->status_transaksi,
            'kondisi_kembali' => $log->kondisi_kembali,
            'tanggal_pinjam' => $log->tanggal_pinjam?->translatedFormat('d M Y, H:i') ?? '-',
            'batas_kembali' => $log->batas_kembali?->translatedFormat('d M Y, H:i') ?? '-',
            'batas_kembali_raw' => $log->batas_kembali?->toIso8601String(),
            'tanggal_kembali' => $log->tanggal_kembali?->translatedFormat('d M Y, H:i'),
            'is_overdue' => $isOverdue,
            'remaining_text' => $remainingText,
            'approver_nama' => $log->approver?->nama,
            'alasan_penolakan' => $log->alasan_penolakan,
            'gambar_url' => $barang?->gambar ? asset('storage/' . $barang->gambar) : null,
        ];
    }
}
