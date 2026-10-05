import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import UserMobileLayout from '@/Layouts/UserMobileLayout';
import {
    Search,
    Wrench,
    Cpu,
    Layers,
    Package,
    ArrowRight,
    X,
    Filter,
    CheckCircle2,
    ShieldAlert,
    AlertCircle,
    SlidersHorizontal,
    Scan
} from 'lucide-react';

export default function MobileKatalog({
    barangs = [],
    categories = [],
    filters = { kategori_id: '', q: '' }
}) {
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.kategori_id || '');

    const handleCategoryClick = (catId) => {
        const newCat = selectedCategory === String(catId) ? '' : String(catId);
        setSelectedCategory(newCat);
        router.visit(
            `/user/katalog?kategori_id=${newCat}&q=${encodeURIComponent(searchQuery)}`,
            { preserveState: true }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.visit(
            `/user/katalog?kategori_id=${selectedCategory}&q=${encodeURIComponent(searchQuery)}`,
            { preserveState: true }
        );
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
                badge: 'bg-amber-50 text-amber-700 border-amber-200',
                activeBg: 'bg-amber-500 text-white',
            };
        }
        return {
            icon: Layers,
            badge: 'bg-emerald-50 text-emerald-600 border-emerald-200',
            activeBg: 'bg-emerald-600 text-white',
        };
    };

    return (
        <UserMobileLayout title="Katalog Peralatan" showBackButton onBack={() => router.visit('/user/dashboard')}>
            <Head title="Katalog Alat - WAMS Mobile" />

            <div className="space-y-4">
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                    <Search size={16} className="absolute left-3.5 text-[#8C93A0]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama atau kode alat..."
                        className="w-full pl-9 pr-20 py-2.5 bg-white border border-[#E0E0E0] rounded-2xl text-xs text-[#1D1616] placeholder-[#8C93A0] focus:outline-none focus:border-[#D84040] shadow-2xs font-medium"
                    />
                    <button
                        type="submit"
                        className="absolute right-1.5 px-3.5 py-1.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-[11px] font-bold rounded-xl transition-colors cursor-pointer"
                    >
                        Cari
                    </button>
                </form>

                {/* Horizontal Category Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <button
                        type="button"
                        onClick={() => handleCategoryClick('')}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs ${selectedCategory === ''
                                ? 'bg-[#D84040] text-white border-[#D84040]'
                                : 'bg-white text-[#1D1616] border-[#E0E0E0] hover:border-[#D84040]'
                            }`}
                    >
                        Semua ({barangs.length})
                    </button>

                    {categories.map((kat) => {
                        const style = getCategoryStyle(kat.nama_kategori);
                        const isSelected = selectedCategory === String(kat.id);
                        return (
                            <button
                                key={kat.id}
                                type="button"
                                onClick={() => handleCategoryClick(kat.id)}
                                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs ${isSelected
                                        ? 'bg-[#D84040] text-white border-[#D84040]'
                                        : 'bg-white text-[#1D1616] border-[#E0E0E0] hover:border-[#D84040]'
                                    }`}
                            >
                                {kat.nama_kategori}
                            </button>
                        );
                    })}
                </div>

                {/* QR Scan Requirement Notice */}
                <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3 flex items-start gap-2.5 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-[#D84040] text-white flex items-center justify-center shrink-0">
                        <Scan size={16} />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-[#8E1616]">
                            Peminjaman Wajib Scan QR Code
                        </h4>
                        <p className="text-[11px] text-[#1D1616]/80 mt-0.5 leading-snug">
                            Pilih alat yang Anda butuhkan, lalu klik <strong>Scan QR Unit</strong> dan arahkan kamera ke stiker QR fisik unit di workshop.
                        </p>
                    </div>
                </div>

                {/* Equipment List / Grid */}
                {barangs.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {barangs.map((item) => {
                            const isAvailable = item.available_units > 0;
                            return (
                                <div
                                    key={item.id}
                                    className="bg-white border border-[#E0E0E0] rounded-2xl p-3 shadow-2xs flex flex-col justify-between hover:border-[#D84040] transition-colors"
                                >
                                    <div>
                                        {/* Image Container */}
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
                                                    <span className="text-[9px] font-mono">WAMS</span>
                                                </div>
                                            )}

                                            {/* Stock Availability Pill */}
                                            {item.is_habis_pakai ? (
                                                <span
                                                    className={`absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${item.stok_saat_ini > 0
                                                            ? item.is_low_stock
                                                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                                                : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                                            : 'bg-rose-100 text-rose-800 border-rose-200'
                                                        }`}
                                                >
                                                    {item.stok_saat_ini > 0 ? `Stok: ${item.stok_saat_ini} ${item.satuan || ''}` : 'Stok Habis'}
                                                </span>
                                            ) : (
                                                <span
                                                    className={`absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${isAvailable
                                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                                            : 'bg-rose-100 text-rose-800 border-rose-200'
                                                        }`}
                                                >
                                                    {isAvailable ? `${item.available_units} Tersedia` : 'Habis'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] font-extrabold uppercase text-[#D84040] tracking-wider">
                                                {item.kategori}
                                            </span>
                                            <span className="text-[9px] font-mono text-[#8C93A0]">
                                                {item.kode_barang}
                                            </span>
                                        </div>

                                        <h4 className="text-xs font-black text-[#1D1616] line-clamp-2 leading-snug mb-1">
                                            {item.nama_barang}
                                        </h4>

                                        {item.deskripsi && (
                                            <p className="text-[10px] text-[#6B7280] line-clamp-1 mb-2">
                                                {item.deskripsi}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Button: Scan QR for loan assets, or badge for consumables */}
                                    {item.is_habis_pakai ? (
                                        <div className="w-full py-2 bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold rounded-xl text-center flex items-center justify-center gap-1">
                                            <Package size={12} className="text-amber-600" />
                                            <span>Bahan Praktikum</span>
                                        </div>
                                    ) : isAvailable ? (
                                        <Link
                                            href={`/user/scanner?target=${encodeURIComponent(item.nama_barang)}`}
                                            className="w-full py-2 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                        >
                                            <Scan size={13} />
                                            <span>Scan QR Unit</span>
                                        </Link>
                                    ) : (
                                        <div className="w-full py-2 bg-[#EEEEEE] text-[#8C93A0] text-xs font-bold rounded-xl text-center">
                                            Unit Habis
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl p-8 text-center shadow-2xs">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#D84040] mx-auto flex items-center justify-center mb-3">
                            <Package size={24} />
                        </div>
                        <h4 className="font-bold text-sm text-[#1D1616]">
                            Peralatan Tidak Ditemukan
                        </h4>
                        <p className="text-xs text-[#6B7280] mt-1 mb-4">
                            Tidak ada alat workshop yang cocok dengan kata kunci "{searchQuery}".
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('');
                                router.visit('/user/katalog');
                            }}
                            className="px-4 py-2 bg-[#EEEEEE] hover:bg-[#E0E0E0] text-[#1D1616] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                            Reset Filter Pencarian
                        </button>
                    </div>
                )}
            </div>
        </UserMobileLayout>
    );
}
