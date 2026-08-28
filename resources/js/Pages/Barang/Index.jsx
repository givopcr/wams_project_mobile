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
    Boxes,
    Wrench,
    Cpu,
    Zap,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Filter
} from 'lucide-react';

export default function BarangIndex({ barangList, categories = [], categoryStats = [], filters }) {
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
        const newCatId = selectedCategory === String(catId) ? '' : String(catId);
        setSelectedCategory(newCatId);
        router.get('/admin/barang', { q: search, kategori_id: newCatId }, { preserveState: true });
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

    const getCategoryIcon = (name = '') => {
        const lower = name.toLowerCase();
        if (lower.includes('perkakas')) return <Wrench size={22} className="text-[#D84040]" />;
        if (lower.includes('elektronik')) return <Zap size={22} className="text-[#8E1616]" />;
        return <Cpu size={22} className="text-[#1D1616]" />;
    };

    return (
        <AuthenticatedLayout title="Daftar Barang & Kategori Workshop">
            <Head title="Barang & Kategori - WAMS" />

            <div className="space-y-8 max-w-7xl mx-auto">
                {/* 1. TOP CARDS: KATEGORI */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-[#1D1616]">Ringkasan Kategori Workshop</h2>
                            <p className="text-xs text-[#6B7280]">Klik kartu untuk memfilter daftar barang per kategori</p>
                        </div>
                        {selectedCategory && (
                            <button
                                onClick={() => handleCategoryFilter('')}
                                className="text-xs font-bold text-[#D84040] hover:underline"
                            >
                                Reset Filter (Tampilkan Semua)
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {categoryStats.map((cat) => {
                            const isSelected = selectedCategory === String(cat.id);
                            return (
                                <div
                                    key={cat.id}
                                    onClick={() => handleCategoryFilter(cat.id)}
                                    className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                                        isSelected
                                            ? 'bg-white border-[#D84040] shadow-sm ring-2 ring-[#D84040]'
                                            : 'bg-white border-[#E0E0E0] hover:border-[#D84040]/60 shadow-2xs'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-11 h-11 rounded-xl bg-[#EEEEEE] border border-[#E0E0E0] flex items-center justify-center">
                                                {getCategoryIcon(cat.nama_kategori)}
                                            </div>
                                            <span className="font-mono text-xs font-bold bg-[#EEEEEE] px-2.5 py-1 rounded-md text-[#1D1616] border border-[#E0E0E0]">
                                                {cat.total_barang} Model
                                            </span>
                                        </div>

                                        <h3 className="text-base font-extrabold text-[#1D1616]">
                                            {cat.nama_kategori}
                                        </h3>
                                        <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                                            Total: <span className="font-bold text-[#1D1616]">{cat.total_unit} Unit Fisik</span>
                                        </p>
                                    </div>

                                    {/* Breakdown Status Unit */}
                                    <div className="pt-4 mt-4 border-t border-[#E0E0E0] grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-[#EEEEEE] p-2 rounded-lg border border-[#E0E0E0]">
                                            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Tersedia</span>
                                            <span className="text-sm font-extrabold text-emerald-700">{cat.tersedia}</span>
                                        </div>
                                        <div className="bg-[#EEEEEE] p-2 rounded-lg border border-[#E0E0E0]">
                                            <span className="text-[10px] uppercase font-bold text-amber-700 block">Dipinjam</span>
                                            <span className="text-sm font-extrabold text-amber-700">{cat.dipinjam}</span>
                                        </div>
                                        <div className="bg-[#EEEEEE] p-2 rounded-lg border border-[#E0E0E0]">
                                            <span className="text-[10px] uppercase font-bold text-[#D84040] block">Rusak</span>
                                            <span className="text-sm font-extrabold text-[#D84040]">{cat.maintenance}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. FILTER & LIST MASTER BARANG */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="w-full sm:w-auto">
                            <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama barang / kode / lokasi..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] placeholder-[#8C93A0] focus:outline-none focus:border-[#D84040]"
                                />
                                <Search size={16} className="absolute left-3.5 top-3 text-[#6B7280]" />
                            </form>
                        </div>

                        <button
                            onClick={openCreateModal}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                        >
                            <Plus size={16} />
                            <span>Tambah Barang Baru</span>
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl overflow-hidden shadow-2xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#EEEEEE] border-b border-[#E0E0E0] text-[#1D1616] uppercase tracking-wider font-bold">
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
                                <tbody className="divide-y divide-[#E0E0E0]">
                                    {barangList.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-[#6B7280] bg-white">
                                                Tidak ada data barang ditemukan pada kategori ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        barangList.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-[#EEEEEE]/50 bg-white transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-[#EEEEEE] border border-[#E0E0E0] overflow-hidden flex items-center justify-center shrink-0">
                                                            {item.gambar_url ? (
                                                                <img src={item.gambar_url} alt={item.nama_barang} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package size={18} className="text-[#D84040]" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-[#1D1616] text-sm">{item.nama_barang}</div>
                                                            <div className="text-[11px] font-mono text-[#D84040] font-bold">{item.kode_barang}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold text-[#1D1616]">{item.nama_kategori}</div>
                                                    <div className="text-[11px] text-[#6B7280] flex items-center gap-1 mt-0.5 font-medium">
                                                        <MapPin size={12} className="text-[#D84040]" /> {item.lokasi || 'Lokasi belum diset'}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center font-bold text-[#1D1616]">
                                                    {item.total_unit}
                                                </td>
                                                <td className="p-4 text-center font-bold text-emerald-700">
                                                    {item.tersedia}
                                                </td>
                                                <td className="p-4 text-center font-bold text-amber-700">
                                                    {item.dipinjam}
                                                </td>
                                                <td className="p-4 text-center font-bold text-[#D84040]">
                                                    {item.maintenance}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(item)}
                                                            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1D1616] hover:bg-[#EEEEEE] transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
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
                </div>
            </div>

            {/* Modal Form Tambah / Edit Barang */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1616]/60 overflow-y-auto">
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl max-w-lg w-full p-6 shadow-xl my-8">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E0E0E0]">
                            <h3 className="text-base font-bold text-[#1D1616]">
                                {editingBarang ? 'Edit Master Barang' : 'Tambah Master Barang Baru'}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-[#6B7280] hover:text-[#1D1616]">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                        Kategori
                                    </label>
                                    <select
                                        value={data.kategori_id}
                                        onChange={(e) => setData('kategori_id', e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-semibold focus:outline-none focus:border-[#D84040]"
                                    >
                                        {categories.map((c) => (
                                             <option key={c.id} value={c.id}>
                                                {c.nama_kategori}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.kategori_id && <p className="text-[#D84040] text-xs mt-1">{errors.kategori_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                        Kode Barang (Unik)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.kode_barang}
                                        onChange={(e) => setData('kode_barang', e.target.value)}
                                        placeholder="Contoh: BOR-101"
                                        required
                                        className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-mono focus:outline-none focus:border-[#D84040]"
                                    />
                                    {errors.kode_barang && <p className="text-[#D84040] text-xs mt-1">{errors.kode_barang}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                    Nama Barang
                                </label>
                                <input
                                    type="text"
                                    value={data.nama_barang}
                                    onChange={(e) => setData('nama_barang', e.target.value)}
                                    placeholder="Contoh: Mesin Bor Cordless 18V"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                />
                                {errors.nama_barang && <p className="text-[#D84040] text-xs mt-1">{errors.nama_barang}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                    Lokasi Rak / Lemari
                                </label>
                                <input
                                    type="text"
                                    value={data.lokasi}
                                    onChange={(e) => setData('lokasi', e.target.value)}
                                    placeholder="Contoh: Lemari B-01 / Rak A-02"
                                    className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                    Detail Spesifikasi Teknis
                                </label>
                                <textarea
                                    value={data.detail_spesifikasi}
                                    onChange={(e) => setData('detail_spesifikasi', e.target.value)}
                                    rows={3}
                                    placeholder="Spesifikasi kelengkapan alat, daya, kapasitas..."
                                    className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
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
