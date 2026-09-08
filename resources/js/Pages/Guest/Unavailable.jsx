import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    Wrench,
    Clock,
    Lock,
    ArrowLeft,
    CheckCircle2,
    Search,
    Mail
} from 'lucide-react';

export default function GuestUnavailable({
    type = 'not_found',
    kode_unit = '',
    unit = null,
    borrower_hint = null,
    message = '',
}) {
    const [emailCheck, setEmailCheck] = useState('');

    const handleCheckBorrower = (e) => {
        e.preventDefault();
        if (!emailCheck.trim()) return;
        window.location.href = `/scan/${kode_unit}?email=${encodeURIComponent(emailCheck.trim())}`;
    };

    return (
        <div className="min-h-screen bg-[#EEEEEE] flex flex-col justify-between text-[#1D1616]">
            <Head title={`Status ${kode_unit} - WAMS`} />

            {/* Top Navbar */}
            <header className="bg-white border-b border-[#E0E0E0] sticky top-0 z-30 px-4 py-3 shadow-2xs">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#D84040] flex items-center justify-center text-white font-black text-sm shadow-xs">
                            W
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-[#1D1616] leading-tight">WAMS Workshop</h1>
                            <p className="text-[10px] text-[#6B7280]">Status Peralatan</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-lg w-full mx-auto p-4 flex flex-col justify-center space-y-4">
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-2xs text-center space-y-4">
                    {type === 'borrowed' && (
                        <>
                            <div className="w-16 h-16 bg-amber-50 text-amber-600 border border-amber-200 rounded-full flex items-center justify-center mx-auto">
                                <Clock size={32} />
                            </div>
                            <div>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                    Sedang Dipinjam
                                </span>
                                <h2 className="text-base font-bold text-[#1D1616] mt-2">
                                    {unit ? `${unit.nama_barang} (${unit.kode_unit})` : kode_unit}
                                </h2>
                                <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                                    {message || 'Unit peralatan ini sedang digunakan oleh pengguna lain.'}
                                </p>
                                {borrower_hint && (
                                    <p className="text-[11px] text-[#6B7280] mt-1">
                                        Peminjam saat ini: <span className="font-mono font-bold text-[#1D1616]">{borrower_hint}</span>
                                    </p>
                                )}
                            </div>

                            {/* Verification form for original borrower to return or view ticket */}
                            <div className="pt-3 border-t border-[#E0E0E0] text-left space-y-2.5">
                                <div className="text-xs font-bold text-[#1D1616]">
                                    Apakah Anda yang meminjam barang ini?
                                </div>
                                <p className="text-[11px] text-[#6B7280]">
                                    Masukkan email yang Anda gunakan saat mengajukan peminjaman untuk membuka tiket atau mengembalikan barang:
                                </p>

                                <form onSubmit={handleCheckBorrower} className="space-y-2">
                                    <div className="relative">
                                        <input
                                            type="email"
                                            required
                                            value={emailCheck}
                                            onChange={(e) => setEmailCheck(e.target.value)}
                                            placeholder="Masukkan email Anda..."
                                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                        />
                                        <Mail size={15} className="absolute left-3 top-3 text-[#6B7280]" />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-2.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                                    >
                                        Buka Tiket Pengembalian
                                    </button>
                                </form>
                            </div>
                        </>
                    )}

                    {type === 'maintenance' && (
                        <>
                            <div className="w-16 h-16 bg-rose-50 text-[#D84040] border border-rose-200 rounded-full flex items-center justify-center mx-auto">
                                <Wrench size={32} />
                            </div>
                            <div>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                    Dalam Pemeliharaan / Perbaikan
                                </span>
                                <h2 className="text-base font-bold text-[#1D1616] mt-2">
                                    {unit ? `${unit.nama_barang} (${unit.kode_unit})` : kode_unit}
                                </h2>
                                <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                                    {message || 'Peralatan ini sedang dalam perawatan teknisi workshop dan belum siap digunakan.'}
                                </p>
                            </div>
                            <div className="p-3 bg-[#EEEEEE]/50 border border-[#E0E0E0] rounded-xl text-xs text-[#6B7280]">
                                Silakan hubungi admin atau staf laboratorium untuk informasi lebih lanjut atau gunakan unit lain yang tersedia.
                            </div>
                        </>
                    )}

                    {type === 'not_found' && (
                        <>
                            <div className="w-16 h-16 bg-zinc-100 text-zinc-600 border border-zinc-300 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircle size={32} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[#1D1616]">Unit Tidak Ditemukan</h2>
                                <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                                    {message || `Kode unit "${kode_unit}" tidak terdaftar di database sistem WAMS.`}
                                </p>
                            </div>
                            <div className="p-3 bg-[#EEEEEE]/50 border border-[#E0E0E0] rounded-xl text-xs text-[#6B7280]">
                                Pastikan QR Code yang Anda pindai adalah stiker resmi dari peralatan workshop WAMS.
                            </div>
                        </>
                    )}
                </div>
            </main>

            <footer className="py-4 text-center text-[11px] text-[#6B7280] border-t border-[#E0E0E0]/60 bg-white">
                WAMS • Workshop Asset Management System
            </footer>
        </div>
    );
}
