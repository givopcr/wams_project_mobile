<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Mail\GuestOtpMail;
use App\Models\BarangUnit;
use App\Models\GuestOtp;
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
        // Jika pengguna terautentikasi (role user), langsung arahkan ke portal scanner user
        if (auth()->check() && auth()->user()->role === 'user') {
            return redirect()->route('user.scanner', ['code' => $kode_unit]);
        }

        $unit = BarangUnit::with(['barang.kategori', 'activeLogbook'])
            ->where('kode_unit', $kode_unit)
            ->first();

        if (!$unit) {
            return Inertia::render('Guest/Unavailable', [
                'type' => 'not_found',
                'kode_unit' => $kode_unit,
                'message' => "Unit dengan kode '{$kode_unit}' tidak terdaftar di sistem WAMS.",
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
            ]);
        }

        if ($unit->status === 'dipinjam' || $unit->status === 'menunggu_persetujuan') {
            $logbook = $unit->activeLogbook;
            $token = $request->query('token') ?: $request->cookie('wams_guest_token_' . $kode_unit);
            $email = $request->query('email');

            $isAuthorized = false;
            if ($logbook) {
                if ($token && $logbook->return_token && hash_equals($logbook->return_token, $token)) {
                    $isAuthorized = true;
                } elseif ($email && strtolower(trim($email)) === strtolower(trim($logbook->peminjam_email))) {
                    $isAuthorized = true;
                }
            }

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

            return Inertia::render('Guest/Unavailable', [
                'type' => 'borrowed',
                'kode_unit' => $kode_unit,
                'unit' => [
                    'kode_unit' => $unit->kode_unit,
                    'nama_barang' => $unit->barang?->nama_barang ?? 'Peralatan',
                    'kategori' => $unit->barang?->kategori?->nama_kategori ?? 'Umum',
                ],
                'borrower_hint' => $logbook ? substr($logbook->peminjam_nama, 0, 3) . '***' : 'Pengguna lain',
                'message' => 'Unit barang ini sedang dipinjam.',
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
                'message' => 'Barang ini memerlukan otorisasi khusus Admin Workshop. Silakan login menggunakan akun teknisi terdaftar untuk mengajukan peminjaman.',
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
            'foto_pinjam' => ['required', 'string'],
        ], [
            'foto_pinjam.required' => 'Foto barang sebelum dipinjam wajib diunggah dan tidak boleh dilewati.',
        ]);

        $fotoPinjamPath = null;
        $rawFoto = $validated['foto_pinjam'];
        if (preg_match('/^data:image\/(\w+);base64,/', $rawFoto, $typeMatch)) {
            $ext = strtolower($typeMatch[1]);
            if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
                $decoded = base64_decode(substr($rawFoto, strpos($rawFoto, ',') + 1));
                if ($decoded !== false) {
                    $fotoPinjamPath = 'peminjaman/guest_borrow_' . $kode_unit . '_' . time() . '_' . uniqid() . '.' . $ext;
                    Storage::disk('public')->put($fotoPinjamPath, $decoded);
                }
            }
        }

        if (!$fotoPinjamPath) {
            return response()->json([
                'success' => false,
                'message' => 'Foto barang sebelum dipinjam wajib diunggah dengan format gambar yang valid.',
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
            ])->withCookie(cookie('wams_guest_token_' . $kode_unit, $returnToken, 60 * 24 * 7));
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
            ])->withCookie(cookie('wams_guest_token_' . $kode_unit, $returnToken, 60 * 24 * 7));
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

        // Verifikasi otorisasi token atau email sebelum menampilkan tiket pengembalian
        $token = $request->query('token') ?: $request->cookie('wams_guest_token_' . $kode_unit);
        $email = $request->query('email');

        $isAuthorized = false;
        if ($token && $logbook->return_token && hash_equals($logbook->return_token, $token)) {
            $isAuthorized = true;
        } elseif ($email && strtolower(trim($email)) === strtolower(trim((string) $logbook->peminjam_email))) {
            $isAuthorized = true;
        }

        if (!$isAuthorized) {
            return Inertia::render('Guest/Unavailable', [
                'type' => 'borrowed',
                'kode_unit' => $kode_unit,
                'unit' => [
                    'kode_unit' => $unit->kode_unit,
                    'nama_barang' => $unit->barang?->nama_barang ?? 'Peralatan',
                    'kategori' => $unit->barang?->kategori?->nama_kategori ?? 'Umum',
                ],
                'borrower_hint' => substr((string) $logbook->peminjam_nama, 0, 3) . '***',
                'message' => 'Unit barang ini sedang dipinjam. Gunakan tautan tiket atau verifikasi email peminjam untuk mengakses halaman pengembalian.',
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
            'foto_kondisi' => ['required', 'string'],
            'token' => ['nullable', 'string'],
        ], [
            'foto_kondisi.required' => 'Foto kondisi barang saat dikembalikan wajib diunggah dan tidak boleh dilewati.',
        ]);

        $fotoKembaliPath = null;
        $rawFoto = $validated['foto_kondisi'];
        if (preg_match('/^data:image\/(\w+);base64,/', $rawFoto, $typeMatch)) {
            $ext = strtolower($typeMatch[1]);
            if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
                $decoded = base64_decode(substr($rawFoto, strpos($rawFoto, ',') + 1));
                if ($decoded !== false) {
                    $fotoKembaliPath = 'pengembalian/guest_return_' . $kode_unit . '_' . time() . '_' . uniqid() . '.' . $ext;
                    Storage::disk('public')->put($fotoKembaliPath, $decoded);
                }
            }
        }

        if (!$fotoKembaliPath) {
            return response()->json([
                'success' => false,
                'message' => 'Foto kondisi barang saat dikembalikan wajib diunggah dengan format gambar yang valid.',
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

        // Verifikasi token jika ada token di logbook
        $providedToken = $validated['token'] ?? $request->cookie('wams_guest_token_' . $kode_unit);
        if ($logbook->return_token && (! $providedToken || ! hash_equals($logbook->return_token, $providedToken))) {
            return response()->json([
                'success' => false,
                'message' => 'Token pengembalian tidak valid.',
            ], 403);
        }

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
        ])->withoutCookie('wams_guest_token_' . $kode_unit);
    }
}
