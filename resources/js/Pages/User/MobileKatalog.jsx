import React, { useState, useMemo, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import UserMobileLayout from '@/Layouts/UserMobileLayout';
import axios from 'axios';
import {
    Search,
    Wrench,
    Zap,
    Cpu,
    Box,
    Boxes,
    X,
    SlidersHorizontal,
    QrCode,
    MinusCircle,
    Plus,
    Minus,
    Package,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    ChevronRight
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

    // Sinkronkan state saat props filters berubah (misal dari scanner redirect)
    useEffect(() => {
        if (filters.kategori_id) {
            setSelectedCategoryId(Number(filters.kategori_id));
        } else {
            setSelectedCategoryId(null);
        }
        if (filters.mode === 'category_list' && Boolean(filters.kategori_id)) {
            setIsCategoryListMode(true);
        } else if (filters.mode !== 'category_list') {
            setIsCategoryListMode(false);
        }
        if (filters.q !== undefined) {
            setSearchQuery(filters.q || '');
        }
    }, [filters.kategori_id, filters.mode, filters.q]);

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

    // Urutan & Tema 4 Card Stacked Katalog (Perkakas -> Elektronik -> Komponen -> Semua)
    const getCategoryCardConfig = (name) => {
        const lower = (name || '').toLowerCase();
        if (lower.includes('perkakas') || lower.includes('tangan')) {
            return {
                order: 1,
                icon: Wrench,
                bgColor: '#DC2626',
                borderColor: '#DC2626',
                shadow: '0 2px 8px rgba(220,38,38,0.2)',
            };
        }
        if (lower.includes('elektronik') || lower.includes('listrik') || lower.includes('ukur')) {
            return {
                order: 2,
                icon: Zap,
                bgColor: '#D97706',
                borderColor: '#D97706',
                shadow: '0 2px 8px rgba(217,119,6,0.2)',
            };
        }
        if (lower.includes('komponen') || lower.includes('chip') || lower.includes('board') || lower.includes('habis')) {
            return {
                order: 3,
                icon: Cpu,
                bgColor: '#059669',
                borderColor: '#059669',
                shadow: '0 2px 8px rgba(5,150,105,0.2)',
            };
        }
        return {
            order: 4,
            icon: Boxes,
            bgColor: '#64748B',
            borderColor: '#64748B',
            shadow: '0 2px 8px rgba(100,116,139,0.2)',
        };
    };

    const sortedCategories = useMemo(() => {
        return [...categories].sort(
            (a, b) => getCategoryCardConfig(a.nama_kategori).order - getCategoryCardConfig(b.nama_kategori).order
        );
    }, [categories]);

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

    // Helper render 2-column product grid (shared between Category/Semua List & Search)
    const renderProductGrid = (items) => (
        <div className="grid grid-cols-2 gap-3 pt-1">
            {items.map((item) => {
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
    );

    // =========================================================================
    // MODE 1: BARANG KATEGORI / SEMUA BARANG SCREEN
    // =========================================================================
    if (isCategoryListMode) {
        const activeCategory = selectedCategoryId
            ? categories.find((c) => Number(c.id) === Number(selectedCategoryId))
            : null;
        const categoryName = activeCategory?.nama_kategori || 'Semua Barang';
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
                    setFilterAvailableOnly(false);
                    setSearchQuery('');
                    if (filters.mode === 'category_list') {
                        if (typeof window !== 'undefined' && window.history.length > 2) {
                            window.history.back();
                        } else {
                            router.visit('/user/katalog');
                        }
                    }
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
                                placeholder={`Cari ${categoryName.toLowerCase()}...`}
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

                    {/* Items Grid */}
                    {filteredItems.length === 0 ? (
                        <div className="py-16 text-center text-[13px] text-[#64748B]">
                            Tidak ada barang ditemukan.
                        </div>
                    ) : (
                        renderProductGrid(filteredItems)
                    )}
                </div>

                {/* Bottom Summary Progress Bar */}
                {filteredItems.length > 0 && (
                    <div className="sticky bottom-0 left-0 right-0 z-20 mt-4">
                        <div className="w-full bg-white border-t border-[#E2E8F0] p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
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
    // MODE 2: MAIN KATALOG SCREEN (4 STACKED CATEGORY CARDS)
    // =========================================================================
    const totalAllUnits = sortedCategories.reduce((sum, k) => sum + (k.total_unit ?? 0), 0);
    const totalAllAvailable = sortedCategories.reduce((sum, k) => sum + (k.tersedia ?? 0), 0);
    const totalAllMaintenance = sortedCategories.reduce((sum, k) => sum + (k.maintenance ?? 0), 0);

    const stackedCards = [
        ...sortedCategories.map((kat) => ({
            id: kat.id,
            title: kat.nama_kategori,
            totalAda: kat.total_unit ?? 0,
            tersedia: kat.tersedia ?? 0,
            maintenance: kat.maintenance ?? 0,
            theme: getCategoryCardConfig(kat.nama_kategori),
        })),
        {
            id: null,
            title: 'Semua',
            totalAda: totalAllUnits,
            tersedia: totalAllAvailable,
            maintenance: totalAllMaintenance,
            theme: getCategoryCardConfig('semua'),
        },
    ];

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

            <div className="space-y-3.5">
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

                {/* 2. SEARCH RESULTS OR 4 STACKED CATEGORY CARDS */}
                {searchQuery.trim() !== '' ? (
                    filteredItems.length === 0 ? (
                        <div className="py-14 px-6 text-center">
                            <Package size={48} className="text-[#CBD5E1] mx-auto mb-3" />
                            <p className="text-[13px] font-semibold text-[#64748B]">
                                {`Tidak ada alat dengan kata kunci "${searchQuery}"`}
                            </p>
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#DC2626] hover:underline cursor-pointer"
                            >
                                <RefreshCw size={15} />
                                <span>Reset Pencarian</span>
                            </button>
                        </div>
                    ) : (
                        renderProductGrid(filteredItems)
                    )
                ) : (
                    <div className="flex flex-col gap-3 pt-0.5">
                        {stackedCards.map((card) => {
                            const Icon = card.theme.icon;
                            return (
                                <button
                                    key={card.id ?? 'semua'}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategoryId(card.id);
                                        setFilterAvailableOnly(false);
                                        setIsCategoryListMode(true);
                                    }}
                                    style={{
                                        backgroundColor: card.theme.bgColor,
                                        borderColor: card.theme.borderColor,
                                        boxShadow: card.theme.shadow,
                                    }}
                                    className="w-full text-left rounded-[14px] border-[1.2px] p-4 transition-all hover:brightness-95 active:scale-[0.99] cursor-pointer"
                                >
                                    {/* Top Row: Icon + Category Title + Arrow */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-11 h-11 rounded-[10px] bg-white/20 border border-white/25 shadow-[0_2px_4px_rgba(0,0,0,0.1)] flex items-center justify-center shrink-0 text-white">
                                                <Icon size={21} className="text-white" />
                                            </div>
                                            <h3 className="text-[16px] font-black text-white tracking-[-0.2px] truncate">
                                                {card.title}
                                            </h3>
                                        </div>
                                        <ChevronRight size={20} className="text-white/85 shrink-0" />
                                    </div>

                                    {/* Bottom Row: Ada | Tersedia | Maintenance (tanpa inner card) */}
                                    <div className="mt-3 pt-2.5 border-t border-white/20 grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <span className="block text-[17px] font-black text-white leading-none">
                                                {card.totalAda}
                                            </span>
                                            <span className="mt-1 block text-[11px] font-bold text-white/90">
                                                Ada
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[17px] font-black text-white leading-none">
                                                {card.tersedia}
                                            </span>
                                            <span className="mt-1 block text-[11px] font-bold text-white/90">
                                                Tersedia
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[17px] font-black text-white leading-none">
                                                {card.maintenance}
                                            </span>
                                            <span className="mt-1 block text-[11px] font-bold text-white/90">
                                                Maintenance
                                            </span>
                                        </div>
                                    </div>
                                </button>
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
