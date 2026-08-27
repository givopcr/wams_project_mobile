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
            <Head title="Logbook Transaksi" />

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <form onSubmit={handleFilter} className="relative w-full sm:w-80">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari user, NIP, kode unit, atau barang..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                        <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
                    </form>

                    <select
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            router.get('/admin/logbook', { q: search, status: e.target.value }, { preserveState: true });
                        }}
                        className="py-2.5 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                    >
                        <option value="">Semua Status Transaksi</option>
                        <option value="dipinjam">Sedang Dipinjam</option>
                        <option value="dikembalikan">Sudah Dikembalikan</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="p-4">Peminjam</th>
                                <th className="p-4">Alat & Unit Fisik</th>
                                <th className="p-4">Tanggal Pinjam</th>
                                <th className="p-4">Tanggal Kembali</th>
                                <th className="p-4">Kondisi Saat Kembali</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {logs.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        Tidak ada catatan logbook transaksi ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                logs.data.map((log) => {
                                    const isDipinjam = log.status_transaksi === 'dipinjam';
                                    return (
                                        <tr key={log.id} className="hover:bg-slate-800/30">
                                            <td className="p-4">
                                                <div className="font-bold text-white text-sm">{log.user?.nama || 'N/A'}</div>
                                                <div className="text-[11px] font-mono text-slate-400 mt-0.5">NIP: {log.user?.nip || '-'}</div>
                                                <div className="text-[10px] text-slate-500">{log.user?.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-semibold text-slate-200">{log.barang_unit?.barang?.nama_barang || 'Barang'}</div>
                                                <div className="text-[11px] font-mono text-blue-400 font-bold mt-0.5">
                                                    {log.barang_unit?.kode_unit || 'Unit'}
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-300">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={13} className="text-slate-500" />
                                                    {new Date(log.tanggal_pinjam).toLocaleString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-300">
                                                {log.tanggal_kembali ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={13} className="text-emerald-500" />
                                                        {new Date(log.tanggal_kembali).toLocaleString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </div>
                                                ) : (
                                                    <span className="text-amber-400 font-medium italic">Belum dikembalikan</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {log.kondisi_kembali ? (
                                                    <span
                                                        className={`font-semibold capitalize px-2 py-0.5 rounded text-[11px] ${
                                                            log.kondisi_kembali === 'baik'
                                                                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                                                                : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                                                        }`}
                                                    >
                                                        {log.kondisi_kembali}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-600">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold ${
                                                        isDipinjam
                                                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
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
        </AuthenticatedLayout>
    );
}
