<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nama',
        'email',
        'google_id',
        'avatar',
        'nip',
        'password',
        'plain_password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'plain_password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * Relasi ke Logbook (User 1:N Logbook)
     */
    public function logbooks(): HasMany
    {
        return $this->hasMany(Logbook::class, 'user_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isUser(): bool
    {
        return $this->role === 'user';
    }

    /**
     * Get avatar URL attribute
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if (!$this->avatar) {
            return null;
        }

        if (str_starts_with($this->avatar, 'http://') || str_starts_with($this->avatar, 'https://')) {
            return $this->avatar;
        }

        return asset('storage/' . $this->avatar);
    }

    /**
     * Simpan plain password secara terenkripsi agar dapat dilihat oleh Admin di Manajemen User
     */
    public function recordPlainPassword(string $plainPassword): void
    {
        try {
            if (Schema::hasColumn('users', 'plain_password')) {
                $this->forceFill(['plain_password' => $plainPassword])->saveQuietly();
            }
        } catch (\Throwable $e) {
            // Abaikan jika kolom belum dimigrasi
        }

        try {
            $vaultPath = 'private_user_passwords.json';
            $vault = [];
            if (Storage::disk('local')->exists($vaultPath)) {
                $decoded = json_decode(Storage::disk('local')->get($vaultPath), true);
                if (is_array($decoded)) {
                    $vault = $decoded;
                }
            }
            $vault[(string) $this->id] = Crypt::encryptString($plainPassword);
            Storage::disk('local')->put($vaultPath, json_encode($vault));
        } catch (\Throwable $e) {
            // Abaikan jika gagal menulis ke storage lokal
        }
    }

    /**
     * Ambil password untuk ditampilkan khusus kepada Admin di halaman Manajemen User
     */
    public function getAdminVisiblePassword(): string
    {
        if (!empty($this->plain_password)) {
            return (string) $this->plain_password;
        }

        try {
            $vaultPath = 'private_user_passwords.json';
            $vault = [];
            if (Storage::disk('local')->exists($vaultPath)) {
                $decoded = json_decode(Storage::disk('local')->get($vaultPath), true);
                if (is_array($decoded)) {
                    $vault = $decoded;
                }
            }

            if (isset($vault[(string) $this->id])) {
                return Crypt::decryptString($vault[(string) $this->id]);
            }

            // Cek password default seeder jika akun lama belum tercatat di vault
            if (!empty($this->password)) {
                foreach (['password123', 'password', 'admin123', '123456', '12345678'] as $candidate) {
                    if (Hash::check($candidate, $this->password)) {
                        $this->recordPlainPassword($candidate);
                        return $candidate;
                    }
                }
            }
        } catch (\Throwable $e) {
            // Fallback di bawah
        }

        if ($this->google_id && empty($this->password)) {
            return 'Login Google (Tanpa Password)';
        }

        return 'Belum tercatat (Muncul saat user login)';
    }
}
