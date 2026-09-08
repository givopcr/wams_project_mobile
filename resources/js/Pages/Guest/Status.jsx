import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import {
    CheckCircle2,
    Clock,
    Wrench,
    AlertCircle,
    Calendar,
    ShieldCheck,
    Share2,
    RotateCcw,
    Sparkles,
    AlertTriangle,
    RefreshCw,
    Check
} from 'lucide-react';

export default function GuestStatus({ unit, logbook }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [isOverdue, setIsOverdue] = useState(false);

    // Return Modal States
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [kondisi, setKondisi] = useState('baik');
    const [catatan, setCatatan] = useState('');
    const [returning, setReturning] = useState(false);
    const [returnError, setReturnError] = useState(null);
    const [returnSuccess, setReturnSuccess] = useState(false);
    const [copied, setCopied] = useState(false);

    // Countdown Timer calculation
    useEffect(() => {
        if (!logbook?.batas_kembali) return;

        const updateTimer = () => {
            const target = new Date(logbook.batas_kembali).getTime();
            const now = new Date().getTime();
            const diff = target - now;

            if (diff <= 0) {
                setIsOverdue(true);
                const overdueDiff = Math.abs(diff);
                const hours = Math.floor(overdueDiff / (1000 * 60 * 60));
                const minutes = Math.floor((overdueDiff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`Terlambat ${hours}j ${minutes}m`);
            } else {
                setIsOverdue(false);
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                if (days > 0) {
                    setTimeLeft(`${days}h ${hours}j ${minutes}m`);
                } else {
                    setTimeLeft(`${hours}j ${minutes}m ${seconds}s`);
                }
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [logbook?.batas_kembali]);

    // Handle Copy / Share Ticket Link
    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Submit Return
    const handleReturn = async (e) => {
        e.preventDefault();
        setReturnError(null);

        if (kondisi === 'rusak' && !catatan.trim()) {
            setReturnError('Catatan kerusakan / kendala alat wajib diisi.');
            return;
        }

        setReturning(true);

        try {
            const token = logbook.return_token || localStorage.getItem(`wams_guest_token_${unit.kode_unit}`);
            const response = await axios.post(`/guest/return/${unit.kode_unit}`, {
                kondisi: kondisi,
                catatan: catatan.trim(),
                token: token,
            });

            if (response.data.success) {
                setShowReturnModal(false);
                localStorage.removeItem(`wams_guest_token_${unit.kode_unit}`);
                setReturnSuccess(true);
            } else {
                setReturnError(response.data.message || 'Gagal mengembalikan barang.');
            }
        } catch (err) {
            if (err.response?.status === 422 && err.response?.data?.message?.includes('sudah dikembalikan')) {
                setShowReturnModal(false);
                localStorage.removeItem(`wams_guest_token_${unit.kode_unit}`);
                setReturnSuccess(true);
                return;
            }
            setReturnError(err.response?.data?.message || 'Terjadi kesalahan saat memproses pengembalian.');
        } finally {
            setReturning(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#EEEEEE] flex flex-col justify-between text-[#1D1616]">
            <Head title={`Tiket Pinjam ${unit.kode_unit} - WAMS`} />

            {/* Top Navbar */}
            <header className="bg-white border-b border-[#E0E0E0] sticky top-0 z-30 px-4 py-3 shadow-2xs">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#D84040] flex items-center justify-center text-white font-black text-sm shadow-xs">
                            W
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-[#1D1616] leading-tight">WAMS Workshop</h1>
                            <p className="text-[10px] text-[#6B7280]">Tiket Peminjaman Digital</p>
                        </div>
                    </div>
                    <button
                        onClick={handleShare}
                        className="p-2 rounded-xl bg-white border border-[#E0E0E0] hover:bg-[#EEEEEE] text-[#1D1616] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Salin Link Tiket"
                    >
                        {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                        <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Bagikan'}</span>
                    </button>
                </div>
            </header>

            {/* Main Area */}
            <main className="flex-1 max-w-lg w-full mx-auto p-4 space-y-4">
                {returnSuccess ? (
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-2xs text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 size={36} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#1D1616]">Pengembalian Selesai!</h2>
                            <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                                Unit <strong className="text-[#1D1616]">{unit.kode_unit} ({unit.nama_barang})</strong> telah berhasil dikembalikan ke workshop.
                            </p>
                        </div>

                        <div className="p-3 bg-[#EEEEEE]/50 border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-medium">
                            Status Kondisi: <span className="font-bold capitalize">{kondisi}</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => (window.location.href = `/scan/${unit.kode_unit}`)}
                            className="w-full py-3 bg-[#1D1616] hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                            Selesai & Tutup Halaman
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Active Badge Card */}
                        <div className="bg-white border border-[#E0E0E0] rounded-2xl p-5 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                                        Sedang Dipinjam
                                    </span>
                                </div>
                                <span className="text-[11px] font-mono font-bold bg-[#EEEEEE] text-[#1D1616] px-2 py-0.5 rounded-md">
                                    #{unit.kode_unit}
                                </span>
                            </div>

                            {/* Item Details */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-14 h-14 rounded-xl bg-[#F8FAFC] border border-[#E0E0E0] shrink-0 flex items-center justify-center overflow-hidden">
                                    {unit.gambar ? (
                                        <img src={unit.gambar} alt={unit.nama_barang} className="w-full h-full object-cover" />
                                    ) : (
                                        <Wrench size={24} className="text-[#D84040]" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D84040]">
                                        {unit.kategori || 'Peralatan'}
                                    </span>
                                    <h3 className="text-base font-bold text-[#1D1616] truncate">
                                        {unit.nama_barang}
                                    </h3>
                                    <div className="text-xs text-[#6B7280] mt-0.5">
                                        Peminjam: <strong className="text-[#1D1616]">{logbook.peminjam_nama}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Countdown / Time remaining block */}
                            <div
                                className={`p-4 rounded-xl border text-center transition-all ${
                                    isOverdue
                                        ? 'bg-rose-50 border-rose-300 text-[#D84040]'
                                        : 'bg-gradient-to-br from-[#1D1616] to-[#2D2424] text-white'
                                }`}
                            >
                                <span className={`text-[10px] uppercase font-bold tracking-wider ${isOverdue ? 'text-[#D84040]' : 'text-zinc-400'}`}>
                                    {isOverdue ? 'Waktu Pengembalian Terlewat' : 'Sisa Waktu Peminjaman'}
                                </span>
                                <div className="text-2xl font-black font-mono tracking-wider mt-1">
                                    {timeLeft || 'Menghitung...'}
                                </div>
                                <div className={`text-[11px] mt-1 ${isOverdue ? 'text-rose-700 font-semibold' : 'text-zinc-300'}`}>
                                    Batas Kembali: {new Date(logbook.batas_kembali).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                </div>
                            </div>

                            {/* Loan Metadata info */}
                            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                                <div className="p-2.5 bg-[#EEEEEE]/50 rounded-xl border border-[#E0E0E0]">
                                    <span className="text-[10px] text-[#6B7280] block">Waktu Pinjam</span>
                                    <span className="font-semibold text-[#1D1616]">
                                        {new Date(logbook.tanggal_pinjam).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                    </span>
                                </div>
                                <div className="p-2.5 bg-[#EEEEEE]/50 rounded-xl border border-[#E0E0E0]">
                                    <span className="text-[10px] text-[#6B7280] block">Verifikasi Tamu</span>
                                    <span className="font-semibold text-[#1D1616] flex items-center gap-1">
                                        {logbook.requires_verification ? (
                                            <>
                                                <ShieldCheck size={13} className="text-emerald-600" />
                                                <span>Lolos OTP</span>
                                            </>
                                        ) : (
                                            <span>Peminjaman Standar</span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Card: Return Button */}
                        <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-2xs space-y-3">
                            <div>
                                <h4 className="text-xs font-bold text-[#1D1616]">Sudah Selesai Menggunakan?</h4>
                                <p className="text-[11px] text-[#6B7280] mt-0.5">
                                    Segera kembalikan peralatan ke rak/tempat asalnya dan konfirmasikan pengembalian di bawah.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowReturnModal(true)}
                                className="w-full py-3 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                                <RotateCcw size={15} />
                                <span>Kembalikan Barang Sekarang</span>
                            </button>
                        </div>
                    </>
                )}
            </main>

            {/* Return Confirmation Modal */}
            {!returnSuccess && showReturnModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 bg-red-50 text-[#D84040] border border-red-200 rounded-2xl flex items-center justify-center mx-auto">
                                <RotateCcw size={22} />
                            </div>
                            <h3 className="text-base font-bold text-[#1D1616]">Konfirmasi Pengembalian</h3>
                            <p className="text-xs text-[#6B7280]">
                                Unit: <strong className="text-[#1D1616]">{unit.kode_unit} - {unit.nama_barang}</strong>
                            </p>
                        </div>

                        {returnError && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                                <AlertCircle size={15} className="shrink-0 text-[#D84040]" />
                                <span>{returnError}</span>
                            </div>
                        )}

                        <form onSubmit={handleReturn} className="space-y-4">
                            {/* Kondisi Radio Selection */}
                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-2">
                                    Pilih Kondisi Fisik Alat:
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setKondisi('baik')}
                                        className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                                            kondisi === 'baik'
                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                                                : 'bg-white border-[#E0E0E0] text-[#1D1616] hover:border-emerald-300'
                                        }`}
                                    >
                                        <CheckCircle2 size={16} className="mx-auto mb-1 text-emerald-600" />
                                        <span>Kondisi Baik</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setKondisi('rusak')}
                                        className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                                            kondisi === 'rusak'
                                                ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs'
                                                : 'bg-white border-[#E0E0E0] text-[#1D1616] hover:border-rose-300'
                                        }`}
                                    >
                                        <AlertTriangle size={16} className="mx-auto mb-1 text-rose-600" />
                                        <span>Ada Kendala/Rusak</span>
                                    </button>
                                </div>
                            </div>

                            {/* Catatan Kerusakan / Kendala (Required if Rusak) */}
                            {kondisi === 'rusak' && (
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-[#D84040]">
                                        Catatan Kendala / Kerusakan <span className="text-[#D84040]">*</span>
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={catatan}
                                        onChange={(e) => setCatatan(e.target.value)}
                                        placeholder="Jelaskan bagian yang bermasalah atau kendala saat pemakaian..."
                                        className="w-full p-3 bg-white border border-rose-300 rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                    ></textarea>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-2 pt-1">
                                <button
                                    type="submit"
                                    disabled={returning}
                                    className="w-full py-3 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                >
                                    {returning ? (
                                        <>
                                            <RefreshCw size={14} className="animate-spin" />
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check size={15} />
                                            <span>Selesaikan Pengembalian</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowReturnModal(false)}
                                    className="w-full py-2.5 text-xs font-semibold text-[#6B7280] hover:text-[#1D1616]"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="py-4 text-center text-[11px] text-[#6B7280] border-t border-[#E0E0E0]/60 bg-white">
                WAMS • Workshop Asset Management System
            </footer>
        </div>
    );
}
