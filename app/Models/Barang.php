<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barang extends Model
{
    use HasFactory;

    protected $table = 'barang';

    protected $fillable = [
        'kategori_id',
        'nama_barang',
        'kode_barang',
        'detail_spesifikasi',
        'lokasi',
        'gambar',
    ];

    /**
     * Relasi ke Kategori (barang N:1 kategori_barang)
     */
    public function kategori(): BelongsTo
    {
        return $this->belongsTo(KategoriBarang::class, 'kategori_id');
    }

    /**
     * Relasi ke Unit Barang (barang 1:N barang_unit)
     */
    public function units(): HasMany
    {
        return $this->hasMany(BarangUnit::class, 'barang_id');
    }

    /**
     * Helper status aggregation
     */
    public function availableUnits(): HasMany
    {
        return $this->hasMany(BarangUnit::class, 'barang_id')->where('status', 'tersedia');
    }

    public function borrowedUnits(): HasMany
    {
        return $this->hasMany(BarangUnit::class, 'barang_id')->where('status', 'dipinjam');
    }

    public function maintenanceUnits(): HasMany
    {
        return $this->hasMany(BarangUnit::class, 'barang_id')->where('status', 'maintenance');
    }
}
