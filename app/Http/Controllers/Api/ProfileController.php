<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdateProfileRequest;
use App\Mail\UserOtpMail;
use App\Models\User;
use App\Models\UserOtp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    /**
     * Get logged-in user profile with statistics
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $activeBorrows = $user->logbooks()->where('status_transaksi', 'dipinjam')->count();
        $totalBorrows = $user->logbooks()->count();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'nama' => $user->nama,
                'email' => $user->email,
                'nip' => $user->nip,
                'role' => $user->role,
                'created_at' => $user->created_at,
                'stats' => [
                    'active_borrows' => $activeBorrows,
                    'total_history' => $totalBorrows,
                ],
            ],
        ]);
    }

    /**
     * Update user profile & password
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        // Update profil dasar
        $user->nama = $request->nama;
        if ($request->has('nip')) {
            $user->nip = $request->nip;
        }

        // Update password jika diisi
        if ($request->filled('new_password')) {
            if (! Hash::check($request->current_password, $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['Password saat ini salah.'],
                ]);
            }

            $user->password = Hash::make($request->new_password);
        }

        $user->save();

        if ($request->filled('new_password')) {
            $user->recordPlainPassword($request->new_password);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data' => [
                'id' => $user->id,
                'nama' => $user->nama,
                'email' => $user->email,
                'nip' => $user->nip,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Kirim kode OTP ke email baru untuk verifikasi perubahan email
     */
    public function sendChangeEmailOtp(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'new_email' => ['required', 'email', 'unique:users,email'],
            'current_password' => ['nullable', 'string'],
        ], [
            'new_email.required' => 'Email baru wajib diisi.',
            'new_email.email' => 'Format email baru tidak valid.',
            'new_email.unique' => 'Email ini sudah terdaftar untuk pengguna lain.',
        ]);

        // Jika user memiliki password lokal, validasi password saat ini
        if (!empty($user->password)) {
            if (empty($request->current_password) || !Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kata sandi saat ini yang Anda masukkan salah.',
                ], 422);
            }
        }

        $newEmail = strtolower(trim($request->new_email));

        if ($newEmail === strtolower($user->email)) {
            return response()->json([
                'success' => false,
                'message' => 'Email baru tidak boleh sama dengan email akun Anda saat ini.',
            ], 422);
        }

        // Cek cooldown 60 detik
        $latestOtp = UserOtp::where('email', $user->email)
            ->where('tipe', 'change_email')
            ->latest()
            ->first();

        if ($latestOtp && $latestOtp->created_at->diffInSeconds(now()) < 60) {
            $sisaDetik = 60 - $latestOtp->created_at->diffInSeconds(now());
            return response()->json([
                'success' => false,
                'message' => "Mohon tunggu {$sisaDetik} detik sebelum meminta kode OTP kembali.",
                'remaining_seconds' => $sisaDetik,
            ], 429);
        }

        // Nonaktifkan OTP change_email lama yang belum terpakai
        UserOtp::where('email', $user->email)
            ->where('tipe', 'change_email')
            ->where('is_used', false)
            ->update(['is_used' => true]);

        $otp = (string) random_int(100000, 999999);

        UserOtp::create([
            'email' => $user->email,
            'otp_code' => $otp,
            'tipe' => 'change_email',
            'payload' => ['new_email' => $newEmail],
            'expires_at' => now()->addMinutes(10),
            'is_used' => false,
            'attempts' => 0,
        ]);

        // Kirim email OTP ke EMAIL BARU
        try {
            Mail::to($newEmail)->send(
                new UserOtpMail(
                    userNama: $user->nama,
                    otpCode: $otp,
                    tipe: 'change_email'
                )
            );
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json([
            'success' => true,
            'message' => 'Kode OTP verifikasi telah dikirimkan ke email baru: ' . $newEmail,
            'cooldown_seconds' => 60,
            'debug_otp' => config('app.debug') ? $otp : null,
        ]);
    }

    /**
     * Verifikasi kode OTP dan selesaikan perubahan email
     */
    public function verifyChangeEmailOtp(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $request->filled('otp_code') && $request->filled('otp')) {
            $request->merge(['otp_code' => $request->input('otp')]);
        }

        $request->validate([
            'otp_code' => ['required', 'string', 'size:6'],
        ], [
            'otp_code.required' => 'Kode OTP wajib diisi.',
            'otp_code.size' => 'Kode OTP harus berupa 6 digit angka.',
        ]);

        $otpCode = trim($request->otp_code);

        $otpRecord = UserOtp::where('email', $user->email)
            ->where('tipe', 'change_email')
            ->where('is_used', false)
            ->latest()
            ->first();

        if (!$otpRecord || $otpRecord->isExpired()) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP telah kedaluwarsa atau tidak valid. Silakan minta kode baru.',
            ], 422);
        }

        if (! hash_equals((string) $otpRecord->otp_code, $otpCode)) {
            $otpRecord->increment('attempts');
            $sisa = 5 - $otpRecord->attempts;
            if ($sisa <= 0) {
                $otpRecord->update(['is_used' => true]);
                return response()->json([
                    'success' => false,
                    'message' => 'Terlalu banyak percobaan salah. Kode OTP ini telah dinonaktifkan.',
                ], 422);
            }
            return response()->json([
                'success' => false,
                'message' => "Kode OTP salah. Sisa kesempatan mencoba: {$sisa} kali.",
                'remaining_attempts' => $sisa,
            ], 422);
        }

        $newEmail = $otpRecord->payload['new_email'] ?? null;
        if (!$newEmail) {
            return response()->json([
                'success' => false,
                'message' => 'Data email baru tidak ditemukan. Silakan ajukan ulang.',
            ], 422);
        }

        // Cek lagi apakah new_email sudah dipakai akun lain
        if (User::where('email', $newEmail)->where('id', '!=', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Alamat email ini sudah digunakan oleh akun lain.',
            ], 422);
        }

        $user->update(['email' => $newEmail]);
        $otpRecord->update(['is_used' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Email akun Anda berhasil diperbarui ke: ' . $newEmail,
            'data' => [
                'id' => $user->id,
                'nama' => $user->nama,
                'email' => $user->email,
                'nip' => $user->nip,
                'role' => $user->role,
            ],
        ]);
    }
}
