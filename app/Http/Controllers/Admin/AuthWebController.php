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
}
