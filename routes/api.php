<?php

use App\Http\Controllers\Api\Admin\AdminApiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BarangController;
use App\Http\Controllers\Api\KategoriController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\TransaksiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes for WAMS (Workshop Asset Management System)
|--------------------------------------------------------------------------
*/

// Public Authentication
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Public/Browsing Data (Bisa diakses untuk scan atau katalog)
Route::get('/kategori', [KategoriController::class, 'index']);
Route::get('/kategori/{id}', [KategoriController::class, 'show']);
Route::get('/kategori/{id}/barang', [KategoriController::class, 'barang']);

Route::get('/barang', [BarangController::class, 'index']);
Route::get('/barang/{id}', [BarangController::class, 'show']);
Route::get('/barang/{id}/units', [BarangController::class, 'units']);

// Authenticated Routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Session
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // Transaksi (Peminjaman, Pengembalian, Riwayat)
    Route::post('/peminjaman', [TransaksiController::class, 'pinjam']);
    Route::post('/pengembalian', [TransaksiController::class, 'kembali']);
    Route::get('/riwayat', [TransaksiController::class, 'riwayat']);

    // Admin Dedicated APIs (Protected by EnsureUserIsAdmin)
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats', [AdminApiController::class, 'stats']);

        // Kategori Management
        Route::post('/kategori', [AdminApiController::class, 'storeKategori']);
        Route::put('/kategori/{id}', [AdminApiController::class, 'updateKategori']);
        Route::delete('/kategori/{id}', [AdminApiController::class, 'destroyKategori']);

        // Master Barang Management
        Route::post('/barang', [AdminApiController::class, 'storeBarang']);
        Route::put('/barang/{id}', [AdminApiController::class, 'updateBarang']);
        Route::delete('/barang/{id}', [AdminApiController::class, 'destroyBarang']);

        // Unit Fisik Management
        Route::post('/barang/{barangId}/units', [AdminApiController::class, 'storeUnit']);
        Route::put('/units/{id}', [AdminApiController::class, 'updateUnit']);
        Route::delete('/units/{id}', [AdminApiController::class, 'destroyUnit']);

        // Logbook & User Management
        Route::get('/logbook', [AdminApiController::class, 'logbooks']);
        Route::get('/users', [AdminApiController::class, 'users']);
        Route::post('/users', [AdminApiController::class, 'storeUser']);
    });
});
