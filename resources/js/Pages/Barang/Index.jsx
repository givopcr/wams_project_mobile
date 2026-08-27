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
            <Head title="Master Barang" />

            {/* Filter & Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari barang / kode / lokasi..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                        <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
                    </form>

                    <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryFilter(e.target.value)}
                        className="py-2.5 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
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
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                >
                    <Plus size={16} />
                    <span>Tambah Master Barang</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
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
                        <tbody className="divide-y divide-slate-800/60">
                            {barangList.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">
                                        Tidak ada data master barang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                barangList.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                                                    {item.gambar_url ? (
                                                        <img src={item.gambar_url} alt={item.nama_barang} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={18} className="text-slate-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">{item.nama_barang}</div>
                                                    <div className="text-[11px] font-mono text-blue-400 font-semibold">{item.kode_barang}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-300">{item.nama_kategori}</div>
                                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                                <MapPin size={12} /> {item.lokasi || 'Lokasi belum diset'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center font-bold text-white">
                                            {item.total_unit}
                                        </td>
                                        <td className="p-4 text-center font-bold text-emerald-400">
                                            {item.tersedia}
                                        </td>
                                        <td className="p-4 text-center font-bold text-amber-400">
                                            {item.dipinjam}
                                        </td>
                                        <td className="p-4 text-center font-bold text-rose-400">
                                            {item.maintenance}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
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

            {/* Modal Form Barang */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-white">
                                {editingBarang ? 'Edit Master Barang' : 'Tambah Master Barang Baru'}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                        Kategori
                                    </label>
                                    <select
                                        value={data.kategori_id}
                                        onChange={(e) => setData('kategori_id', e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                                    >
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.nama_kategori}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.kategori_id && <p className="text-rose-400 text-xs mt-1">{errors.kategori_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                        Kode Barang (Unik)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.kode_barang}
                                        onChange={(e) => setData('kode_barang', e.target.value)}
                                        placeholder="Contoh: OBG-001"
                                        required
                                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 uppercase"
                                    />
                                    {errors.kode_barang && <p className="text-rose-400 text-xs mt-1">{errors.kode_barang}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Nama Barang
                                </label>
                                <input
                                    type="text"
                                    value={data.nama_barang}
                                    onChange={(e) => setData('nama_barang', e.target.value)}
                                    placeholder="Contoh: Obeng Plus & Minus Set"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                                />
                                {errors.nama_barang && <p className="text-rose-400 text-xs mt-1">{errors.nama_barang}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Lokasi Penyimpanan
                                </label>
                                <input
                                    type="text"
                                    value={data.lokasi}
                                    onChange={(e) => setData('lokasi', e.target.value)}
                                    placeholder="Contoh: Rak A-01 / Lemari B-02"
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Detail Spesifikasi
                                </label>
                                <textarea
                                    value={data.detail_spesifikasi}
                                    onChange={(e) => setData('detail_spesifikasi', e.target.value)}
                                    placeholder="Spesifikasi teknis alat..."
                                    rows={3}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Foto Barang (Opsional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('gambar', e.target.files[0])}
                                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                                />
                                {errors.gambar && <p className="text-rose-400 text-xs mt-1">{errors.gambar}</p>}
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg disabled:opacity-50"
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
