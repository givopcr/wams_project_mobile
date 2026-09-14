import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import UserMobileLayout from '@/Layouts/UserMobileLayout';
import {
    Search,
    Wrench,
    Cpu,
    Layers,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    ArrowRight,
    Calendar,
    ShieldAlert,
    Package,
    Sparkles,
    Scan,
    QrCode
} from 'lucide-react';

export default function MobileDashboard({
    stats = { dipinjam: 0, menunggu: 0, selesai: 0 },
    activeLoans = [],
    categories = [],
    availableItems = [],
    user = {}
}) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.visit(`/user/katalog?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            router.visit('/user/katalog');
        }
    };

    // Category style mapping matching WAMS admin
    const getCategoryStyle = (nama) => {
        const lower = (nama || '').toLowerCase();
        if (lower.includes('perkakas')) {
            return {
                icon: Wrench,
                badge: 'bg-rose-50 text-[#D84040] border-rose-200',
                activeBg: 'bg-[#D84040] text-white',
            };
        }
        if (lower.includes('elektronik')) {
            return {
                icon: Cpu,
                badge: 'bg-blue-50 text-blue-600 border-blue-200',
                activeBg: 'bg-blue-600 text-white',
            };
        }
        return {
            icon: Layers,
            badge: 'bg-emerald-50 text-emerald-600 border-emerald-200',
            activeBg: 'bg-emerald-600 text-white',
        };
    };

    return (
        <UserMobileLayout title="Beranda">
            <Head title="Beranda Pengguna - WAMS Mobile" />

            <div className="space-y-5">
                {/* 1. Welcome Greeting & Search */}
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-xs text-[#6B7280] font-medium">Selamat datang,</p>
                            <h2 className="text-lg font-black text-[#1D1616] tracking-tight">
                                {user?.nama || 'Teknisi Workshop'}
                            </h2>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-[#D84040] border border-rose-200">
                            {user?.role === 'admin' ? 'Admin / Pratinjau' : 'Teknisi'}
                        </span>
                    </div>

                    {/* Instant Search Form */}
                    <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                        <Search size={16} className="absolute left-3.5 text-[#8C93A0]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari bor, obeng, multimeter, rak..."
                            className="w-full pl-9 pr-20 py-2.5 bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] placeholder-[#8C93A0] focus:outline-none focus:border-[#D84040] focus:bg-white transition-all font-medium"
                        />
                        <button
                            type="submit"
                            className="absolute right-1.5 px-3 py-1.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* 2. KPI Cards (Matching Web Admin Style) */}
                <div className="grid grid-cols-3 gap-2.5">
                    {/* Dipinjam */}
                    <Link
                        href="/user/peminjaman"
                        className="bg-white border border-[#E0E0E0] rounded-2xl p-3 shadow-2xs hover:border-amber-400 transition-all flex flex-col items-center text-center cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                            <Clock size={19} />
                        </div>
                        <span className="text-xl font-black text-[#1D1616] tracking-tight">
                            {stats.dipinjam}
                        </span>
                        <span className="text-[10px] font-bold text-[#6B7280]">
                            Dipinjam
                        </span>
                    </Link>

                    {/* Menunggu */}
                    <Link
                        href="/user/peminjaman"
                        className="bg-white border border-[#E0E0E0] rounded-2xl p-3 shadow-2xs hover:border-blue-400 transition-all flex flex-col items-center text-center cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                            <ShieldAlert size={19} />
                        </div>
                        <span className="text-xl font-black text-[#1D1616] tracking-tight">
                            {stats.menunggu}
                        </span>
                        <span className="text-[10px] font-bold text-[#6B7280]">
                            Menunggu
                        </span>
                    </Link>

                    {/* Selesai */}
                    <Link
                        href="/user/riwayat"
                        className="bg-white border border-[#E0E0E0] rounded-2xl p-3 shadow-2xs hover:border-emerald-400 transition-all flex flex-col items-center text-center cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                            <CheckCircle2 size={19} />
                        </div>
                        <span className="text-xl font-black text-[#1D1616] tracking-tight">
                            {stats.selesai}
                        </span>
                        <span className="text-[10px] font-bold text-[#6B7280]">
                            Selesai
                        </span>
                    </Link>
                </div>

                {/* 3. Ongoing Active Borrowing Section */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#6B7280]">
                            Pinjaman Berjalan
                        </h3>
                        <Link
                            href="/user/peminjaman"
                            className="text-[11px] font-bold text-[#D84040] hover:underline flex items-center gap-0.5"
                        >
                            Lihat Semua <ChevronRight size={13} />
                        </Link>
                    </div>

                    {activeLoans.length > 0 ? (
                        <div className="space-y-2.5">
                            {activeLoans.slice(0, 2).map((loan) => (
                                <div
                                    key={loan.id}
                                    className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-2xs relative overflow-hidden"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-2.5">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#EEEEEE] text-[#1D1616] font-mono">
                                                    {loan.kode_unit}
                                                </span>
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                        loan.status_transaksi === 'dipinjam'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}
                                                >
                                                    {loan.status_transaksi === 'dipinjam'
                                                        ? 'Sedang Dipinjam'
                                                        : 'Menunggu Persetujuan'}
                                                </span>
                                            </div>
                                            <h4 className="font-extrabold text-sm text-[#1D1616] truncate">
                                                {loan.nama_barang}
                                            </h4>
                                        </div>

                                        {/* Status Icon */}
                                        <div className="w-9 h-9 rounded-xl bg-[#F8F9FA] border border-[#E0E0E0] flex items-center justify-center text-[#D84040] shrink-0">
                                            <Wrench size={18} />
                                        </div>
                                    </div>

                                    {/* Due time badge */}
                                    <div className="bg-[#F8F9FA] rounded-xl p-2.5 border border-[#E0E0E0] flex items-center justify-between text-xs mb-3">
                                        <div className="flex items-center gap-1.5 text-[#6B7280]">
                                            <Calendar size={13} />
                                            <span className="text-[11px]">Batas: {loan.batas_kembali}</span>
                                        </div>
                                        {loan.status_transaksi === 'dipinjam' && (
                                            <span
                                                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                                    loan.is_overdue
                                                        ? 'bg-rose-100 text-rose-700'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}
                                            >
                                                {loan.remaining_text}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action button */}
                                    {loan.status_transaksi === 'dipinjam' ? (
                                        <Link
                                            href="/user/peminjaman"
                                            className="w-full py-2.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl text-center block transition-colors shadow-xs"
                                        >
                                            Kembalikan Alat
                                        </Link>
                                    ) : (
                                        <div className="text-center py-1.5 bg-amber-50 rounded-xl text-amber-800 text-[11px] font-bold border border-amber-200">
                                            Menunggu konfirmasi admin bengkel
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-[#E0E0E0] rounded-2xl p-5 text-center shadow-2xs">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-2">
                                <CheckCircle2 size={22} />
                            </div>
                            <h4 className="font-bold text-xs text-[#1D1616]">
                                Tidak Ada Pinjaman Aktif
                            </h4>
                            <p className="text-[11px] text-[#6B7280] mt-0.5 mb-3">
                                Semua alat telah dikembalikan atau Anda belum meminjam hari ini.
                            </p>
                            <Link
                                href="/user/katalog"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                            >
                                <Package size={14} />
                                <span>Buka Katalog Alat</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* 4. Category Filter Chips */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#6B7280]">
                            Kategori Alat
                        </h3>
                        <Link
                            href="/user/katalog"
                            className="text-[11px] font-bold text-[#D84040] hover:underline"
                        >
                            Lihat Semua
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {categories.map((kat) => {
                            const style = getCategoryStyle(kat.nama_kategori);
                            const Icon = style.icon;
                            return (
                                <Link
                                    key={kat.id}
                                    href={`/user/katalog?kategori_id=${kat.id}`}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shrink-0 bg-white hover:border-[#D84040] shadow-2xs`}
                                >
                                    <span className={`p-1 rounded-lg ${style.badge}`}>
                                        <Icon size={14} />
                                    </span>
                                    <span className="text-[#1D1616]">{kat.nama_kategori}</span>
                                    <span className="text-[10px] text-[#8C93A0] font-normal">
                                        ({kat.total_barang})
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* 5. Available Equipment Grid */}
                <div className="space-y-2.5">
                    {/* Notice: Scan QR Requirement */}
                    <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3 flex items-start gap-2.5 shadow-2xs">
                        <div className="w-8 h-8 rounded-xl bg-[#D84040] text-white flex items-center justify-center shrink-0">
                            <Scan size={16} />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-[#8E1616]">
                                Akses Peminjaman Wajib Scan QR Code
                            </h4>
                            <p className="text-[11px] text-[#1D1616]/80 mt-0.5 leading-snug">
                                Untuk meminjam alat, temukan unit fisik di workshop lalu pindai stiker QR Code yang tertempel pada alat.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1 pt-1">
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#6B7280]">
                            Alat Siap Dipinjam
                        </h3>
                        <Link
                            href="/user/katalog"
                            className="text-[11px] font-bold text-[#D84040] hover:underline flex items-center gap-0.5"
                        >
                            Katalog <ChevronRight size={13} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {availableItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white border border-[#E0E0E0] rounded-2xl p-3 shadow-2xs flex flex-col justify-between hover:border-[#D84040] transition-colors"
                            >
                                <div>
                                    {/* Image or Icon */}
                                    <div className="h-28 rounded-xl bg-[#F8F9FA] border border-[#E0E0E0] mb-2.5 overflow-hidden flex items-center justify-center relative">
                                        {item.gambar_url ? (
                                            <img
                                                src={item.gambar_url}
                                                alt={item.nama_barang}
                                                className="w-full h-full object-contain p-2"
                                            />
                                        ) : (
                                            <div className="text-[#8C93A0] flex flex-col items-center gap-1">
                                                <Package size={28} />
                                                <span className="text-[9px] font-mono">WAMS UNIT</span>
                                            </div>
                                        )}

                                        {/* Availability Badge */}
                                        <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            {item.available_units} Tersedia
                                        </span>
                                    </div>

                                    <span className="text-[10px] font-extrabold uppercase text-[#D84040] tracking-wider block">
                                        {item.kategori}
                                    </span>
                                    <h4 className="text-xs font-black text-[#1D1616] line-clamp-2 mt-0.5 mb-1.5 leading-snug">
                                        {item.nama_barang}
                                    </h4>
                                </div>

                                <Link
                                    href={`/user/scanner?target=${encodeURIComponent(item.nama_barang)}`}
                                    className="w-full py-2 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                >
                                    <Scan size={13} />
                                    <span>Scan QR Unit</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </UserMobileLayout>
    );
}
