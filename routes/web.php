<?php

use App\Http\Controllers\Admin\AuthWebController;
use App\Http\Controllers\Admin\BarangController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\LogbookController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Guest\GuestPinjamController;
use App\Http\Controllers\User\UserWebController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes (Admin Web with Inertia.js + React)
|--------------------------------------------------------------------------
*/

// Root - Arahkan ke dashboard sesuai role jika sudah login, atau ke halaman Login jika belum
Route::get('/', function () {
    if (auth()->check()) {
        return auth()->user()->role === 'admin'
            ? redirect()->route('admin.dashboard')
            : redirect()->route('user.dashboard');
    }

    return redirect()->route('login');
});

// Auth Routes (Universal Login & Register untuk Pengguna WAMS dengan proteksi Guest & Rate Limit)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthWebController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthWebController::class, 'login'])->middleware('throttle:10,1')->name('login.post');
    Route::get('/register', fn () => redirect()->to('/login?tab=register'))->name('register');
    Route::post('/register', [AuthWebController::class, 'register'])->middleware('throttle:10,1')->name('register.post');
    Route::get('/admin/login', fn () => redirect()->route('login'));
    Route::post('/admin/login', [AuthWebController::class, 'login'])->middleware('throttle:10,1');

    // Google OAuth Web Routes
    Route::get('/auth/google', [AuthWebController::class, 'redirectToGoogle'])->name('auth.google');
    Route::get('/auth/google/callback', [AuthWebController::class, 'handleGoogleCallback'])->name('auth.google.callback');
});

// Universal Logout (Bisa diakses oleh role admin maupun user tanpa terblokir middleware)
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthWebController::class, 'logout'])->name('logout');
    Route::post('/admin/logout', [AuthWebController::class, 'logout'])->name('admin.logout');
});

// Admin Protected Routes
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

    // Master Barang
    Route::get('/barang', [BarangController::class, 'index'])->name('admin.barang');
    Route::post('/barang', [BarangController::class, 'store'])->name('admin.barang.store');
    Route::post('/barang/{id}', [BarangController::class, 'update'])->name('admin.barang.update'); // Form data with file
    Route::delete('/barang/{id}', [BarangController::class, 'destroy'])->name('admin.barang.destroy');
    Route::post('/barang/{id}/restock', [BarangController::class, 'restock'])->name('admin.barang.restock');
    Route::get('/barang/{id}/kartu-stok', [BarangController::class, 'kartuStokJson'])->name('admin.barang.kartu_stok');

    // Unit Fisik (Diarahkan ke Manajemen Barang karena terintegrasi)
    Route::get('/unit', fn () => redirect()->route('admin.barang'))->name('admin.unit');
    Route::post('/unit', [BarangController::class, 'storeUnit'])->name('admin.unit.store');
    Route::match(['put', 'post'], '/unit/{id}', [BarangController::class, 'updateUnit'])->name('admin.unit.update');
    Route::delete('/unit/{id}', [BarangController::class, 'destroyUnit'])->name('admin.unit.destroy');
    Route::get('/unit/{id}/history', [BarangController::class, 'unitHistoryJson'])->name('admin.unit.history');

    // Transaksi & Logbook
    Route::get('/logbook', [LogbookController::class, 'index'])->name('admin.logbook');
    Route::post('/peminjaman/{id}/approve', [LogbookController::class, 'approve'])->name('admin.peminjaman.approve');
    Route::post('/peminjaman/{id}/reject', [LogbookController::class, 'reject'])->name('admin.peminjaman.reject');
    Route::get('/scanner', [BarangController::class, 'scanner'])->name('admin.scanner');

    // Kalender Peminjaman & Jadwal Batas Kembali
    Route::get('/calendar', [LogbookController::class, 'calendar'])->name('admin.calendar');
    Route::post('/calendar/peminjaman', [LogbookController::class, 'storeCalendar'])->name('admin.calendar.store');

    // Manajemen User
    Route::get('/users', [UserController::class, 'index'])->name('admin.users');
    Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');
    Route::put('/users/{id}', [UserController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('admin.users.destroy');

    // QR Code
    Route::get('/qrcode', [BarangController::class, 'qrCode'])->name('admin.qrcode');

    // Laporan & Statistik
    Route::get('/reports', [ReportController::class, 'index'])->name('admin.reports');
    Route::get('/reports/export-excel', [ReportController::class, 'exportExcel'])->name('admin.reports.excel');
    Route::get('/reports/export-doc', [ReportController::class, 'exportDoc'])->name('admin.reports.doc');
    Route::get('/reports/export-pdf', [ReportController::class, 'exportPdf'])->name('admin.reports.pdf');
    Route::get('/reports/print-pdf', [ReportController::class, 'exportPdf']);

    // Live Notifications (Peminjaman & Pengembalian)
    Route::get('/notifications/check', [NotificationController::class, 'check'])->name('admin.notifications.check');

    // Pengaturan Akun Administrator
    Route::get('/profile', [UserController::class, 'profile'])->name('admin.profile');
    Route::post('/profile', [UserController::class, 'updateProfile'])->name('admin.profile.update');
    Route::put('/profile/password', [UserController::class, 'updatePassword'])->name('admin.profile.password');
});

/*
|--------------------------------------------------------------------------
| User Mobile Web Routes (Mobile-Friendly Portal for Workshop Users)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'user'])->prefix('user')->name('user.')->group(function () {
    Route::get('/dashboard', [UserWebController::class, 'dashboard'])->name('dashboard');
    Route::get('/katalog', [UserWebController::class, 'katalog'])->name('katalog');
    Route::get('/barang/{id}', [UserWebController::class, 'detailBarang'])->name('barang.detail');
    Route::get('/peminjaman', [UserWebController::class, 'peminjaman'])->name('peminjaman');
    Route::post('/pinjam', [UserWebController::class, 'storePinjam'])->name('pinjam.store');
    Route::post('/pakai-bahan', [\App\Http\Controllers\Api\TransaksiStokController::class, 'pakai'])->name('pakai.store');
    Route::post('/kembali/{id}', [UserWebController::class, 'storeKembali'])->name('kembali.store');
    Route::post('/batalkan/{id}', [UserWebController::class, 'cancelPinjam'])->name('pinjam.cancel');
    Route::get('/riwayat', [UserWebController::class, 'riwayat'])->name('riwayat');
    Route::get('/scanner', [UserWebController::class, 'scanner'])->name('scanner');
    Route::get('/lookup-unit/{kode_unit?}', [UserWebController::class, 'lookupUnit'])->where('kode_unit', '.*')->name('lookup.unit');
    Route::get('/profile', [UserWebController::class, 'profile'])->name('profile');
    Route::post('/profile/update', [UserWebController::class, 'updateProfile'])->name('profile.update');
    Route::post('/profile/email/send-otp', [\App\Http\Controllers\Api\ProfileController::class, 'sendChangeEmailOtp'])->middleware('throttle:10,1')->name('profile.email.otp');
    Route::post('/profile/email/verify-otp', [\App\Http\Controllers\Api\ProfileController::class, 'verifyChangeEmailOtp'])->middleware('throttle:10,1')->name('profile.email.verify');
});

/*
|--------------------------------------------------------------------------
| Public Guest Borrowing (Scan QR via Mobile Web)
|--------------------------------------------------------------------------
*/
Route::get('/scan/{kode_unit}', [GuestPinjamController::class, 'show'])->where('kode_unit', '.*')->name('guest.scan');
Route::post('/guest/pinjam/{kode_unit}', [GuestPinjamController::class, 'submitBorrow'])->where('kode_unit', '.*')->middleware('throttle:15,1')->name('guest.borrow.submit');
Route::post('/guest/pinjam/{kode_unit}/verify-otp', [GuestPinjamController::class, 'verifyOtp'])->where('kode_unit', '.*')->middleware('throttle:10,1')->name('guest.borrow.verify_otp');
Route::post('/guest/pinjam/{kode_unit}/resend-otp', [GuestPinjamController::class, 'resendOtp'])->where('kode_unit', '.*')->middleware('throttle:10,1')->name('guest.borrow.resend_otp');
Route::get('/guest/status/{kode_unit}', [GuestPinjamController::class, 'showStatus'])->where('kode_unit', '.*')->name('guest.status');
Route::post('/guest/return/{kode_unit}', [GuestPinjamController::class, 'submitReturn'])->where('kode_unit', '.*')->middleware('throttle:15,1')->name('guest.return.submit');

