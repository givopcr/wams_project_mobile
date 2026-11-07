<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Mail\GuestOtpMail;
use App\Models\BarangUnit;
use App\Models\GuestOtp;
use App\Models\KategoriBarang;
use App\Models\Logbook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GuestPinjamController extends Controller
{
    /**
     * Batas waktu standar tamu tanpa verifikasi OTP (dalam menit).
     * 240 menit = 4 jam.
     */
    protected int $maxStandardMinutes = 240;

    /**
     * Menampilkan halaman peminjaman atau status unit berdasarkan scan QR
     */
    public function show(Request $request, string $kode_unit): Response|RedirectResponse
    {
        $kode_unit = trim(urldecode($kode_unit));

        // 1. Cek apakah QR yang di-scan adalah QR Kategori (contoh: kategori/1, scan/kategori/1, dll)
        if (preg_match('#^(?:scan/)?kategori/(\d+)#i', $kode_unit, $katMatch)) {
            $katId = (int) $katMatch[1];
            if (auth()->check()) {
                if (auth()->user()->role === 'user') {
                    return redirect()->route('user.katalog', ['kategori_id' => $katId, 'mode' => 'category_list']);
                }
                return redirect()->route('admin.barang', ['kategori_id' => $katId]);
            }

            return redirect()->route('login', [
                'redirect' => route('user.katalog', ['kategori_id' => $katId, 'mode' => 'category_list']),
                'message' => 'Silakan masuk untuk melihat daftar alat pada kategori ini.',
            ]);
        }

        // Cek jika kode_unit cocok dengan qr_code kategori di database
        $kategori = KategoriBarang::where('qr_code', $kode_unit)
            ->orWhere('qr_code', '/' . ltrim($kode_unit, '/'))
            ->orWhere('qr_code', '/scan/' . ltrim($kode_unit, '/'))
            ->first();
        if ($kategori) {
            if (auth()->check()) {
                if (auth()->user()->role === 'user') {
                    return redirect()->route('user.katalog', ['kategori_id' => $kategori->id, 'mode' => 'category_list']);
                }
                return redirect()->route('admin.barang', ['kategori_id' => $kategori->id]);
            }

            return redirect()->route('login', [
                'redirect' => route('user.katalog', ['kategori_id' => $kategori->id, 'mode' => 'category_list']),
                'message' => 'Silakan masuk untuk melihat daftar alat pada kategori ini.',
            ]);
        }

        // Jika meminta mode login secara eksplisit lewat query (?mode=login)
        if ($request->query('mode') === 'login') {
            return redirect()->route('login', [
                'redirect' => route('guest.scan', ['kode_unit' => $kode_unit]),
            ]);
        }

        // Jika pengguna terautentikasi, langsung arahkan sesuai role (User ke scanner mobile, Admin ke manajemen barang/unit)
        // Kecuali jika secara eksplisit meminta preview mode tamu (?guest_preview=1 atau ?mode=guest)
        if (auth()->check() && ! $request->boolean('guest_preview') && $request->query('mode') !== 'guest') {
            if (auth()->user()->role === 'user') {
                return redirect()->route('user.scanner', ['code' => $kode_unit]);
            }
            if (auth()->user()->role === 'admin') {
                return redirect()->route('admin.barang', ['q' => $kode_unit]);
            }
        }

        $unit = BarangUnit::with(['barang.kategori', 'activeLogbook'])
            ->where('kode_unit', $kode_unit)
            ->orWhere('kode_unit', rawurldecode($kode_unit))
            ->first();

        $loginUrl = route('login', ['redirect' => route('guest.scan', ['kode_unit' => $kode_unit])]);

        if (!$unit) {
            return Inertia::render('Guest/Unavailable', [
                'type' => 'not_found',
                'kode_unit' => $kode_unit,
                'message' => "Unit dengan kode '{$kode_unit}' tidak terdaftar di sistem WAMS.",
                'login_url' => $loginUrl,
            ]);
        }

        if ($unit->status === 'maintenance') {
            return Inertia::render('Guest/Unavailable', [
                'type' => 'maintenance',
                'kode_unit' => $kode_unit,
                'unit' => [
                    'kode_unit' => $unit->kode_unit,
                    'kondisi' => $unit->kondisi,
                    'nama_barang' => $unit->barang?->nama_barang ?? 'Peralatan',
                    'kategori' => $unit->barang?->kategori?->nama_kategori ?? 'Umum',
                ],
                'message' => 'Unit barang ini sedang dalam perbaikan/pemeliharaan teknisi dan tidak dapat dipinjam.',
                'login_url' => $loginUrl,
            ]);
        }

        if ($unit->status === 'dipinjam' || $unit->status === 'menunggu_persetujuan') {
            $logbook = $unit->activeLogbook;
            $isAuthorized = $this->isAuthorizedForGuestReturn($request, $logbook, $kode_unit);

            if ($isAuthorized) {
                // Tampilkan halaman status / pengembalian
                return Inertia::render('Guest/Status', [
                    'unit' => [
                        'id' => $unit->id,
                        'kode_unit' => $unit->kode_unit,
                        'status' => $unit->status,
                        'nama_barang' => $unit->barang?->nama_barang,
                        'kategori' => $unit->barang?->kategori?->nama_kategori,
                        'gambar' => $unit->barang?->gambar ? asset('storage/' . $unit->barang->gambar) : null,
                    ],
                    'logbook' => [
                        'id' => $logbook->id,
                        'tipe_peminjam' => $logbook->tipe_peminjam,
                        'peminjam_nama' => $logbook->peminjam_nama,
                        'peminjam_email' => $logbook->peminjam_email,
                        'tanggal_pinjam' => $logbook->tanggal_pinjam?->toIso8601String(),
                        'batas_kembali' => $logbook->batas_kembali?->toIso8601String(),
                        'requires_verification' => $logbook->requires_verification,
                        'return_token' => $logbook->return_token,
                    ],
                ]);
            }

            $hasVerificationAttempt = $request->filled('email') || $request->filled('nama') || $request->filled('token');

            return Inertia::render('Guest/Unavailable', [
                'type' => 'borrowed',
                'kode_unit' => $kode_unit,
                'unit' => [
                    'kode_unit' => $unit->kode_unit,
                    'nama_barang' => $unit->barang?->nama_barang ?? 'Peralatan',
                    'kategori' => $unit->barang?->kategori?->nama_kategori ?? 'Umum',
                ],
                'is_guest_loan' => $logbook?->tipe_peminjam === 'guest',
                'borrower_hint' => $this->maskBorrowerHint($logbook),
                'verification_error' => $hasVerificationAttempt
                    ? 'Nama dan email peminjam tidak sesuai dengan data peminjaman aktif unit ini.'
                    : null,
                'message' => 'Unit barang ini sedang dipinjam.',
                'login_url' => $loginUrl,
            ]);
        }

        // Cegah bypass persetujuan admin untuk barang khusus pada mode tamu
        if ($unit->barang?->perlu_persetujuan) {
            return Inertia::render('Guest/Unavailable', [
                'type' => 'restricted',
                'kode_unit' => $kode_unit,
                'unit' => [
                    'kode_unit' => $unit->kode_unit,
                    'nama_barang' => $unit->barang?->nama_barang ?? 'Peralatan Khusus',
                    'kategori' => $unit->barang?->kategori?->nama_kategori ?? 'Umum',
                ],
                'message' => 'Barang ini memerlukan otorisasi khusus Admin Workshop. Silakan login menggunakan akun terdaftar untuk mengajukan peminjaman.',
                'login_url' => $loginUrl,
            ]);
        }

        // Unit tersedia untuk dipinjam
        return Inertia::render('Guest/Borrow', [
            'unit' => [
                'id' => $unit->id,
                'kode_unit' => $unit->kode_unit,
                'status' => $unit->status,
                'kondisi' => $unit->kondisi,
            ],
            'barang' => [
                'id' => $unit->barang?->id,
                'nama_barang' => $unit->barang?->nama_barang,
                'deskripsi' => $unit->barang?->deskripsi,
                'kategori' => $unit->barang?->kategori?->nama_kategori,
                'gambar' => $unit->barang?->gambar ? asset('storage/' . $unit->barang->gambar) : null,
            ],
            'max_standard_duration_minutes' => $this->maxStandardMinutes,
            'preset_durations' => [
                ['label' => '1 Jam', 'minutes' => 60, 'requires_otp' => false],
                ['label' => '2 Jam', 'minutes' => 120, 'requires_otp' => false],
                ['label' => '4 Jam (Maks Standar)', 'minutes' => 240, 'requires_otp' => false],
                ['label' => '8 Jam', 'minutes' => 480, 'requires_otp' => true],
                ['label' => '1 Hari', 'minutes' => 1440, 'requires_otp' => true],
                ['label' => '3 Hari', 'minutes' => 4320, 'requires_otp' => true],
            ],
            'login_url' => $loginUrl,
        ]);
    }

    /**
     * Submit form peminjaman tamu
     */
    public function submitBorrow(Request $request, string $kode_unit): JsonResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'min:3', 'max:100'],
            'email' => ['required', 'email', 'max:150'],
            'durasi_menit' => ['required', 'integer', 'min:15', 'max:10080'], // max 7 hari
            'keperluan' => ['nullable', 'string', 'max:500'],
            'foto_pinjam' => ['required', 'string', 'max:7000000'],
        ], [
            'foto_pinjam.required' => 'Foto barang sebelum dipinjam wajib diunggah dan tidak boleh dilewati.',
            'foto_pinjam.max' => 'Ukuran foto barang terlalu besar (maksimal 5MB).',
        ]);

        $parsedFoto = $this->decodeAndValidateBase64Image($validated['foto_pinjam'] ?? null);
        if (!$parsedFoto) {
            return response()->json([
                'success' => false,
                'message' => 'Foto barang sebelum dipinjam wajib diunggah dengan format gambar yang valid (JPG, PNG, atau WEBP maks 5MB).',
            ], 422);
        }

        $keperluanText = !empty($validated['keperluan']) ? trim($validated['keperluan']) : null;

        $unit = BarangUnit::with('barang')
            ->where('kode_unit', $kode_unit)
            ->first();

        if (!$unit || $unit->status !== 'tersedia') {
            return response()->json([
                'success' => false,
                'message' => 'Unit barang tidak tersedia untuk dipinjam saat ini.',
            ], 422);
        }

        if ($unit->barang?->perlu_persetujuan) {
            return response()->json([
                'success' => false,
                'message' => 'Barang ini memerlukan persetujuan Admin Workshop dan hanya dapat diajukan melalui akun teknisi terdaftar.',
            ], 403);
        }

        $safeSlug = $this->sanitizeUnitSlug($unit->kode_unit);
        $fotoPinjamPath = 'peminjaman/guest_borrow_' . $safeSlug . '_' . time() . '_' . uniqid() . '.' . $parsedFoto['ext'];
        Storage::disk('public')->put($fotoPinjamPath, $parsedFoto['decoded']);

        $durasiMenit = (int) $validated['durasi_menit'];

        // Jika durasi > batas standar (4 jam), butuh verifikasi OTP
        if ($durasiMenit > $this->maxStandardMinutes) {
            $otp = (string) random_int(100000, 999999);

            // Simpan OTP ke database
            GuestOtp::create([
                'email' => strtolower(trim($validated['email'])),
                'guest_nama' => trim($validated['nama']),
                'kode_unit' => $kode_unit,
                'durasi_menit' => $durasiMenit,
                'keperluan' => $keperluanText,
                'foto_pinjam' => $fotoPinjamPath,
                'otp_code' => $otp,
                'expires_at' => now()->addMinutes(10),
                'is_used' => false,
            ]);

            // Kirim email OTP
            try {
                Mail::to($validated['email'])->send(
                    new GuestOtpMail(
                        guestNama: $validated['nama'],
                        otpCode: $otp,
                        unit: $unit,
                        durasiMenit: $durasiMenit,
                    )
                );
            } catch (\Throwable $e) {
                report($e);
            }

            return response()->json([
                'success' => true,
                'requires_otp' => true,
                'message' => 'Kode verifikasi OTP telah dikirimkan ke ' . $validated['email'],
                // Sertakan debug_otp jika APP_DEBUG aktif untuk mempermudah testing lokal
                'debug_otp' => config('app.debug') ? $otp : null,
            ]);
        }

        // Durasi <= 4 jam: Langsung disetujui tanpa OTP
        return DB::transaction(function () use ($unit, $validated, $durasiMenit, $kode_unit, $keperluanText, $fotoPinjamPath) {
            $lockedUnit = BarangUnit::where('id', $unit->id)
                ->where('status', 'tersedia')
                ->lockForUpdate()
                ->first();

            if (!$lockedUnit) {
                Storage::disk('public')->delete($fotoPinjamPath);
                return response()->json([
                    'success' => false,
                    'message' => 'Unit barang sedang diproses atau sudah dipinjam pengguna lain.',
                ], 422);
            }

            $lockedUnit->update(['status' => 'dipinjam']);

            $returnToken = Str::random(40);

            $logbook = Logbook::create([
                'user_id' => null,
                'barang_unit_id' => $lockedUnit->id,
                'tipe_peminjam' => 'guest',
                'guest_nama' => trim($validated['nama']),
                'guest_email' => strtolower(trim($validated['email'])),
                'keperluan' => $keperluanText,
                'foto_pinjam' => $fotoPinjamPath,
                'tanggal_pinjam' => now(),
                'batas_kembali' => now()->addMinutes($durasiMenit),
                'tanggal_kembali' => null,
                'kondisi_kembali' => null,
                'status_transaksi' => 'dipinjam',
                'requires_verification' => false,
                'return_token' => $returnToken,
            ]);

            return response()->json([
                'success' => true,
                'requires_otp' => false,
                'message' => 'Peminjaman berhasil diajukan.',
                'return_token' => $returnToken,
                'redirect_url' => route('guest.status', [
                    'kode_unit' => $kode_unit,
                    'token' => $returnToken,
                ]),
            ])->withCookie(cookie($this->guestCookieName($kode_unit), $returnToken, 60 * 24 * 7));
        });
    }

    /**
     * Verifikasi kode OTP peminjaman durasi panjang
     */
    public function verifyOtp(Request $request, string $kode_unit): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'otp_code' => ['required', 'string', 'size:6'],
        ]);

        $unit = BarangUnit::where('kode_unit', $kode_unit)->first();
        if (!$unit || $unit->status !== 'tersedia') {
            return response()->json([
                'success' => false,
                'message' => 'Unit barang tidak tersedia untuk dipinjam saat ini.',
            ], 422);
        }

        if ($unit->barang?->perlu_persetujuan) {
            return response()->json([
                'success' => false,
                'message' => 'Barang ini memerlukan persetujuan Admin Workshop dan hanya dapat diajukan melalui akun teknisi terdaftar.',
            ], 403);
        }

        $email = strtolower(trim($validated['email']));
        $otp = trim($validated['otp_code']);

        $latestOtp = GuestOtp::where('email', $email)
            ->where('kode_unit', $kode_unit)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$latestOtp) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP tidak ditemukan atau telah kedaluwarsa. Silakan minta kode baru.',
            ], 422);
        }

        $hasAttemptsColumn = Schema::hasColumn('guest_otps', 'attempts');
        if ($hasAttemptsColumn && $latestOtp->attempts >= 5) {
            $latestOtp->update(['is_used' => true]);
            return response()->json([
                'success' => false,
                'message' => 'Terlalu banyak percobaan OTP yang salah. Silakan minta kode OTP baru.',
            ], 429);
        }

        if (!hash_equals((string) $latestOtp->otp_code, $otp)) {
            if ($hasAttemptsColumn) {
                $latestOtp->increment('attempts');
            }
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP salah. Silakan periksa kembali kode Anda.',
            ], 422);
        }

        $otpRecord = $latestOtp;

        return DB::transaction(function () use ($unit, $otpRecord, $kode_unit) {
            $lockedUnit = BarangUnit::where('id', $unit->id)
                ->where('status', 'tersedia')
                ->lockForUpdate()
                ->first();

            if (!$lockedUnit) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unit barang baru saja dipinjam orang lain.',
                ], 422);
            }

            $lockedUnit->update(['status' => 'dipinjam']);
            $otpRecord->update(['is_used' => true]);

            $returnToken = Str::random(40);

            $logbook = Logbook::create([
                'user_id' => null,
                'barang_unit_id' => $lockedUnit->id,
                'tipe_peminjam' => 'guest',
                'guest_nama' => $otpRecord->guest_nama,
                'guest_email' => $otpRecord->email,
                'keperluan' => $otpRecord->keperluan,
                'foto_pinjam' => $otpRecord->foto_pinjam,
                'tanggal_pinjam' => now(),
                'batas_kembali' => now()->addMinutes($otpRecord->durasi_menit),
                'tanggal_kembali' => null,
                'kondisi_kembali' => null,
                'status_transaksi' => 'dipinjam',
                'requires_verification' => true,
                'return_token' => $returnToken,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Verifikasi berhasil! Peminjaman telah aktif.',
                'return_token' => $returnToken,
                'redirect_url' => route('guest.status', [
                    'kode_unit' => $kode_unit,
                    'token' => $returnToken,
                ]),
            ])->withCookie(cookie($this->guestCookieName($kode_unit), $returnToken, 60 * 24 * 7));
        });
    }

    /**
     * Kirim ulang kode OTP
     */
    public function resendOtp(Request $request, string $kode_unit): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $unit = BarangUnit::with('barang')->where('kode_unit', $kode_unit)->first();
        if (!$unit || $unit->status !== 'tersedia') {
            return response()->json([
                'success' => false,
                'message' => 'Unit barang tidak tersedia.',
            ], 422);
        }

        $email = strtolower(trim($validated['email']));

        $latestOtp = GuestOtp::where('email', $email)
            ->where('kode_unit', $kode_unit)
            ->latest()
            ->first();

        if (!$latestOtp) {
            return response()->json([
                'success' => false,
                'message' => 'Data pengajuan peminjaman tidak ditemukan.',
            ], 404);
        }

        // Cegah spam: minimal 30 detik sejak kirim terakhir
        if ($latestOtp->created_at->diffInSeconds(now()) < 30) {
            $sisaDetik = 30 - $latestOtp->created_at->diffInSeconds(now());
            return response()->json([
                'success' => false,
                'message' => "Mohon tunggu {$sisaDetik} detik sebelum meminta kode baru.",
            ], 429);
        }

        $newOtp = (string) random_int(100000, 999999);

        GuestOtp::create([
            'email' => $email,
            'guest_nama' => $latestOtp->guest_nama,
            'kode_unit' => $kode_unit,
            'durasi_menit' => $latestOtp->durasi_menit,
            'keperluan' => $latestOtp->keperluan,
            'foto_pinjam' => $latestOtp->foto_pinjam,
            'otp_code' => $newOtp,
            'expires_at' => now()->addMinutes(10),
            'is_used' => false,
        ]);

        try {
            Mail::to($email)->send(
                new GuestOtpMail(
                    guestNama: $latestOtp->guest_nama,
                    otpCode: $newOtp,
                    unit: $unit,
                    durasiMenit: $latestOtp->durasi_menit,
                )
            );
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json([
            'success' => true,
            'message' => 'Kode OTP baru telah dikirimkan.',
            'debug_otp' => config('app.debug') ? $newOtp : null,
        ]);
    }

    /**
     * Tiket digital peminjaman aktif tamu
     */
    public function showStatus(Request $request, string $kode_unit): Response|RedirectResponse
    {
        $unit = BarangUnit::with(['barang.kategori', 'activeLogbook'])
            ->where('kode_unit', $kode_unit)
            ->firstOrFail();

        $logbook = $unit->activeLogbook;
        if (!$logbook || $unit->status !== 'dipinjam') {
            if ($unit->status === 'tersedia') {
                return redirect()->route('guest.scan', ['kode_unit' => $kode_unit]);
            }

            return Inertia::render('Guest/Unavailable', [
                'type' => $unit->status === 'maintenance' ? 'maintenance' : 'not_borrowed',
                'kode_unit' => $kode_unit,
                'unit' => [
                    'nama_barang' => $unit->barang?->nama_barang,
                    'kode_unit' => $unit->kode_unit,
                ],
                'message' => 'Unit barang ini sedang tidak dalam status dipinjam.',
            ]);
        }

        // Verifikasi otorisasi token atau kombinasi nama + email tamu sebelum menampilkan tiket pengembalian
        $isAuthorized = $this->isAuthorizedForGuestReturn($request, $logbook, $kode_unit);

        if (!$isAuthorized) {
            $hasVerificationAttempt = $request->filled('email') || $request->filled('nama') || $request->filled('token');

            return Inertia::render('Guest/Unavailable', [
                'type' => 'borrowed',
                'kode_unit' => $kode_unit,
                'unit' => [
                    'kode_unit' => $unit->kode_unit,
                    'nama_barang' => $unit->barang?->nama_barang ?? 'Peralatan',
                    'kategori' => $unit->barang?->kategori?->nama_kategori ?? 'Umum',
                ],
                'is_guest_loan' => $logbook->tipe_peminjam === 'guest',
                'borrower_hint' => $this->maskBorrowerHint($logbook),
                'verification_error' => $hasVerificationAttempt
                    ? 'Nama dan email peminjam tidak sesuai dengan data peminjaman aktif unit ini.'
                    : null,
                'message' => 'Unit barang ini sedang dipinjam. Gunakan tautan tiket atau verifikasi nama & email peminjam untuk mengakses halaman pengembalian.',
            ]);
        }

        return Inertia::render('Guest/Status', [
            'unit' => [
                'id' => $unit->id,
                'kode_unit' => $unit->kode_unit,
                'status' => $unit->status,
                'nama_barang' => $unit->barang?->nama_barang,
                'kategori' => $unit->barang?->kategori?->nama_kategori,
                'gambar' => $unit->barang?->gambar ? asset('storage/' . $unit->barang->gambar) : null,
            ],
            'logbook' => [
                'id' => $logbook->id,
                'tipe_peminjam' => $logbook->tipe_peminjam,
                'peminjam_nama' => $logbook->peminjam_nama,
                'peminjam_email' => $logbook->peminjam_email,
                'tanggal_pinjam' => $logbook->tanggal_pinjam?->toIso8601String(),
                'batas_kembali' => $logbook->batas_kembali?->toIso8601String(),
                'requires_verification' => $logbook->requires_verification,
                'return_token' => $logbook->return_token,
            ],
        ]);
    }

    /**
     * Menyelesaikan pengembalian barang secara mandiri oleh tamu
     */
    public function submitReturn(Request $request, string $kode_unit): JsonResponse
    {
        $validated = $request->validate([
            'kondisi' => ['required', 'in:baik,rusak'],
            'catatan' => ['nullable', 'string', 'max:500'],
            'foto_kondisi' => ['required', 'string', 'max:7000000'],
            'token' => ['nullable', 'string'],
        ], [
            'foto_kondisi.required' => 'Foto kondisi barang saat dikembalikan wajib diunggah dan tidak boleh dilewati.',
            'foto_kondisi.max' => 'Ukuran foto kondisi barang terlalu besar (maksimal 5MB).',
        ]);

        $parsedFoto = $this->decodeAndValidateBase64Image($validated['foto_kondisi'] ?? null);
        if (!$parsedFoto) {
            return response()->json([
                'success' => false,
                'message' => 'Foto kondisi barang saat dikembalikan wajib diunggah dengan format gambar yang valid (JPG, PNG, atau WEBP maks 5MB).',
            ], 422);
        }

        $unit = BarangUnit::with('activeLogbook')
            ->where('kode_unit', $kode_unit)
            ->firstOrFail();

        $logbook = $unit->activeLogbook;
        if (!$logbook || $unit->status !== 'dipinjam') {
            return response()->json([
                'success' => false,
                'message' => 'Barang ini sudah dikembalikan atau tidak dalam status dipinjam.',
            ], 422);
        }

        if ($logbook->tipe_peminjam !== 'guest') {
            return response()->json([
                'success' => false,
                'message' => 'Peminjaman oleh akun teknisi terdaftar hanya dapat dikembalikan melalui portal pengguna.',
            ], 403);
        }

        // Wajib verifikasi return_token untuk pengembalian tamu
        $providedToken = $validated['token'] ?: $this->resolveGuestToken($request, $kode_unit);
        if (empty($logbook->return_token) || ! $providedToken || ! hash_equals($logbook->return_token, $providedToken)) {
            return response()->json([
                'success' => false,
                'message' => 'Token pengembalian tidak valid.',
            ], 403);
        }

        $safeSlug = $this->sanitizeUnitSlug($unit->kode_unit);
        $fotoKembaliPath = 'pengembalian/guest_return_' . $safeSlug . '_' . time() . '_' . uniqid() . '.' . $parsedFoto['ext'];
        Storage::disk('public')->put($fotoKembaliPath, $parsedFoto['decoded']);

        DB::transaction(function () use ($unit, $logbook, $validated, $fotoKembaliPath) {
            $kondisi = $validated['kondisi'];

            $updateData = [
                'tanggal_kembali' => now(),
                'kondisi_kembali' => $kondisi,
                'foto_kembali' => $fotoKembaliPath,
                'status_transaksi' => 'dikembalikan',
            ];

            if (!empty($validated['catatan']) && Schema::hasColumn('logbook', 'catatan_kembali')) {
                $updateData['catatan_kembali'] = $validated['catatan'];
            }

            $logbook->update($updateData);

            // Jika kondisi rusak, unit masuk status maintenance
            $unit->update([
                'status' => $kondisi === 'rusak' ? 'maintenance' : 'tersedia',
                'kondisi' => $kondisi,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Barang berhasil dikembalikan. Terima kasih telah menggunakan peralatan workshop WAMS!',
        ])->withoutCookie($this->guestCookieName($kode_unit));
    }

    /**
     * Nama cookie aman sesuai RFC 6265 (tanpa spasi atau slash dari kode_unit)
     */
    private function guestCookieName(string $kode_unit): string
    {
        return 'wams_guest_token_' . md5(trim(urldecode($kode_unit)));
    }

    /**
     * Ambil return_token dari query parameter atau cookie (termasuk fallback cookie lama)
     */
    private function resolveGuestToken(Request $request, string $kode_unit): ?string
    {
        $token = $request->query('token')
            ?: $request->cookie($this->guestCookieName($kode_unit))
            ?: $request->cookie('wams_guest_token_' . $kode_unit);

        return is_string($token) && trim($token) !== '' ? trim($token) : null;
    }

    /**
     * Verifikasi apakah tamu berhak membuka tiket pengembalian:
     * 1. Memiliki return_token valid (via URL/Cookie), ATAU
     * 2. Memasukkan kombinasi Nama Lengkap DAN Email Peminjam yang keduanya cocok dengan logbook aktif.
     */
    private function isAuthorizedForGuestReturn(Request $request, ?Logbook $logbook, string $kode_unit): bool
    {
        if (!$logbook || $logbook->tipe_peminjam !== 'guest' || empty($logbook->return_token)) {
            return false;
        }

        $token = $this->resolveGuestToken($request, $kode_unit);
        if ($token && hash_equals($logbook->return_token, $token)) {
            return true;
        }

        $email = strtolower(trim((string) $request->query('email', '')));
        $nama = strtolower(trim((string) $request->query('nama', '')));
        $expectedEmail = strtolower(trim((string) $logbook->guest_email));
        $expectedNama = strtolower(trim((string) $logbook->guest_nama));

        if ($email !== '' && $nama !== '' && $expectedEmail !== '' && $expectedNama !== '') {
            return hash_equals($expectedEmail, $email) && hash_equals($expectedNama, $nama);
        }

        return false;
    }

    /**
     * Masking petunjuk peminjam tanpa membocorkan nama peminjam yang dipakai untuk verifikasi
     */
    private function maskBorrowerHint(?Logbook $logbook): string
    {
        if (!$logbook) {
            return 'Pengguna lain';
        }

        if ($logbook->tipe_peminjam === 'guest' && !empty($logbook->guest_email) && str_contains($logbook->guest_email, '@')) {
            [$local, $domain] = explode('@', $logbook->guest_email, 2);
            $maskedLocal = substr($local, 0, 1) . '***';
            return $maskedLocal . '@' . $domain;
        }

        return 'Member Terdaftar';
    }

    /**
     * Sanitasi kode_unit sebelum digunakan pada nama file di storage
     */
    private function sanitizeUnitSlug(string $kode_unit): string
    {
        $slug = preg_replace('/[^A-Za-z0-9\-_]/', '_', trim($kode_unit));
        return !empty($slug) ? substr($slug, 0, 60) : 'unit';
    }

    /**
     * Validasi ketat Base64 image beserta pengecekan magic bytes / MIME gambar
     *
     * @return array{decoded: string, ext: string}|null
     */
    private function decodeAndValidateBase64Image(?string $rawFoto): ?array
    {
        if (empty($rawFoto) || !preg_match('/^data:image\/(jpeg|jpg|png|webp);base64,/i', $rawFoto)) {
            return null;
        }

        $commaPos = strpos($rawFoto, ',');
        if ($commaPos === false) {
            return null;
        }

        $decoded = base64_decode(substr($rawFoto, $commaPos + 1), true);
        if ($decoded === false || strlen($decoded) === 0 || strlen($decoded) > 5 * 1024 * 1024) {
            return null;
        }

        $imageInfo = @getimagesizefromstring($decoded);
        if ($imageInfo === false || empty($imageInfo['mime'])) {
            return null;
        }

        $mimeMap = [
            'image/jpeg' => 'jpg',
            'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ];

        $mime = strtolower($imageInfo['mime']);
        if (!isset($mimeMap[$mime])) {
            return null;
        }

        return [
            'decoded' => $decoded,
            'ext' => $mimeMap[$mime],
        ];
    }
}
