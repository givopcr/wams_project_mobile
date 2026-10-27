import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    Clock,
    User,
    Calendar,
    Tag,
    Layers,
    CheckCircle2,
    AlertTriangle,
    Image as ImageIcon,
    ZoomIn,
    FileText,
    ShieldCheck
} from 'lucide-react';

export default function UnitHistoryModal({ isOpen, onClose, unitId, initialUnit = null }) {
    const [loading, setLoading] = useState(false);
    const [unitInfo, setUnitInfo] = useState(initialUnit);
    const [historyList, setHistoryList] = useState([]);
    const [zoomedImage, setZoomedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 5;
    const bodyScrollRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !unitId) return;

        setLoading(true);
        setCurrentPage(1);
        if (initialUnit) setUnitInfo(initialUnit);

        fetch(`/admin/unit/${unitId}/history`)
            .then((res) => {
                if (!res.ok) throw new Error('Gagal memuat riwayat unit.');
                return res.json();
            })
            .then((data) => {
                if (data.unit) setUnitInfo(data.unit);
                setHistoryList(data.history || []);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [isOpen, unitId]);

    const totalItems = historyList.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const from = totalItems > 0 ? (currentPage - 1) * perPage + 1 : 0;
    const to = Math.min(currentPage * perPage, totalItems);
    const paginatedHistory = historyList.slice((currentPage - 1) * perPage, currentPage * perPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        if (bodyScrollRef.current) {
            bodyScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getPaginationPages = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push('...');
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }
        return pages;
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F172A]/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-page-enter">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-[#E0E0E0] bg-[#FDFDFC] flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        {unitInfo?.gambar_url ? (
                            <img
                                src={unitInfo.gambar_url}
                                alt={unitInfo.kode_unit || 'Unit'}
                                className="w-12 h-12 rounded-xl border border-[#E0E0E0] object-cover shrink-0"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-100 border border-[#E0E0E0] flex items-center justify-center text-gray-400 shrink-0">
                                <Layers size={22} />
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-extrabold text-[#1D1616] truncate">
                                    Riwayat Unit: {unitInfo?.kode_unit || 'Memuat...'}
                                </h3>
                                {unitInfo?.nama_kategori && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 border border-gray-200 text-gray-700">
                                        {unitInfo.nama_kategori}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-[#6B7280] truncate mt-0.5">
                                Master Barang: <span className="font-bold text-[#1D1616]">{unitInfo?.nama_barang || '-'}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                            <Clock size={13} />
                            {historyList.length}x Dipinjam
                        </span>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Tutup"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Sub-bar on mobile */}
                <div className="sm:hidden px-4 py-2 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between text-xs font-bold text-blue-700">
                    <span>Total Siklus Peminjaman:</span>
                    <span>{historyList.length}x Dipinjam</span>
                </div>

                {/* Body Content / Timeline */}
                <div ref={bodyScrollRef} className="overflow-y-auto flex-1 p-4 sm:p-6 bg-white space-y-6">
                    {loading ? (
                        <div className="space-y-4 py-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="w-32 h-4 rounded shimmer-box" />
                                        <div className="w-20 h-4 rounded shimmer-box" />
                                    </div>
                                    <div className="w-48 h-3 rounded shimmer-box" />
                                    <div className="w-full h-16 rounded-xl shimmer-box" />
                                </div>
                            ))}
                        </div>
                    ) : historyList.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto text-gray-400 mb-3">
                                <Clock size={28} />
                            </div>
                            <h4 className="text-sm font-extrabold text-[#1D1616]">Belum Ada Riwayat Peminjaman</h4>
                            <p className="text-xs text-[#6B7280] max-w-sm mx-auto mt-1">
                                Unit fisik ini belum pernah tercatat dipinjam oleh teknisi maupun tamu di logbook.
                            </p>
                        </div>
                    ) : (
                        <div className="relative pl-6 sm:pl-8 border-l-2 border-gray-200 space-y-6 ml-2 sm:ml-4">
                            {paginatedHistory.map((item, idx) => {
                                const isReturned = item.status_transaksi === 'dikembalikan';
                                const isRusak = item.kondisi_kembali?.toLowerCase() === 'rusak';

                                return (
                                    <div key={item.id} className="relative group">
                                        {/* Dot Indicator */}
                                        <span
                                            className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                                                isReturned
                                                    ? isRusak
                                                        ? 'border-rose-500 text-rose-500'
                                                        : 'border-emerald-500 text-emerald-500'
                                                    : 'border-amber-500 text-amber-500 ring-4 ring-amber-100'
                                            }`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${
                                                    isReturned
                                                        ? isRusak
                                                            ? 'bg-rose-500'
                                                            : 'bg-emerald-500'
                                                        : 'bg-amber-500'
                                                }`}
                                            />
                                        </span>

                                        {/* Card Item */}
                                        <div className="bg-[#FDFDFC] border border-[#E0E0E0] rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3">
                                            {/* Top Row: User & Status Badge */}
                                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 shrink-0">
                                                        {item.peminjam_nama ? item.peminjam_nama.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-extrabold text-[#1D1616] text-xs sm:text-sm">
                                                                {item.peminjam_nama}
                                                            </span>
                                                            {item.tipe_peminjam === 'guest' && (
                                                                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-purple-100 text-purple-700">
                                                                    Tamu
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] text-[#6B7280]">
                                                            {item.peminjam_email}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div>
                                                    {isReturned ? (
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold ${
                                                                isRusak
                                                                    ? 'bg-rose-50 border border-rose-200 text-rose-700'
                                                                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                                            }`}
                                                        >
                                                            {isRusak ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                                                            Selesai ({isRusak ? 'Kondisi Rusak' : 'Kondisi Baik'})
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-50 border border-amber-200 text-amber-700 animate-pulse">
                                                            <Clock size={12} />
                                                            Sedang Dipinjam
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Time & Duration Info */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                                                <div>
                                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Tanggal Pinjam:</span>
                                                    <span className="font-semibold text-gray-800">{item.tanggal_pinjam}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Tanggal Kembali:</span>
                                                    <span className="font-semibold text-gray-800">
                                                        {item.tanggal_kembali || (
                                                            <span className="text-amber-600 font-bold">Belum dikembalikan (Batas: {item.batas_kembali || '-'})</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Notes / Keperluan */}
                                            {item.keperluan && item.keperluan !== '-' && (
                                                <div className="text-xs text-[#1D1616]">
                                                    <span className="text-[#6B7280] font-semibold">Keperluan: </span>
                                                    <span className="italic">"{item.keperluan}"</span>
                                                </div>
                                            )}

                                            {/* Return Note if any */}
                                            {item.catatan_kembali && (
                                                <div className="text-xs text-gray-700 bg-amber-50/60 border border-amber-200/60 p-2 rounded-lg">
                                                    <span className="font-bold text-amber-800">Catatan Pengembalian: </span>
                                                    {item.catatan_kembali}
                                                </div>
                                            )}

                                            {/* Photos section (Foto Pinjam & Foto Kembali) */}
                                            {(item.foto_pinjam_url || item.foto_kembali_url) && (
                                                <div className="pt-2 border-t border-gray-100">
                                                    <span className="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                        Dokumentasi Serah Terima Barang:
                                                    </span>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {/* Foto Pinjam */}
                                                        <div>
                                                            <span className="text-[10px] font-semibold text-gray-500 block mb-1">
                                                                Foto Saat Dipinjam:
                                                            </span>
                                                            {item.foto_pinjam_url ? (
                                                                <div
                                                                    onClick={() => setZoomedImage({ url: item.foto_pinjam_url, title: `Foto Sebelum Pinjam (${item.peminjam_nama})` })}
                                                                    className="relative group h-24 rounded-xl border border-gray-200 overflow-hidden cursor-pointer bg-gray-100"
                                                                >
                                                                    <img
                                                                        src={item.foto_pinjam_url}
                                                                        alt="Foto Pinjam"
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold gap-1">
                                                                        <ZoomIn size={14} /> Perbesar
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="h-24 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-[11px] text-gray-400 bg-gray-50">
                                                                    Tanpa foto pinjam
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Foto Kembali */}
                                                        <div>
                                                            <span className="text-[10px] font-semibold text-gray-500 block mb-1">
                                                                Foto Kondisi Selesai Pinjam:
                                                            </span>
                                                            {item.foto_kembali_url ? (
                                                                <div
                                                                    onClick={() => setZoomedImage({ url: item.foto_kembali_url, title: `Foto Selesai Pinjam - Kondisi ${item.kondisi_kembali} (${item.peminjam_nama})` })}
                                                                    className="relative group h-24 rounded-xl border border-gray-200 overflow-hidden cursor-pointer bg-gray-100"
                                                                >
                                                                    <img
                                                                        src={item.foto_kembali_url}
                                                                        alt="Foto Selesai Pinjam"
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold gap-1">
                                                                        <ZoomIn size={14} /> Perbesar
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="h-24 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-[11px] text-gray-400 bg-gray-50">
                                                                    {isReturned ? 'Tanpa foto kembali' : 'Menunggu pengembalian'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination Riwayat - Sama seperti di page barang */}
                {totalPages > 1 && (
                    <div className="p-3 sm:p-4 border-t border-[#E0E0E0] flex flex-col sm:flex-row items-center justify-between gap-3 bg-white shrink-0">
                        <span className="text-xs text-[#6B7280]">
                            Menampilkan <span className="font-bold text-[#1D1616]">{from}</span> sampai{' '}
                            <span className="font-bold text-[#1D1616]">{to}</span> dari{' '}
                            <span className="font-bold text-[#1D1616]">{totalItems}</span> riwayat
                        </span>
                        <div className="flex items-center gap-1 flex-wrap">
                            <button
                                type="button"
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
                                    currentPage === 1
                                        ? 'text-gray-300 pointer-events-none cursor-not-allowed'
                                        : 'text-[#1D1616] hover:bg-[#EEEEEE]'
                                }`}
                            >
                                &laquo; Sebelumnya
                            </button>

                            {getPaginationPages().map((p, idx) => (
                                p === '...' ? (
                                    <span key={`dots-${idx}`} className="px-2 py-1 text-xs text-gray-400 font-bold select-none">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => handlePageChange(p)}
                                        className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
                                            currentPage === p
                                                ? 'bg-[#D84040] text-white'
                                                : 'text-[#1D1616] hover:bg-[#EEEEEE]'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                )
                            ))}

                            <button
                                type="button"
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
                                    currentPage === totalPages
                                        ? 'text-gray-300 pointer-events-none cursor-not-allowed'
                                        : 'text-[#1D1616] hover:bg-[#EEEEEE]'
                                }`}
                            >
                                Berikutnya &raquo;
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="p-3 sm:p-4 border-t border-[#E0E0E0] bg-[#FDFDFC] flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-[#EEEEEE] hover:bg-gray-200 text-[#1D1616] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>
            </div>

            {/* Lightbox Zoom Photo Modal */}
            {zoomedImage && (
                <div
                    onClick={() => setZoomedImage(null)}
                    className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 cursor-pointer"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
                    >
                        <div className="p-3.5 bg-gray-900 text-white flex items-center justify-between text-xs font-bold">
                            <span>{zoomedImage.title}</span>
                            <button
                                onClick={() => setZoomedImage(null)}
                                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-2 bg-gray-950 flex items-center justify-center max-h-[75vh]">
                            <img
                                src={zoomedImage.url}
                                alt="Zoomed condition"
                                className="max-h-[70vh] max-w-full object-contain rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
