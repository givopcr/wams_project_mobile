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
        'qr_code',
    ];

    /**
     * Relasi ke Barang (kategori_barang 1:N barang)
     */
    public function barang(): HasMany
    {
        return $this->hasMany(Barang::class, 'kategori_id');
    }

    /**
     * Relasi ke Unit Barang melalui Barang
     */
    public function units(): HasManyThrough
    {
        return $this->hasManyThrough(BarangUnit::class, Barang::class, 'kategori_id', 'barang_id');
    }
}
