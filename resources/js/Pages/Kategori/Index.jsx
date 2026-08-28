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
        <AuthenticatedLayout title="Kategori Barang">
            <Head title="Kategori Barang - WAMS" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama kategori..."
                            className="w-full pl-10 pr-4 py-2.5 bg-[#FFF2DB] border border-[#F0DFC4] rounded-xl text-xs text-[#1E232A] placeholder-[#8C93A0] focus:outline-none focus:border-[#F62440]"
                        />
                        <Search size={16} className="absolute left-3.5 top-3 text-[#6B7280]" />
                    </form>

                    <button
                        onClick={openCreateModal}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F62440] hover:bg-[#D91A33] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                        <Plus size={16} />
                        <span>Tambah Kategori</span>
                    </button>
                </div>

                {/* Flat Table Container */}
                <div className="bg-[#FFF2DB] border border-[#F0DFC4] rounded-2xl overflow-hidden shadow-none">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#FFE5BF] border-b border-[#F0DFC4] text-[#1E232A] uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="p-4">Nama Kategori</th>
                                    <th className="p-4">QR Code String</th>
                                    <th className="p-4 text-center">Master Barang</th>
                                    <th className="p-4 text-center">Total Unit</th>
                                    <th className="p-4 text-center">Status Unit (T / D / M)</th>
                                    <th className="p-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0DFC4]">
                                {categories.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-[#6B7280] bg-[#FFFAF3]">
                                            Tidak ada kategori barang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    categories.data.map((kat) => (
                                        <tr key={kat.id} className="hover:bg-[#FFE5BF]/40 bg-[#FFFAF3] transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-[#1E232A] text-sm flex items-center gap-2">
                                                    <Boxes size={16} className="text-[#F62440]" />
                                                    {kat.nama_kategori}
                                                </div>
                                                <div className="text-[10px] text-[#6B7280] mt-0.5">Dibuat: {kat.created_at}</div>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => setQrModal(kat)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFE5BF] text-[#F62440] border border-[#F0DFC4] font-mono text-[11px] font-bold hover:bg-[#F62440] hover:text-white transition-colors cursor-pointer"
                                                >
                                                    <QrCode size={14} />
                                                    {kat.qr_code}
                                                </button>
                                            </td>
                                            <td className="p-4 text-center font-bold text-[#1E232A]">
                                                {kat.total_barang}
                                            </td>
                                            <td className="p-4 text-center font-extrabold text-[#F62440]">
                                                {kat.total_unit}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 font-mono text-[11px] bg-[#FFF2DB] px-3 py-1 rounded-lg border border-[#F0DFC4]">
                                                    <span className="text-[#059669] font-bold" title="Tersedia">{kat.tersedia} T</span>
                                                    <span className="text-[#6B7280]">/</span>
                                                    <span className="text-[#D97706] font-bold" title="Dipinjam">{kat.dipinjam} D</span>
                                                    <span className="text-[#6B7280]">/</span>
                                                    <span className="text-[#F62440] font-bold" title="Maintenance">{kat.maintenance} M</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(kat)}
                                                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1E232A] hover:bg-[#FFE5BF] transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(kat.id)}
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

            {/* Modal Form Kategori */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E232A]/50 backdrop-blur-none">
                    <div className="bg-[#FFFAF3] border border-[#F0DFC4] rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0DFC4]">
                            <h3 className="text-base font-bold text-[#1E232A]">
                                {editingKategori ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-[#6B7280] hover:text-[#1E232A]">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#1E232A] mb-1.5">
                                    Nama Kategori
                                </label>
                                <input
                                    type="text"
                                    value={data.nama_kategori}
                                    onChange={(e) => setData('nama_kategori', e.target.value)}
                                    placeholder="Contoh: Perkakas, Elektronik, Komponen"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-[#FFF2DB] border border-[#F0DFC4] rounded-xl text-xs text-[#1E232A] focus:outline-none focus:border-[#F62440]"
                                />
                                {errors.nama_kategori && (
                                    <p className="text-[#F62440] text-xs mt-1">{errors.nama_kategori}</p>
                                )}
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

            {/* Modal Preview QR Code */}
            {qrModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E232A]/50">
                    <div className="bg-[#FFFAF3] border border-[#F0DFC4] rounded-2xl max-w-sm w-full p-6 text-center shadow-xl">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F0DFC4]">
                            <h3 className="text-sm font-bold text-[#1E232A]">QR Code Kategori</h3>
                            <button onClick={() => setQrModal(null)} className="text-[#6B7280] hover:text-[#1E232A]">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="bg-white p-5 rounded-2xl inline-block border-2 border-[#F0DFC4] mb-4">
                            <QRCodeSVG
                                value={qrModal.qr_code}
                                size={180}
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                        <div className="font-bold text-[#1E232A] text-base mb-1">{qrModal.nama_kategori}</div>
                        <p className="text-xs font-mono text-[#F62440] font-bold mb-3">{qrModal.qr_code}</p>
                        <p className="text-[11px] text-[#6B7280]">
                            Scan QR Code ini pada aplikasi Flutter Mobile untuk mengakses daftar peralatan dalam kategori ini.
                        </p>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
