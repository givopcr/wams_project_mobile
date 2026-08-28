import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Package,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    MapPin,
    Layers,
    Image as ImageIcon
} from 'lucide-react';

export default function BarangIndex({ barangList, categories, filters }) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.kategori_id || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBarang, setEditingBarang] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        kategori_id: '',
        nama_barang: '',
        kode_barang: '',
        detail_spesifikasi: '',
        lokasi: '',
        gambar: null,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/barang', { q: search, kategori_id: selectedCategory }, { preserveState: true });
    };

    const handleCategoryFilter = (catId) => {
        setSelectedCategory(catId);
        router.get('/admin/barang', { q: search, kategori_id: catId }, { preserveState: true });
    };

    const openCreateModal = () => {
        setEditingBarang(null);
        reset();
        setData({
            kategori_id: categories.length > 0 ? categories[0].id : '',
            nama_barang: '',
            kode_barang: '',
            detail_spesifikasi: '',
            lokasi: '',
            gambar: null,
        });
        setModalOpen(true);
    };

    const openEditModal = (b) => {
        setEditingBarang(b);
        setData({
            kategori_id: b.kategori_id,
            nama_barang: b.nama_barang,
            kode_barang: b.kode_barang,
            detail_spesifikasi: b.detail_spesifikasi || '',
            lokasi: b.lokasi || '',
            gambar: null,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingBarang) {
            post(`/admin/barang/${editingBarang.id}`, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            post('/admin/barang', {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus master barang ini? Seluruh unit fisik dan logbook terkait juga akan dihapus.')) {
            router.delete(`/admin/barang/${id}`);
        }
    };

    return (
        <AuthenticatedLayout title="Master Barang Workshop">
            <Head title="Master Barang - WAMS" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Filter & Action Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari barang / kode / lokasi..."
                                className="w-full pl-10 pr-4 py-2.5 bg-[#FFF2DB] border border-[#F0DFC4] rounded-xl text-xs text-[#1E232A] placeholder-[#8C93A0] focus:outline-none focus:border-[#F62440]"
                            />
                            <Search size={16} className="absolute left-3.5 top-3 text-[#6B7280]" />
                        </form>

                        <select
                            value={selectedCategory}
                            onChange={(e) => handleCategoryFilter(e.target.value)}
                            className="py-2.5 px-3.5 bg-[#FFF2DB] border border-[#F0DFC4] rounded-xl text-xs text-[#1E232A] font-semibold focus:outline-none focus:border-[#F62440]"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nama_kategori}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F62440] hover:bg-[#D91A33] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                        <Plus size={16} />
                        <span>Tambah Master Barang</span>
                    </button>
                </div>

                {/* Flat Table */}
                <div className="bg-[#FFF2DB] border border-[#F0DFC4] rounded-2xl overflow-hidden shadow-none">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#FFE5BF] border-b border-[#F0DFC4] text-[#1E232A] uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="p-4">Barang</th>
                                    <th className="p-4">Kategori & Lokasi</th>
                                    <th className="p-4 text-center">Total Unit</th>
                                    <th className="p-4 text-center">Tersedia</th>
                                    <th className="p-4 text-center">Dipinjam</th>
                                    <th className="p-4 text-center">Maintenance</th>
                                    <th className="p-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0DFC4]">
                                {barangList.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-[#6B7280] bg-[#FFFAF3]">
                                            Tidak ada data master barang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    barangList.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-[#FFE5BF]/40 bg-[#FFFAF3] transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#FFE5BF] border border-[#F0DFC4] overflow-hidden flex items-center justify-center shrink-0">
                                                        {item.gambar_url ? (
                                                            <img src={item.gambar_url} alt={item.nama_barang} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package size={18} className="text-[#F62440]" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-[#1E232A] text-sm">{item.nama_barang}</div>
                                                        <div className="text-[11px] font-mono text-[#F62440] font-bold">{item.kode_barang}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-[#1E232A]">{item.nama_kategori}</div>
                                                <div className="text-[11px] text-[#6B7280] flex items-center gap-1 mt-0.5 font-medium">
                                                    <MapPin size={12} className="text-[#F62440]" /> {item.lokasi || 'Lokasi belum diset'}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center font-bold text-[#1E232A]">
                                                {item.total_unit}
                                            </td>
                                            <td className="p-4 text-center font-bold text-[#059669]">
                                                {item.tersedia}
                                            </td>
                                            <td className="p-4 text-center font-bold text-[#D97706]">
                                                {item.dipinjam}
                                            </td>
                                            <td className="p-4 text-center font-bold text-[#F62440]">
                                                {item.maintenance}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1E232A] hover:bg-[#FFE5BF] transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 rounded-lg text-[#F62440] hover:bg-[#F62440]/10 transition-colors"
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
            </div>

            {/* Modal Form Barang */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E232A]/50 overflow-y-auto">
                    <div className="bg-[#FFFAF3] border border-[#F0DFC4] rounded-2xl max-w-lg w-full p-6 shadow-xl my-8">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0DFC4]">
                            <h3 className="text-base font-bold text-[#1E232A]">
                                {editingBarang ? 'Edit Master Barang' : 'Tambah Master Barang Baru'}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-[#6B7280] hover:text-[#1E232A]">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#1E232A] mb-1.5">
                                        Kategori
                                    </label>
                                    <select
                                        value={data.kategori_id}
                                        onChange={(e) => setData('kategori_id', e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 bg-[#FFF2DB] border border-[#F0DFC4] rounded-xl text-xs text-[#1E232A] font-semibold focus:outline-none focus:border-[#F62440]"
                                    >
                                        {categories.map((c) => (
                                             <option key={c.id} value={c.id}>
                                                {c.nama_kategori}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.kategori_id && <p className="text-[#F62440] text-xs mt-1">{errors.kategori_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#1E232A] mb-1.5">
                                        Kode Barang (Unik)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.kode_barang}
                                        onChange={(e) => setData('kode_barang', e.target.value)}
                                        placeholder="Contoh: BOR-101"
                                        required
                                        className="w-full px-3.5 py-2.5 bg-[#FFF2DB] border border-[#F0DFC4] rounded-xl text-xs text-[#1E232A] font-mono focus:outline-none focus:border-[#F62440]"
                                    />
                                    {errors.kode_barang && <p className="text-[#F62440] text-xs mt-1">{errors.kode_barang}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1E232A] mb-1.5">
                                    Nama Barang
                                </label>
                                <input
                                    type="text"
                                    value={data.nama_barang}
                                    onChange={(e) => setData('nama_barang', e.target.value)}
                                    placeholder="Contoh: Mesin Bor Cordless 18V"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-[#FFF2DB] border border-[#F0DFC4] rounded-xl text-xs text-[#1E232A] focus:outline-none focus:border-[#F62440]"
                                />
                                {errors.nama_barang && <p className="text-[#F62440] text-xs mt-1">{errors.nama_barang}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1E232A] mb-1.5">
                                    Lokasi Rak / Lemari
                                </label>
                                <input
                                    type="text"
                                    value={data.lokasi}
                                    onChange={(e) => setData('lokasi', e.target.value)}
                                    placeholder="Contoh: Lemari B-01 / Rak A-02"
                                    className="w-full px-3.5 py-2.5 bg-[#FFF2DB] border border-[#F0DFC4] rounded-xl text-xs text-[#1E232A] focus:outline-none focus:border-[#F62440]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1E232A] mb-1.5">
                                    Detail Spesifikasi Teknis
                                </label>
                                <textarea
                                    value={data.detail_spesifikasi}
                                    onChange={(e) => setData('detail_spesifikasi', e.target.value)}
                                    rows={3}
                                    placeholder="Spesifikasi kelengkapan alat, daya, kapasitas..."
                                    className="w-full px-3.5 py-2.5 bg-[#FFF2DB] border border-[#F0DFC4] rounded-xl text-xs text-[#1E232A] focus:outline-none focus:border-[#F62440]"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7280] hover:bg-[#FFE5BF]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-[#F62440] hover:bg-[#D91A33] text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
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
