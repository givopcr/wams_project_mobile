import React, { useState, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
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
    UserCheck,
    Image as ImageIcon,
    UploadCloud,
    Eye,
    Tag
} from 'lucide-react';

export default function UnitIndex({ units, barangList, filters }) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedBarang, setSelectedBarang] = useState(filters.barang_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, itemBadge: null });
    const [imagePreview, setImagePreview] = useState(null);
    const [previewModalImage, setPreviewModalImage] = useState(null);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        barang_id: '',
        kode_unit: '',
        status: 'tersedia',
        kondisi: 'baik',
        gambar: null,
        hapus_gambar: false,
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
        clearErrors();
        reset();
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setData({
            barang_id: barangList.length > 0 ? barangList[0].id : '',
            kode_unit: '',
            status: 'tersedia',
            kondisi: 'baik',
            gambar: null,
            hapus_gambar: false,
        });
        setModalOpen(true);
    };

    const openEditModal = (u) => {
        setEditingUnit(u);
        clearErrors();
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setData({
            barang_id: u.barang_id,
            kode_unit: u.kode_unit,
            status: u.status,
            kondisi: u.kondisi,
            gambar: null,
            hapus_gambar: false,
        });
        setModalOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData((prev) => ({ ...prev, gambar: file, hapus_gambar: false }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveSelectedFile = () => {
        setData((prev) => ({ ...prev, gambar: null }));
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveExistingImage = () => {
        setData((prev) => ({ ...prev, gambar: null, hapus_gambar: true }));
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUnit) {
            post(`/admin/unit/${editingUnit.id}`, {
                onSuccess: () => {
                    setModalOpen(false);
                    setImagePreview(null);
                },
            });
        } else {
            post('/admin/unit', {
                onSuccess: () => {
                    setModalOpen(false);
                    setImagePreview(null);
                    reset();
                },
            });
        }
    };

    const openDeleteModal = (u) => {
        setDeleteModal({
            isOpen: true,
            id: u.id,
            itemBadge: `Kode Unit: ${u.kode_unit}`,
        });
    };

    const handleConfirmDelete = () => {
        if (!deleteModal.id) return;
        router.delete(`/admin/unit/${deleteModal.id}`, {
            onSuccess: () => setDeleteModal({ isOpen: false, id: null, itemBadge: null }),
        });
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
                                <th className="p-4">Foto & Kode Unit</th>
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
                                            <div className="flex items-center gap-3">
                                                <div
                                                    onClick={() => u.gambar_url && setPreviewModalImage({ url: u.gambar_url, nama: u.nama_barang, kode: u.kode_unit, kategori: u.nama_kategori })}
                                                    className={`w-11 h-11 rounded-xl bg-[#EEEEEE] border border-[#E0E0E0] overflow-hidden flex items-center justify-center shrink-0 relative group ${u.gambar_url ? 'cursor-pointer hover:ring-2 hover:ring-[#D84040]/50' : ''}`}
                                                    title={u.unit_gambar_url ? 'Foto khusus unit fisik (Klik untuk perbesar)' : u.gambar_url ? 'Foto master barang (Klik untuk perbesar)' : 'Belum ada foto'}
                                                >
                                                    {u.gambar_url ? (
                                                        <>
                                                            <img src={u.gambar_url} alt={u.kode_unit} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                                                <Eye size={13} />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <ImageIcon size={18} className="text-[#8C93A0]" />
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-[#1D1616] font-bold text-xs">
                                                        {u.kode_unit}
                                                    </span>
                                                    {u.unit_gambar_url ? (
                                                        <span className="block text-[10px] font-sans font-bold text-emerald-600 mt-1">
                                                            • Foto Khusus Unit
                                                        </span>
                                                    ) : u.gambar_url ? (
                                                        <span className="block text-[10px] font-sans font-medium text-[#8C93A0] mt-1">
                                                            • Ikut Master
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
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
                                                    onClick={() => openDeleteModal(u)}
                                                    className="p-1.5 rounded-lg text-[#D84040] hover:bg-[#D84040]/10 transition-colors cursor-pointer"
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

                {/* Pagination */}
                {units.links && units.links.length > 3 && (
                    <div className="p-4 border-t border-[#E0E0E0] flex items-center justify-end gap-3 bg-white">
                        <div className="flex items-center gap-1 flex-wrap">
                            {units.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    preserveState
                                    className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors ${
                                        link.active
                                            ? 'bg-[#D84040] text-white'
                                            : link.url
                                            ? 'text-[#1D1616] hover:bg-[#EEEEEE]'
                                            : 'text-gray-300 pointer-events-none'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
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

                            {/* Unggah Foto Unit Fisik */}
                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1.5 flex items-center justify-between">
                                    <span>Foto Spesifik Unit Fisik (Opsional)</span>
                                    <span className="text-[11px] font-normal text-[#6B7280]">Maks. 2MB (JPG, PNG, WebP)</span>
                                </label>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    className="hidden"
                                />

                                {imagePreview ? (
                                    /* Preview foto baru dipilih */
                                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={imagePreview}
                                                alt="Preview Unit"
                                                className="w-12 h-12 rounded-lg object-cover border border-emerald-300 shrink-0 bg-white"
                                            />
                                            <div className="min-w-0">
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mb-0.5">
                                                    <CheckCircle2 size={10} /> Foto Baru Dipilih
                                                </span>
                                                <p className="text-[11px] text-[#6B7280] truncate">
                                                    {data.gambar?.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-2.5 py-1 text-xs font-bold text-[#1D1616] bg-white border border-[#E0E0E0] rounded-lg hover:bg-gray-50 cursor-pointer shadow-2xs"
                                            >
                                                Ganti
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleRemoveSelectedFile}
                                                className="p-1.5 text-[#D84040] hover:bg-rose-100 rounded-lg cursor-pointer"
                                                title="Batal pilih foto"
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ) : editingUnit?.unit_gambar_url && !data.hapus_gambar ? (
                                    /* Foto khusus unit saat ini */
                                    <div className="p-3 bg-gray-50 border border-[#E0E0E0] rounded-xl flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={editingUnit.unit_gambar_url}
                                                alt={editingUnit.kode_unit}
                                                className="w-12 h-12 rounded-lg object-cover border border-[#E0E0E0] shrink-0 bg-white"
                                            />
                                            <div className="min-w-0">
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 mb-0.5">
                                                    <ImageIcon size={10} /> Foto Khusus Unit Ini
                                                </span>
                                                <p className="text-[11px] text-[#6B7280]">
                                                    Tersimpan di sistem
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-2.5 py-1 text-xs font-bold text-[#1D1616] bg-white border border-[#E0E0E0] rounded-lg hover:bg-gray-50 cursor-pointer shadow-2xs flex items-center gap-1"
                                            >
                                                <UploadCloud size={12} /> Ganti
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleRemoveExistingImage}
                                                className="p-1.5 text-[#D84040] hover:bg-rose-50 rounded-lg cursor-pointer"
                                                title="Hapus foto khusus unit ini (akan ikut foto master barang)"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Belum ada foto unit */
                                    <div>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-[#E0E0E0] hover:border-[#D84040] rounded-xl p-3.5 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-rose-50/10 group"
                                        >
                                            <div className="w-8 h-8 mx-auto rounded-full bg-[#EEEEEE] group-hover:bg-rose-50 flex items-center justify-center text-[#6B7280] group-hover:text-[#D84040] transition-colors mb-1.5">
                                                <UploadCloud size={16} />
                                            </div>
                                            <p className="text-xs font-bold text-[#1D1616]">
                                                Klik untuk unggah foto khusus unit
                                            </p>
                                            <p className="text-[10.5px] text-[#6B7280] mt-0.5">
                                                Jika dikosongkan, unit akan otomatis menggunakan foto Master Barang
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {errors.gambar && (
                                    <p className="text-[#D84040] text-xs mt-1">{errors.gambar}</p>
                                )}
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

            {/* Modal Lightbox Preview Foto */}
            {previewModalImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
                    onClick={() => setPreviewModalImage(null)}
                >
                    <div
                        className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl border border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-[#E0E0E0]">
                            <div className="min-w-0 pr-2">
                                <h3 className="font-extrabold text-[#1D1616] text-sm truncate">
                                    {previewModalImage.nama}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-mono text-xs font-bold text-[#D84040]">
                                        {previewModalImage.kode}
                                    </span>
                                    {previewModalImage.kategori && (
                                        <span className="text-[11px] text-[#6B7280]">
                                            • {previewModalImage.kategori}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setPreviewModalImage(null)}
                                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1D1616] hover:bg-[#EEEEEE] transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-4 bg-gray-50 flex items-center justify-center max-h-[70vh]">
                            <img
                                src={previewModalImage.url}
                                alt={previewModalImage.nama}
                                loading="lazy"
                                decoding="async"
                                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-xs border border-[#E0E0E0]"
                            />
                        </div>
                        <div className="p-3 bg-white border-t border-[#E0E0E0] text-right">
                            <button
                                onClick={() => setPreviewModalImage(null)}
                                className="px-4 py-1.5 bg-[#EEEEEE] hover:bg-gray-200 text-[#1D1616] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pop-up Card Alert Konfirmasi Hapus */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, itemBadge: null })}
                onConfirm={handleConfirmDelete}
                title="Hapus Unit Fisik"
                message="Yakin ingin menghapus unit fisik ini dari sistem? Unit yang telah dihapus tidak dapat dipinjam kembali."
                itemBadge={deleteModal.itemBadge}
                confirmText="Hapus"
                cancelText="Batal"
                variant="danger"
            />
        </AuthenticatedLayout>
    );
}
