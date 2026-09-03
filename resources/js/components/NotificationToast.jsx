import React, { useEffect, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { router } from '@inertiajs/react';

/**
 * Single Live Toast Item
 * - Peminjaman: Icon (i) Hitam
 * - Pengembalian Baik: Icon (i) Hijau
 * - Pengembalian Rusak: Icon (i) Merah
 */
export function ToastItem({ notification, onDismiss }) {
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered) return;

        const timer = setTimeout(() => {
            onDismiss(notification.id);
        }, 10000); // 10s auto-dismiss

        return () => clearTimeout(timer);
    }, [notification.id, isHovered, onDismiss]);

    const isReturn = notification.type === 'return' || notification.status_transaksi === 'dikembalikan';
    const isRusak = isReturn && notification.kondisi?.toLowerCase() === 'rusak';
    const isBaik = isReturn && !isRusak;

    // Menentukan skema warna icon (i) dan ripple berdasarkan jenis transaksi & kondisi
    let outerRingClass = 'bg-gray-100/70 border-gray-200/80';
    let middleRingClass = 'bg-gray-200/80 border-gray-300/80';
    let innerCircleClass = 'border-[#1D1616] text-[#1D1616]';

    if (isBaik) {
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
            className="w-full bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-300 transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-bottom-5 pointer-events-auto"
            role="alert"
        >
            <div className="flex items-start gap-3.5">
                {/* Concentric Circle Icon */}
                <div className="relative flex items-center justify-center shrink-0 mt-0.5 select-none">
                    {/* Outer wave ring */}
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${outerRingClass}`}>
                        {/* Middle wave ring */}
                        <div className={`w-7 h-7 rounded-full border flex items-center justify-center ${middleRingClass}`}>
                            {/* Inner circle with (i) */}
                            <div className={`w-5 h-5 rounded-full border-[1.6px] flex items-center justify-center ${innerCircleClass}`}>
                                <span className="font-serif font-bold text-[11px] leading-none">i</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-start justify-between gap-2">
                        {/* Red Title */}
                        <h4 className="text-sm sm:text-[15px] font-bold text-[#D84040] tracking-tight leading-tight">
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

                    {/* Action Links with Red Accent */}
                    <div className="mt-3.5 flex items-center gap-4 text-xs sm:text-[13px]">
                        <button
                            type="button"
                            onClick={() => onDismiss(notification.id)}
                            className="font-medium text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
                        >
                            Dismiss
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onDismiss(notification.id);
                                router.visit('/admin/logbook');
                            }}
                            className="font-bold text-[#D84040] hover:text-[#8E1616] cursor-pointer transition-colors inline-flex items-center gap-1"
                        >
                            Lihat Logbook
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
