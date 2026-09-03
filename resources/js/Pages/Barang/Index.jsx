import React, { useState, useMemo, useRef } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
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
    Filter,
    ChevronDown,
    ChevronRight,
    QrCode,
    Tag,
    UploadCloud,
    Image as ImageIcon,
    Eye
} from 'lucide-react';

export default function BarangIndex({ barangList, categories = [], categoryStats = [], filters }) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.kategori_id || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBarang, setEditingBarang] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [previewModalImage, setPreviewModalImage] = useState(null);
    const fileInputRef = useRef(null);

    // View Mode: 'master' (group by master item with unit badges & expandable rows) | 'unit' (flat list of every individual unit)
    const [viewMode, setViewMode] = useState('master');
    const [expandedRows, setExpandedRows] = useState({});

    // Unit Modal State
    const [unitModalOpen, setUnitModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [selectedBarangForUnit, setSelectedBarangForUnit] = useState(null);

    // Form Master Barang
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        kategori_id: '',
        nama_barang: '',
        kode_barang: '',
        detail_spesifikasi: '',
        lokasi: '',
        gambar: null,
        hapus_gambar: false,
    });

    // Form Unit Fisik
    const unitForm = useForm({
        barang_id: '',
        kode_unit: '',
        status: 'tersedia',
        kondisi: 'baik',
    });

    const toggleExpand = (id) => {
        setExpandedRows((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Flatten all physical units for 'unit' view mode
    const allFlatUnits = useMemo(() => {
        const list = [];
        if (barangList?.data) {
            barangList.data.forEach((item) => {
                (item.units || []).forEach((u) => {
                    list.push({
                        ...u,
                        parentBarang: item,
                        barang_id: item.id,
                        nama_barang: item.nama_barang,
                        kode_barang: item.kode_barang,
                        nama_kategori: item.nama_kategori,
                        lokasi: item.lokasi,
                        gambar_url: item.gambar_url,
                    });
                });
            });
        }
        return list;
    }, [barangList?.data]);

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
        clearErrors();
        reset();
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setData({
            kategori_id: categories.length > 0 ? categories[0].id : '',
            nama_barang: '',
            kode_barang: '',
            detail_spesifikasi: '',
            lokasi: '',
            gambar: null,
            hapus_gambar: false,
        });
        setModalOpen(true);
    };

    const openEditModal = (b) => {
        setEditingBarang(b);
        clearErrors();
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setData({
            kategori_id: b.kategori_id,
            nama_barang: b.nama_barang,
            kode_barang: b.kode_barang,
            detail_spesifikasi: b.detail_spesifikasi || '',
            lokasi: b.lokasi || '',
            gambar: null,
            hapus_gambar: false,
        });
        setModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setData((prev) => ({
                ...prev,
                gambar: file,
                hapus_gambar: false,
            }));
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleRemoveSelectedFile = () => {
        setData((prev) => ({
            ...prev,
            gambar: null,
        }));
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveExistingImage = () => {
        setData((prev) => ({
            ...prev,
            gambar: null,
            hapus_gambar: true,
        }));
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingBarang) {
            post(`/admin/barang/${editingBarang.id}`, {
                onSuccess: () => {
                    setModalOpen(false);
                    setImagePreview(null);
                },
            });
        } else {
            post('/admin/barang', {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                    setImagePreview(null);
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus master barang ini? Seluruh unit fisik dan logbook terkait juga akan dihapus.')) {
            router.delete(`/admin/barang/${id}`);
        }
    };

    // Unit Handlers
    const openAddUnitModal = (barang) => {
        setSelectedBarangForUnit(barang);
        setEditingUnit(null);
        unitForm.reset();

        // Suggest next unit code like BOR-101-04
        const count = (barang.units?.length || 0) + 1;
        const suggestedCode = `${barang.kode_barang}-${String(count).padStart(2, '0')}`;

        unitForm.setData({
            barang_id: barang.id,
            kode_unit: suggestedCode,
            status: 'tersedia',
            kondisi: 'baik',
        });
        setUnitModalOpen(true);
    };

    const openEditUnitModal = (barang, unit) => {
        setSelectedBarangForUnit(barang || unit.parentBarang);
        setEditingUnit(unit);
        unitForm.setData({
            barang_id: unit.barang_id,
            kode_unit: unit.kode_unit,
            status: u?.status || unit.status,
            kondisi: unit.kondisi,
        });
        setUnitModalOpen(true);
    };

    const handleUnitSubmit = (e) => {
        e.preventDefault();
        if (editingUnit) {
            unitForm.put(`/admin/unit/${editingUnit.id}`, {
                onSuccess: () => {
                    setUnitModalOpen(false);
                    unitForm.reset();
                },
            });
        } else {
            unitForm.post('/admin/unit', {
                onSuccess: () => {
                    setUnitModalOpen(false);
                    unitForm.reset();
                },
            });
        }
    };

    const handleDeleteUnit = (id) => {
        if (confirm('Yakin ingin menghapus unit fisik ini?')) {
            router.delete(`/admin/unit/${id}`);
        }
    };

    const getCategoryIcon = (name = '') => {
        const lower = name.toLowerCase();
        if (lower.includes('perkakas')) return <Wrench size={22} className="text-[#D84040]" />;
        if (lower.includes('elektronik')) return <Cpu size={22} className="text-blue-600" />;
        if (lower.includes('komponen')) return <Layers size={22} className="text-emerald-600" />;
        return <Package size={22} className="text-[#D84040]" />;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'tersedia':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={12} /> Tersedia
                    </span>
                );
            case 'dipinjam':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock size={12} /> Dipinjam
                    </span>
                );
            case 'maintenance':
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-[#D84040] border border-rose-200">
                        <AlertTriangle size={12} /> Maintenance
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout title="Manajemen Barang">
            <Head title="Manajemen Master Barang & Unit - WAMS" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* 1. STATISTIK KATEGORI CARDS */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-bold text-[#1D1616]">
                            Kategori Barang & Unit Workshop
                        </h2>
                        {selectedCategory && (
                            <button
                                onClick={() => handleCategoryFilter('')}
                                className="text-xs text-[#D84040] font-bold hover:underline cursor-pointer"
                            >
                                Reset Filter Kategori
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
                                    className={`bg-white rounded-2xl border p-5 shadow-2xs cursor-pointer transition-all ${
                                        isSelected
                                            ? 'border-[#D84040] ring-2 ring-[#D84040]/20 bg-rose-50/10'
                                            : 'border-[#E0E0E0] hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="w-12 h-12 rounded-xl bg-[#EEEEEE] flex items-center justify-center border border-[#E0E0E0]">
                                            {getCategoryIcon(cat.nama_kategori)}
                                        </div>
                                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#EEEEEE] text-[#1D1616]">
                                            {cat.total_barang} Model Barang
                                        </span>
                                    </div>

                                    <div className="mt-4">
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

                {/* 2. FILTER & TABLE MASTER / UNIT BARANG */}
                <div className="space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                        {/* Search Bar */}
                        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
                            <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama / kode master / kode unit..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] placeholder-[#8C93A0] focus:outline-none focus:border-[#D84040]"
                                />
                                <Search size={16} className="absolute left-3.5 top-3 text-[#6B7280]" />
                            </form>

                            {/* View Mode Toggle: Master vs Tiap Unit */}
                            <div className="flex items-center bg-[#EEEEEE] p-1 rounded-xl border border-[#E0E0E0] w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('master')}
                                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        viewMode === 'master'
                                            ? 'bg-white text-[#1D1616] shadow-xs'
                                            : 'text-[#6B7280] hover:text-[#1D1616]'
                                    }`}
                                >
                                    <Package size={14} />
                                    <span>Master Barang ({barangList.total || barangList.data.length})</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('unit')}
                                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        viewMode === 'unit'
                                            ? 'bg-white text-[#1D1616] shadow-xs'
                                            : 'text-[#6B7280] hover:text-[#1D1616]'
                                    }`}
                                >
                                    <Layers size={14} />
                                    <span>Tiap Unit Fisik ({allFlatUnits.length})</span>
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={openCreateModal}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                            >
                                <Plus size={16} />
                                <span>Tambah Master Barang</span>
                            </button>
                        </div>
                    </div>

                    {/* TABLE: MODE 1 - MASTER BARANG DENGAN BADGE & AKORDION UNIT */}
                    {viewMode === 'master' ? (
                        <div className="bg-white border border-[#E0E0E0] rounded-2xl overflow-hidden shadow-2xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-[#EEEEEE] border-b border-[#E0E0E0] text-[#1D1616] uppercase tracking-wider font-bold">
                                        <tr>
                                            <th className="p-4">Barang & Unit Fisik</th>
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
                                            barangList.data.map((item) => {
                                                const isExpanded = !!expandedRows[item.id];
                                                return (
                                                    <React.Fragment key={item.id}>
                                                        <tr className="hover:bg-[#EEEEEE]/40 bg-white transition-colors">
                                                            {/* Kolom Barang & List Unit Fisik */}
                                                            <td className="p-4 max-w-md">
                                                                <div className="flex items-start gap-3">
                                                                    <div
                                                                        onClick={() => item.gambar_url && setPreviewModalImage({ url: item.gambar_url, nama: item.nama_barang, kode: item.kode_barang, kategori: item.nama_kategori })}
                                                                        className={`w-12 h-12 rounded-xl bg-[#EEEEEE] border border-[#E0E0E0] overflow-hidden flex items-center justify-center shrink-0 mt-0.5 group relative ${item.gambar_url ? 'cursor-pointer hover:ring-2 hover:ring-[#D84040]/50' : ''}`}
                                                                        title={item.gambar_url ? 'Klik untuk melihat foto ukuran penuh' : 'Tidak ada gambar'}
                                                                    >
                                                                        {item.gambar_url ? (
                                                                            <>
                                                                                <img src={item.gambar_url} alt={item.nama_barang} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                                                                    <Eye size={16} />
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <Package size={22} className="text-[#D84040]" />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="font-extrabold text-[#1D1616] text-sm leading-tight">
                                                                            {item.nama_barang}
                                                                        </div>
                                                                        <div className="text-[11px] font-mono text-[#D84040] font-bold mt-0.5">
                                                                            Kode Master: {item.kode_barang}
                                                                        </div>

                                                                        {/* DAFTAR KODE UNIT FISIK (BOR-001, BOR-002, dst.) */}
                                                                        <div className="mt-2 pt-2 border-t border-[#E0E0E0]/60">
                                                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                                                <span className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
                                                                                    <Layers size={12} className="text-[#D84040]" />
                                                                                    Unit Terdaftar ({item.units?.length || 0}):
                                                                                </span>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => toggleExpand(item.id)}
                                                                                    className="text-[11px] font-bold text-[#D84040] hover:text-[#8E1616] inline-flex items-center gap-0.5 cursor-pointer"
                                                                                >
                                                                                    {isExpanded ? (
                                                                                        <>Tutup Rincian <ChevronDown size={12} /></>
                                                                                    ) : (
                                                                                        <>Kelola Unit <ChevronRight size={12} /></>
                                                                                    )}
                                                                                </button>
                                                                            </div>

                                                                            {item.units && item.units.length > 0 ? (
                                                                                <div className="flex flex-wrap items-center gap-1.5">
                                                                                    {item.units.map((u) => {
                                                                                        const isAvailable = u.status === 'tersedia';
                                                                                        const isBorrowed = u.status === 'dipinjam';
                                                                                        const badgeCls = isAvailable
                                                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                                            : isBorrowed
                                                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                                            : 'bg-rose-50 text-[#D84040] border-rose-200';
                                                                                        const dotCls = isAvailable ? 'bg-emerald-500' : isBorrowed ? 'bg-amber-500' : 'bg-[#D84040]';

                                                                                        return (
                                                                                            <span
                                                                                                key={u.id}
                                                                                                onClick={() => openEditUnitModal(item, u)}
                                                                                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${badgeCls} cursor-pointer hover:shadow-xs transition-shadow`}
                                                                                                title={`Klik untuk edit status unit: ${u.kode_unit} | Status: ${u.status} | Kondisi: ${u.kondisi}`}
                                                                                            >
                                                                                                <span className={`w-1.5 h-1.5 rounded-full ${dotCls}`} />
                                                                                                {u.kode_unit}
                                                                                            </span>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-[11px] text-[#8C93A0] italic">
                                                                                    Belum ada unit fisik terdaftar
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Kategori & Lokasi */}
                                                            <td className="p-4 align-top">
                                                                <div className="font-bold text-[#1D1616]">{item.nama_kategori}</div>
                                                                <div className="text-[11px] text-[#6B7280] flex items-center gap-1 mt-0.5 font-medium">
                                                                    <MapPin size={12} className="text-[#D84040]" /> {item.lokasi || 'Lokasi belum diset'}
                                                                </div>
                                                            </td>

                                                            {/* Total Unit dengan expander button */}
                                                            <td className="p-4 text-center align-top">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleExpand(item.id)}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EEEEEE] hover:bg-gray-200 text-[#1D1616] font-bold text-xs cursor-pointer transition-colors"
                                                                    title="Klik untuk melihat rincian unit fisik"
                                                                >
                                                                    <span>{item.total_unit} Unit</span>
                                                                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                                                </button>
                                                            </td>

                                                            {/* Status Counts */}
                                                            <td className="p-4 text-center font-bold text-emerald-700 align-top">
                                                                {item.tersedia}
                                                            </td>
                                                            <td className="p-4 text-center font-bold text-amber-700 align-top">
                                                                {item.dipinjam}
                                                            </td>
                                                            <td className="p-4 text-center font-bold text-[#D84040] align-top">
                                                                {item.maintenance}
                                                            </td>

                                                            {/* Aksi Master Barang */}
                                                            <td className="p-4 text-right align-top">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <button
                                                                        onClick={() => openAddUnitModal(item)}
                                                                        className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                                                                        title="Tambah Unit Fisik Baru"
                                                                    >
                                                                        <Plus size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => openEditModal(item)}
                                                                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1D1616] hover:bg-[#EEEEEE] transition-colors"
                                                                        title="Edit Master Barang"
                                                                    >
                                                                        <Edit2 size={15} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(item.id)}
                                                                        className="p-1.5 rounded-lg text-[#D84040] hover:bg-[#D84040]/10 transition-colors"
                                                                        title="Hapus Master Barang"
                                                                    >
                                                                        <Trash2 size={15} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        {/* SUB-ROW ACCORDION: DETAIL UNIT FISIK */}
                                                        {isExpanded && (
                                                            <tr className="bg-gray-50/80 border-b border-[#E0E0E0]">
                                                                <td colSpan={7} className="p-4 sm:p-5">
                                                                    <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-xs">
                                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-2.5 border-b border-[#E0E0E0]">
                                                                            <div className="flex items-center gap-2">
                                                                                <Layers size={16} className="text-[#D84040]" />
                                                                                <h4 className="font-extrabold text-xs text-[#1D1616]">
                                                                                    Rincian Unit Fisik: {item.nama_barang} ({item.units?.length || 0} Unit Terdaftar)
                                                                                </h4>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => openAddUnitModal(item)}
                                                                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-lg transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
                                                                            >
                                                                                <Plus size={13} />
                                                                                Tambah Unit Fisik
                                                                            </button>
                                                                        </div>

                                                                        {item.units && item.units.length > 0 ? (
                                                                            <div className="overflow-x-auto">
                                                                                <table className="w-full text-left text-xs">
                                                                                    <thead>
                                                                                        <tr className="border-b border-[#E0E0E0] text-[10px] text-[#6B7280] uppercase tracking-wider font-bold">
                                                                                            <th className="pb-2">Kode Unit Fisik</th>
                                                                                            <th className="pb-2">Status Peminjaman</th>
                                                                                            <th className="pb-2">Kondisi Fisik</th>
                                                                                            <th className="pb-2 text-right">Aksi Unit</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="divide-y divide-[#E0E0E0]/60">
                                                                                        {item.units.map((u) => (
                                                                                            <tr key={u.id} className="hover:bg-gray-50/70">
                                                                                                <td className="py-2.5 font-mono font-bold text-[#1D1616]">
                                                                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#EEEEEE] border border-[#E0E0E0]">
                                                                                                        <Tag size={12} className="text-[#6B7280]" />
                                                                                                        {u.kode_unit}
                                                                                                    </span>
                                                                                                </td>
                                                                                                <td className="py-2.5">
                                                                                                    {getStatusBadge(u.status)}
                                                                                                </td>
                                                                                                <td className="py-2.5">
                                                                                                    <span
                                                                                                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                                                                                                            u.kondisi === 'baik' ? 'text-emerald-700' : 'text-[#D84040]'
                                                                                                        }`}
                                                                                                    >
                                                                                                        {u.kondisi === 'baik' ? 'Layak / Baik' : 'Rusak / Perlu Servis'}
                                                                                                    </span>
                                                                                                </td>
                                                                                                <td className="py-2.5 text-right">
                                                                                                    <div className="flex items-center justify-end gap-1.5">
                                                                                                        <button
                                                                                                            onClick={() => openEditUnitModal(item, u)}
                                                                                                            className="p-1 rounded text-[#6B7280] hover:text-[#1D1616] hover:bg-gray-100 transition-colors"
                                                                                                            title="Edit Status Unit"
                                                                                                        >
                                                                                                            <Edit2 size={13} />
                                                                                                        </button>
                                                                                                        <button
                                                                                                            onClick={() => handleDeleteUnit(u.id)}
                                                                                                            className="p-1 rounded text-[#D84040] hover:bg-rose-50 transition-colors"
                                                                                                            title="Hapus Unit"
                                                                                                        >
                                                                                                            <Trash2 size={13} />
                                                                                                        </button>
                                                                                                    </div>
                                                                                                </td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="py-4 text-center text-xs text-[#6B7280]">
                                                                                Belum ada unit fisik. Klik tombol &quot;Tambah Unit Fisik&quot; untuk menambahkan unit pertama seperti {item.kode_barang}-01.
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {barangList.links && barangList.links.length > 3 && (
                                <div className="p-4 border-t border-[#E0E0E0] flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
                                    <span className="text-xs text-[#6B7280]">
                                        Menampilkan <span className="font-bold text-[#1D1616]">{barangList.from || 0}</span> sampai{' '}
                                        <span className="font-bold text-[#1D1616]">{barangList.to || 0}</span> dari{' '}
                                        <span className="font-bold text-[#1D1616]">{barangList.total || 0}</span> master barang
                                    </span>
                                    <div className="flex items-center gap-1 flex-wrap">
                                        {barangList.links.map((link, idx) => (
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
                    ) : (
                        /* TABLE: MODE 2 - TIAP UNIT FISIK SEBAGAI SATU BARIS (BOR-101-01, BOR-101-02, dst.) */
                        <div className="bg-white border border-[#E0E0E0] rounded-2xl overflow-hidden shadow-2xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-[#EEEEEE] border-b border-[#E0E0E0] text-[#1D1616] uppercase tracking-wider font-bold">
                                        <tr>
                                            <th className="p-4">Kode Unit Fisik</th>
                                            <th className="p-4">Nama Master Barang</th>
                                            <th className="p-4">Kategori & Lokasi</th>
                                            <th className="p-4 text-center">Status Unit</th>
                                            <th className="p-4 text-center">Kondisi</th>
                                            <th className="p-4 text-right">Aksi Unit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E0E0E0]">
                                        {allFlatUnits.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-[#6B7280] bg-white">
                                                    Tidak ada unit fisik ditemukan.
                                                </td>
                                            </tr>
                                        ) : (
                                            allFlatUnits.map((unit) => (
                                                <tr key={unit.id} className="hover:bg-[#EEEEEE]/40 bg-white transition-colors">
                                                    {/* Kode Unit */}
                                                    <td className="p-4 font-mono">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-[#1D1616] font-bold text-xs">
                                                            <Tag size={13} className="text-[#D84040]" />
                                                            {unit.kode_unit}
                                                        </span>
                                                    </td>

                                                    {/* Nama Barang Master */}
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                onClick={() => unit.gambar_url && setPreviewModalImage({ url: unit.gambar_url, nama: unit.nama_barang, kode: unit.kode_barang, kategori: unit.nama_kategori })}
                                                                className={`w-10 h-10 rounded-lg bg-[#EEEEEE] border border-[#E0E0E0] overflow-hidden flex items-center justify-center shrink-0 relative group ${unit.gambar_url ? 'cursor-pointer hover:ring-2 hover:ring-[#D84040]/50' : ''}`}
                                                                title={unit.gambar_url ? 'Klik untuk melihat foto' : ''}
                                                            >
                                                                {unit.gambar_url ? (
                                                                    <>
                                                                        <img src={unit.gambar_url} alt={unit.nama_barang} className="w-full h-full object-cover" />
                                                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                                                            <Eye size={12} />
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <Package size={16} className="text-[#D84040]" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-extrabold text-[#1D1616] text-xs">
                                                                    {unit.nama_barang}
                                                                </div>
                                                                <div className="text-[11px] font-mono text-[#6B7280] font-semibold">
                                                                    Master: {unit.kode_barang}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Kategori & Lokasi */}
                                                    <td className="p-4">
                                                        <div className="font-bold text-[#1D1616]">{unit.nama_kategori}</div>
                                                        <div className="text-[11px] text-[#6B7280] flex items-center gap-1 mt-0.5 font-medium">
                                                            <MapPin size={12} className="text-[#D84040]" /> {unit.lokasi || 'Lokasi belum diset'}
                                                        </div>
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="p-4 text-center">
                                                        {getStatusBadge(unit.status)}
                                                    </td>

                                                    {/* Kondisi */}
                                                    <td className="p-4 text-center">
                                                        <span
                                                            className={`font-bold capitalize text-xs ${
                                                                unit.kondisi === 'baik' ? 'text-emerald-700' : 'text-[#D84040]'
                                                            }`}
                                                        >
                                                            {unit.kondisi}
                                                        </span>
                                                    </td>

                                                    {/* Aksi Unit */}
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() => openEditUnitModal(unit.parentBarang, unit)}
                                                                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1D1616] hover:bg-[#EEEEEE] transition-colors"
                                                                title="Edit Status Unit"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUnit(unit.id)}
                                                                className="p-1.5 rounded-lg text-[#D84040] hover:bg-[#D84040]/10 transition-colors"
                                                                title="Hapus Unit Fisik"
                                                            >
                                                                <Trash2 size={14} />
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
                    )}
                </div>
            </div>

            {/* Modal Form Tambah / Edit Master Barang */}
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
                                        Kode Barang Master (Unik)
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

                            {/* Upload / Ganti / Hapus Gambar Master Barang */}
                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1.5 flex items-center justify-between">
                                    <span>Foto / Gambar Barang</span>
                                    <span className="text-[11px] font-normal text-[#6B7280]">Opsional (Maks. 2MB)</span>
                                </label>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    className="hidden"
                                />

                                {/* Kondisi 1: Preview file baru yang dipilih */}
                                {imagePreview ? (
                                    <div className="p-3.5 bg-rose-50/20 border border-rose-200 rounded-xl flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={imagePreview}
                                                alt="Preview Baru"
                                                className="w-14 h-14 rounded-lg object-cover border border-rose-300 shrink-0 bg-white"
                                            />
                                            <div className="min-w-0">
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 mb-1">
                                                    <CheckCircle2 size={10} /> Gambar Baru Terpilih
                                                </span>
                                                <p className="text-xs font-bold text-[#1D1616] truncate">
                                                    {data.gambar?.name || 'File dipilih'}
                                                </p>
                                                <p className="text-[11px] text-[#6B7280]">
                                                    {data.gambar?.size ? `${(data.gambar.size / 1024).toFixed(1)} KB` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-2.5 py-1.5 text-xs font-bold text-[#1D1616] bg-white border border-[#E0E0E0] rounded-lg hover:bg-gray-50 cursor-pointer transition-colors shadow-2xs"
                                            >
                                                Ganti
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleRemoveSelectedFile}
                                                className="p-1.5 text-[#D84040] hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
                                                title="Batal pilih gambar"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : editingBarang?.gambar_url && !data.hapus_gambar ? (
                                    /* Kondisi 2: Sedang Edit dan memiliki gambar yang sudah ada */
                                    <div className="p-3.5 bg-[#EEEEEE]/50 border border-[#E0E0E0] rounded-xl flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={editingBarang.gambar_url}
                                                alt={editingBarang.nama_barang}
                                                className="w-14 h-14 rounded-lg object-cover border border-[#E0E0E0] shrink-0 bg-white"
                                            />
                                            <div className="min-w-0">
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 mb-1">
                                                    <ImageIcon size={10} /> Gambar Saat Ini
                                                </span>
                                                <p className="text-xs font-bold text-[#1D1616] truncate">
                                                    {editingBarang.nama_barang}
                                                </p>
                                                <p className="text-[11px] text-[#6B7280]">
                                                    Klik tombol untuk mengganti atau menghapus
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-2.5 py-1.5 text-xs font-bold text-[#1D1616] bg-white border border-[#E0E0E0] rounded-lg hover:bg-gray-50 cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                                            >
                                                <UploadCloud size={13} /> Ganti
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleRemoveExistingImage}
                                                className="p-1.5 text-[#D84040] hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                                title="Hapus foto dari barang ini"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Kondisi 3: Belum ada gambar / gambar dihapus */
                                    <div>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-[#E0E0E0] hover:border-[#D84040] rounded-xl p-4 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-rose-50/10 group"
                                        >
                                            <div className="w-10 h-10 mx-auto rounded-full bg-[#EEEEEE] group-hover:bg-rose-50 flex items-center justify-center text-[#6B7280] group-hover:text-[#D84040] transition-colors mb-2">
                                                <UploadCloud size={20} />
                                            </div>
                                            <p className="text-xs font-bold text-[#1D1616]">
                                                Klik untuk memilih atau unggah foto barang
                                            </p>
                                            <p className="text-[11px] text-[#6B7280] mt-0.5">
                                                Format file: PNG, JPG, JPEG, WEBP (Maks. 2 MB)
                                            </p>
                                        </div>
                                        {data.hapus_gambar && (
                                            <div className="mt-2 flex items-center justify-between text-xs text-[#D84040] bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                                                <span>Foto saat ini akan dihapus saat disimpan.</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setData('hapus_gambar', false)}
                                                    className="text-xs font-bold underline cursor-pointer text-[#D84040] hover:text-[#8E1616]"
                                                >
                                                    Batalkan Hapus
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {errors.gambar && (
                                    <p className="text-[#D84040] text-xs font-bold mt-1.5 flex items-center gap-1">
                                        <AlertTriangle size={12} /> {errors.gambar}
                                    </p>
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
                                    {processing ? 'Menyimpan...' : 'Simpan Master Barang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Form Tambah / Edit Unit Fisik */}
            {unitModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1616]/60 overflow-y-auto">
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl max-w-md w-full p-6 shadow-xl my-8">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E0E0E0]">
                            <div>
                                <h3 className="text-base font-bold text-[#1D1616]">
                                    {editingUnit ? 'Edit Unit Fisik' : 'Tambah Unit Fisik Baru'}
                                </h3>
                                {selectedBarangForUnit && (
                                    <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                                        Barang: {selectedBarangForUnit.nama_barang} ({selectedBarangForUnit.kode_barang})
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setUnitModalOpen(false)} className="text-[#6B7280] hover:text-[#1D1616]">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleUnitSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                    Kode Unit Fisik (Unik)
                                </label>
                                <input
                                    type="text"
                                    value={unitForm.data.kode_unit}
                                    onChange={(e) => unitForm.setData('kode_unit', e.target.value)}
                                    placeholder="Contoh: BOR-101-01"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-mono focus:outline-none focus:border-[#D84040]"
                                />
                                {unitForm.errors.kode_unit && (
                                    <p className="text-[#D84040] text-xs mt-1">{unitForm.errors.kode_unit}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                        Status Peminjaman
                                    </label>
                                    <select
                                        value={unitForm.data.status}
                                        onChange={(e) => unitForm.setData('status', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-semibold focus:outline-none focus:border-[#D84040]"
                                    >
                                        <option value="tersedia">Tersedia</option>
                                        <option value="dipinjam">Dipinjam</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                        Kondisi Fisik
                                    </label>
                                    <select
                                        value={unitForm.data.kondisi}
                                        onChange={(e) => unitForm.setData('kondisi', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-semibold focus:outline-none focus:border-[#D84040]"
                                    >
                                        <option value="baik">Baik</option>
                                        <option value="rusak">Rusak</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setUnitModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7280] hover:bg-[#EEEEEE]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={unitForm.processing}
                                    className="px-4 py-2 bg-[#D84040] hover:bg-[#8E1616] text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                    {unitForm.processing ? 'Menyimpan...' : 'Simpan Unit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lightbox / Preview Foto Master Barang */}
            {previewModalImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1616]/80 backdrop-blur-xs animate-in fade-in duration-150"
                    onClick={() => setPreviewModalImage(null)}
                >
                    <div
                        className="bg-white border border-[#E0E0E0] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-[#E0E0E0] flex items-center justify-between bg-white">
                            <div>
                                <h3 className="font-extrabold text-sm text-[#1D1616]">
                                    {previewModalImage.nama}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] font-mono font-bold text-[#D84040]">
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
        </AuthenticatedLayout>
    );
}
