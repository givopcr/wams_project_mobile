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
        'satuan',
        'stok_saat_ini',
        'stok_minimum',
        'detail_spesifikasi',
        'lokasi',
        'gambar',
        'perlu_persetujuan',
    ];

    protected function casts(): array
    {
        return [
            'perlu_persetujuan' => 'boolean',
            'stok_saat_ini' => 'float',
            'stok_minimum' => 'float',
        ];
    }

    /**
     * Relasi ke Kategori (barang N:1 kategori_barang)
     */
    public function kategori(): BelongsTo
    {
        return $this->belongsTo(KategoriBarang::class, 'kategori_id');
    }

    /**
     * Relasi ke Unit Barang (barang 1:N barang_unit) - untuk barang aset
     */
    public function units(): HasMany
    {
        return $this->hasMany(BarangUnit::class, 'barang_id');
    }

    /**
     * Relasi ke Mutasi Transaksi Stok - untuk barang habis pakai
     */
    public function transaksiStok(): HasMany
    {
        return $this->hasMany(TransaksiStok::class, 'barang_id');
    }

    /**
     * Cek apakah stok habis pakai berada pada atau di bawah ambang minimum
     */
    public function isLowStock(): bool
    {
        return (float) $this->stok_saat_ini <= (float) $this->stok_minimum;
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
