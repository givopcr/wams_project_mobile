<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Mail\UserOtpMail;
use App\Models\User;
use App\Models\UserOtp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ForgotPasswordController extends Controller
{
    /**
     * Kirim kode OTP 6-digit untuk Reset Password ke email user
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ], [
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format alamat email tidak valid.',
        ]);

        $email = strtolower(trim($request->email));
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Alamat email ini belum terdaftar di sistem WAMS.',
            ], 404);
        }

        // Cek apakah akun terdaftar murni Google OAuth tanpa password
        if (empty($user->password) && !empty($user->google_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda terhubung dengan Google Sign-In. Silakan masuk langsung menggunakan tombol Google.',
            ], 400);
        }

        // Cek cooldown kirim ulang (60 detik)
        $latestOtp = UserOtp::where('email', $email)
            ->where('tipe', 'reset_password')
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

        // Nonaktifkan OTP lama yang belum terpakai
        UserOtp::where('email', $email)
            ->where('tipe', 'reset_password')
            ->where('is_used', false)
            ->update(['is_used' => true]);

        // Generate 6-digit OTP
        $otp = (string) random_int(100000, 999999);

        UserOtp::create([
            'email' => $email,
            'otp_code' => $otp,
            'tipe' => 'reset_password',
            'expires_at' => now()->addMinutes(10),
            'is_used' => false,
            'attempts' => 0,
        ]);

        // Kirim email
        try {
            Mail::to($email)->send(
                new UserOtpMail(
                    userNama: $user->nama,
                    otpCode: $otp,
                    tipe: 'reset_password'
                )
            );
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json([
            'success' => true,
            'message' => 'Kode OTP pemulihan kata sandi telah dikirimkan ke email Anda.',
            'cooldown_seconds' => 60,
            // debug_otp disertakan jika APP_DEBUG aktif untuk mempermudah pengetesan lokal tanpa membuka email
            'debug_otp' => config('app.debug') ? $otp : null,
        ]);
    }

    /**
     * Verifikasi kode OTP dan dapatkan token reset
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'otp_code' => ['required', 'string', 'size:6'],
        ], [
            'email.required' => 'Email wajib diisi.',
            'otp_code.required' => 'Kode OTP wajib diisi.',
            'otp_code.size' => 'Kode OTP harus berupa 6 digit angka.',
        ]);

        $email = strtolower(trim($request->email));
        $otpCode = trim($request->otp_code);

        $otpRecord = UserOtp::where('email', $email)
            ->where('tipe', 'reset_password')
            ->where('is_used', false)
            ->latest()
            ->first();

        if (!$otpRecord || $otpRecord->isExpired()) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP telah kedaluwarsa atau tidak valid. Silakan minta kode baru.',
            ], 422);
        }

        // Cek kecocokan OTP
        if ($otpRecord->otp_code !== $otpCode) {
            $otpRecord->increment('attempts');
            $sisaPercobaan = 5 - $otpRecord->attempts;

            if ($sisaPercobaan <= 0) {
                $otpRecord->update(['is_used' => true]);
                return response()->json([
                    'success' => false,
                    'message' => 'Terlalu banyak percobaan salah. Kode OTP ini telah dinonaktifkan. Silakan minta kode baru.',
                ], 422);
            }

            return response()->json([
                'success' => false,
                'message' => "Kode OTP salah. Sisa kesempatan mencoba: {$sisaPercobaan} kali.",
                'remaining_attempts' => $sisaPercobaan,
            ], 422);
        }

        // Kode OTP cocok, buat token reset sementara (berlaku 15 menit)
        $resetToken = Str::random(64);
        $otpRecord->update([
            'reset_token' => $resetToken,
            'expires_at' => now()->addMinutes(15),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kode OTP berhasil diverifikasi.',
            'reset_token' => $resetToken,
        ]);
    }

    /**
     * Reset password menggunakan token reset yang sudah diverifikasi
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'reset_token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'email.required' => 'Email wajib diisi.',
            'reset_token.required' => 'Token reset wajib disertakan.',
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.min' => 'Kata sandi baru minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi baru tidak cocok.',
        ]);

        $email = strtolower(trim($request->email));

        $otpRecord = UserOtp::where('email', $email)
            ->where('tipe', 'reset_password')
            ->where('reset_token', $request->reset_token)
            ->where('is_used', false)
            ->first();

        if (!$otpRecord || $otpRecord->isExpired()) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi reset kata sandi telah kedaluwarsa. Silakan ulangi langkah pemulihan dari awal.',
            ], 422);
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan.',
            ], 404);
        }

        // Update password pengguna
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Tandai OTP telah digunakan
        $otpRecord->update(['is_used' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil direset! Silakan masuk dengan kata sandi baru Anda.',
        ]);
    }
}
