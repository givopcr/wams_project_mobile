<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BarangUnit;
use App\Models\Logbook;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Manajemen Pengguna / User
     */
    public function index(Request $request): Response
    {
        $query = User::query()->withCount([
            'logbooks as total_transaksi',
            'logbooks as transaksi_aktif' => fn ($q) => $q->where('status_transaksi', 'dipinjam'),
        ]);

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->latest('id')->paginate(15)->withQueryString();

        $users->getCollection()->transform(function ($u) {
            return [
                'id' => $u->id,
                'nama' => $u->nama,
                'email' => $u->email,
                'nip' => $u->nip,
                'role' => $u->role,
                'avatar' => $u->avatar,
                'google_id' => $u->google_id,
                'total_transaksi' => $u->total_transaksi,
                'transaksi_aktif' => $u->transaksi_aktif,
                'created_at' => $u->created_at?->format('d M Y'),
            ];
        });

        return Inertia::render('User/Index', [
            'users' => $users,
            'filters' => $request->only(['q', 'role']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'nip' => ['nullable', 'string', 'max:50', 'unique:users,nip'],
            'role' => ['required', 'in:admin,user'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $rawPassword = $validated['password'];
        $validated['password'] = Hash::make($rawPassword);
        User::create($validated);

        return back()->with('success', 'User berhasil ditambahkan.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        // Mode 1: Quick Role Switch dari tabel Manajemen User
        if ($request->boolean('quick_role_toggle')) {
            $validatedRole = $request->validate([
                'role' => ['required', 'in:admin,user'],
            ]);

            if ($user->id === auth()->id() && $validatedRole['role'] !== 'admin') {
                return back()->with('error', 'Anda tidak dapat menurunkan role akun Administrator Anda sendiri.');
            }

            $user->update(['role' => $validatedRole['role']]);
            $roleLabel = $validatedRole['role'] === 'admin' ? 'Administrator' : 'User / Teknisi';

            return back()->with('success', "Role akun {$user->nama} berhasil diubah menjadi {$roleLabel}.");
        }

        // Mode 2: Edit Data Pengguna
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'nip' => ['nullable', 'string', 'max:50', Rule::unique('users', 'nip')->ignore($user->id)],
            'role' => ['required', 'in:admin,user'],
        ]);

        if ($user->id === auth()->id() && $validated['role'] !== 'admin') {
            return back()->with('error', 'Anda tidak dapat menurunkan role akun Administrator Anda sendiri.');
        }

        $user->update($validated);

        return back()->with('success', 'Data pengguna berhasil diperbarui.');
    }

    public function destroy($id): RedirectResponse
    {
        $user = User::find($id);
        if (!$user) {
            return redirect()->route('admin.users')->with('success', 'Akun pengguna berhasil dihapus.');
        }

        if ($user->id === auth()->id()) {
            return redirect()->route('admin.users')->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $namaUser = $user->nama;

        DB::transaction(function () use ($user) {
            $activeLogs = Logbook::where('user_id', $user->id)
                ->whereIn('status_transaksi', ['dipinjam', 'menunggu_persetujuan'])
                ->lockForUpdate()
                ->get();

            foreach ($activeLogs as $log) {
                if ($log->barang_unit_id) {
                    BarangUnit::where('id', $log->barang_unit_id)->update(['status' => 'tersedia']);
                }
                if ($log->status_transaksi === 'dipinjam') {
                    $log->update([
                        'status_transaksi' => 'dikembalikan',
                        'tanggal_kembali' => now(),
                        'kondisi_kembali' => 'baik',
                    ]);
                } else {
                    $log->update([
                        'status_transaksi' => 'dibatalkan',
                    ]);
                }
            }

            Logbook::where('user_id', $user->id)->update([
                'user_id' => null,
                'guest_nama' => $user->nama,
                'guest_email' => $user->email,
            ]);

            $user->tokens()->delete();
            $user->delete();
        });

        return redirect()->route('admin.users')->with('success', "Akun pengguna {$namaUser} berhasil dihapus.");
    }

    /**
     * Tampilan Pengaturan Profil & Akun Administrator
     */
    public function profile(): Response
    {
        $user = auth()->user();

        $stats = [
            'total_approval' => Logbook::where('disetujui_oleh', $user->id)->count(),
            'total_users' => User::count(),
            'created_at_formatted' => $user->created_at ? $user->created_at->translatedFormat('d F Y, H:i') : '-',
        ];

        return Inertia::render('Admin/Profile', [
            'profile' => [
                'id' => $user->id,
                'nama' => $user->nama,
                'email' => $user->email,
                'nip' => $user->nip,
                'role' => $user->role,
                'avatar_url' => $user->avatar_url,
                'has_google' => !empty($user->google_id),
                'has_password' => !empty($user->password),
                'created_at' => $user->created_at?->format('d M Y'),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Perbarui Informasi Profil Administrator
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'nip' => ['nullable', 'string', 'max:50', 'unique:users,nip,' . $user->id],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'remove_avatar' => ['nullable', 'boolean'],
        ], [
            'nama.required' => 'Nama administrator wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.unique' => 'Email ini sudah terdaftar oleh pengguna lain.',
            'nip.unique' => 'NIP ini sudah terdaftar oleh pengguna lain.',
            'avatar.image' => 'File avatar harus berupa gambar.',
            'avatar.max' => 'Ukuran file avatar maksimal 2MB.',
        ]);

        if ($request->boolean('remove_avatar')) {
            if ($user->avatar && !str_starts_with($user->avatar, 'http') && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->avatar = null;
        } elseif ($request->hasFile('avatar')) {
            if ($user->avatar && !str_starts_with($user->avatar, 'http') && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->avatar = $request->file('avatar')->store('avatars', 'public');
        }

        $user->nama = $validated['nama'];
        $user->email = $validated['email'];
        $user->nip = $validated['nip'] ?? $user->nip;
        $user->save();

        return back()->with('success', 'Profil administrator berhasil diperbarui.');
    }

    /**
     * Perbarui Password Akun Administrator
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $rules = [
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];

        if (!empty($user->password)) {
            $rules['current_password'] = ['required', 'current_password'];
        }

        $messages = [
            'current_password.required' => 'Password saat ini wajib diisi.',
            'current_password.current_password' => 'Password saat ini yang Anda masukkan salah.',
            'password.required' => 'Password baru wajib diisi.',
            'password.min' => 'Password baru minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password baru tidak cocok.',
        ];

        $request->validate($rules, $messages);

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Password administrator berhasil diubah.');
    }
}

