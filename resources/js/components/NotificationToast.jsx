import React, { useEffect, useState } from 'react';
import { X, ArrowRight, AlertTriangle, Clock } from 'lucide-react';
import { router } from '@inertiajs/react';

/**
 * Single Live Toast Item
 * - Overdue: Icon (!) Merah Alarm + Live Ticker
 * - Peminjaman: Icon (i) Hitam
 * - Pengembalian Baik: Icon (i) Hijau
 * - Pengembalian Rusak: Icon (i) Merah
 */
export function ToastItem({ notification, onDismiss }) {
    const [isHovered, setIsHovered] = useState(false);
    const [currentTime, setCurrentTime] = useState(Date.now());

    const isOverdue = notification.type === 'overdue';
    const isApproval = notification.type === 'approval' || notification.status_transaksi === 'menunggu_persetujuan';
    const isReturn = notification.type === 'return' || notification.status_transaksi === 'dikembalikan';
    const isRusak = isReturn && notification.kondisi?.toLowerCase() === 'rusak';
    const isBaik = isReturn && !isRusak;

    // Real-time ticking counter for overdue loan
    useEffect(() => {
        if (!isOverdue || !notification.batas_kembali) return;
        const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(interval);
    }, [isOverdue, notification.batas_kembali]);

    useEffect(() => {
        if (isHovered) return;

        // Overdue gives a bit more time (15s), others 10s
        const autoDismissTime = isOverdue ? 15000 : 10000;
        const timer = setTimeout(() => {
            onDismiss(notification.id);
        }, autoDismissTime);

        return () => clearTimeout(timer);
    }, [notification.id, isHovered, isOverdue, onDismiss]);

    // Format elapsed overdue time in real-time ("Terlambat 9 Jam 24 menit")
    const formatElapsedTime = (batasKembaliStr) => {
        if (!batasKembaliStr) return '0 menit';
        const target = new Date(batasKembaliStr).getTime();
        const diff = Math.max(0, currentTime - target);
        const totalSeconds = Math.floor(diff / 1000);

        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        let parts = [];
        if (days > 0) parts.push(`${days} Hari`);
        if (hours > 0) parts.push(`${hours} Jam`);
        parts.push(`${minutes} menit`);

        return `Terlambat ${parts.join(' ')}`;
    };

    // Menentukan skema warna icon (i/!) dan ripple berdasarkan jenis transaksi & kondisi
    let outerRingClass = 'bg-gray-100/70 border-gray-200/80';
    let middleRingClass = 'bg-gray-200/80 border-gray-300/80';
    let innerCircleClass = 'border-[#1D1616] text-[#1D1616]';

    if (isOverdue) {
        // Melebihi Batas Waktu / Overdue -> Merah Alarm Berdenyut
        outerRingClass = 'bg-rose-100/90 border-rose-300 ring-2 ring-rose-400/40 animate-pulse';
        middleRingClass = 'bg-rose-200/90 border-rose-400';
        innerCircleClass = 'border-[#D84040] text-white bg-[#D84040]';
    } else if (isApproval) {
        // Permohonan izin / approval -> Kuning/Amber
        outerRingClass = 'bg-amber-50/90 border-amber-200';
        middleRingClass = 'bg-amber-100/80 border-amber-300';
        innerCircleClass = 'border-amber-600 text-amber-600';
    } else if (isBaik) {
        // Pengembalian kondisi baik -> Hijau
        outerRingClass = 'bg-emerald-50/90 border-emerald-100';
        middleRingClass = 'bg-emerald-100/80 border-emerald-200';
        innerCircleClass = 'border-emerald-600 text-emerald-600';
    } else if (isRusak) {
        // Pengembalian kondisi rusak -> Merah
        outerRingClass = 'bg-red-50/90 border-red-100';
        middleRingClass = 'bg-red-100/80 border-red-200';
        innerCircleClass = 'border-[#D84040] text-[#D84040]';
    } else {
        // Peminjaman -> Hitam
        outerRingClass = 'bg-gray-100/70 border-gray-200/80';
        middleRingClass = 'bg-gray-200/80 border-gray-300/80';
        innerCircleClass = 'border-[#1D1616] text-[#1D1616]';
    }

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`w-full bg-white rounded-2xl border ${
                isOverdue ? 'border-rose-300 shadow-[0_12px_36px_-4px_rgba(216,64,64,0.2)] ring-1 ring-rose-300/60' : 'border-gray-200/90 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)]'
            } p-4 sm:p-5 transition-all duration-300 transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-bottom-5 pointer-events-auto`}
            role="alert"
        >
            <div className="flex items-start gap-3.5">
                {/* Concentric Circle Icon */}
                <div className="relative flex items-center justify-center shrink-0 mt-0.5 select-none">
                    {/* Outer wave ring */}
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${outerRingClass}`}>
                        {/* Middle wave ring */}
                        <div className={`w-7 h-7 rounded-full border flex items-center justify-center ${middleRingClass}`}>
                            {/* Inner circle with (i / !) */}
                            <div className={`w-5 h-5 rounded-full border-[1.6px] flex items-center justify-center ${innerCircleClass}`}>
                                {isOverdue ? (
                                    <span className="font-sans font-black text-[12px] leading-none">!</span>
                                ) : (
                                    <span className="font-serif font-bold text-[11px] leading-none">i</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-start justify-between gap-2">
                        {/* Red / Amber Title */}
                        <h4 className={`text-sm sm:text-[15px] font-bold tracking-tight leading-tight ${isApproval ? 'text-amber-700' : 'text-[#D84040]'}`}>
                            {notification.title}
                        </h4>
                        <button
                            type="button"
                            onClick={() => onDismiss(notification.id)}
                            className="text-gray-400 hover:text-gray-600 p-0.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
                            title="Tutup"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <p className="text-xs sm:text-[13px] text-gray-700 mt-1.5 leading-relaxed">
                        {notification.message}
                    </p>

                    {/* Live Ticker Badge for Overdue */}
                    {isOverdue && notification.batas_kembali && (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-[#D84040] text-xs font-semibold shadow-2xs">
                            <Clock size={13} className="text-[#D84040] animate-pulse shrink-0" />
                            <span>{formatElapsedTime(notification.batas_kembali)}</span>
                        </div>
                    )}

                    {/* Action Links with Red / Amber Accent */}
                    <div className="mt-3.5 flex items-center gap-4 text-xs sm:text-[13px]">
                        <button
                            type="button"
                            onClick={() => onDismiss(notification.id)}
                            className="font-medium text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
                        >
                            Abaikan
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onDismiss(notification.id);
                                router.visit(
                                    isApproval
                                        ? '/admin/logbook?status=menunggu_persetujuan'
                                        : '/admin/logbook'
                                );
                            }}
                            className={`font-bold cursor-pointer transition-colors inline-flex items-center gap-1 ${
                                isApproval ? 'text-amber-700 hover:text-amber-900' : 'text-[#D84040] hover:text-[#8E1616]'
                            }`}
                        >
                            {isApproval ? 'Tinjau Permohonan' : 'Logbook'}
                            <ArrowRight size={13} className="inline" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Toast Container for Web Admin
 */
export default function NotificationToastContainer({ toasts, onDismiss }) {
    if (!toasts || toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} notification={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}
