import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Layers,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Wrench,
    UserCheck
} from 'lucide-react';

export default function UnitIndex({ units, barangList, filters }) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedBarang, setSelectedBarang] = useState(filters.barang_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        barang_id: '',
        kode_unit: '',
        status: 'tersedia',
        kondisi: 'baik',
    });

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get('/admin/unit', {
            q: search,
            barang_id: selectedBarang,
            status: selectedStatus,
        }, { preserveState: true });
    };

    const openCreateModal = () => {
        setEditingUnit(null);
        reset();
        setData({
            barang_id: barangList.length > 0 ? barangList[0].id : '',
            kode_unit: '',
            status: 'tersedia',
            kondisi: 'baik',
        });
        setModalOpen(true);
    };

    const openEditModal = (u) => {
        setEditingUnit(u);
        setData({
            barang_id: u.barang_id,
            kode_unit: u.kode_unit,
            status: u.status,
            kondisi: u.kondisi,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUnit) {
            put(`/admin/unit/${editingUnit.id}`, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            post('/admin/unit', {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus unit fisik ini?')) {
            router.delete(`/admin/unit/${id}`);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'tersedia':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={12} /> Tersedia
                    </span>
                );
            case 'dipinjam':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock size={12} /> Dipinjam
                    </span>
                );
            case 'maintenance':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#D84040]/10 text-[#D84040] border border-[#D84040]/20">
                        <AlertTriangle size={12} /> Maintenance
                    </span>
                );
            default:
                return status;
        }
    };

    return (
        <AuthenticatedLayout title="Manajemen Unit Fisik Barang">
            <Head title="Unit Fisik Barang - WAMS" />

            {/* Filter & Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <form onSubmit={handleFilter} className="relative w-full sm:w-60">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kode unit..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] placeholder-[#8C93A0] focus:outline-none focus:border-[#D84040]"
                        />
                        <Search size={16} className="absolute left-3.5 top-3 text-[#6B7280]" />
                    </form>

                    <select
                        value={selectedBarang}
                        onChange={(e) => {
                            setSelectedBarang(e.target.value);
                            router.get('/admin/unit', { q: search, barang_id: e.target.value, status: selectedStatus }, { preserveState: true });
                        }}
                        className="py-2.5 px-3 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-semibold focus:outline-none focus:border-[#D84040] max-w-[200px]"
                    >
                        <option value="">Semua Master Barang</option>
                        {barangList.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.kode_barang} - {b.nama_barang}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            router.get('/admin/unit', { q: search, barang_id: selectedBarang, status: e.target.value }, { preserveState: true });
                        }}
                        className="py-2.5 px-3 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-semibold focus:outline-none focus:border-[#D84040]"
                    >
                        <option value="">Semua Status</option>
                        <option value="tersedia">Tersedia</option>
                        <option value="dipinjam">Dipinjam</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>

                <button
                    onClick={openCreateModal}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                    <Plus size={16} />
                    <span>Tambah Unit Fisik</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white border border-[#E0E0E0] rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#EEEEEE] border-b border-[#E0E0E0] text-[#1D1616] uppercase tracking-wider font-bold">
                            <tr>
                                <th className="p-4">Kode Unit</th>
                                <th className="p-4">Master Barang</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Kondisi Fisik</th>
                                <th className="p-4">Peminjam Aktif</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E0E0E0]">
                            {units.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-[#6B7280] bg-white">
                                        Tidak ada unit fisik ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                units.data.map((u) => (
                                    <tr key={u.id} className="hover:bg-[#EEEEEE]/50 bg-white transition-colors">
                                        <td className="p-4 font-mono font-bold text-[#D84040] text-sm">
                                            {u.kode_unit}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-[#1D1616]">{u.nama_barang}</div>
                                            <div className="text-[10px] text-[#6B7280]">{u.nama_kategori}</div>
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(u.status)}
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`font-semibold capitalize ${
                                                    u.kondisi === 'baik' ? 'text-emerald-700' : 'text-[#D84040]'
                                                }`}
                                            >
                                                {u.kondisi}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {u.borrower ? (
                                                <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                                                    <UserCheck size={14} className="text-amber-700" />
                                                    <span>{u.borrower}</span>
                                                    <span className="text-[10px] text-[#6B7280] font-normal">({u.borrow_date})</span>
                                                </div>
                                            ) : (
                                                <span className="text-[#6B7280]">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(u)}
                                                    className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1D1616] hover:bg-[#EEEEEE] transition-colors"
                                                    title="Edit Status & Kondisi"
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    className="p-1.5 rounded-lg text-[#D84040] hover:bg-[#D84040]/10 transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form Unit */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1616]/60">
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E0E0E0]">
                            <h3 className="text-base font-bold text-[#1D1616]">
                                {editingUnit ? 'Edit Unit Fisik' : 'Tambah Unit Fisik Baru'}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-[#6B7280] hover:text-[#1D1616]">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!editingUnit && (
                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                        Master Barang
                                    </label>
                                    <select
                                        value={data.barang_id}
                                        onChange={(e) => setData('barang_id', e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-semibold focus:outline-none focus:border-[#D84040]"
                                    >
                                        {barangList.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.kode_barang} - {b.nama_barang}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.barang_id && <p className="text-[#D84040] text-xs mt-1">{errors.barang_id}</p>}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                    Kode Unit (Unik)
                                </label>
                                <input
                                    type="text"
                                    value={data.kode_unit}
                                    onChange={(e) => setData('kode_unit', e.target.value)}
                                    placeholder="Contoh: OBG-001-05"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040] uppercase font-mono"
                                />
                                {errors.kode_unit && <p className="text-[#D84040] text-xs mt-1">{errors.kode_unit}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                        Status Unit
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-semibold focus:outline-none focus:border-[#D84040]"
                                    >
                                        <option value="tersedia">Tersedia</option>
                                        <option value="dipinjam">Dipinjam</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                        Kondisi
                                    </label>
                                    <select
                                        value={data.kondisi}
                                        onChange={(e) => setData('kondisi', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-semibold focus:outline-none focus:border-[#D84040]"
                                    >
                                        <option value="baik">Baik</option>
                                        <option value="rusak">Rusak</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-[#E0E0E0]">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7280] hover:bg-[#EEEEEE]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-[#D84040] hover:bg-[#8E1616] text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
