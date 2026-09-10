import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
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
    SlidersHorizontal
} from 'lucide-react';

export default function MobileKatalog({
    barangs = [],
    categories = [],
    filters = { kategori_id: '', q: '' }
}) {
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.kategori_id || '');
    const [selectedItemForBorrow, setSelectedItemForBorrow] = useState(null);
    const [borrowDurationPreset, setBorrowDurationPreset] = useState(120); // 2 jam

    // Form Peminjaman
    const { data, setData, post, processing, errors, reset } = useForm({
        barang_id: '',
        barang_unit_id: '',
        keperluan: '',
        batas_kembali: '',
    });

    const calculateDeadline = (minutes) => {
        const d = new Date(Date.now() + minutes * 60 * 1000);
        return d.toISOString().slice(0, 16);
    };

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

    const handleOpenBorrowModal = (item) => {
        setSelectedItemForBorrow(item);
        const firstUnitId = item.available_unit_list?.[0]?.id || '';
        setData({
            barang_id: item.id,
            barang_unit_id: firstUnitId,
            keperluan: 'Pekerjaan / Praktikum Workshop',
            batas_kembali: calculateDeadline(borrowDurationPreset),
        });
    };

    const handlePresetChange = (minutes) => {
        setBorrowDurationPreset(minutes);
        setData('batas_kembali', calculateDeadline(minutes));
    };

    const handleSubmitBorrow = (e) => {
        e.preventDefault();
        post('/user/pinjam', {
            onSuccess: () => {
                setSelectedItemForBorrow(null);
                reset();
            },
        });
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
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs ${
                            selectedCategory === ''
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
                                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs ${
                                    isSelected
                                        ? 'bg-[#D84040] text-white border-[#D84040]'
                                        : 'bg-white text-[#1D1616] border-[#E0E0E0] hover:border-[#D84040]'
                                }`}
                            >
                                {kat.nama_kategori}
                            </button>
                        );
                    })}
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
                                            <span
                                                className={`absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                                                    isAvailable
                                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                                        : 'bg-rose-100 text-rose-800 border-rose-200'
                                                }`}
                                            >
                                                {isAvailable ? `${item.available_units} Tersedia` : 'Habis'}
                                            </span>
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

                                    {/* Action Button */}
                                    <button
                                        type="button"
                                        disabled={!isAvailable}
                                        onClick={() => handleOpenBorrowModal(item)}
                                        className={`w-full py-2 text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1 ${
                                            isAvailable
                                                ? 'bg-[#D84040] hover:bg-[#8E1616] text-white cursor-pointer'
                                                : 'bg-[#EEEEEE] text-[#8C93A0] cursor-not-allowed'
                                        }`}
                                    >
                                        <span>{isAvailable ? 'Pinjam Alat' : 'Tidak Tersedia'}</span>
                                        {isAvailable && <ArrowRight size={12} />}
                                    </button>
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

            {/* Quick Borrow Modal / Bottom Sheet */}
            {selectedItemForBorrow && (
                <div className="fixed inset-0 z-50 bg-[#1D1616]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-[440px] bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#E0E0E0] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0] mb-4">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#D84040]">
                                    Peminjaman Alat
                                </span>
                                <h3 className="text-base font-black text-[#1D1616] line-clamp-1">
                                    {selectedItemForBorrow.nama_barang}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedItemForBorrow(null)}
                                className="w-8 h-8 rounded-full bg-[#EEEEEE] hover:bg-[#E0E0E0] text-[#6B7280] flex items-center justify-center cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Approval Notice if applicable */}
                        {selectedItemForBorrow.perlu_persetujuan && (
                            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                                <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">Memerlukan Persetujuan Admin</p>
                                    <p className="text-[11px] text-amber-700">
                                        Alat ini perlu disetujui langsung oleh Admin sebelum dapat diambil.
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmitBorrow} className="space-y-3.5">
                            {/* Available Unit Selector */}
                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1">
                                    Pilih Unit Fisik Tersedia
                                </label>
                                <select
                                    value={data.barang_unit_id}
                                    onChange={(e) => setData('barang_unit_id', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl text-xs font-mono text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                    required
                                >
                                    {(selectedItemForBorrow.available_unit_list || []).map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.kode_unit} ({u.kondisi === 'baik' ? 'Kondisi Baik' : u.kondisi})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Keperluan */}
                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1">
                                    Keperluan Peminjaman
                                </label>
                                <input
                                    type="text"
                                    value={data.keperluan}
                                    onChange={(e) => setData('keperluan', e.target.value)}
                                    placeholder="Contoh: Praktikum Kelistrikan / Uji Komponen"
                                    required
                                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                />
                                {errors.keperluan && (
                                    <p className="text-rose-600 text-[10px] mt-1 font-medium">{errors.keperluan}</p>
                                )}
                            </div>

                            {/* Durasi Peminjaman Preset */}
                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                    Pilihan Durasi Peminjaman
                                </label>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {[
                                        { label: '2 Jam', min: 120 },
                                        { label: '4 Jam', min: 240 },
                                        { label: '1 Hari', min: 1440 },
                                        { label: '3 Hari', min: 4320 },
                                    ].map((preset) => (
                                        <button
                                            key={preset.min}
                                            type="button"
                                            onClick={() => handlePresetChange(preset.min)}
                                            className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                                borrowDurationPreset === preset.min
                                                    ? 'bg-[#D84040] text-white border-[#D84040] shadow-xs'
                                                    : 'bg-[#F8F9FA] text-[#1D1616] border-[#E0E0E0] hover:border-[#D84040]'
                                            }`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Batas Tanggal & Waktu Pengembalian */}
                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1">
                                    Batas Pengembalian (Waktu Maksimal)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.batas_kembali}
                                    onChange={(e) => {
                                        setData('batas_kembali', e.target.value);
                                        setBorrowDurationPreset(0);
                                    }}
                                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                    required
                                />
                                {errors.batas_kembali && (
                                    <p className="text-rose-600 text-[10px] mt-1 font-medium">{errors.batas_kembali}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#D84040]/30 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? 'Memproses...' : 'Konfirmasi Peminjaman'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </UserMobileLayout>
    );
}
