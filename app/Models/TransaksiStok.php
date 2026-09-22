<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransaksiStok extends Model
{
    use HasFactory;

    protected $table = 'transaksi_stok';

    protected $fillable = [
        'barang_id',
        'user_id',
        'tipe',
        'jumlah',
        'sisa_stok',
        'keterangan',
    ];

    protected function casts(): array
    {
        return [
            'jumlah' => 'float',
            'sisa_stok' => 'float',
        ];
    }

    /**
     * Relasi ke Barang
     */
    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class, 'barang_id');
    }

    /**
     * Relasi ke User pemakai atau admin restock
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
