<?php

use App\Http\Controllers\Admin\AdminWebController;
use App\Http\Controllers\Admin\AuthWebController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes (Admin Web with Inertia.js + React)
|--------------------------------------------------------------------------
*/

// Root
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('admin.dashboard');
    }
    return redirect()->route('login');
});

// Auth Routes (Guest)
Route::middleware('guest')->group(function () {
    Route::get('/admin/login', [AuthWebController::class, 'showLogin'])->name('login');
    Route::post('/admin/login', [AuthWebController::class, 'login'])->name('login.post');
    Route::get('/login', fn() => redirect('/admin/login'));
    Route::post('/login', [AuthWebController::class, 'login']);
});

// Admin Protected Routes
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::post('/logout', [AuthWebController::class, 'logout'])->name('logout');

    // Dashboard
    Route::get('/dashboard', [AdminWebController::class, 'dashboard'])->name('admin.dashboard');

    // Kategori
    Route::get('/kategori', [AdminWebController::class, 'kategori'])->name('admin.kategori');
    Route::post('/kategori', [AdminWebController::class, 'storeKategori'])->name('admin.kategori.store');
    Route::put('/kategori/{id}', [AdminWebController::class, 'updateKategori'])->name('admin.kategori.update');
    Route::delete('/kategori/{id}', [AdminWebController::class, 'destroyKategori'])->name('admin.kategori.destroy');

    // Master Barang
    Route::get('/barang', [AdminWebController::class, 'barang'])->name('admin.barang');
    Route::post('/barang', [AdminWebController::class, 'storeBarang'])->name('admin.barang.store');
    Route::post('/barang/{id}', [AdminWebController::class, 'updateBarang'])->name('admin.barang.update'); // Form data with file
    Route::delete('/barang/{id}', [AdminWebController::class, 'destroyBarang'])->name('admin.barang.destroy');

    // Unit Fisik
    Route::get('/unit', [AdminWebController::class, 'unit'])->name('admin.unit');
    Route::post('/unit', [AdminWebController::class, 'storeUnit'])->name('admin.unit.store');
    Route::put('/unit/{id}', [AdminWebController::class, 'updateUnit'])->name('admin.unit.update');
    Route::delete('/unit/{id}', [AdminWebController::class, 'destroyUnit'])->name('admin.unit.destroy');

    // Transaksi & Logbook
    Route::get('/logbook', [AdminWebController::class, 'logbook'])->name('admin.logbook');
    Route::get('/scanner', [AdminWebController::class, 'scanner'])->name('admin.scanner');

    // Manajemen User
    Route::get('/users', [AdminWebController::class, 'users'])->name('admin.users');
    Route::post('/users', [AdminWebController::class, 'storeUser'])->name('admin.users.store');
    Route::put('/users/{id}', [AdminWebController::class, 'updateUser'])->name('admin.users.update');
    Route::delete('/users/{id}', [AdminWebController::class, 'destroyUser'])->name('admin.users.destroy');

    // QR Code
    Route::get('/qrcode', [AdminWebController::class, 'qrCode'])->name('admin.qrcode');

    // Laporan & Statistik
    Route::get('/reports', [AdminWebController::class, 'reports'])->name('admin.reports');
    Route::get('/reports/export-excel', [AdminWebController::class, 'exportExcelReports'])->name('admin.reports.excel');
    Route::get('/reports/print-pdf', [AdminWebController::class, 'exportPdfReports'])->name('admin.reports.pdf');
});
