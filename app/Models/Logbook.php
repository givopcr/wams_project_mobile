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
        'tanggal_pinjam',
        'tanggal_kembali',
        'kondisi_kembali',
        'status_transaksi',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_pinjam' => 'datetime',
            'tanggal_kembali' => 'datetime',
        ];
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
}
