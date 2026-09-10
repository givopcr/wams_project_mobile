<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
        ]);

        // Redirect user yang sudah login ke dashboard sesuai role
        $middleware->redirectUsersTo(fn () => auth()->user()?->role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
        // Redirect unauthenticated users ke halaman login admin
        $middleware->redirectGuestsTo('/admin/login');

        // Peminjaman tamu via scan QR publik
        $middleware->validateCsrfTokens(except: [
            'guest/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
