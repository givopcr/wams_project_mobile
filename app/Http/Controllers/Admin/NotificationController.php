<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Logbook;
use App\Models\TransaksiStok;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Polling transaksi baru (peminjaman & pengembalian) dan deteksi keterlambatan (overdue) untuk web admin
     */
    public function check(Request $request): JsonResponse
    {
        $since = $request->query('since');
        $now = now();

        // Cari semua peminjaman aktif yang telah melewati batas kembali (overdue)
        $overdueLogs = Logbook::with(['user', 'barangUnit.barang'])
            ->where('status_transaksi', 'dipinjam')
            ->whereNotNull('batas_kembali')
            ->where('batas_kembali', '<', $now)
            ->orderBy('batas_kembali', 'asc')
            ->get();

        $overdues = $overdueLogs->map(function ($log) use ($now) {
            $isGuest = $log->tipe_peminjam === 'guest';
            $userName = $isGuest
                ? ($log->guest_nama ?: 'Tamu') . ' (Tamu)'
                : ($log->user?->nama ?? 'Pengguna Workshop');

            $userNip = $isGuest ? 'Guest' : ($log->user?->nip ?? '-');
            $barangName = $log->barangUnit?->barang?->nama_barang ?? 'Barang Workshop';
            $kodeUnit = $log->barangUnit?->kode_unit ?? '-';
            $diffSeconds = abs($now->getTimestamp() - $log->batas_kembali->getTimestamp());

            return [
                'id' => 'overdue_' . $log->id,
                'logbook_id' => $log->id,
                'type' => 'overdue',
                'title' => 'Peringatan: Melebihi Batas Waktu!',
                'user_name' => $userName,
                'user_nip' => $userNip,
                'is_guest' => $isGuest,
                'barang_name' => $barangName,
                'kode_unit' => $kodeUnit,
                'kondisi' => 'baik',
                'status_transaksi' => 'dipinjam',
                'batas_kembali' => $log->batas_kembali->toIso8601String(),
                'batas_kembali_formatted' => $log->batas_kembali->translatedFormat('d M Y, H:i'),
                'seconds_overdue' => $diffSeconds,
                'message' => "Peminjaman {$barangName} ({$kodeUnit}) oleh {$userName} telah melebihi batas waktu pengembalian.",
                'time' => $log->batas_kembali->diffForHumans(),
                'timestamp' => $log->batas_kembali->toIso8601String(),
            ];
        });

        // Ambil riwayat logbook terbaru (15 transaksi terakhir) untuk ditampilkan pada dropdown bel
        $recentLogs = Logbook::with(['user', 'barangUnit.barang'])
            ->whereIn('status_transaksi', ['dipinjam', 'dikembalikan', 'menunggu_persetujuan', 'dibatalkan'])
            ->latest('updated_at')
            ->limit(15)
            ->get();

        $formatLog = function ($log) {
            $isReturned = $log->status_transaksi === 'dikembalikan';
            $isApproval = $log->status_transaksi === 'menunggu_persetujuan';
            $isDibatalkan = $log->status_transaksi === 'dibatalkan';
            $isGuest = $log->tipe_peminjam === 'guest';

            $userName = $isGuest
                ? ($log->guest_nama ?: 'Tamu') . ' (Tamu)'
                : ($log->user?->nama ?? 'Pengguna Workshop');

            $userNip = $isGuest ? 'Guest' : ($log->user?->nip ?? '-');
            $barangName = $log->barangUnit?->barang?->nama_barang ?? 'Barang Workshop';
            $kodeUnit = $log->barangUnit?->kode_unit ?? '-';
            $kondisi = $log->kondisi_kembali ?? 'baik';

            if ($isApproval) {
                $type = 'approval';
                $title = 'Permohonan Izin Peminjaman Baru';
                $message = "{$userName} (NIP: {$userNip}) mengajukan peminjaman khusus untuk {$barangName} ({$kodeUnit}). Menunggu izin Anda.";
            } elseif ($isReturned) {
                $type = 'return';
                $title = $isGuest ? 'Pengembalian Barang (Tamu)' : 'Pengembalian Barang Selesai';
                $kondisiText = strtolower($kondisi) === 'rusak' ? 'Rusak' : 'Baik';
                $message = $isGuest
                    ? "Tamu {$log->guest_nama} telah mengembalikan {$barangName} ({$kodeUnit}). Kondisi: {$kondisiText}."
                    : "{$userName} telah mengembalikan {$barangName} ({$kodeUnit}). Kondisi: {$kondisiText}.";
            } elseif ($isDibatalkan) {
                $type = 'cancel';
                $title = 'Peminjaman Dibatalkan';
                $message = "{$userName} membatalkan pengajuan peminjaman {$barangName} ({$kodeUnit}).";
            } else {
                $type = 'borrow';
                $title = $isGuest ? 'Peminjaman Barang Baru (Tamu)' : 'Peminjaman Barang Baru';
                $message = $isGuest
                    ? "Tamu {$log->guest_nama} ({$log->guest_email}) baru saja meminjam {$barangName} ({$kodeUnit}) via Mobile Web."
                    : "{$userName} (NIP: {$userNip}) baru saja meminjam {$barangName} ({$kodeUnit}).";
            }

            return [
                'id' => 'log_' . $log->id . '_' . $log->status_transaksi . '_' . $log->updated_at->timestamp,
                'logbook_id' => $log->id,
                'type' => $type,
                'title' => $title,
                'user_name' => $userName,
                'user_nip' => $userNip,
                'is_guest' => $isGuest,
                'barang_name' => $barangName,
                'kode_unit' => $kodeUnit,
                'kondisi' => $kondisi,
                'status_transaksi' => $log->status_transaksi,
                'batas_kembali' => $log->batas_kembali?->toIso8601String(),
                'batas_kembali_formatted' => $log->batas_kembali?->translatedFormat('d M Y, H:i'),
                'message' => $message,
                'time' => $log->updated_at->diffForHumans(),
                'timestamp' => $log->updated_at->toIso8601String(),
            ];
        };

        $historyNotifications = $recentLogs->map($formatLog);

        if (! $since) {
            $recentThreshold = $now->copy()->subSeconds(60);
            $newLogs = $recentLogs->filter(function ($log) use ($recentThreshold) {
                return $log->updated_at >= $recentThreshold;
            });

            $stockLogs = TransaksiStok::with(['barang', 'user'])
                ->where('created_at', '>=', $recentThreshold)
                ->where('tipe', 'keluar')
                ->latest('created_at')
                ->get();
        } else {
            try {
                $parsedSince = Carbon::parse($since);
            } catch (\Exception $e) {
                $parsedSince = $now->copy()->subSeconds(10);
            }

            $bufferedSince = $parsedSince->copy()->subSeconds(5);

            $newLogs = Logbook::with(['user', 'barangUnit.barang'])
                ->where('updated_at', '>=', $bufferedSince)
                ->whereIn('status_transaksi', ['dipinjam', 'dikembalikan', 'menunggu_persetujuan', 'dibatalkan'])
                ->latest('updated_at')
                ->limit(10)
                ->get();

            $stockLogs = TransaksiStok::with(['barang', 'user'])
                ->where('created_at', '>=', $bufferedSince)
                ->where('tipe', 'keluar')
                ->latest('created_at')
                ->limit(5)
                ->get();
        }

        $notifications = $newLogs->map($formatLog);

        $stockNotifications = $stockLogs->filter(function ($t) {
            return (float) $t->sisa_stok <= (float) ($t->barang?->stok_minimum ?? 0);
        })->map(function ($t) {
            $barangName = $t->barang?->nama_barang ?? 'Barang Habis Pakai';
            $satuan = $t->barang?->satuan ?? 'unit';
            $userName = $t->user?->nama ?? 'Pengguna';
            $sisa = (float) $t->sisa_stok;
            $min = (float) ($t->barang?->stok_minimum ?? 0);

            return [
                'id' => 'stok_' . $t->id . '_' . $t->created_at->timestamp,
                'logbook_id' => null,
                'type' => 'low_stock',
                'title' => 'Peringatan: Stok Bahan Menipis!',
                'user_name' => $userName,
                'user_nip' => $t->user?->nip ?? '-',
                'is_guest' => false,
                'barang_name' => $barangName,
                'kode_unit' => "Sisa: {$sisa} {$satuan}",
                'kondisi' => 'menipis',
                'status_transaksi' => 'stok_menipis',
                'message' => "Stok {$barangName} tersisa {$sisa} {$satuan} (Batas minimum: {$min} {$satuan}) setelah pemakaian oleh {$userName}.",
                'time' => $t->created_at->diffForHumans(),
                'timestamp' => $t->created_at->toIso8601String(),
            ];
        });

        $allNotifications = $notifications->concat($stockNotifications)->sortByDesc('timestamp')->values();
        $allHistory = $historyNotifications->concat($stockNotifications)->sortByDesc('timestamp')->take(15)->values();

        return response()->json([
            'server_time' => $now->toIso8601String(),
            'notifications' => $allNotifications,
            'history' => $allHistory,
            'overdues' => $overdues,
            'overdue_count' => $overdues->count(),
        ]);
    }
}

