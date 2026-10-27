<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsRegularUser
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || $request->user()->role !== 'user') {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Regular user access required.',
                ], 403);
            }

            if ($request->user() && $request->user()->role === 'admin') {
                return redirect()->route('admin.dashboard')->with('error', 'Akses dibatasi. Halaman portal mobile ini khusus untuk Pengguna / Teknisi WAMS.');
            }

            abort(403, 'Akses khusus pengguna.');
        }

        return $next($request);
    }
}
