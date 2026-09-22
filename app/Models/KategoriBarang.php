<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class KategoriBarang extends Model
{
    use HasFactory;

    protected $table = 'kategori_barang';

    protected $fillable = [
        'nama_kategori',
        'tipe',
        'qr_code',
    ];

    /**
     * Cek apakah kategori ini adalah barang sekali pakai / habis pakai
     */
    public function isHabisPakai(): bool
    {
        return $this->tipe === 'habis_pakai';
    }

    /**
     * Relasi ke Barang (kategori_barang 1:N barang)
     */
    public function barang(): HasMany
    {
        return $this->hasMany(Barang::class, 'kategori_id');
    }

    /**
     * Alias plural relasi ke Barang
     */
    public function barangs(): HasMany
    {
        return $this->barang();
    }

    /**
     * Relasi ke Unit Barang melalui Barang
     */
    public function units(): HasManyThrough
    {
        return $this->hasManyThrough(BarangUnit::class, Barang::class, 'kategori_id', 'barang_id');
    }
}
