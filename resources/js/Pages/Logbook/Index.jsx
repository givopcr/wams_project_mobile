import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    BookOpen,
    Search,
    Clock,
    CheckCircle2,
    Calendar,
    Filter
} from 'lucide-react';

export default function LogbookIndex({ logs, filters }) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get('/admin/logbook', {
            q: search,
            status: selectedStatus,
        }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout title="Logbook Transaksi Peminjaman & Pengembalian">
            <Head title="Logbook Transaksi - WAMS" />

            <div className="space-y-6 max-w-7xl mx-auto">
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

                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                router.get('/admin/logbook', { q: search, status: e.target.value }, { preserveState: true });
                            }}
                            className="py-2.5 px-3.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-semibold focus:outline-none focus:border-[#D84040]"
                        >
                            <option value="">Semua Status Transaksi</option>
                            <option value="dipinjam">Sedang Dipinjam</option>
                            <option value="dikembalikan">Sudah Dikembalikan</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-[#E0E0E0] rounded-2xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#EEEEEE] border-b border-[#E0E0E0] text-[#1D1616] uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="p-4">Peminjam</th>
                                    <th className="p-4">Alat & Unit Fisik</th>
                                    <th className="p-4">Tanggal Pinjam</th>
                                    <th className="p-4">Tanggal Kembali</th>
                                    <th className="p-4">Kondisi Saat Kembali</th>
                                    <th className="p-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E0E0E0]">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-[#6B7280] bg-white">
                                            Tidak ada catatan logbook transaksi ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => {
                                        const isDipinjam = log.status_transaksi === 'dipinjam';
                                        return (
                                            <tr key={log.id} className="hover:bg-[#EEEEEE]/50 bg-white transition-colors">
                                                <td className="p-4">
                                                    <div className="font-bold text-[#1D1616] text-sm">{log.user?.nama || 'N/A'}</div>
                                                    <div className="text-[11px] font-mono text-[#6B7280] mt-0.5">NIP: {log.user?.nip || '-'}</div>
                                                    <div className="text-[10px] text-[#6B7280]">{log.user?.email}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold text-[#1D1616]">{log.barang_unit?.barang?.nama_barang || 'Barang'}</div>
                                                    <div className="text-[11px] font-mono text-[#D84040] font-bold mt-0.5">
                                                        {log.barang_unit?.kode_unit || 'Unit'}
                                                    </div>
                                                </td>
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
                                                <td className="p-4 text-[#1D1616] font-medium">
                                                    {log.tanggal_kembali ? (
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
                                                    ) : (
                                                        <span className="text-[#6B7280] italic">Belum dikembalikan</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {log.kondisi_kembali ? (
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold capitalize ${log.kondisi_kembali === 'baik'
                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                    : 'bg-[#D84040]/10 text-[#D84040] border border-[#D84040]/20'
                                                                }`}
                                                        >
                                                            {log.kondisi_kembali}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#6B7280]">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold ${isDipinjam
                                                                ? 'bg-[#D84040] text-white'
                                                                : 'bg-[#1D1616] text-white'
                                                            }`}
                                                    >
                                                        {isDipinjam ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                                                        {isDipinjam ? 'Dipinjam' : 'Dikembalikan'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
