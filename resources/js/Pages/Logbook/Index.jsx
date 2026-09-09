import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    BookOpen,
    Search,
    Clock,
    CheckCircle2,
    Calendar,
    Filter,
    ArrowLeft,
    ArrowRight,
    ShieldAlert,
    Check,
    X,
    AlertCircle,
    UserCheck,
    UserX,
    FileText,
    MessageSquare
} from 'lucide-react';

export default function LogbookIndex({ logs, filters = {}, statusCounts = {} }) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    // Modal State Approval & Reject
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [batasKembali, setBatasKembali] = useState('');
    const [alasanPenolakan, setAlasanPenolakan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get('/admin/logbook', {
            q: search,
            status: selectedStatus,
        }, { preserveState: true });
    };

    const handleStatusTab = (status) => {
        setSelectedStatus(status);
        router.get('/admin/logbook', {
            q: search,
            status: status,
        }, { preserveState: true });
    };

    const openApproveModal = (log) => {
        setSelectedLog(log);
        // Default batas kembali 3 hari ke depan
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 3);
        setBatasKembali(defaultDate.toISOString().slice(0, 16));
        setApproveModalOpen(true);
    };

    const handleConfirmApprove = (e) => {
        e.preventDefault();
        if (!selectedLog) return;
        setIsSubmitting(true);
        router.post(`/admin/peminjaman/${selectedLog.id}/approve`, {
            batas_kembali: batasKembali,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setApproveModalOpen(false);
                setSelectedLog(null);
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    const openRejectModal = (log) => {
        setSelectedLog(log);
        setAlasanPenolakan('');
        setRejectModalOpen(true);
    };

    const handleConfirmReject = (e) => {
        e.preventDefault();
        if (!selectedLog || !alasanPenolakan.trim()) return;
        setIsSubmitting(true);
        router.post(`/admin/peminjaman/${selectedLog.id}/reject`, {
            alasan_penolakan: alasanPenolakan,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setRejectModalOpen(false);
                setSelectedLog(null);
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    // Helper for pagination range with ellipsis
    const getPaginationRange = (currentPage, lastPage) => {
        if (!lastPage || lastPage <= 1) return [1];
        if (lastPage <= 7) {
            return Array.from({ length: lastPage }, (_, i) => i + 1);
        }

        if (currentPage <= 4) {
            return [1, 2, 3, 4, 5, '...', lastPage];
        }

        if (currentPage >= lastPage - 3) {
            return [1, '...', lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
        }

        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', lastPage];
    };

    const paginationRange = getPaginationRange(logs?.current_page || 1, logs?.last_page || 1);

    const statusTabs = [
        { key: '', label: 'Semua Transaksi', count: statusCounts.all ?? 0 },
        {
            key: 'menunggu_persetujuan',
            label: 'Menunggu Persetujuan',
            count: statusCounts.menunggu_persetujuan ?? 0,
            isApproval: true,
        },
        { key: 'dipinjam', label: 'Sedang Dipinjam', count: statusCounts.dipinjam ?? 0 },
        { key: 'dikembalikan', label: 'Sudah Dikembalikan', count: statusCounts.dikembalikan ?? 0 },
        { key: 'ditolak', label: 'Ditolak', count: statusCounts.ditolak ?? 0 },
    ];

    return (
        <AuthenticatedLayout title="Logbook Transaksi Peminjaman & Pengembalian">
            <Head title="Logbook Transaksi - WAMS" />

            <div className="space-y-6 max-w-7xl mx-auto pb-8">
                {/* Status Tabs Navigation */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {statusTabs.map((tab) => {
                        const isActive = selectedStatus === tab.key;
                        const isPendingApprovalTab = tab.key === 'menunggu_persetujuan';

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleStatusTab(tab.key)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 flex items-center gap-2 cursor-pointer ${
                                    isActive
                                        ? isPendingApprovalTab
                                            ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-400/40'
                                            : 'bg-[#1D1616] text-white shadow-sm'
                                        : isPendingApprovalTab && tab.count > 0
                                        ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                                        : 'bg-white border border-[#E0E0E0] text-[#6B7280] hover:text-[#1D1616] hover:bg-[#EEEEEE]'
                                }`}
                            >
                                {isPendingApprovalTab && <ShieldAlert size={14} className={isActive ? 'text-white' : 'text-amber-600'} />}
                                <span>{tab.label}</span>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                        isActive
                                            ? 'bg-white/25 text-white'
                                            : isPendingApprovalTab && tab.count > 0
                                            ? 'bg-amber-200 text-amber-900'
                                            : 'bg-[#EEEEEE] text-[#6B7280]'
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <form onSubmit={handleFilter} className="relative w-full sm:w-80">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari user, NIP, kode unit, atau barang..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] placeholder-[#8C93A0] focus:outline-none focus:border-[#D84040]"
                            />
                            <Search size={16} className="absolute left-3.5 top-3 text-[#6B7280]" />
                        </form>
                    </div>

                    <div className="text-xs text-[#6B7280] font-medium self-end sm:self-auto">
                        <span>Menampilkan </span>
                        <span className="font-bold text-[#1D1616]">
                            {logs?.from ?? 0} - {logs?.to ?? 0}
                        </span>
                        <span> dari </span>
                        <span className="font-bold text-[#1D1616]">{logs?.total ?? 0}</span>
                        <span> transaksi</span>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white border border-[#E0E0E0] rounded-2xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#EEEEEE] border-b border-[#E0E0E0] text-[#1D1616] uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="p-4">Peminjam</th>
                                    <th className="p-4">Alat & Keperluan</th>
                                    <th className="p-4">Waktu Pinjam</th>
                                    <th className="p-4">Batas / Waktu Kembali</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-center">Aksi / Verifikasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E0E0E0]">
                                {logs?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-[#6B7280] bg-white">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <BookOpen size={32} className="text-[#8C93A0]" />
                                                <p className="font-bold text-sm text-[#1D1616]">Tidak ada catatan transaksi ditemukan</p>
                                                <p className="text-xs text-[#6B7280]">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => {
                                        const isDipinjam = log.status_transaksi === 'dipinjam';
                                        const isApproval = log.status_transaksi === 'menunggu_persetujuan';
                                        const isDitolak = log.status_transaksi === 'ditolak';
                                        const isDibatalkan = log.status_transaksi === 'dibatalkan';

                                        return (
                                            <tr key={log.id} className="hover:bg-[#EEEEEE]/50 bg-white transition-colors">
                                                {/* Kolom 1: Peminjam */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-[#1D1616] text-sm">
                                                            {log.tipe_peminjam === 'guest' ? log.guest_nama : (log.user?.nama || 'N/A')}
                                                        </span>
                                                        {log.tipe_peminjam === 'guest' && (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                                                Tamu
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] font-mono text-[#6B7280] mt-0.5">
                                                        {log.tipe_peminjam === 'guest' ? 'Peminjam Guest / Tamu' : `NIP: ${log.user?.nip || '-'}`}
                                                    </div>
                                                    <div className="text-[10px] text-[#6B7280]">
                                                        {log.tipe_peminjam === 'guest' ? log.guest_email : log.user?.email}
                                                    </div>
                                                </td>

                                                {/* Kolom 2: Alat & Keperluan */}
                                                <td className="p-4">
                                                    <div className="font-bold text-[#1D1616] flex items-center gap-1.5">
                                                        <span>{log.barang_unit?.barang?.nama_barang || 'Barang Workshop'}</span>
                                                        {log.barang_unit?.barang?.perlu_persetujuan && (
                                                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold" title="Barang spesifik wajib izin admin">
                                                                Spesifik
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] font-mono text-[#D84040] font-bold mt-0.5">
                                                        Unit: {log.barang_unit?.kode_unit || 'Unit'}
                                                    </div>
                                                    {log.keperluan && (
                                                        <div className="text-[11px] text-gray-600 bg-gray-50 border border-gray-200 rounded-md p-1.5 mt-1.5 max-w-xs">
                                                            <span className="font-bold text-gray-700">Keperluan: </span>
                                                            <span>{log.keperluan}</span>
                                                        </div>
                                                    )}
                                                    {isDitolak && log.alasan_penolakan && (
                                                        <div className="text-[11px] text-rose-800 bg-rose-50 border border-rose-200 rounded-md p-1.5 mt-1.5 max-w-xs">
                                                            <span className="font-bold text-[#D84040]">Alasan Ditolak: </span>
                                                            <span>{log.alasan_penolakan}</span>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Kolom 3: Waktu Pinjam */}
                                                <td className="p-4 text-[#1D1616] font-medium">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={13} className="text-[#D84040]" />
                                                        {new Date(log.tanggal_pinjam).toLocaleString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </div>
                                                </td>

                                                {/* Kolom 4: Batas / Waktu Kembali */}
                                                <td className="p-4 text-[#1D1616] font-medium">
                                                    {log.tanggal_kembali ? (
                                                        <div>
                                                            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                                                                <CheckCircle2 size={13} />
                                                                {new Date(log.tanggal_kembali).toLocaleString('id-ID', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </div>
                                                            {log.kondisi_kembali && (
                                                                <span
                                                                    className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                                                                        log.kondisi_kembali === 'baik'
                                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                            : 'bg-rose-50 text-[#D84040] border border-rose-200'
                                                                    }`}
                                                                >
                                                                    Kondisi: {log.kondisi_kembali}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : log.batas_kembali ? (
                                                        <div className="text-[11px] text-gray-700">
                                                            <span className="font-semibold text-gray-500">Batas: </span>
                                                            <span>
                                                                {new Date(log.batas_kembali).toLocaleString('id-ID', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[#6B7280] italic">Belum kembali</span>
                                                    )}
                                                </td>

                                                {/* Kolom 5: Status Badge */}
                                                <td className="p-4 text-center">
                                                    {isApproval ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                                                            <ShieldAlert size={13} className="text-amber-700" />
                                                            Menunggu Izin
                                                        </span>
                                                    ) : isDipinjam ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-[#D84040] text-white">
                                                            <Clock size={12} />
                                                            Dipinjam
                                                        </span>
                                                    ) : isDitolak ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-rose-100 text-[#D84040] border border-rose-300">
                                                            <X size={12} />
                                                            Ditolak
                                                        </span>
                                                    ) : isDibatalkan ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border border-gray-300">
                                                            Dibatalkan
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-[#1D1616] text-white">
                                                            <CheckCircle2 size={12} />
                                                            Dikembalikan
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Kolom 6: Aksi / Verifikasi Admin */}
                                                <td className="p-4 text-center">
                                                    {isApproval ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => openApproveModal(log)}
                                                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                                                title="Setujui Peminjaman Alat Ini"
                                                            >
                                                                <Check size={13} />
                                                                <span>Setujui</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openRejectModal(log)}
                                                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-[#D84040] border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                                                title="Tolak Permohonan"
                                                            >
                                                                <X size={13} />
                                                                <span>Tolak</span>
                                                            </button>
                                                        </div>
                                                    ) : log.approver ? (
                                                        <div className="text-[11px] text-gray-500 font-medium">
                                                            <div className="flex items-center justify-center gap-1 text-gray-700 font-bold">
                                                                <UserCheck size={12} className="text-emerald-600" />
                                                                <span>{log.approver.nama}</span>
                                                            </div>
                                                            <div className="text-[10px] text-gray-400">
                                                                {log.tanggal_approval
                                                                    ? new Date(log.tanggal_approval).toLocaleDateString('id-ID', {
                                                                          day: 'numeric',
                                                                          month: 'short',
                                                                      })
                                                                    : '-'}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[#8C93A0] text-[11px] font-medium">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Bar */}
                {logs && logs.last_page > 1 && (
                    <div className="flex items-center justify-between pt-2 px-1 select-none">
                        {logs.prev_page_url ? (
                            <Link
                                href={logs.prev_page_url}
                                preserveState
                                preserveScroll
                                className="flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#1D1616] transition-colors cursor-pointer"
                            >
                                <ArrowLeft size={16} />
                                <span>Previous</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-300 pointer-events-none">
                                <ArrowLeft size={16} />
                                <span>Previous</span>
                            </div>
                        )}

                        <div className="flex items-center gap-1">
                            {paginationRange.map((page, index) => {
                                if (page === '...') {
                                    return (
                                        <span key={`ellipsis-${index}`} className="w-9 h-9 flex items-center justify-center text-xs font-semibold text-[#8C93A0]">
                                            ...
                                        </span>
                                    );
                                }

                                const isCurrent = logs.current_page === page;
                                const pageUrl = `${logs.path}?page=${page}&q=${encodeURIComponent(search)}&status=${encodeURIComponent(selectedStatus)}`;

                                return (
                                    <Link
                                        key={`page-${page}`}
                                        href={pageUrl}
                                        preserveState
                                        preserveScroll
                                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                                            isCurrent
                                                ? 'bg-[#1D1616] text-white'
                                                : 'text-[#6B7280] hover:text-[#1D1616] hover:bg-[#EEEEEE]'
                                        }`}
                                    >
                                        {page}
                                    </Link>
                                );
                            })}
                        </div>

                        {logs.next_page_url ? (
                            <Link
                                href={logs.next_page_url}
                                preserveState
                                preserveScroll
                                className="flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#1D1616] transition-colors cursor-pointer"
                            >
                                <span>Next</span>
                                <ArrowRight size={16} />
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-300 pointer-events-none">
                                <span>Next</span>
                                <ArrowRight size={16} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL SETUJUI / APPROVE */}
            {approveModalOpen && selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1616]/60 backdrop-blur-xs">
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
                            <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-base">
                                <CheckCircle2 size={20} />
                                <span>Setujui Permohonan Peminjaman</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setApproveModalOpen(false)}
                                className="text-[#6B7280] hover:text-[#1D1616] cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmApprove} className="mt-4 space-y-4">
                            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-2">
                                <div>
                                    <span className="text-gray-500 font-medium">Peminjam: </span>
                                    <span className="font-bold text-[#1D1616]">{selectedLog.user?.nama || selectedLog.guest_nama}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 font-medium">Barang: </span>
                                    <span className="font-bold text-[#1D1616]">
                                        {selectedLog.barang_unit?.barang?.nama_barang} ({selectedLog.barang_unit?.kode_unit})
                                    </span>
                                </div>
                                {selectedLog.keperluan && (
                                    <div>
                                        <span className="text-gray-500 font-medium">Keperluan: </span>
                                        <span className="italic text-gray-700">{selectedLog.keperluan}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                    Tentukan Batas Waktu Pengembalian
                                </label>
                                <input
                                    type="datetime-local"
                                    value={batasKembali}
                                    onChange={(e) => setBatasKembali(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-semibold focus:outline-none focus:border-emerald-600"
                                />
                                <p className="text-[11px] text-gray-500 mt-1">
                                    Status unit fisik akan resmi diubah menjadi <b>Dipinjam</b> dan waktu transaksi dimulai sekarang.
                                </p>
                            </div>

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E0E0E0]">
                                <button
                                    type="button"
                                    onClick={() => setApproveModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                                >
                                    <Check size={14} />
                                    <span>{isSubmitting ? 'Memproses...' : 'Ya, Setujui Peminjaman'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL TOLAK / REJECT */}
            {rejectModalOpen && selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1616]/60 backdrop-blur-xs">
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
                            <div className="flex items-center gap-2 text-[#D84040] font-extrabold text-base">
                                <AlertCircle size={20} />
                                <span>Tolak Permohonan Peminjaman</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRejectModalOpen(false)}
                                className="text-[#6B7280] hover:text-[#1D1616] cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmReject} className="mt-4 space-y-4">
                            <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs space-y-1">
                                <div>
                                    <span className="text-gray-500 font-medium">Peminjam: </span>
                                    <span className="font-bold text-[#1D1616]">{selectedLog.user?.nama || selectedLog.guest_nama}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 font-medium">Barang: </span>
                                    <span className="font-bold text-[#1D1616]">
                                        {selectedLog.barang_unit?.barang?.nama_barang} ({selectedLog.barang_unit?.kode_unit})
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                    Alasan Penolakan <span className="text-[#D84040]">*</span>
                                </label>
                                <textarea
                                    value={alasanPenolakan}
                                    onChange={(e) => setAlasanPenolakan(e.target.value)}
                                    rows={3}
                                    required
                                    placeholder="Contoh: Alat sedang dijadwalkan untuk praktikum wajib, atau belum ada sertifikasi penggunaan..."
                                    className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                />
                                <p className="text-[11px] text-gray-500 mt-1">
                                    Alasan ini akan dapat dilihat oleh peminjam di riwayat aplikasinya dan unit fisik otomatis dikembalikan ke status <b>Tersedia</b>.
                                </p>
                            </div>

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E0E0E0]">
                                <button
                                    type="button"
                                    onClick={() => setRejectModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !alasanPenolakan.trim()}
                                    className="px-4 py-2 text-xs font-bold text-white bg-[#D84040] hover:bg-[#8E1616] rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                                >
                                    <X size={14} />
                                    <span>{isSubmitting ? 'Memproses...' : 'Konfirmasi Tolak'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
