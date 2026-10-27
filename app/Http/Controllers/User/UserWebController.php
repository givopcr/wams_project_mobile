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
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserWebController extends Controller
{
    /**
     * Dashboard Mobile Pengguna (Beranda - Mirip Flutter DashboardScreen)
     */
    public function dashboard(): Response
    {
        $user = auth()->user();

        // 1. Hitung Statistik Status Saya (Dipinjam | Menunggu | Selesai)
        $stats = [
            'dipinjam' => Logbook::where('user_id', $user->id)->where('status_transaksi', 'dipinjam')->count(),
            'menunggu' => Logbook::where('user_id', $user->id)->where('status_transaksi', 'menunggu_persetujuan')->count(),
            'selesai' => Logbook::where('user_id', $user->id)->where('status_transaksi', 'dikembalikan')->count(),
        ];

        // 2. Daftar Pinjaman Aktif Saat Ini (Untuk Featured Return Card Carousel & Date Strip)
        $activeLoans = Logbook::with(['barangUnit.barang.kategori', 'approver'])
            ->where('user_id', $user->id)
            ->whereIn('status_transaksi', ['dipinjam', 'menunggu_persetujuan'])
            ->latest('tanggal_pinjam')
            ->get()
            ->map(function ($log) {
                return $this->formatLogbookItem($log);
            });

        // 3. Kategori Peralatan dengan jumlah unit siap (Mirip Flutter _buildKategoriSection)
        $categories = KategoriBarang::withCount('barang')
            ->with(['units'])
            ->get()
            ->map(function ($kat) {
                $totalUnits = $kat->units->count();
                $tersedia = $kat->units->where('status', 'tersedia')->count();

                return [
                    'id' => $kat->id,
                    'nama_kategori' => $kat->nama_kategori,
                    'tipe' => $kat->tipe ?? 'aset',
                    'is_habis_pakai' => $kat->isHabisPakai(),
                    'qr_code' => $kat->qr_code,
                    'total_barang' => $kat->barang_count ?? 0,
                    'total_unit' => $totalUnits,
                    'tersedia' => $tersedia,
                ];
            });

        // 4. Aktivitas Terbaru (4 transaksi terakhir dengan indikator warna)
        $recentActivity = Logbook::with(['barangUnit.barang.kategori', 'approver'])
            ->where('user_id', $user->id)
            ->latest('tanggal_pinjam')
            ->take(6)
            ->get()
            ->map(function ($log) {
                return $this->formatLogbookItem($log);
            });

        // 5. Rekomendasi Barang Tersedia
        $availableItems = Barang::with(['kategori', 'units'])
            ->latest()
            ->take(8)
            ->get()
            ->map(function ($b) {
                return $this->formatBarangItem($b);
            });

        return Inertia::render('User/MobileDashboard', [
            'stats' => $stats,
            'activeLoans' => $activeLoans,
            'categories' => $categories,
            'recentActivity' => $recentActivity,
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
     * Katalog Peralatan & Barang Kategori (Mirip Flutter KategoriScreen & BarangKategoriScreen)
     */
    public function katalog(Request $request): Response
    {
        $query = Barang::with(['kategori', 'units']);

        // Filter Kategori
        if ($request->filled('kategori_id')) {
            $query->where('kategori_id', $request->kategori_id);
        }

        // Pencarian Nama / Kode / Spesifikasi Barang
        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                  ->orWhere('kode_barang', 'like', "%{$search}%")
                  ->orWhere('detail_spesifikasi', 'like', "%{$search}%");
            });
        }

        $barangs = $query->orderBy('nama_barang')->get()->map(function ($b) {
            return $this->formatBarangItem($b);
        });

        $categories = KategoriBarang::withCount('barang')
            ->with(['units'])
            ->get()
            ->map(function ($kat) {
                return [
                    'id' => $kat->id,
                    'nama_kategori' => $kat->nama_kategori,
                    'tipe' => $kat->tipe ?? 'aset',
                    'is_habis_pakai' => $kat->isHabisPakai(),
                    'qr_code' => $kat->qr_code,
                    'total_barang' => $kat->barang_count ?? 0,
                    'total_unit' => $kat->units->count(),
                    'tersedia' => $kat->units->where('status', 'tersedia')->count(),
                ];
            });

        return Inertia::render('User/MobileKatalog', [
            'barangs' => $barangs,
            'categories' => $categories,
            'filters' => [
                'kategori_id' => $request->kategori_id,
                'q' => $request->q,
                'mode' => $request->query('mode', ''), // 'category_list' untuk tampilan BarangKategoriScreen
            ],
        ]);
    }

    /**
     * Detail Barang, Pilih Unit, Form Peminjaman & Peminjaman Berhasil
     * (Mirip Flutter DetailBarangScreen -> PilihUnitScreen -> FormPeminjamanScreen -> PeminjamanBerhasilScreen)
     */
    public function detailBarang(Request $request, $id): Response
    {
        $barang = Barang::with(['kategori', 'units'])->findOrFail($id);

        return Inertia::render('User/MobileDetailBarang', [
            'barang' => $this->formatBarangItem($barang),
            'initialStep' => $request->query('step', 'detail'), // 'detail' | 'pilih_unit' | 'form' | 'berhasil'
            'borrowResult' => session('borrow_result'),
        ]);
    }

    /**
     * Halaman Peminjaman Aktif & Detail Peminjaman
     */
    public function peminjaman(Request $request): Response
    {
        $user = auth()->user();

        $allLogs = Logbook::with(['barangUnit.barang.kategori', 'approver'])
            ->where('user_id', $user->id)
            ->latest('tanggal_pinjam')
            ->get()
            ->map(function ($log) {
                return $this->formatLogbookItem($log);
            });

        $activeLoans = $allLogs->filter(fn ($l) => in_array($l['status_transaksi'], ['dipinjam', 'menunggu_persetujuan']))->values();

        return Inertia::render('User/MobilePeminjaman', [
            'loans' => $activeLoans,
            'allLogs' => $allLogs,
            'initialLogId' => $request->query('id') ? (int) $request->query('id') : null,
        ]);
    }

    /**
     * Proses Pengajuan Peminjaman Barang (Mendukung Single Unit maupun Multi-Unit seperti Flutter)
     */
    public function storePinjam(Request $request)
    {
        $request->validate([
            'barang_id' => ['required', 'exists:barang,id'],
            'barang_unit_id' => ['nullable', 'exists:barang_unit,id'],
            'barang_unit_ids' => ['nullable', 'array'],
            'barang_unit_ids.*' => ['exists:barang_unit,id'],
            'keperluan' => ['nullable', 'string', 'max:500'],
            'foto_pinjam' => ['required', 'string', 'max:7000000'],
            'batas_kembali' => ['required', 'date'],
            'tanggal_pinjam' => ['nullable', 'date'],
        ], [
            'foto_pinjam.required' => 'Foto barang sebelum dipinjam wajib diunggah dan tidak boleh dilewati.',
            'foto_pinjam.max' => 'Ukuran foto barang terlalu besar (maksimal 5MB).',
        ]);

        $fotoPinjamPath = null;
        $rawFotoPinjam = $request->input('foto_pinjam');
        if ($rawFotoPinjam && preg_match('/^data:image\/(\w+);base64,/', $rawFotoPinjam, $typeMatch)) {
            $ext = strtolower($typeMatch[1]);
            if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
                $decoded = base64_decode(substr($rawFotoPinjam, strpos($rawFotoPinjam, ',') + 1), true);
                if ($decoded !== false && strlen($decoded) > 0 && strlen($decoded) <= 5 * 1024 * 1024) {
                    $fotoPinjamPath = 'peminjaman/borrow_' . auth()->id() . '_' . time() . '_' . uniqid() . '.' . $ext;
                    Storage::disk('public')->put($fotoPinjamPath, $decoded);
                }
            }
        }

        if (!$fotoPinjamPath) {
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => 'Foto barang sebelum dipinjam wajib diunggah dengan format gambar yang valid.'], 422);
            }
            return back()->withErrors(['foto_pinjam' => 'Foto barang sebelum dipinjam wajib diunggah dengan format gambar yang valid.']);
        }

        $user = auth()->user();
        $barang = Barang::with('kategori')->findOrFail($request->barang_id);
        if ($barang->isHabisPakai()) {
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => 'Barang habis pakai tidak dapat dipinjam sebagai unit aset.'], 422);
            }
            return back()->with('error', 'Barang habis pakai tidak dapat dipinjam sebagai unit aset.');
        }
        $requiresApproval = (bool) $barang->perlu_persetujuan;
        $targetStatus = $requiresApproval ? 'menunggu_persetujuan' : 'dipinjam';

        $unitIds = [];
        if ($request->filled('barang_unit_ids') && is_array($request->barang_unit_ids)) {
            $unitIds = array_map('intval', $request->barang_unit_ids);
        } elseif ($request->filled('barang_unit_id')) {
            $unitIds = [(int) $request->barang_unit_id];
        }

        if (empty($unitIds)) {
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => 'Pilih minimal satu unit fisik untuk dipinjam.'], 422);
            }
            return back()->with('error', 'Pilih minimal satu unit fisik untuk dipinjam.');
        }

        $tglPinjam = $request->filled('tanggal_pinjam') ? Carbon::parse($request->tanggal_pinjam) : now();
        $batasKembali = Carbon::parse($request->batas_kembali);
        if ($batasKembali->lt($tglPinjam->copy()->startOfDay())) {
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => 'Batas waktu pengembalian tidak boleh sebelum tanggal pinjam.'], 422);
            }
            return back()->with('error', 'Batas waktu pengembalian tidak boleh sebelum tanggal pinjam.');
        }

        // Batas kuota peminjaman: maksimal 5 unit aktif/menunggu per user
        $activeUserLoans = Logbook::where('user_id', $user->id)
            ->whereIn('status_transaksi', ['dipinjam', 'menunggu_persetujuan'])
            ->count();
        if (($activeUserLoans + count($unitIds)) > 5) {
            $msgQuota = 'Batas maksimum peminjaman aktif adalah 5 unit per pengguna.';
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $msgQuota], 422);
            }
            return back()->with('error', $msgQuota);
        }

        return DB::transaction(function () use ($user, $barang, $unitIds, $request, $targetStatus, $requiresApproval, $tglPinjam, $batasKembali, $fotoPinjamPath) {
            $units = BarangUnit::whereIn('id', $unitIds)
                ->where('barang_id', $barang->id)
                ->where('status', 'tersedia')
                ->lockForUpdate()
                ->get();

            if ($units->count() !== count($unitIds)) {
                $errMsg = 'Satu atau lebih unit fisik tidak tersedia atau sedang digunakan.';
                if ($request->wantsJson()) {
                    return response()->json(['success' => false, 'message' => $errMsg], 422);
                }
                return back()->with('error', $errMsg);
            }

            $keperluanText = $request->filled('keperluan') ? trim($request->keperluan) : null;

            foreach ($units as $unit) {
                $unit->update(['status' => $targetStatus]);

                Logbook::create([
                    'user_id' => $user->id,
                    'barang_unit_id' => $unit->id,
                    'tipe_peminjam' => 'user',
                    'keperluan' => $keperluanText,
                    'foto_pinjam' => $fotoPinjamPath,
                    'batas_kembali' => $batasKembali,
                    'tanggal_pinjam' => $tglPinjam,
                    'status_transaksi' => $targetStatus,
                ]);
            }

            $kodeUnitsStr = $units->pluck('kode_unit')->implode(', ');
            $message = $requiresApproval
                ? "Pengajuan peminjaman unit ({$kodeUnitsStr}) berhasil dikirim. Menunggu persetujuan Admin."
                : "Peminjaman unit ({$kodeUnitsStr}) berhasil dikonfirmasi!";

            $borrowResult = [
                'barang_id' => $barang->id,
                'nama_barang' => $barang->nama_barang,
                'gambar_url' => $barang->gambar_url,
                'kode_unit' => $kodeUnitsStr,
                'tanggal_pinjam' => $tglPinjam->translatedFormat('d M Y'),
                'tanggal_kembali' => $batasKembali->translatedFormat('d M Y'),
                'keperluan' => $keperluanText ?: '-',
                'foto_pinjam_url' => asset('storage/' . $fotoPinjamPath),
                'perlu_persetujuan' => $requiresApproval,
                'status_transaksi' => $targetStatus,
            ];

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $borrowResult,
                ], 201);
            }

            if ($request->boolean('from_detail_flow')) {
                return redirect()
                    ->route('user.barang.detail', ['id' => $barang->id, 'step' => 'berhasil'])
                    ->with('borrow_result', $borrowResult)
                    ->with('success', $message);
            }

            return redirect()->route('user.riwayat')->with('success', $message);
        });
    }

    /**
     * Proses Pengembalian Barang (Mendukung kondisi 'baik', 'rusak', 'rusak_ringan', 'rusak_berat')
     */
    public function storeKembali(Request $request, $id)
    {
        $request->validate([
            'kondisi_kembali' => ['required', 'in:baik,rusak,rusak_ringan,rusak_berat'],
            'catatan' => ['nullable', 'string', 'max:500'],
            'foto_kondisi' => ['required', 'string', 'max:7000000'],
        ], [
            'foto_kondisi.required' => 'Foto kondisi barang saat dikembalikan wajib diunggah dan tidak boleh dilewati.',
            'foto_kondisi.max' => 'Ukuran foto kondisi barang terlalu besar (maksimal 5MB).',
        ]);

        $rawFoto = $request->input('foto_kondisi');
        if (!$rawFoto || !preg_match('/^data:image\/(\w+);base64,/', $rawFoto)) {
            return back()->withErrors(['foto_kondisi' => 'Foto kondisi barang saat dikembalikan wajib diunggah dengan format gambar yang valid.']);
        }

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
            $kondisi = $request->kondisi_kembali === 'baik' ? 'baik' : 'rusak';

            $updateData = [
                'status_transaksi' => 'dikembalikan',
                'tanggal_kembali' => now(),
                'kondisi_kembali' => $kondisi,
            ];

            if (Schema::hasColumn('logbook', 'catatan_kembali') && $request->filled('catatan')) {
                $updateData['catatan_kembali'] = trim($request->catatan);
            }

            if (Schema::hasColumn('logbook', 'foto_kembali') && $request->filled('foto_kondisi')) {
                $rawFoto = $request->input('foto_kondisi');
                if (preg_match('/^data:image\/(\w+);base64,/', $rawFoto, $typeMatch)) {
                    $ext = strtolower($typeMatch[1]);
                    if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
                        $decoded = base64_decode(substr($rawFoto, strpos($rawFoto, ',') + 1));
                        if ($decoded !== false) {
                            $filePath = 'pengembalian/return_' . $logbook->id . '_' . time() . '.' . $ext;
                            Storage::disk('public')->put($filePath, $decoded);
                            $updateData['foto_kembali'] = $filePath;
                        }
                    }
                }
            }

            // Update Logbook
            $logbook->update($updateData);

            // Update Unit status: jika kondisi baik -> tersedia, jika rusak -> maintenance
            if ($unit) {
                $newUnitStatus = $kondisi === 'baik' ? 'tersedia' : 'maintenance';
                $unit->update([
                    'status' => $newUnitStatus,
                    'kondisi' => $kondisi,
                ]);
            }

            $namaBarang = $unit?->barang?->nama_barang ?? ($unit?->kode_unit ?? 'Alat');
            $labelKondisi = $kondisi === 'baik' ? 'Baik' : 'Rusak';

            return redirect()->route('user.riwayat')->with(
                'success',
                "Pengembalian {$namaBarang} ({$labelKondisi}) berhasil dikonfirmasi!"
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
     * Halaman Riwayat Peminjaman (Mirip Flutter RiwayatScreen + DetailPeminjamanScreen + FormPengembalianScreen)
     */
    public function riwayat(Request $request): Response
    {
        $user = auth()->user();

        $allItems = Logbook::with(['barangUnit.barang.kategori', 'approver'])
            ->where('user_id', $user->id)
            ->latest('tanggal_pinjam')
            ->get()
            ->map(function ($log) {
                return $this->formatLogbookItem($log);
            });

        return Inertia::render('User/MobileRiwayat', [
            'riwayatList' => $allItems,
            'riwayat' => [
                'data' => $allItems,
                'links' => [],
            ],
            'filters' => [
                'status' => $request->status,
                'q' => $request->q,
                'tab' => $request->query('tab', 'semua'),
                'detail_id' => $request->query('detail_id') ? (int) $request->query('detail_id') : null,
                'return_id' => $request->query('return_id') ? (int) $request->query('return_id') : null,
            ],
        ]);
    }

    /**
     * Halaman Scanner QR Code Mobile (Mirip Flutter ScanScreen)
     */
    public function scanner(Request $request): Response
    {
        $categories = KategoriBarang::withCount('barang')
            ->with(['units'])
            ->get()
            ->map(fn ($k) => [
                'id' => $k->id,
                'nama_kategori' => $k->nama_kategori,
                'qr_code' => $k->qr_code ?: "/scan/kategori/{$k->id}",
                'tipe' => $k->tipe ?? 'aset',
                'is_habis_pakai' => $k->isHabisPakai(),
                'total_barang' => $k->barang_count,
                'total_unit' => $k->units->count(),
                'tersedia' => $k->units->where('status', 'tersedia')->count(),
            ]);

        $recentUnits = BarangUnit::with('barang')
            ->where('status', 'tersedia')
            ->take(8)
            ->get()
            ->map(fn ($u) => [
                'kode_unit' => $u->kode_unit,
                'nama_barang' => $u->barang?->nama_barang,
                'kategori' => $u->barang?->kategori?->nama_kategori ?? 'Umum',
            ]);

        return Inertia::render('User/MobileScanner', [
            'categories' => $categories,
            'recentUnits' => $recentUnits,
            'initialCode' => (string) $request->query('code', ''),
            'targetName' => (string) $request->query('target', ''),
        ]);
    }

    /**
     * Lookup Cepat saat Scan QR Code (Mendukung QR Kategori maupun QR Unit Fisik)
     */
    public function lookupUnit(Request $request, ?string $kode_unit = null): JsonResponse
    {
        $user = auth()->user();
        
        // 1. Ambil input dari query parameter ?code= atau dari path parameter {kode_unit}
        $raw = (string) $request->query('code', $kode_unit ?? '');
        $raw = trim(urldecode($raw));

        if (empty($raw)) {
            return response()->json([
                'success' => false,
                'message' => 'Kode QR tidak boleh kosong.',
            ], 400);
        }

        // Jika berbentuk URL lengkap (contoh: http://localhost:8000/scan/...)
        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://') || filter_var($raw, FILTER_VALIDATE_URL)) {
            $parsedPath = parse_url($raw, PHP_URL_PATH) ?? '';
            $raw = trim($parsedPath, '/');
        }

        // Hapus query params jika ada
        if (str_contains($raw, '?')) {
            $raw = explode('?', $raw)[0];
        }

        // 2. Cek apakah QR adalah QR Kategori
        // Format didukung: /scan/kategori/{id}, scan/kategori/{id}, kategori/{id}, kat-1, ID numerik, atau nama kategori
        if (
            preg_match('#(?:^|/)scan/kategori/(\d+)#i', $raw, $katMatch) ||
            preg_match('#^kategori/(\d+)#i', $raw, $katMatch) ||
            preg_match('#^(?:kategori|kat)[-_\s]?(\d+)$#i', $raw, $katMatch)
        ) {
            $kat = KategoriBarang::withCount('barang')->with('units')->find((int) $katMatch[1]);
            if ($kat) {
                return response()->json([
                    'success' => true,
                    'type' => 'kategori',
                    'data' => [
                        'id' => $kat->id,
                        'nama_kategori' => $kat->nama_kategori,
                        'tipe' => $kat->tipe ?? 'aset',
                        'is_habis_pakai' => $kat->isHabisPakai(),
                        'total_barang' => $kat->barang_count,
                        'total_unit' => $kat->units->count(),
                        'tersedia' => $kat->units->where('status', 'tersedia')->count(),
                        'qr_code' => $kat->qr_code ?: "/scan/kategori/{$kat->id}",
                    ],
                ]);
            }
        }

        if (is_numeric($raw)) {
            $kat = KategoriBarang::withCount('barang')->with('units')->find((int) $raw);
            if ($kat) {
                return response()->json([
                    'success' => true,
                    'type' => 'kategori',
                    'data' => [
                        'id' => $kat->id,
                        'nama_kategori' => $kat->nama_kategori,
                        'tipe' => $kat->tipe ?? 'aset',
                        'is_habis_pakai' => $kat->isHabisPakai(),
                        'total_barang' => $kat->barang_count,
                        'total_unit' => $kat->units->count(),
                        'tersedia' => $kat->units->where('status', 'tersedia')->count(),
                        'qr_code' => $kat->qr_code ?: "/scan/kategori/{$kat->id}",
                    ],
                ]);
            }
        }

        $katByCode = KategoriBarang::withCount('barang')->with('units')
            ->where('qr_code', $raw)
            ->orWhere('qr_code', '/' . ltrim($raw, '/'))
            ->orWhere('nama_kategori', $raw)
            ->orWhere('nama_kategori', 'like', "%{$raw}%")
            ->first();
        if ($katByCode) {
            return response()->json([
                'success' => true,
                'type' => 'kategori',
                'data' => [
                    'id' => $katByCode->id,
                    'nama_kategori' => $katByCode->nama_kategori,
                    'tipe' => $katByCode->tipe ?? 'aset',
                    'is_habis_pakai' => $katByCode->isHabisPakai(),
                    'total_barang' => $katByCode->barang_count,
                    'total_unit' => $katByCode->units->count(),
                    'tersedia' => $katByCode->units->where('status', 'tersedia')->count(),
                    'qr_code' => $katByCode->qr_code ?: "/scan/kategori/{$katByCode->id}",
                ],
            ]);
        }

        // 3. Normalisasi format QR Unit Fisik
        // Payload dari admin bisa berbentuk:
        // - "http://localhost:8000/scan/3D Printer Anet LCD/SLA"
        // - "/scan/3D Printer Anet LCD/SLA"
        // - "scan/3D Printer Anet LCD/SLA"
        // - "3D Printer Anet LCD/SLA" (kode unit langsung)
        $cleanKode = $raw;
        if (preg_match('#(?:^|/)scan/(.+)$#i', $cleanKode, $matches)) {
            $cleanKode = trim($matches[1]);
        }

        // Cari unit berdasarkan kode_unit (exact match atau decode)
        $unit = BarangUnit::with(['barang.kategori', 'activeLogbook'])
            ->where('kode_unit', $cleanKode)
            ->orWhere('kode_unit', urldecode($cleanKode))
            ->orWhere('kode_unit', rawurldecode($cleanKode))
            ->first();

        if (!$unit) {
            return response()->json([
                'success' => false,
                'message' => "Kode QR '{$cleanKode}' tidak ditemukan di sistem WAMS.",
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
            'type' => 'unit',
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
                    'gambar_url' => $unit->barang?->gambar_url,
                ],
            ],
        ]);
    }

    /**
     * Profil Pengguna & Edit Profil (Mirip Flutter ProfileScreen & EditProfileScreen)
     */
    public function profile(Request $request): Response
    {
        $user = auth()->user();

        $activeCount = Logbook::where('user_id', $user->id)->where('status_transaksi', 'dipinjam')->count();
        $totalHistory = Logbook::where('user_id', $user->id)->count();

        $stats = [
            'active_borrows' => $activeCount,
            'total_history' => $totalHistory,
            'total_pinjam' => $totalHistory,
            'selesai' => Logbook::where('user_id', $user->id)->where('status_transaksi', 'dikembalikan')->count(),
            'aktif' => $activeCount,
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
            'initialMode' => $request->query('mode', 'view'), // 'view' | 'edit'
        ]);
    }

    /**
     * Update Profil & Password (Mirip Flutter EditProfileScreen)
     */
    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'nip' => ['nullable', 'string', 'max:50', 'unique:users,nip,' . $user->id],
            'current_password' => ['nullable', 'string'],
            'new_password' => ['nullable', 'string', 'min:6', 'confirmed'],
        ], [
            'nama.required' => 'Nama lengkap wajib diisi.',
            'nip.unique' => 'NIP sudah terdaftar pada pengguna lain.',
            'new_password.min' => 'Password baru minimal 6 karakter.',
            'new_password.confirmed' => 'Konfirmasi password baru tidak cocok.',
        ]);

        if ($request->filled('new_password')) {
            if (!Hash::check($request->current_password ?? '', $user->password)) {
                if ($request->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Password saat ini salah.',
                    ], 422);
                }
                throw ValidationException::withMessages([
                    'current_password' => ['Password saat ini salah.'],
                ]);
            }
            $user->password = Hash::make($request->new_password);
        }

        $user->nama = trim($request->nama);
        if ($request->has('nip')) {
            $user->nip = $request->nip ? trim($request->nip) : null;
        }
        $user->save();

        if ($request->filled('new_password')) {
            $user->recordPlainPassword($request->new_password);
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => $request->filled('new_password') ? 'Password berhasil diperbarui.' : 'Profil berhasil diperbarui.',
                'data' => [
                    'id' => $user->id,
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'nip' => $user->nip,
                ],
            ]);
        }

        return back()->with('success', $request->filled('new_password') ? 'Password berhasil diperbarui.' : 'Profil berhasil diperbarui.');
    }

    /**
     * Helper formatting Barang item (Sesuai BarangModel Flutter)
     */
    private function formatBarangItem(Barang $b): array
    {
        $units = $b->relationLoaded('units') ? $b->units : $b->units()->get();
        $totalUnits = $units->count();
        $availableUnits = $units->where('status', 'tersedia')->count();
        $dipinjamUnits = $units->where('status', 'dipinjam')->count();
        $maintenanceUnits = $units->where('status', 'maintenance')->count();
        $isHabisPakai = $b->isHabisPakai();

        return [
            'id' => $b->id,
            'kategori_id' => $b->kategori_id,
            'nama_kategori' => $b->kategori?->nama_kategori ?? 'Peralatan',
            'kategori' => $b->kategori?->nama_kategori ?? 'Peralatan',
            'nama_barang' => $b->nama_barang,
            'kode_barang' => $b->kode_barang ?? 'WMS',
            'detail_spesifikasi' => $b->detail_spesifikasi,
            'deskripsi' => $b->detail_spesifikasi,
            'lokasi' => $b->lokasi ?? 'Workshop Mesin / Lab Utama',
            'lokasi_penyimpanan' => $b->lokasi ?? 'Workshop Mesin / Lab Utama',
            'perlu_persetujuan' => (bool) $b->perlu_persetujuan,
            'total_unit' => $totalUnits,
            'total_units' => $totalUnits,
            'tersedia' => $availableUnits,
            'stok_tersedia' => $availableUnits,
            'available_units' => $availableUnits,
            'dipinjam' => $dipinjamUnits,
            'maintenance' => $maintenanceUnits,
            'can_borrow' => $availableUnits > 0,
            'tipe' => $isHabisPakai ? 'habis_pakai' : 'aset',
            'is_habis_pakai' => $isHabisPakai,
            'satuan' => $b->satuan ?? 'unit',
            'stok_saat_ini' => (float) $b->stok_saat_ini,
            'stok_minimum' => (float) $b->stok_minimum,
            'is_low_stock' => $isHabisPakai ? $b->isLowStock() : false,
            'gambar_url' => $b->gambar_url,
            'foto_url' => $b->gambar_url,
            'units' => $units->map(fn ($u) => [
                'id' => $u->id,
                'barang_id' => $u->barang_id,
                'kode_unit' => $u->kode_unit,
                'serial_number' => $u->nomor_seri ?? null,
                'status' => $u->status,
                'kondisi' => $u->kondisi,
                'kondisi_label' => $u->kondisi === 'baik' ? 'Baik' : 'Rusak',
                'gambar_url' => $u->gambar_url,
                'unit_gambar_url' => $u->unit_gambar_url,
                'is_tersedia' => $u->status === 'tersedia',
                'is_maintenance' => $u->status === 'maintenance',
            ])->values(),
            'available_unit_list' => $units->where('status', 'tersedia')->map(fn ($u) => [
                'id' => $u->id,
                'kode_unit' => $u->kode_unit,
                'kondisi' => $u->kondisi,
            ])->values(),
        ];
    }

    /**
     * Helper formatting Logbook item (Sesuai RiwayatModel Flutter)
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
                $remainingText = $diff->days > 0 ? "{$diff->days} hari terlambat" : "{$diff->h} jam terlambat";
            } else {
                if ($diff->days > 0) {
                    $remainingText = "sisa {$diff->days} hari";
                } elseif ($diff->h > 0) {
                    $remainingText = "sisa {$diff->h} jam";
                } else {
                    $remainingText = "segera berakhir";
                }
            }
        }

        return [
            'id' => $log->id,
            'user_id' => $log->user_id,
            'barang_id' => $barang?->id,
            'unit_id' => $unit?->id,
            'nama_barang' => $barang?->nama_barang ?? 'Peralatan Workshop',
            'kode_barang' => $barang?->kode_barang ?? '-',
            'nama_kategori' => $barang?->kategori?->nama_kategori ?? 'Umum',
            'kategori' => $barang?->kategori?->nama_kategori ?? 'Umum',
            'kode_unit' => $unit?->kode_unit ?? '-',
            'keperluan' => $log->keperluan,
            'status_transaksi' => $log->status_transaksi,
            'kondisi_pinjam_label' => 'Baik',
            'kondisi_kembali' => $log->kondisi_kembali,
            'kondisi_kembali_label' => $log->kondisi_kembali
                ? ($log->kondisi_kembali === 'baik' ? 'Baik' : 'Rusak')
                : '-',
            'catatan_kembali' => $log->catatan_kembali ?? null,
            'tanggal_pinjam' => $log->tanggal_pinjam?->translatedFormat('d M Y') ?? '-',
            'tanggal_pinjam_raw' => $log->tanggal_pinjam?->toIso8601String(),
            'batas_kembali' => $log->batas_kembali?->translatedFormat('d M Y') ?? '-',
            'batas_kembali_raw' => $log->batas_kembali?->toIso8601String(),
            'batas_kembali_iso' => $log->batas_kembali?->toIso8601String(),
            'tanggal_kembali' => $log->tanggal_kembali?->translatedFormat('d M Y'),
            'tanggal_kembali_raw' => $log->tanggal_kembali?->toIso8601String(),
            'is_overdue' => $isOverdue,
            'remaining_text' => $remainingText,
            'nama_approver' => $log->approver?->nama,
            'approver_nama' => $log->approver?->nama,
            'alasan_penolakan' => $log->alasan_penolakan,
            'foto_pinjam_url' => $log->foto_pinjam_url,
            'foto_kembali_url' => $log->foto_kembali_url,
            'gambar_url' => $unit?->gambar_url ?? $barang?->gambar_url,
            'foto' => $unit?->gambar_url ?? $barang?->gambar_url,
        ];
    }
}
