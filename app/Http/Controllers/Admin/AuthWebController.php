<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthWebController extends Controller
{
    public function showLogin(Request $request): Response
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
        ]);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $loginField = filter_var($credentials['login'], FILTER_VALIDATE_EMAIL) ? 'email' : 'nip';

        // Jika sebelumnya sudah ada sesi aktif, bersihkan agar login baru bersih
        if (Auth::check()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        if (Auth::attempt([$loginField => $credentials['login'], 'password' => $credentials['password']], $request->boolean('remember'))) {
            $request->session()->regenerate();

            if (Auth::user()->role === 'admin') {
                return redirect()->route('admin.dashboard')->with('success', 'Selamat datang kembali, Administrator!');
            }

            return redirect()->route('user.dashboard')->with('success', 'Selamat datang di WAMS Mobile, ' . Auth::user()->nama . '!');
        }

        throw ValidationException::withMessages([
            'login' => 'Email/NIP atau password yang Anda masukkan tidak sesuai.',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'Sesi Anda telah berhasil diakhiri.');
    }

    /**
     * Redirect pengguna ke halaman autentikasi Google
     */
    public function redirectToGoogle()
    {
        return \Laravel\Socialite\Facades\Socialite::driver('google')
            ->redirectUrl(url('/auth/google/callback'))
            ->redirect();
    }

    /**
     * Tangani callback dari Google OAuth
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $driver = \Laravel\Socialite\Facades\Socialite::driver('google')
                ->redirectUrl(url('/auth/google/callback'));
            if (app()->isLocal()) {
                $driver->setHttpClient(new \GuzzleHttp\Client(['verify' => false]));
            }
            $googleUser = $driver->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors([
                'login' => 'Gagal mengautentikasi dengan Google: ' . $e->getMessage(),
            ]);
        }

        // Cari user berdasarkan google_id atau email
        $user = \App\Models\User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if ($user) {
            // Update google_id dan avatar jika belum ada
            $user->update([
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar() ?: $user->avatar,
            ]);
        } else {
            // Buat user baru dengan role default 'user'
            $user = \App\Models\User::create([
                'nama' => $googleUser->getName() ?: 'User Google',
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'role' => 'user',
            ]);
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard')->with('success', 'Selamat datang kembali, Administrator!');
        }

        return redirect()->route('user.dashboard')->with('success', 'Selamat datang di WAMS Mobile, ' . $user->nama . '!');
    }
}
