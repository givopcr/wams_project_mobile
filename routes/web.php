<?php

use App\Http\Controllers\Admin\AdminWebController;
use App\Http\Controllers\Admin\AuthWebController;
use App\Http\Controllers\Guest\GuestPinjamController;
use App\Http\Controllers\User\UserWebController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes (Admin Web with Inertia.js + React)
|--------------------------------------------------------------------------
*/

// Root
Route::get('/', function () {
    if (auth()->check()) {
        if (auth()->user()->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('user.dashboard');
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
    Route::post('/peminjaman/{id}/approve', [AdminWebController::class, 'approvePeminjaman'])->name('admin.peminjaman.approve');
    Route::post('/peminjaman/{id}/reject', [AdminWebController::class, 'rejectPeminjaman'])->name('admin.peminjaman.reject');
    Route::get('/scanner', [AdminWebController::class, 'scanner'])->name('admin.scanner');

    // Kalender Peminjaman & Jadwal Batas Kembali
    Route::get('/calendar', [AdminWebController::class, 'calendar'])->name('admin.calendar');
    Route::post('/calendar/peminjaman', [AdminWebController::class, 'storeCalendarPeminjaman'])->name('admin.calendar.store');

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

    // Live Notifications (Peminjaman & Pengembalian)
    Route::get('/notifications/check', [AdminWebController::class, 'checkNewTransactions'])->name('admin.notifications.check');
    Route::match(['get', 'post'], '/notifications/test', [AdminWebController::class, 'testNotification'])->name('admin.notifications.test');
});

/*
|--------------------------------------------------------------------------
| User Mobile Web Routes (Mobile-Friendly Portal for Workshop Users)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->prefix('user')->name('user.')->group(function () {
    Route::get('/dashboard', [UserWebController::class, 'dashboard'])->name('dashboard');
    Route::get('/katalog', [UserWebController::class, 'katalog'])->name('katalog');
    Route::get('/peminjaman', [UserWebController::class, 'peminjaman'])->name('peminjaman');
    Route::post('/pinjam', [UserWebController::class, 'storePinjam'])->name('pinjam.store');
    Route::post('/kembali/{id}', [UserWebController::class, 'storeKembali'])->name('kembali.store');
    Route::post('/batalkan/{id}', [UserWebController::class, 'cancelPinjam'])->name('pinjam.cancel');
    Route::get('/riwayat', [UserWebController::class, 'riwayat'])->name('riwayat');
    Route::get('/scanner', [UserWebController::class, 'scanner'])->name('scanner');
    Route::get('/lookup-unit/{kode_unit}', [UserWebController::class, 'lookupUnit'])->name('lookup.unit');
    Route::get('/profile', [UserWebController::class, 'profile'])->name('profile');
});

/*
|--------------------------------------------------------------------------
| Public Guest Borrowing (Scan QR via Mobile Web)
|--------------------------------------------------------------------------
*/
Route::get('/scan/{kode_unit}', [GuestPinjamController::class, 'show'])->name('guest.scan');
Route::post('/guest/pinjam/{kode_unit}', [GuestPinjamController::class, 'submitBorrow'])->name('guest.borrow.submit');
Route::post('/guest/pinjam/{kode_unit}/verify-otp', [GuestPinjamController::class, 'verifyOtp'])->name('guest.borrow.verify_otp');
Route::post('/guest/pinjam/{kode_unit}/resend-otp', [GuestPinjamController::class, 'resendOtp'])->name('guest.borrow.resend_otp');
Route::get('/guest/status/{kode_unit}', [GuestPinjamController::class, 'showStatus'])->name('guest.status');
Route::post('/guest/return/{kode_unit}', [GuestPinjamController::class, 'submitReturn'])->name('guest.return.submit');

