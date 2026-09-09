<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Logbook extends Model
{
    use HasFactory;

    protected $table = 'logbook';

    protected $fillable = [
        'user_id',
        'barang_unit_id',
        'tipe_peminjam',
        'guest_nama',
        'guest_email',
        'requires_verification',
        'return_token',
        'keperluan',
        'disetujui_oleh',
        'tanggal_approval',
        'alasan_penolakan',
        'tanggal_pinjam',
        'batas_kembali',
        'tanggal_kembali',
        'kondisi_kembali',
        'status_transaksi',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_pinjam' => 'datetime',
            'batas_kembali' => 'datetime',
            'tanggal_kembali' => 'datetime',
            'tanggal_approval' => 'datetime',
            'requires_verification' => 'boolean',
        ];
    }

    /**
     * Nama peminjam (user atau tamu)
     */
    public function getPeminjamNamaAttribute(): string
    {
        if ($this->tipe_peminjam === 'guest') {
            return ($this->guest_nama ?: 'Tamu') . ' (Tamu)';
        }
        return $this->user?->nama ?? 'Pengguna';
    }

    /**
     * Email peminjam
     */
    public function getPeminjamEmailAttribute(): string
    {
        if ($this->tipe_peminjam === 'guest') {
            return $this->guest_email ?: '-';
        }
        return $this->user?->email ?? '-';
    }

    /**
     * Relasi ke User (logbook N:1 users)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relasi ke Unit Barang (logbook N:1 barang_unit)
     */
    public function barangUnit(): BelongsTo
    {
        return $this->belongsTo(BarangUnit::class, 'barang_unit_id');
    }

    /**
     * Relasi ke Admin/User yang menyetujui atau menolak
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }
}
