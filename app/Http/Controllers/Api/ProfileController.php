<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdateProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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
}
