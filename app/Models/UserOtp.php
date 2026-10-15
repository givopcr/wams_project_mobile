<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserOtp extends Model
{
    use HasFactory;

    protected $table = 'user_otps';

    protected $fillable = [
        'email',
        'otp_code',
        'tipe',
        'payload',
        'reset_token',
        'attempts',
        'expires_at',
        'is_used',
    ];

    protected $casts = [
        'payload' => 'array',
        'attempts' => 'integer',
        'expires_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    /**
     * Cek apakah OTP sudah kadaluarsa
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Cek apakah OTP masih valid
     */
    public function isValid(): bool
    {
        return !$this->is_used && !$this->isExpired() && $this->attempts < 5;
    }
}
