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
        'gambar',
    ];

    protected $appends = [
        'gambar_url',
        'unit_gambar_url',
    ];

    /**
     * URL Foto Unit (fallback ke Foto Master Barang jika unit belum memiliki foto khusus)
     */
    public function getGambarUrlAttribute(): ?string
    {
        if ($this->gambar) {
            return asset('storage/' . $this->gambar);
        }

        $barang = $this->relationLoaded('barang') ? $this->barang : $this->barang;
        if ($barang && $barang->gambar) {
            return asset('storage/' . $barang->gambar);
        }

        return null;
    }

    /**
     * URL Foto Khusus Unit (null jika belum diunggah)
     */
    public function getUnitGambarUrlAttribute(): ?string
    {
        return $this->gambar ? asset('storage/' . $this->gambar) : null;
    }

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
