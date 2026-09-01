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
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] placeholder-[#8C93A0] focus:outline-none focus:border-[#D84040]"
                        />
                        <Search size={16} className="absolute left-3.5 top-3 text-[#6B7280]" />
                    </form>

                    <button
                        onClick={openCreateModal}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                        <Plus size={16} />
                        <span>Tambah Kategori</span>
                    </button>
                </div>

                {/* Table Container */}
                <div className="bg-white border border-[#E0E0E0] rounded-2xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#EEEEEE] border-b border-[#E0E0E0] text-[#1D1616] uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="p-4">Nama Kategori</th>
                                    <th className="p-4">QR Code String</th>
                                    <th className="p-4 text-center">Master Barang</th>
                                    <th className="p-4 text-center">Total Unit</th>
                                    <th className="p-4 text-center">Status Unit (T / D / M)</th>
                                    <th className="p-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E0E0E0]">
                                {categories.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-[#6B7280] bg-white">
                                            Tidak ada kategori barang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    categories.data.map((kat) => (
                                        <tr key={kat.id} className="hover:bg-[#EEEEEE]/50 bg-white transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-[#1D1616] text-sm flex items-center gap-2">
                                                    <Boxes size={16} className="text-[#D84040]" />
                                                    {kat.nama_kategori}
                                                </div>
                                                <div className="text-[10px] text-[#6B7280] mt-0.5">Dibuat: {kat.created_at}</div>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => setQrModal(kat)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEEEEE] text-[#D84040] border border-[#E0E0E0] font-mono text-[11px] font-bold hover:bg-[#D84040] hover:text-white transition-colors cursor-pointer"
                                                >
                                                    <QrCode size={14} />
                                                    {kat.qr_code}
                                                </button>
                                            </td>
                                            <td className="p-4 text-center font-bold text-[#1D1616]">
                                                {kat.total_barang}
                                            </td>
                                            <td className="p-4 text-center font-extrabold text-[#D84040]">
                                                {kat.total_unit}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 font-mono text-[11px] bg-[#EEEEEE] px-3 py-1 rounded-lg border border-[#E0E0E0]">
                                                    <span className="text-emerald-700 font-bold" title="Tersedia">{kat.tersedia} T</span>
                                                    <span className="text-[#6B7280]">/</span>
                                                    <span className="text-amber-700 font-bold" title="Dipinjam">{kat.dipinjam} D</span>
                                                    <span className="text-[#6B7280]">/</span>
                                                    <span className="text-[#D84040] font-bold" title="Maintenance">{kat.maintenance} M</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(kat)}
                                                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1D1616] hover:bg-[#EEEEEE] transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(kat.id)}
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

            {/* Modal Form Kategori */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1616]/60 backdrop-blur-none">
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E0E0E0]">
                            <h3 className="text-base font-bold text-[#1D1616]">
                                {editingKategori ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-[#6B7280] hover:text-[#1D1616]">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                    Nama Kategori
                                </label>
                                <input
                                    type="text"
                                    value={data.nama_kategori}
                                    onChange={(e) => setData('nama_kategori', e.target.value)}
                                    placeholder="Contoh: Perkakas, Elektronik, Komponen"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                />
                                {errors.nama_kategori && (
                                    <p className="text-[#D84040] text-xs mt-1">{errors.nama_kategori}</p>
                                )}
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

            {/* Modal Preview QR Code */}
            {qrModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1616]/60">
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl max-w-sm w-full p-6 text-center shadow-xl">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E0E0E0]">
                            <h3 className="text-sm font-bold text-[#1D1616]">QR Code Kategori</h3>
                            <button onClick={() => setQrModal(null)} className="text-[#6B7280] hover:text-[#1D1616]">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="bg-white p-5 rounded-2xl inline-block border-2 border-[#E0E0E0] mb-4">
                            <QRCodeSVG
                                id={`qr-modal-svg-${qrModal.id}`}
                                value={qrModal.qr_code}
                                size={180}
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                        <div className="font-bold text-[#1D1616] text-base mb-1">{qrModal.nama_kategori}</div>
                        <p className="text-xs font-mono text-[#D84040] font-bold mb-3">{qrModal.qr_code}</p>
                        <p className="text-[11px] text-[#6B7280] mb-4">
                            Scan QR Code ini pada aplikasi Flutter Mobile untuk mengakses daftar peralatan dalam kategori ini.
                        </p>
                        <button
                            onClick={() => {
                                const svg = document.getElementById(`qr-modal-svg-${qrModal.id}`);
                                if (!svg) return;
                                const svgData = new XMLSerializer().serializeToString(svg);
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');
                                const img = new Image();
                                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                                const url = URL.createObjectURL(svgBlob);
                                img.onload = () => {
                                    const width = 600;
                                    const height = 750;
                                    canvas.width = width;
                                    canvas.height = height;
                                    ctx.fillStyle = '#FFFFFF';
                                    ctx.fillRect(0, 0, width, height);
                                    ctx.strokeStyle = '#E0E0E0';
                                    ctx.lineWidth = 4;
                                    ctx.strokeRect(20, 20, width - 40, height - 40);
                                    ctx.fillStyle = '#D84040';
                                    ctx.fillRect(20, 20, width - 40, 60);
                                    ctx.fillStyle = '#FFFFFF';
                                    ctx.font = 'bold 24px sans-serif';
                                    ctx.textAlign = 'center';
                                    ctx.fillText('WAMS WORKSHOP QR', width / 2, 58);
                                    const qrSize = 360;
                                    ctx.drawImage(img, (width - qrSize) / 2, 110, qrSize, qrSize);
                                    ctx.fillStyle = '#1D1616';
                                    ctx.font = 'bold 30px sans-serif';
                                    ctx.fillText(qrModal.nama_kategori, width / 2, 530);
                                    ctx.fillStyle = '#D84040';
                                    ctx.font = 'bold 20px monospace';
                                    ctx.fillText(qrModal.qr_code, width / 2, 570);
                                    ctx.fillStyle = '#9CA3AF';
                                    ctx.font = '14px sans-serif';
                                    ctx.fillText('Pindai dengan Aplikasi WAMS Mobile', width / 2, 670);

                                    const pngFile = canvas.toDataURL('image/png');
                                    const downloadLink = document.createElement('a');
                                    downloadLink.download = `WAMS_QR_${qrModal.nama_kategori.replace(/[^a-zA-Z0-9]/g, '_')}_ID${qrModal.id}.png`;
                                    downloadLink.href = pngFile;
                                    downloadLink.click();
                                    URL.revokeObjectURL(url);
                                };
                                img.src = url;
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                        >
                            <Download size={15} />
                            <span>Unduh QR Label (PNG)</span>
                        </button>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
