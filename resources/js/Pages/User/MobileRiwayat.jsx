import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import UserMobileLayout from '@/Layouts/UserMobileLayout';
import {
    Search,
    Wrench,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Package,
    Clock,
    UserCheck
} from 'lucide-react';

export default function MobileRiwayat({
    riwayat = { data: [], links: [] },
    filters = { status: '', q: '' }
}) {
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const handleFilterChange = (status) => {
        setSelectedStatus(status);
        router.visit(
            `/user/riwayat?status=${status}&q=${encodeURIComponent(searchQuery)}`,
            { preserveState: true }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.visit(
            `/user/riwayat?status=${selectedStatus}&q=${encodeURIComponent(searchQuery)}`,
            { preserveState: true }
        );
    };

    const items = riwayat?.data || [];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'dikembalikan':
                return {
                    label: 'Selesai Dikembalikan',
                    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    icon: CheckCircle2,
                };
            case 'ditolak':
                return {
                    label: 'Ditolak Admin',
                    badge: 'bg-rose-50 text-rose-700 border-rose-200',
                    icon: XCircle,
                };
            case 'dibatalkan':
                return {
                    label: 'Dibatalkan',
                    badge: 'bg-gray-100 text-gray-700 border-gray-200',
                    icon: AlertCircle,
                };
            default:
                return {
                    label: status,
                    badge: 'bg-blue-50 text-blue-700 border-blue-200',
                    icon: Clock,
                };
        }
    };

    return (
        <UserMobileLayout title="Riwayat Peminjaman" showBackButton onBack={() => router.visit('/user/dashboard')}>
            <Head title="Riwayat Peminjaman - WAMS Mobile" />

            <div className="space-y-4">
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                    <Search size={16} className="absolute left-3.5 text-[#8C93A0]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari riwayat peminjaman..."
                        className="w-full pl-9 pr-20 py-2.5 bg-white border border-[#E0E0E0] rounded-2xl text-xs text-[#1D1616] placeholder-[#8C93A0] focus:outline-none focus:border-[#D84040] shadow-2xs font-medium"
                    />
                    <button
                        type="submit"
                        className="absolute right-1.5 px-3.5 py-1.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-[11px] font-bold rounded-xl transition-colors cursor-pointer"
                    >
                        Cari
                    </button>
                </form>

                {/* Filter Status Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {[
                        { key: '', label: 'Semua Status' },
                        { key: 'dikembalikan', label: 'Dikembalikan' },
                        { key: 'ditolak', label: 'Ditolak' },
                        { key: 'dibatalkan', label: 'Dibatalkan' },
                    ].map((st) => (
                        <button
                            key={st.key}
                            type="button"
                            onClick={() => handleFilterChange(st.key)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs ${
                                selectedStatus === st.key
                                    ? 'bg-[#D84040] text-white border-[#D84040]'
                                    : 'bg-white text-[#1D1616] border-[#E0E0E0] hover:border-[#D84040]'
                            }`}
                        >
                            {st.label}
                        </button>
                    ))}
                </div>

                {/* Riwayat Cards List */}
                {items.length > 0 ? (
                    <div className="space-y-3">
                        {items.map((log) => {
                            const statusInfo = getStatusBadge(log.status_transaksi);
                            const StatusIcon = statusInfo.icon;
                            return (
                                <div
                                    key={log.id}
                                    className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-2xs space-y-2.5"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-[#EEEEEE] text-[#1D1616]">
                                                    {log.kode_unit}
                                                </span>
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusInfo.badge}`}
                                                >
                                                    <StatusIcon size={12} />
                                                    <span>{statusInfo.label}</span>
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-black text-[#1D1616] leading-snug">
                                                {log.nama_barang}
                                            </h4>
                                        </div>

                                        <div className="w-9 h-9 rounded-xl bg-[#F8F9FA] border border-[#E0E0E0] flex items-center justify-center text-[#8C93A0] shrink-0">
                                            <Package size={18} />
                                        </div>
                                    </div>

                                    {/* Dates & Details */}
                                    <div className="bg-[#F8F9FA] rounded-xl p-3 border border-[#E0E0E0] space-y-1.5 text-xs text-[#6B7280]">
                                        <div className="flex items-center justify-between">
                                            <span>Tanggal Pinjam:</span>
                                            <span className="font-semibold text-[#1D1616]">{log.tanggal_pinjam}</span>
                                        </div>
                                        {log.tanggal_kembali && (
                                            <div className="flex items-center justify-between">
                                                <span>Tanggal Kembali:</span>
                                                <span className="font-semibold text-emerald-700">{log.tanggal_kembali}</span>
                                            </div>
                                        )}
                                        {log.kondisi_kembali && (
                                            <div className="flex items-center justify-between">
                                                <span>Kondisi Saat Kembali:</span>
                                                <span className="font-semibold uppercase text-xs text-[#1D1616]">
                                                    {log.kondisi_kembali.replace('_', ' ')}
                                                </span>
                                            </div>
                                        )}
                                        {log.approver_nama && (
                                            <div className="flex items-center justify-between pt-1 border-t border-[#E0E0E0]/60">
                                                <span>Disetujui Oleh:</span>
                                                <span className="font-medium text-[#1D1616] flex items-center gap-1">
                                                    <UserCheck size={12} className="text-emerald-600" />
                                                    {log.approver_nama}
                                                </span>
                                            </div>
                                        )}
                                        {log.alasan_penolakan && (
                                            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] mt-1">
                                                <strong>Alasan Penolakan:</strong> {log.alasan_penolakan}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl p-8 text-center shadow-2xs">
                        <div className="w-12 h-12 rounded-2xl bg-[#EEEEEE] text-[#8C93A0] mx-auto flex items-center justify-center mb-3">
                            <Clock size={24} />
                        </div>
                        <h4 className="font-bold text-sm text-[#1D1616]">
                            Belum Ada Riwayat
                        </h4>
                        <p className="text-xs text-[#6B7280] mt-1">
                            Riwayat peminjaman yang telah selesai akan tercatat otomatis di sini.
                        </p>
                    </div>
                )}
            </div>
        </UserMobileLayout>
    );
}
