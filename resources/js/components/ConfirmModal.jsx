import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi Hapus',
    message = 'Apakah Anda yakin ingin menghapus data ini?',
    itemBadge = null,
    confirmText = 'Hapus',
    cancelText = 'Batal',
    variant = 'danger', // 'danger' | 'warning' | 'info'
    processing = false,
}) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button Top Right */}
                <button
                    type="button"
                    onClick={onClose}
                    disabled={processing}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                    aria-label="Tutup"
                >
                    <X size={18} />
                </button>

                <div className="flex flex-col items-center text-center">
                    {/* Icon with soft pulse/ripple rings */}
                    <div className="relative mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#D84040] shadow-xs">
                            {variant === 'danger' ? (
                                <Trash2 size={28} className="text-[#D84040]" />
                            ) : (
                                <AlertTriangle size={28} className="text-amber-600" />
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-black text-[#1D1616] tracking-tight mb-2">
                        {title}
                    </h3>

                    {/* Optional Item Badge Pill */}
                    {itemBadge && (
                        <div className="mb-3 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-mono font-bold text-[#1D1616] max-w-full truncate">
                            {typeof itemBadge === 'string'
                                ? itemBadge
                                : `${itemBadge.label ? itemBadge.label + ': ' : ''}${itemBadge.value}`}
                        </div>
                    )}

                    {/* Message */}
                    <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed mb-6">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="w-full py-2.5 sm:py-3 px-4 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-100 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={processing}
                            className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-[#D84040] to-[#8E1616] hover:from-[#c93636] hover:to-[#771111] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#D84040]/30 hover:shadow-xl hover:shadow-[#D84040]/40 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                        >
                            {processing ? 'Memproses...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
