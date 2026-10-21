import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import UserMobileLayout from '@/Layouts/UserMobileLayout';
import axios from 'axios';
import {
    Search,
    Wrench,
    Zap,
    Cpu,
    Box,
    X,
    SlidersHorizontal,
    QrCode,
    ChevronRight,
    MinusCircle,
    Plus,
    Minus,
    Package,
    RefreshCw,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

export default function MobileKatalog({
    barangs = [],
    categories = [],
    filters = { kategori_id: '', q: '', mode: '' }
}) {
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [selectedCategoryId, setSelectedCategoryId] = useState(
        filters.kategori_id ? Number(filters.kategori_id) : null
    );
    const [isCategoryListMode, setIsCategoryListMode] = useState(
        filters.mode === 'category_list' && Boolean(filters.kategori_id)
    );
    const [filterAvailableOnly, setFilterAvailableOnly] = useState(false);

    // Bottom Sheet Pakai Bahan (Matching BarangKategoriScreen._showPakaiBahanBottomSheet)
    const [pakaiModalItem, setPakaiModalItem] = useState(null);
    const [pakaiQty, setPakaiQty] = useState('1');
    const [pakaiNote, setPakaiNote] = useState('');
    const [pakaiSubmitting, setPakaiSubmitting] = useState(false);
    const [localToast, setLocalToast] = useState(null);

    const showToast = (type, text) => {
        setLocalToast({ type, text });
        setTimeout(() => setLocalToast(null), 3500);
    };

    // Instant live local filtering matching KategoriScreen.dart
    const filteredItems = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return barangs.filter((item) => {
            if (selectedCategoryId && Number(item.kategori_id) !== Number(selectedCategoryId)) {
                return false;
            }
            if (filterAvailableOnly && !item.is_habis_pakai && item.tersedia <= 0) {
                return false;
            }
            if (!q) return true;
            const nameMatch = (item.nama_barang || '').toLowerCase().includes(q);
            const codeMatch = (item.kode_barang || '').toLowerCase().includes(q);
            const specMatch = (item.detail_spesifikasi || '').toLowerCase().includes(q);
            const katMatch = (item.nama_kategori || '').toLowerCase().includes(q);
            return nameMatch || codeMatch || specMatch || katMatch;
        });
    }, [barangs, selectedCategoryId, searchQuery, filterAvailableOnly]);

    // Dynamic Category Pill Color matching KategoriScreen._getCategoryPillColor
    const getCategoryPillStyle = (name) => {
        const lower = (name || '').toLowerCase();
        if (lower.includes('perkakas') || lower.includes('tangan')) {
            return {
                bg: '#DC2626',
                shadow: '0 2px 8px rgba(220, 38, 38, 0.35)',
                text: '#FFFFFF',
            };
        }
        if (lower.includes('elektronik') || lower.includes('listrik') || lower.includes('ukur')) {
            return {
                bg: '#F59E0B',
                shadow: '0 2px 8px rgba(245, 158, 11, 0.35)',
                text: '#FFFFFF',
            };
        }
        if (lower.includes('komponen') || lower.includes('chip') || lower.includes('board') || lower.includes('habis')) {
            return {
                bg: '#16A34A',
                shadow: '0 2px 8px rgba(22, 163, 74, 0.35)',
                text: '#FFFFFF',
            };
        }
        return {
            bg: '#FFFFFF',
            shadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            text: '#0F172A',
        };
    };

    const getCategoryBadgeColor = (name) => {
        const lower = (name || '').toLowerCase();
        if (lower.includes('perkakas') || lower.includes('tangan')) return '#DC2626';
        if (lower.includes('elektronik') || lower.includes('listrik') || lower.includes('ukur')) return '#D97706';
        if (lower.includes('komponen') || lower.includes('chip') || lower.includes('board') || lower.includes('habis')) return '#16A34A';
        return '#DC2626';
    };

    const openPakaiBottomSheet = (item) => {
        setPakaiModalItem(item);
        setPakaiQty('1');
        setPakaiNote('');
    };

    const handlePakaiSubmit = async (e) => {
        e.preventDefault();
        if (!pakaiModalItem) return;

        const qty = parseFloat(pakaiQty) || 0;
        const sisaStok = pakaiModalItem.stok_saat_ini || 0;
        const satuan = pakaiModalItem.satuan || 'unit';

        if (qty <= 0) {
            showToast('error', 'Jumlah pemakaian harus lebih dari 0');
            return;
        }
        if (qty > sisaStok) {
            showToast('error', `Sisa stok tidak mencukupi (sisa: ${sisaStok} ${satuan})`);
            return;
        }

        setPakaiSubmitting(true);
        try {
            await axios.post('/user/pakai-bahan', {
                barang_id: pakaiModalItem.id,
                jumlah: qty,
                keterangan: pakaiNote.trim() || 'Praktikum Workshop',
            });
            showToast('success', `Berhasil mencatat pemakaian ${qty} ${satuan} ${pakaiModalItem.nama_barang}`);
            setPakaiModalItem(null);
            router.reload({ only: ['barangs', 'categories'] });
        } catch (err) {
            showToast(
                'error',
                err.response?.data?.message || 'Gagal mencatat pemakaian bahan.'
            );
        } finally {
            setPakaiSubmitting(false);
        }
    };

    // =========================================================================
    // MODE 1: BARANG KATEGORI SCREEN (Mirip BarangKategoriScreen.dart)
    // =========================================================================
    if (isCategoryListMode && selectedCategoryId) {
        const activeCategory = categories.find((c) => Number(c.id) === Number(selectedCategoryId));
        const categoryName = activeCategory?.nama_kategori || 'Kategori Peralatan';
        const isHabisPakai = Boolean(activeCategory?.is_habis_pakai);

        let totalUnits = 0;
        let availableUnits = 0;
        filteredItems.forEach((i) => {
            totalUnits += i.total_unit || 0;
            availableUnits += i.tersedia || 0;
        });
        const percent = totalUnits > 0 ? Math.round((availableUnits / totalUnits) * 100) : 0;
        const lowCount = filteredItems.filter((i) => i.is_low_stock).length;

        return (
            <UserMobileLayout
                title={categoryName}
                subtitle={isHabisPakai ? 'Bahan Sekali Pakai • Monitoring Stok' : null}
                showBackButton
                onBack={() => {
                    setIsCategoryListMode(false);
                    setSelectedCategoryId(null);
                    router.visit('/user/dashboard');
                }}
            >
                <Head title={`${categoryName} - WAMS Mobile`} />

                {localToast && (
                    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[380px]">
                        <div
                            className={`p-3 rounded-xl shadow-lg text-white text-xs font-semibold flex items-center gap-2 ${
                                localToast.type === 'success' ? 'bg-[#059669]' : 'bg-[#DC2626]'
                            }`}
                        >
                            {localToast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            <span className="flex-1">{localToast.text}</span>
                        </div>
                    </div>
                )}

                <div className="pb-20 space-y-3">
                    {/* Search Bar + Filter Button */}
                    <div className="flex items-center gap-2.5">
                        <div className="flex-1 relative flex items-center bg-white rounded-[12px] border border-[#E2E8F0]">
                            <Search size={18} className="absolute left-3.5 text-[#64748B]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari perkakas..."
                                className="w-full pl-10 pr-8 py-2.5 bg-transparent text-[13px] text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none font-medium"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setFilterAvailableOnly(!filterAvailableOnly);
                                showToast(
                                    'success',
                                    !filterAvailableOnly
                                        ? 'Filter unit tersedia diaktifkan.'
                                        : 'Menampilkan semua peralatan.'
                                );
                            }}
                            className={`w-[44px] h-[44px] rounded-[12px] border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                filterAvailableOnly
                                    ? 'bg-[#D84040] border-[#D84040] text-white'
                                    : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                            }`}
                            title="Filter Ketersediaan"
                        >
                            <SlidersHorizontal size={18} />
                        </button>
                    </div>

                    {/* Items List */}
                    {filteredItems.length === 0 ? (
                        <div className="py-16 text-center text-[13px] text-[#64748B]">
                            Tidak ada barang ditemukan.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        if (isHabisPakai || item.is_habis_pakai) {
                                            openPakaiBottomSheet(item);
                                        } else {
                                            router.visit(`/user/barang/${item.id}`);
                                        }
                                    }}
                                    className="p-3.5 bg-white rounded-[16px] border border-[#E2E8F0] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-3.5 cursor-pointer hover:border-[#CBD5E1] transition-all active:scale-[0.99]"
                                >
                                    {/* Tool Thumbnail */}
                                    <div className="w-[52px] h-[52px] rounded-[12px] bg-[#F3F4F6] border border-[#E2E8F0] overflow-hidden flex items-center justify-center shrink-0">
                                        {item.gambar_url ? (
                                            <img
                                                src={item.gambar_url}
                                                alt={item.nama_barang}
                                                className="w-full h-full object-contain p-1"
                                            />
                                        ) : (
                                            <Wrench size={26} className="text-[#D84040]" />
                                        )}
                                    </div>

                                    {/* Name & Available Units / Stok */}
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-[14px] font-bold text-[#0F172A] truncate">
                                            {item.nama_barang}
                                        </h4>
                                        <div className="mt-1 flex items-center gap-2">
                                            {isHabisPakai || item.is_habis_pakai ? (
                                                <>
                                                    <span
                                                        className={`text-[12px] font-semibold ${
                                                            item.is_low_stock ? 'text-[#EF4444]' : 'text-[#64748B]'
                                                        }`}
                                                    >
                                                        Stok: {item.stok_saat_ini} {item.satuan || 'Unit'}
                                                    </span>
                                                    {item.is_low_stock && (
                                                        <span className="px-1.5 py-0.5 rounded-[6px] bg-[#FEE2E2] text-[#DC2626] text-[10px] font-bold">
                                                            Menipis
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-[12px] text-[#64748B]">
                                                    {item.total_unit} Unit • {item.tersedia} Tersedia
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Action */}
                                    {isHabisPakai || item.is_habis_pakai ? (
                                        <div className="px-2.5 py-1.5 rounded-[8px] bg-[#D84040]/10 text-[#D84040] flex items-center gap-1 text-[12px] font-bold shrink-0">
                                            <MinusCircle size={14} />
                                            <span>Pakai</span>
                                        </div>
                                    ) : (
                                        <ChevronRight size={20} className="text-[#9CA3AF] shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom Summary Progress Bar (Matching BarangKategoriScreen.dart) */}
                {filteredItems.length > 0 && (
                    <div className="fixed bottom-[66px] left-0 right-0 z-30 pointer-events-none">
                        <div className="max-w-[440px] mx-auto bg-white border-t border-[#E2E8F0] p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] pointer-events-auto">
                            {isHabisPakai ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Package size={18} className="text-[#D84040]" />
                                        <span className="text-[13px] font-bold text-[#0F172A]">
                                            {filteredItems.length} Jenis Bahan Tersedia
                                        </span>
                                    </div>
                                    {lowCount > 0 ? (
                                        <span className="px-2 py-1 rounded-[6px] bg-[#FEE2E2] text-[#DC2626] text-[11px] font-bold">
                                            {lowCount} Perlu Restock
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 rounded-[6px] bg-[#D1FAE5] text-[#059669] text-[11px] font-bold">
                                            Stok Aman
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[12px] font-bold text-[#0F172A]">
                                            {availableUnits} dari {totalUnits} Unit tersedia
                                        </span>
                                        <span className="text-[12px] font-bold text-[#D84040]">
                                            {percent}%
                                        </span>
                                    </div>
                                    <div className="w-full h-[6px] bg-[#E5E7EB] rounded-full overflow-hidden">
                                        <div
                                            style={{ width: `${percent}%` }}
                                            className="h-full bg-[#D84040] rounded-full transition-all duration-300"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Bottom Sheet Pakai Bahan */}
                <PakaiBahanModal
                    item={pakaiModalItem}
                    qty={pakaiQty}
                    setQty={setPakaiQty}
                    note={pakaiNote}
                    setNote={setPakaiNote}
                    submitting={pakaiSubmitting}
                    onClose={() => setPakaiModalItem(null)}
                    onSubmit={handlePakaiSubmit}
                />
            </UserMobileLayout>
        );
    }

    // =========================================================================
    // MODE 2: MAIN KATALOG SCREEN (Mirip KategoriScreen.dart)
    // =========================================================================
    const tabItems = [
        { id: null, nama_kategori: 'Semua' },
        ...categories,
    ];
    const selectedTabIndex = Math.max(
        0,
        tabItems.findIndex((t) =>
            selectedCategoryId === null ? t.id === null : Number(t.id) === Number(selectedCategoryId)
        )
    );
    const activeTabObj = tabItems[selectedTabIndex] || tabItems[0];
    const pillStyle = getCategoryPillStyle(activeTabObj.nama_kategori);

    return (
        <UserMobileLayout title="Katalog" centerTitle>
            <Head title="Katalog - WAMS Mobile" />

            {localToast && (
                <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[380px]">
                    <div
                        className={`p-3 rounded-xl shadow-lg text-white text-xs font-semibold flex items-center gap-2 ${
                            localToast.type === 'success' ? 'bg-[#059669]' : 'bg-[#DC2626]'
                        }`}
                    >
                        {localToast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <span className="flex-1">{localToast.text}</span>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {/* 1. SEARCH BAR WIDGET */}
                <div className="h-[46px] bg-white rounded-[14px] border-[1.1px] border-[#CBD5E1] shadow-[0_2px_6px_rgba(15,23,42,0.04)] relative flex items-center">
                    <Search size={20} className="absolute left-3.5 text-[#64748B]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama alat, spesifikasi, atau kode..."
                        className="w-full pl-11 pr-9 py-2.5 bg-transparent text-[13.5px] font-semibold text-[#0F172A] placeholder-[#94A3B8] placeholder:font-medium focus:outline-none"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* 2. CATEGORY SEGMENTED CONTROL WITH DYNAMIC THEME COLORS */}
                <div className="h-[44px] p-1 bg-[#F1F2F6] rounded-[14px] relative flex items-center select-none">
                    {/* Smooth Sliding Colored Pill Indicator */}
                    <div
                        style={{
                            width: `calc((100% - 8px) / ${tabItems.length})`,
                            transform: `translateX(${selectedTabIndex * 100}%)`,
                            backgroundColor: pillStyle.bg,
                            boxShadow: pillStyle.shadow,
                        }}
                        className="absolute top-1 bottom-1 left-1 rounded-[10px] transition-all duration-260 ease-in-out"
                    />

                    {/* Tab Text Buttons */}
                    {tabItems.map((tab, idx) => {
                        const isSelected = idx === selectedTabIndex;
                        const textColor = isSelected ? pillStyle.text : '#64748B';
                        return (
                            <button
                                key={tab.id ?? 'semua'}
                                type="button"
                                onClick={() => setSelectedCategoryId(tab.id)}
                                style={{ color: textColor }}
                                className={`relative z-10 flex-1 h-full flex items-center justify-center text-[13px] truncate px-1 transition-colors duration-200 cursor-pointer ${
                                    isSelected ? 'font-black' : 'font-semibold'
                                }`}
                            >
                                <span className="truncate">{tab.nama_kategori}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 3. MAIN PRODUCT GRID (2 COLUMNS matching KategoriScreen.dart) */}
                {filteredItems.length === 0 ? (
                    <div className="py-14 px-6 text-center">
                        <Package size={48} className="text-[#CBD5E1] mx-auto mb-3" />
                        <p className="text-[13px] font-semibold text-[#64748B]">
                            {searchQuery
                                ? `Tidak ada alat dengan kata kunci "${searchQuery}"`
                                : 'Tidak ada alat pada kategori ini.'}
                        </p>
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#DC2626] hover:underline cursor-pointer"
                            >
                                <RefreshCw size={15} />
                                <span>Reset Pencarian</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                        {filteredItems.map((item) => {
                            const categoryName = (item.nama_kategori || 'PERALATAN').toUpperCase();
                            const itemCode = item.kode_barang || 'WMS';
                            const badgeColor = getCategoryBadgeColor(item.nama_kategori || '');

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        if (item.is_habis_pakai) {
                                            openPakaiBottomSheet(item);
                                        } else {
                                            router.visit(`/user/barang/${item.id}`);
                                        }
                                    }}
                                    className="bg-white rounded-[16px] border-[1.2px] border-[#E2E8F0] p-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] flex flex-col justify-between h-[244px] cursor-pointer hover:border-[#CBD5E1] transition-all active:scale-[0.99]"
                                >
                                    <div>
                                        {/* 1. Image Container (With [ X Tersedia ] badge) */}
                                        <div className="w-full h-[120px] bg-[#F1F5F9] rounded-[12px] overflow-hidden relative flex items-center justify-center">
                                            {item.gambar_url ? (
                                                <img
                                                    src={item.gambar_url}
                                                    alt={item.nama_barang}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-[#64748B]">
                                                    <Box size={40} strokeWidth={1.6} />
                                                    <span className="mt-0.5 text-[9px] font-extrabold text-[#94A3B8] tracking-[0.8px]">
                                                        WAMS
                                                    </span>
                                                </div>
                                            )}

                                            {/* Top-Right: [ X Tersedia ] */}
                                            <span className="absolute top-[7px] right-[7px] px-[7px] py-[3px] rounded-full bg-[#DCFCE7]/95 border border-[#A7F3D0] shadow-[0_1px_4px_rgba(0,0,0,0.06)] text-[9.5px] font-extrabold text-[#047857]">
                                                {item.is_habis_pakai
                                                    ? `${item.stok_saat_ini} ${item.satuan || 'pcs'}`
                                                    : `${item.tersedia} Tersedia`}
                                            </span>
                                        </div>

                                        {/* 2. Category & Code Row */}
                                        <div className="mt-[7px] flex items-center justify-between gap-1">
                                            <span
                                                style={{ color: badgeColor }}
                                                className="text-[9.5px] font-black tracking-[0.5px] truncate"
                                            >
                                                {categoryName}
                                            </span>
                                            <span className="text-[9.5px] font-bold text-[#94A3B8] shrink-0">
                                                {itemCode}
                                            </span>
                                        </div>

                                        {/* 3. Tool Name */}
                                        <h4 className="mt-[3px] h-[32px] text-[12.5px] font-extrabold text-[#0F172A] leading-[1.25] line-clamp-2">
                                            {item.nama_barang}
                                        </h4>
                                    </div>

                                    {/* 4. Crimson Button: [ Scan QR Unit ] */}
                                    {item.is_habis_pakai ? (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openPakaiBottomSheet(item);
                                            }}
                                            className="w-full h-[34px] bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-[9px] flex items-center justify-center gap-1.5 text-[11px] font-extrabold transition-colors cursor-pointer"
                                        >
                                            <MinusCircle size={14} />
                                            <span>Pakai Bahan</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.visit(
                                                    `/user/scanner?target=${encodeURIComponent(item.nama_barang)}`
                                                );
                                            }}
                                            className="w-full h-[34px] bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-[9px] flex items-center justify-center gap-1.5 text-[11px] font-extrabold transition-colors cursor-pointer"
                                        >
                                            <QrCode size={14} />
                                            <span>Scan QR Unit</span>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom Sheet Pakai Bahan */}
            <PakaiBahanModal
                item={pakaiModalItem}
                qty={pakaiQty}
                setQty={setPakaiQty}
                note={pakaiNote}
                setNote={setPakaiNote}
                submitting={pakaiSubmitting}
                onClose={() => setPakaiModalItem(null)}
                onSubmit={handlePakaiSubmit}
            />
        </UserMobileLayout>
    );
}

/**
 * Bottom Sheet Modal Pakai Bahan (Mirip BarangKategoriScreen._showPakaiBahanBottomSheet)
 */
function PakaiBahanModal({ item, qty, setQty, note, setNote, submitting, onClose, onSubmit }) {
    if (!item) return null;

    const sisaStok = item.stok_saat_ini || 0;
    const satuan = item.satuan || 'unit';

    const handleDecrement = () => {
        const cur = parseFloat(qty) || 1;
        if (cur > 1) {
            setQty(String(cur - 1));
        }
    };

    const handleIncrement = () => {
        const cur = parseFloat(qty) || 0;
        if (cur < sisaStok) {
            setQty(String(cur + 1));
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-150">
            <div className="w-full max-w-[440px] bg-white rounded-t-[24px] p-5 pb-7 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
                {/* Handle Bar */}
                <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

                {/* Item Header */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[10px] bg-[#F3F4F6] border border-[#E2E8F0] flex items-center justify-center overflow-hidden shrink-0">
                        {item.gambar_url ? (
                            <img
                                src={item.gambar_url}
                                alt={item.nama_barang}
                                className="w-full h-full object-contain p-1"
                            />
                        ) : (
                            <Cpu size={24} className="text-[#D84040]" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="text-[15px] font-bold text-[#0F172A] truncate">
                            {item.nama_barang}
                        </h4>
                        <p
                            className={`text-[12px] mt-0.5 ${
                                item.is_low_stock ? 'text-red-700 font-bold' : 'text-[#64748B]'
                            }`}
                        >
                            Sisa Stok Saat Ini: {sisaStok} {satuan}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 text-[#64748B] flex items-center justify-center cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="mt-5 space-y-4">
                    <div>
                        <label className="block text-[13px] font-bold text-[#0F172A] mb-2">
                            Jumlah Diambil / Digunakan ({satuan})
                        </label>
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handleDecrement}
                                className="w-11 h-11 rounded-xl bg-rose-50 text-[#D84040] flex items-center justify-center hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                                <Minus size={18} />
                            </button>
                            <input
                                type="number"
                                step="any"
                                value={qty}
                                onChange={(e) => setQty(e.target.value)}
                                className="flex-1 h-11 border border-[#E2E8F0] rounded-[12px] text-center text-[18px] font-bold text-[#0F172A] focus:outline-none focus:border-[#D84040]"
                            />
                            <button
                                type="button"
                                onClick={handleIncrement}
                                className="w-11 h-11 rounded-xl bg-rose-50 text-[#D84040] flex items-center justify-center hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[13px] font-bold text-[#0F172A] mb-2">
                            Keperluan Praktikum / Catatan
                        </label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Contoh: Praktik Pengelasan Modul 3"
                            className="w-full px-3.5 py-3 border border-[#E2E8F0] rounded-[12px] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#D84040]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-[48px] bg-[#D84040] hover:bg-[#8E1616] text-white rounded-[14px] text-[14px] font-bold transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {submitting ? 'Memproses...' : 'Catat Pengambilan'}
                    </button>
                </form>
            </div>
        </div>
    );
}
