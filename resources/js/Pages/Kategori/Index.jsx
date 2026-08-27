import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Boxes,
    Plus,
    Search,
    Edit2,
    Trash2,
    QrCode,
    X,
    Layers,
    Download
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function KategoriIndex({ categories, filters }) {
    const [search, setSearch] = useState(filters.q || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingKategori, setEditingKategori] = useState(null);
    const [qrModal, setQrModal] = useState(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        nama_kategori: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/kategori', { q: search }, { preserveState: true });
    };

    const openCreateModal = () => {
        setEditingKategori(null);
        setData({ nama_kategori: '' });
        setModalOpen(true);
    };

    const openEditModal = (kat) => {
        setEditingKategori(kat);
        setData({ nama_kategori: kat.nama_kategori });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingKategori) {
            put(`/admin/kategori/${editingKategori.id}`, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            post('/admin/kategori', {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus kategori ini? Seluruh master barang di dalamnya juga akan terhapus.')) {
            router.delete(`/admin/kategori/${id}`);
        }
    };

    return (
        <AuthenticatedLayout title="Manajemen Kategori Barang">
            <Head title="Kategori Barang" />

            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
                <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama kategori..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
                </form>

                <button
                    onClick={openCreateModal}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                >
                    <Plus size={16} />
                    <span>Tambah Kategori</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="p-4">Nama Kategori</th>
                                <th className="p-4">QR Code String</th>
                                <th className="p-4 text-center">Master Barang</th>
                                <th className="p-4 text-center">Total Unit</th>
                                <th className="p-4 text-center">Status Unit (T / D / M)</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {categories.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        Tidak ada kategori barang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                categories.data.map((kat) => (
                                    <tr key={kat.id} className="hover:bg-slate-800/30">
                                        <td className="p-4">
                                            <div className="font-bold text-white text-sm flex items-center gap-2">
                                                <Boxes size={16} className="text-blue-400" />
                                                {kat.nama_kategori}
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">Dibuat: {kat.created_at}</div>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => setQrModal(kat)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 font-mono text-[11px] transition-colors"
                                            >
                                                <QrCode size={14} />
                                                {kat.qr_code}
                                            </button>
                                        </td>
                                        <td className="p-4 text-center font-semibold text-slate-300">
                                            {kat.total_barang}
                                        </td>
                                        <td className="p-4 text-center font-bold text-white">
                                            {kat.total_unit}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                                                <span className="text-emerald-400 font-bold" title="Tersedia">{kat.tersedia} T</span>
                                                <span className="text-slate-600">/</span>
                                                <span className="text-amber-400 font-bold" title="Dipinjam">{kat.dipinjam} D</span>
                                                <span className="text-slate-600">/</span>
                                                <span className="text-rose-400 font-bold" title="Maintenance">{kat.maintenance} M</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(kat)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(kat.id)}
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

            {/* Modal Form Kategori */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-white">
                                {editingKategori ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Nama Kategori
                                </label>
                                <input
                                    type="text"
                                    value={data.nama_kategori}
                                    onChange={(e) => setData('nama_kategori', e.target.value)}
                                    placeholder="Contoh: Peralatan Tangan (Hand Tools)"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                                />
                                {errors.nama_kategori && (
                                    <p className="text-rose-400 text-xs mt-1">{errors.nama_kategori}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
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

            {/* Modal Preview QR Code */}
            {qrModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-white">QR Code Kategori</h3>
                            <button onClick={() => setQrModal(null)} className="text-slate-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="bg-white p-6 rounded-2xl inline-block shadow-inner mb-4">
                            <QRCodeSVG
                                value={qrModal.qr_code}
                                size={180}
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                        <div className="font-bold text-white text-base mb-1">{qrModal.nama_kategori}</div>
                        <p className="text-xs font-mono text-blue-400 mb-4">{qrModal.qr_code}</p>
                        <p className="text-[11px] text-slate-400">
                            Scan QR Code ini pada aplikasi Flutter Mobile untuk mengakses daftar barang di kategori ini.
                        </p>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
