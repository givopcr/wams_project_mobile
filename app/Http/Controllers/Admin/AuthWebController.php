<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthWebController extends Controller
{
    public function showLogin(Request $request): Response
    {
        $safeRedirect = $this->sanitizeRedirectUrl($request, $request->query('redirect'));
        if ($safeRedirect) {
            $request->session()->put('url.intended', $safeRedirect);
        }

        return Inertia::render('Auth/Login', [
            'status' => session('status') ?? $request->query('message'),
            'initialTab' => $request->query('tab', 'login'),
            'redirect' => $safeRedirect,
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'nip' => ['nullable', 'string', 'max:50', 'unique:users,nip'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'nama.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format alamat email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar.',
            'nip.unique' => 'NIP ini sudah digunakan oleh akun lain.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 6 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        $user = \App\Models\User::create([
            'nama' => $validated['nama'],
            'email' => $validated['email'],
            'nip' => $validated['nip'] ?: null,
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'role' => 'user',
        ]);

        $user->recordPlainPassword($validated['password']);

        Auth::login($user);
        $request->session()->regenerate();

        $targetUrl = $this->resolvePostAuthRedirect($request, $user);

        return redirect()->to($targetUrl)->with('success', 'Registrasi berhasil! Selamat datang di WAMS, ' . $user->nama . '.');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $loginInput = trim($credentials['login']);

        // Prioritaskan pencarian berdasarkan identifier unik (email atau nip) terlebih dahulu,
        // baru fallback ke nama agar perubahan nama user tidak bisa membajak/mengunci login email/NIP akun lain
        $user = $this->findAndVerifyUser($loginInput, $credentials['password']);

        // Jika sebelumnya sudah ada sesi aktif, bersihkan agar login baru bersih
        if (Auth::check()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        if ($user) {
            Auth::login($user, $request->boolean('remember'));
            $request->session()->regenerate();
            $user->recordPlainPassword($credentials['password']);

            $targetUrl = $this->resolvePostAuthRedirect($request, $user);

            if ($user->role === 'admin') {
                return redirect()->to($targetUrl)->with('success', 'Selamat datang kembali, Administrator!');
            }

            return redirect()->to($targetUrl)->with('success', 'Selamat datang di WAMS Mobile, ' . $user->nama . '!');
        }

        throw ValidationException::withMessages([
            'login' => 'Email/Nama/NIP atau password yang Anda masukkan tidak sesuai.',
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

        // Cari user berdasarkan google_id terlebih dahulu, lalu email
        $user = \App\Models\User::where('google_id', $googleUser->getId())->first();

        if (! $user && $googleUser->getEmail()) {
            $emailVerified = $googleUser->user['email_verified'] ?? ($googleUser->user['verified_email'] ?? true);
            if (! $emailVerified) {
                return redirect()->route('login')->withErrors([
                    'login' => 'Email akun Google Anda belum terverifikasi.',
                ]);
            }

            $user = \App\Models\User::where('email', $googleUser->getEmail())->first();

            if ($user && ! empty($user->google_id) && $user->google_id !== $googleUser->getId()) {
                return redirect()->route('login')->withErrors([
                    'login' => 'Email ini sudah terhubung dengan akun Google yang berbeda.',
                ]);
            }
        }

        if ($user) {
            // Update google_id dan avatar jika belum ada
            $user->update([
                'google_id' => $user->google_id ?: $googleUser->getId(),
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

        $targetUrl = $this->resolvePostAuthRedirect($request, $user);

        if ($user->role === 'admin') {
            return redirect()->to($targetUrl)->with('success', 'Selamat datang kembali, Administrator!');
        }

        return redirect()->to($targetUrl)->with('success', 'Selamat datang di WAMS Mobile, ' . $user->nama . '!');
    }

    /**
     * Cari user dengan prioritas email/NIP (unik) sebelum fallback ke nama
     */
    private function findAndVerifyUser(string $loginInput, string $password): ?User
    {
        $uniqueCandidates = User::where('email', $loginInput)
            ->orWhere('nip', $loginInput)
            ->get();

        if ($uniqueCandidates->isNotEmpty()) {
            foreach ($uniqueCandidates as $candidate) {
                if (! empty($candidate->password) && Hash::check($password, $candidate->password)) {
                    return $candidate;
                }
            }

            return null;
        }

        $nameCandidates = User::where('nama', $loginInput)->get();
        foreach ($nameCandidates as $candidate) {
            if (! empty($candidate->password) && Hash::check($password, $candidate->password)) {
                return $candidate;
            }
        }

        return null;
    }

    /**
     * Validasi URL redirect agar hanya mengizinkan path internal aplikasi
     */
    private function sanitizeRedirectUrl(Request $request, ?string $redirect): ?string
    {
        if (! $redirect || ! is_string($redirect)) {
            return null;
        }

        $redirect = trim($redirect);
        if (str_starts_with($redirect, 'http://') || str_starts_with($redirect, 'https://')) {
            $parsedHost = parse_url($redirect, PHP_URL_HOST);
            if ($parsedHost && strtolower($parsedHost) === strtolower($request->getHost())) {
                $path = parse_url($redirect, PHP_URL_PATH) ?: '/';
                $query = parse_url($redirect, PHP_URL_QUERY);

                return $query ? "{$path}?{$query}" : $path;
            }

            return null;
        }

        if (str_starts_with($redirect, '/') && ! str_starts_with($redirect, '//')) {
            return $redirect;
        }

        return null;
    }

    /**
     * Tentukan halaman tujuan setelah login/registrasi sesuai role
     */
    private function resolvePostAuthRedirect(Request $request, User $user): string
    {
        $rawRedirect = $request->input('redirect') ?: $request->session()->pull('url.intended');
        $safeRedirect = $this->sanitizeRedirectUrl($request, $rawRedirect);

        if ($user->role === 'admin') {
            if ($safeRedirect && str_starts_with($safeRedirect, '/admin')) {
                return $safeRedirect;
            }

            return route('admin.dashboard');
        }

        if ($safeRedirect && (str_starts_with($safeRedirect, '/user') || str_starts_with($safeRedirect, '/scan'))) {
            return $safeRedirect;
        }

        return route('user.dashboard');
    }
}
