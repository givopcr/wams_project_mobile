<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register User Mobile
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'nama' => $request->nama,
            'email' => $request->email,
            'nip' => $request->nip,
            'password' => Hash::make($request->password),
            'role' => 'user', // Default role always user
        ]);

        $user->recordPlainPassword($request->password);

        $token = $user->createToken('mobile_app_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'nip' => $user->nip,
                    'role' => $user->role,
                ],
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Login User Mobile & Admin API
     * Mendukung login menggunakan email ATAU NIP
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $loginInput = trim($request->input('login'));
        $password = (string) $request->input('password');

        // Prioritaskan pencarian berdasarkan identifier unik (email atau NIP) sebelum fallback ke nama
        $user = null;
        $uniqueCandidates = User::where('email', $loginInput)
            ->orWhere('nip', $loginInput)
            ->get();

        if ($uniqueCandidates->isNotEmpty()) {
            foreach ($uniqueCandidates as $candidate) {
                if (! empty($candidate->password) && Hash::check($password, $candidate->password)) {
                    $user = $candidate;
                    break;
                }
            }
        } else {
            $nameCandidates = User::where('nama', $loginInput)->get();
            foreach ($nameCandidates as $candidate) {
                if (! empty($candidate->password) && Hash::check($password, $candidate->password)) {
                    $user = $candidate;
                    break;
                }
            }
        }

        if (! $user) {
            throw ValidationException::withMessages([
                'login' => ['Email/Nama/NIP atau password yang Anda masukkan tidak sesuai.'],
            ]);
        }

        $user->recordPlainPassword($request->password);

        // Generate Sanctum Token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'nip' => $user->nip,
                    'role' => $user->role,
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * Logout & Revoke current token
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);
    }

    /**
     * Get Current User Profile
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $request->user()->id,
                'nama' => $request->user()->nama,
                'email' => $request->user()->email,
                'nip' => $request->user()->nip,
                'avatar' => $request->user()->avatar,
                'role' => $request->user()->role,
            ],
        ]);
    }

    /**
     * Login / Register via Google OIDC Token (Mobile App)
     */
    public function loginWithGoogle(Request $request): JsonResponse
    {
        $request->validate([
            'id_token' => ['required', 'string'],
        ]);

        $idToken = $request->input('id_token');

        try {
            $http = Http::timeout(15);
            if (app()->isLocal()) {
                $http = $http->withoutVerifying();
            }

            $response = $http->get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $idToken,
            ]);

            if (! $response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token Google tidak valid atau telah kedaluwarsa.',
                ], 401);
            }

            $payload = $response->json();
            $expectedClientId = config('services.google.client_id');
            if (! empty($expectedClientId) && isset($payload['aud']) && $payload['aud'] !== $expectedClientId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Audience token Google tidak sesuai dengan aplikasi WAMS.',
                ], 401);
            }

            $googleId = $payload['sub'] ?? null;
            $email = $payload['email'] ?? null;
            $emailVerified = filter_var($payload['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN);
            $name = $payload['name'] ?? 'User Google';
            $avatar = $payload['picture'] ?? null;

            if (! $googleId || ! $email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data profil Google tidak lengkap.',
                ], 422);
            }

            if (! $emailVerified) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email akun Google Anda belum terverifikasi.',
                ], 403);
            }

            // Cari user berdasarkan google_id terlebih dahulu, lalu email
            $user = User::where('google_id', $googleId)->first();

            if (! $user) {
                $user = User::where('email', $email)->first();
                if ($user && ! empty($user->google_id) && $user->google_id !== $googleId) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Email ini sudah terhubung dengan akun Google yang berbeda.',
                    ], 403);
                }
            }

            if ($user) {
                $user->update([
                    'google_id' => $user->google_id ?: $googleId,
                    'avatar' => $avatar ?: $user->avatar,
                ]);
            } else {
                $user = User::create([
                    'nama' => $name,
                    'email' => $email,
                    'google_id' => $googleId,
                    'avatar' => $avatar,
                    'role' => 'user',
                ]);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login Google berhasil',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'nama' => $user->nama,
                        'email' => $user->email,
                        'nip' => $user->nip,
                        'avatar' => $user->avatar,
                        'role' => $user->role,
                    ],
                    'token' => $token,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses login Google: ' . $e->getMessage(),
            ], 500);
        }
    }
}
