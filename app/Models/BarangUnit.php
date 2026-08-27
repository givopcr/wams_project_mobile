<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BarangUnit extends Model
{
    use HasFactory;

    protected $table = 'barang_unit';

    protected $fillable = [
        'barang_id',
        'kode_unit',
        'status',
        'kondisi',
    ];

    /**
     * Relasi ke Master Barang (barang_unit N:1 barang)
     */
    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class, 'barang_id');
    }

    /**
     * Relasi ke Logbook (barang_unit 1:N logbook)
     */
    public function logbooks(): HasMany
    {
        return $this->hasMany(Logbook::class, 'barang_unit_id');
    }

    /**
     * Transaksi aktif untuk unit ini
     */
    public function activeLogbook()
    {
        return $this->hasOne(Logbook::class, 'barang_unit_id')->where('status_transaksi', 'dipinjam')->latestOfMany();
    }
}
