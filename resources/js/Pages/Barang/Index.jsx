import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
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
    Eye,
    ShieldAlert,
    ShieldCheck
} from 'lucide-react';

export default function BarangIndex({ barangList, categories = [], categoryStats = [], filters }) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.kategori_id || '');

    // Tab Filter: 'semua' | 'aset' | 'habis_pakai' (Persist via URL query param ?tipe=...)
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const tipeParam = urlParams.get('tipe');
            if (tipeParam === 'aset' || tipeParam === 'habis_pakai') {
                return tipeParam;
            }
        }
        return filters.tipe || 'semua';
    });

    const [isTableLoading, setIsTableLoading] = useState(false);

    const handleTabChange = (newTab) => {
        setIsTableLoading(true);
        setActiveTab(newTab);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (newTab && newTab !== 'semua') {
                url.searchParams.set('tipe', newTab);
            } else {
                url.searchParams.delete('tipe');
            }
            window.history.replaceState({}, '', url.toString());
        }
        setTimeout(() => {
            setIsTableLoading(false);
        }, 180);
    };

    // Auto trigger skeleton on router start/finish for in-page updates
    useEffect(() => {
        const unbindStart = router.on('start', (event) => {
            const targetUrl = event?.detail?.visit?.url;
            const path = typeof targetUrl === 'string' ? targetUrl : targetUrl?.pathname || '';
            if (path.includes('/barang')) {
                setIsTableLoading(true);
            }
        });
        const unbindFinish = router.on('finish', () => {
            setIsTableLoading(false);
        });
        const unbindError = () => {
            setIsTableLoading(false);
        };
        return () => {
            unbindStart();
            unbindFinish();
            unbindError();
        };
    }, []);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingBarang, setEditingBarang] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [previewModalImage, setPreviewModalImage] = useState(null);
    const fileInputRef = useRef(null);
    const unitFileInputRef = useRef(null);
    const [unitImagePreview, setUnitImagePreview] = useState(null);

    // View Mode: 'master' (group by master item with unit badges & expandable rows) | 'unit' (flat list of every individual unit)
    const [viewMode, setViewMode] = useState('master');
    const [expandedRows, setExpandedRows] = useState({});

    // Unit Modal State
    const [unitModalOpen, setUnitModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [selectedBarangForUnit, setSelectedBarangForUnit] = useState(null);

    // Delete Confirmation Pop-up Card State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        type: null,
        id: null,
        title: '',
        message: '',
        itemBadge: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    // Form Master Barang
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        kategori_id: '',
        nama_barang: '',
        kode_barang: '',
        satuan: 'pcs',
        stok_saat_ini: '',
        stok_minimum: '5',
        detail_spesifikasi: '',
        lokasi: '',
        gambar: null,
        hapus_gambar: false,
        perlu_persetujuan: false,
        jumlah_unit: '',
    });

    // Form Restock Bahan Habis Pakai
    const [restockModal, setRestockModal] = useState({ isOpen: false, barang: null });
    const {
        data: restockData,
        setData: setRestockData,
        post: postRestock,
        processing: restockProcessing,
        reset: resetRestock,
        errors: restockErrors,
    } = useForm({
        jumlah: '',
        keterangan: '',
    });

    // Modal Kartu Stok
    const [kartuStokModal, setKartuStokModal] = useState({
        isOpen: false,
        loading: false,
        barang: null,
        mutasi: [],
    });

    // Prevent background scrolling while any modal is open
    useEffect(() => {
        const isAnyModalOpen = Boolean(
            modalOpen ||
            unitModalOpen ||
            previewModalImage ||
            deleteModal?.isOpen ||
            restockModal?.isOpen ||
            kartuStokModal?.isOpen
        );
        if (isAnyModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [modalOpen, unitModalOpen, previewModalImage, deleteModal.isOpen, restockModal.isOpen, kartuStokModal.isOpen]);

    // Form Unit Fisik
    const unitForm = useForm({
        barang_id: '',
        kode_unit: '',
        status: 'tersedia',
        kondisi: 'baik',
        jumlah_unit: 1,
        gambar: null,
        hapus_gambar: false,
    });

    const toggleExpand = (id) => {
        setExpandedRows((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Tab Counts (Semua, Aset, Habis Pakai, dan Low Stock Alert)
    const tabCounts = useMemo(() => {
        const all = barangList?.data || [];
        const totalAll = all.length;
        const totalAset = all.filter((i) => (i.tipe_kategori || 'aset') === 'aset').length;
        const totalHabisPakai = all.filter((i) => i.tipe_kategori === 'habis_pakai').length;
        const totalLowStock = all.filter((i) => i.tipe_kategori === 'habis_pakai' && i.is_low_stock).length;
        return { totalAll, totalAset, totalHabisPakai, totalLowStock };
    }, [barangList?.data]);

    // Client-side Filtered Master Barang respecting the active tab
    const filteredBarangList = useMemo(() => {
        if (!barangList?.data) return [];
        return barangList.data.filter((item) => {
            const itemTipe = item.tipe_kategori || 'aset';
            if (activeTab === 'aset' && itemTipe !== 'aset') return false;
            if (activeTab === 'habis_pakai' && itemTipe !== 'habis_pakai') return false;
            return true;
        });
    }, [barangList?.data, activeTab]);

    // Flatten physical units respecting active tab
    const allFlatUnits = useMemo(() => {
        const list = [];
        if (activeTab === 'habis_pakai') return []; // Habis pakai tidak memiliki unit fisik
        if (barangList?.data) {
            barangList.data.forEach((item) => {
                const itemTipe = item.tipe_kategori || 'aset';
                if (itemTipe !== 'aset') return;
                (item.units || []).forEach((u) => {
                    list.push({
                        ...u,
                        parentBarang: item,
                        barang_id: item.id,
                        nama_barang: item.nama_barang,
                        kode_barang: item.kode_barang,
                        nama_kategori: item.nama_kategori,
                        lokasi: item.lokasi,
                        gambar_url: u.gambar_url || item.gambar_url,
                        unit_gambar_url: u.unit_gambar_url,
                    });
                });
            });
        }
        return list;
    }, [barangList?.data, activeTab]);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = { q: search };
        if (selectedCategory) params.kategori_id = selectedCategory;
        if (activeTab && activeTab !== 'semua') params.tipe = activeTab;
        setIsTableLoading(true);
        router.get('/admin/barang', params, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsTableLoading(false),
        });
    };

    const handleCategoryFilter = (catId) => {
        const newCatId = selectedCategory === String(catId) ? '' : String(catId);
        setSelectedCategory(newCatId);
        const params = { q: search, kategori_id: newCatId };
        if (activeTab && activeTab !== 'semua') params.tipe = activeTab;
        setIsTableLoading(true);
        router.get('/admin/barang', params, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsTableLoading(false),
        });
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
            satuan: 'pcs',
            stok_saat_ini: '',
            stok_minimum: '5',
            detail_spesifikasi: '',
            lokasi: '',
            gambar: null,
            hapus_gambar: false,
            perlu_persetujuan: false,
            jumlah_unit: '',
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
            satuan: b.satuan || 'pcs',
            stok_saat_ini: b.stok_saat_ini ?? '',
            stok_minimum: b.stok_minimum ?? '5',
            detail_spesifikasi: b.detail_spesifikasi || '',
            lokasi: b.lokasi || '',
            gambar: null,
            hapus_gambar: false,
            perlu_persetujuan: Boolean(b.perlu_persetujuan),
            jumlah_unit: '',
        });
        setModalOpen(true);
    };

    const handleOpenRestock = (b) => {
        setRestockModal({ isOpen: true, barang: b });
        setRestockData({ jumlah: '', keterangan: '' });
    };

    const handleRestockSubmit = (e) => {
        e.preventDefault();
        if (!restockModal.barang) return;
        postRestock(`/admin/barang/${restockModal.barang.id}/restock`, {
            onSuccess: () => {
                setRestockModal({ isOpen: false, barang: null });
                resetRestock();
            },
        });
    };

    const handleOpenKartuStok = async (b) => {
        setKartuStokModal({ isOpen: true, loading: true, barang: b, mutasi: [] });
        try {
            const res = await fetch(`/admin/barang/${b.id}/kartu-stok`);
            const json = await res.json();
            setKartuStokModal({
                isOpen: true,
                loading: false,
                barang: json.barang || b,
                mutasi: json.mutasi || [],
            });
        } catch (err) {
            setKartuStokModal((prev) => ({ ...prev, loading: false }));
        }
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

    const openDeleteModal = (item) => {
        setDeleteModal({
            isOpen: true,
            type: 'barang',
            id: item.id,
            title: 'Hapus Barang',
            message: 'Yakin ingin menghapus barang ini? Seluruh unit fisik dan riwayat logbook terkait juga akan dihapus secara permanen.',
            itemBadge: `${item.kode_barang} • ${item.nama_barang}`,
        });
    };

    // Unit Handlers
    const openAddUnitModal = (barang) => {
        setSelectedBarangForUnit(barang);
        setEditingUnit(null);
        unitForm.clearErrors();
        unitForm.reset();
        setUnitImagePreview(null);
        if (unitFileInputRef.current) unitFileInputRef.current.value = '';

        // Suggest next unit code like BOR-101-04
        const count = (barang.units?.length || 0) + 1;
        const suggestedCode = `${barang.kode_barang}-${String(count).padStart(2, '0')}`;

        unitForm.setData({
            barang_id: barang.id,
            kode_unit: suggestedCode,
            status: 'tersedia',
            kondisi: 'baik',
            jumlah_unit: 1,
            gambar: null,
            hapus_gambar: false,
        });
        setUnitModalOpen(true);
    };

    const openEditUnitModal = (barang, unit) => {
        setSelectedBarangForUnit(barang || unit.parentBarang);
        setEditingUnit(unit);
        unitForm.clearErrors();
        setUnitImagePreview(null);
        if (unitFileInputRef.current) unitFileInputRef.current.value = '';

        unitForm.setData({
            barang_id: unit.barang_id,
            kode_unit: unit.kode_unit,
            status: unit.status,
            kondisi: unit.kondisi,
            jumlah_unit: 1,
            gambar: null,
            hapus_gambar: false,
        });
        setUnitModalOpen(true);
    };

    const handleUnitImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            unitForm.setData((prev) => ({ ...prev, gambar: file, hapus_gambar: false }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setUnitImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveUnitSelectedFile = () => {
        unitForm.setData((prev) => ({ ...prev, gambar: null }));
        setUnitImagePreview(null);
        if (unitFileInputRef.current) unitFileInputRef.current.value = '';
    };

    const handleRemoveExistingUnitImage = () => {
        unitForm.setData((prev) => ({ ...prev, gambar: null, hapus_gambar: true }));
        setUnitImagePreview(null);
        if (unitFileInputRef.current) unitFileInputRef.current.value = '';
    };

    const handleUnitSubmit = (e) => {
        e.preventDefault();
        if (editingUnit) {
            unitForm.post(`/admin/unit/${editingUnit.id}`, {
                onSuccess: () => {
                    setUnitModalOpen(false);
                    setUnitImagePreview(null);
                    unitForm.reset();
                },
            });
        } else {
            unitForm.post('/admin/unit', {
                onSuccess: () => {
                    setUnitModalOpen(false);
                    setUnitImagePreview(null);
                    unitForm.reset();
                },
            });
        }
    };

    const openDeleteUnitModal = (unit) => {
        setDeleteModal({
            isOpen: true,
            type: 'unit',
            id: unit.id,
            title: 'Hapus Unit Fisik',
            message: 'Yakin ingin menghapus unit fisik ini? Data unit yang telah dihapus tidak akan dapat dipinjam kembali.',
            itemBadge: `Kode Unit: ${unit.kode_unit}`,
        });
    };

    const handleConfirmDelete = () => {
        if (!deleteModal.id || isDeleting) return;
        setIsDeleting(true);
        if (deleteModal.type === 'barang') {
            router.delete(`/admin/barang/${deleteModal.id}`, {
                onSuccess: () => {
                    setIsDeleting(false);
                    setDeleteModal((prev) => ({ ...prev, isOpen: false }));
                },
                onError: () => setIsDeleting(false),
                onFinish: () => setIsDeleting(false),
            });
        } else if (deleteModal.type === 'unit') {
            router.delete(`/admin/unit/${deleteModal.id}`, {
                onSuccess: () => {
                    setIsDeleting(false);
                    setDeleteModal((prev) => ({ ...prev, isOpen: false }));
                },
                onError: () => setIsDeleting(false),
                onFinish: () => setIsDeleting(false),
            });
        }
    };

    const getCategoryIcon = (name = '') => {
        const lower = name.toLowerCase();
        if (lower.includes('perkakas')) return <Wrench size={22} className="text-[#D84040]" />;
        if (lower.includes('elektronik')) return <Cpu size={22} className="text-amber-600" />;
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
            <Head title="Manajemen Barang - WAMS" />

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
                        {categoryStats.length === 0 ? (
                            [1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-2xs space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="w-12 h-12 rounded-xl bg-[#EEEEEE] border border-[#E0E0E0] shimmer-box" />
                                        <div className="w-24 h-6 rounded-full shimmer-box opacity-75" />
                                    </div>
                                    <div className="space-y-1.5 pt-1">
                                        <div className="w-32 h-5 rounded-md shimmer-box" />
                                        <div className="w-24 h-3.5 rounded shimmer-box opacity-60" />
                                    </div>
                                    <div className="pt-4 mt-4 border-t border-[#E0E0E0] grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-[#EEEEEE] p-2 rounded-lg border border-[#E0E0E0] space-y-1">
                                            <div className="w-10 h-2 mx-auto rounded shimmer-box opacity-60" />
                                            <div className="w-6 h-4 mx-auto rounded shimmer-box" />
                                        </div>
                                        <div className="bg-[#EEEEEE] p-2 rounded-lg border border-[#E0E0E0] space-y-1">
                                            <div className="w-10 h-2 mx-auto rounded shimmer-box opacity-60" />
                                            <div className="w-6 h-4 mx-auto rounded shimmer-box" />
                                        </div>
                                        <div className="bg-[#EEEEEE] p-2 rounded-lg border border-[#E0E0E0] space-y-1">
                                            <div className="w-10 h-2 mx-auto rounded shimmer-box opacity-60" />
                                            <div className="w-6 h-4 mx-auto rounded shimmer-box" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            categoryStats.map((cat) => {
                                const isSelected = selectedCategory === String(cat.id);
                                return (
                                    <div
                                        key={cat.id}
                                        onClick={() => handleCategoryFilter(cat.id)}
                                        className={`bg-white rounded-2xl border p-5 shadow-2xs cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg active:scale-[0.98] ${
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
                            })
                        )}
                    </div>
                </div>

                {/* 2. FILTER & TABLE MASTER / UNIT BARANG */}
                <div className="space-y-4">
                    {/* SEGMENTED TAB FILTER: SEMUA | ASET FISIK | BAHAN HABIS PAKAI */}
                    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white border border-[#E0E0E0] rounded-2xl shadow-2xs">
                        <button
                            type="button"
                            onClick={() => handleTabChange('semua')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'semua'
                                    ? 'bg-[#1D1616] text-white shadow-xs'
                                    : 'text-[#6B7280] hover:text-[#1D1616] hover:bg-gray-100'
                            }`}
                        >
                            <Package size={15} />
                            <span>Semua Barang</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                activeTab === 'semua' ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#6B7280]'
                            }`}>
                                {tabCounts.totalAll}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTabChange('aset')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'aset'
                                    ? 'bg-[#D84040] text-white shadow-xs'
                                    : 'text-[#D84040] hover:text-[#8E1616] hover:bg-rose-50/60'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${activeTab === 'aset' ? 'bg-white' : 'bg-[#D84040]'}`} />
                            <span>Aset</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                activeTab === 'aset' ? 'bg-white/20 text-white' : 'bg-rose-50 text-[#D84040] border border-rose-200'
                            }`}>
                                {tabCounts.totalAset}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTabChange('habis_pakai')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'habis_pakai'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'text-amber-800 hover:text-amber-950 hover:bg-amber-50/60'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${activeTab === 'habis_pakai' ? 'bg-white' : 'bg-amber-500'}`} />
                            <span>Habis Pakai</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                activeTab === 'habis_pakai' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                                {tabCounts.totalHabisPakai}
                            </span>
                            {tabCounts.totalLowStock > 0 && (
                                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-red-500 text-white animate-pulse" title="Terdapat bahan yang perlu restock">
                                    {tabCounts.totalLowStock} Menipis
                                </span>
                            )}
                        </button>
                    </div>

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
                                    <span>Barang ({filteredBarangList.length})</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('unit')}
                                    disabled={activeTab === 'habis_pakai'}
                                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        activeTab === 'habis_pakai'
                                            ? 'opacity-40 cursor-not-allowed text-[#8C93A0]'
                                            : viewMode === 'unit'
                                            ? 'bg-white text-[#1D1616] shadow-xs'
                                            : 'text-[#6B7280] hover:text-[#1D1616]'
                                    }`}
                                    title={activeTab === 'habis_pakai' ? 'Bahan habis pakai tidak memiliki unit fisik individual' : 'Lihat daftar per unit fisik'}
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
                                <span className="font-bold">Tambah Barang</span>
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
                                            <th className="p-4 text-center">Stok</th>
                                            <th className="p-4 text-center">Tersedia</th>
                                            <th className="p-4 text-center">Dipinjam</th>
                                            <th className="p-4 text-center">Maintenance</th>
                                            <th className="p-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E0E0E0]">
                                        {isTableLoading ? (
                                            [1, 2, 3, 4, 5].map((idx) => (
                                                <tr key={`skel-master-${idx}`} className="bg-white">
                                                    <td className="p-4 max-w-md">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-12 h-12 rounded-xl shimmer-box shrink-0 mt-0.5" />
                                                            <div className="space-y-2 flex-1 min-w-0">
                                                                <div className="w-44 h-4 rounded-md shimmer-box" />
                                                                <div className="w-24 h-3 rounded shimmer-box opacity-60" />
                                                                <div className="flex items-center gap-1.5 pt-1">
                                                                    <div className="w-16 h-5 rounded-md shimmer-box opacity-50" />
                                                                    <div className="w-16 h-5 rounded-md shimmer-box opacity-50" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="space-y-2">
                                                            <div className="w-24 h-5 rounded-full shimmer-box opacity-75" />
                                                            <div className="w-28 h-3 rounded shimmer-box opacity-50" />
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="w-10 h-5 mx-auto rounded-md shimmer-box" />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="w-10 h-5 mx-auto rounded-md shimmer-box bg-emerald-100/50" />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="w-10 h-5 mx-auto rounded-md shimmer-box bg-amber-100/50" />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="w-10 h-5 mx-auto rounded-md shimmer-box bg-rose-100/50" />
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <div className="w-7 h-7 rounded-lg shimmer-box" />
                                                            <div className="w-7 h-7 rounded-lg shimmer-box" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : filteredBarangList.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-[#6B7280] bg-white">
                                                    Tidak ada data {activeTab === 'aset' ? 'aset fisik' : activeTab === 'habis_pakai' ? 'bahan habis pakai' : 'barang'} ditemukan.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredBarangList.map((item) => {
                                                const isExpanded = !!expandedRows[item.id];
                                                const isHabisPakai = item.tipe_kategori === 'habis_pakai';
                                                return (
                                                    <React.Fragment key={item.id}>
                                                        <tr className={`transition-colors ${
                                                            isHabisPakai
                                                                ? 'bg-amber-50/15 hover:bg-amber-50/30'
                                                                : 'bg-white hover:bg-rose-50/20'
                                                        }`}>
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
                                                                                <img src={item.gambar_url} alt={item.nama_barang} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                                                                    <Eye size={16} />
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <Package size={22} className="text-[#D84040]" />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <span className="font-extrabold text-[#1D1616] text-sm leading-tight">
                                                                                {item.nama_barang}
                                                                            </span>
                                                                            {item.perlu_persetujuan && (
                                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shrink-0" title="Peminjaman barang ini wajib izin langsung dari Admin">
                                                                                    <ShieldAlert size={11} className="text-amber-700" /> Wajib Izin Admin
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-[11px] font-mono text-[#D84040] font-bold mt-0.5">
                                                                            Kode Master: {item.kode_barang}
                                                                        </div>

                                                                        {/* DAFTAR KODE UNIT FISIK ATAU STATUS BAHAN HABIS PAKAI */}
                                                                        <div className="mt-2 pt-2 border-t border-[#E0E0E0]/60">
                                                                            {isHabisPakai ? (
                                                                                <div className="flex flex-wrap items-center gap-2">
                                                                                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                                                                                        <Boxes size={12} className="text-amber-600" />
                                                                                        Bahan Habis Pakai (Monitoring Stok)
                                                                                    </span>
                                                                                    {item.is_low_stock && (
                                                                                        <span className="text-[10px] font-extrabold text-red-700 bg-red-100 border border-red-300 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                                                                                            <AlertTriangle size={11} /> Stok Menipis (Batas: {item.stok_minimum} {item.satuan})
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            ) : (
                                                                                <>
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
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Kategori & Lokasi dengan Badge Tipe */}
                                                            <td className="p-4 align-top">
                                                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                                                    <span className="font-bold text-[#1D1616] text-xs">{item.nama_kategori}</span>
                                                                    {isHabisPakai ? (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                                            Habis Pakai
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-[#D84040] border border-rose-200">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#D84040]"></span>
                                                                            Aset Fisik
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-[11px] text-[#6B7280] flex items-center gap-1 mt-0.5 font-medium">
                                                                    <MapPin size={12} className="text-[#D84040]" /> {item.lokasi || 'Lokasi belum diset'}
                                                                </div>
                                                            </td>

                                                            {/* Total Unit / Sisa Stok Bahan */}
                                                            <td className="p-4 text-center align-top">
                                                                {isHabisPakai ? (
                                                                    <div>
                                                                        <div className={`font-extrabold text-sm ${item.is_low_stock ? 'text-red-600' : 'text-[#1D1616]'}`}>
                                                                            {item.stok_saat_ini} <span className="text-xs text-[#6B7280] font-normal">{item.satuan || 'unit'}</span>
                                                                        </div>
                                                                        <div className="text-[10px] text-[#6B7280] mt-0.5">
                                                                            Min: {item.stok_minimum} {item.satuan}
                                                                        </div>
                                                                        {item.is_low_stock && (
                                                                            <span className="mt-1 inline-flex items-center gap-0.5 text-[9px] font-extrabold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                                                                                Perlu Restock
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleExpand(item.id)}
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EEEEEE] hover:bg-gray-200 text-[#1D1616] font-bold text-xs cursor-pointer transition-colors"
                                                                        title="Klik untuk melihat rincian unit fisik"
                                                                    >
                                                                        <span>{item.total_unit} Unit</span>
                                                                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                                                    </button>
                                                                )}
                                                            </td>

                                                            {/* Status Counts */}
                                                            <td className="p-4 text-center font-bold text-emerald-700 align-top">
                                                                {isHabisPakai ? `${item.stok_saat_ini} ${item.satuan}` : item.tersedia}
                                                            </td>
                                                            <td className="p-4 text-center font-bold text-amber-700 align-top">
                                                                {isHabisPakai ? '-' : item.dipinjam}
                                                            </td>
                                                            <td className="p-4 text-center font-bold text-[#D84040] align-top">
                                                                {isHabisPakai ? '-' : item.maintenance}
                                                            </td>

                                                            {/* Aksi Kontekstual Sesuai Tipe Barang */}
                                                            <td className="p-4 text-right align-top">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    {isHabisPakai ? (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleOpenRestock(item)}
                                                                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                                                                                title="Restock Kuantitas Stok Bahan"
                                                                            >
                                                                                <Plus size={13} />
                                                                                <span>Restock</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleOpenKartuStok(item)}
                                                                                className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold inline-flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                                                                                title="Lihat Kartu Stok & Riwayat Mutasi"
                                                                            >
                                                                                <Clock size={13} className="text-amber-700" />
                                                                                <span>Kartu Stok</span>
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => toggleExpand(item.id)}
                                                                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer border shadow-2xs ${
                                                                                    isExpanded
                                                                                        ? 'bg-[#1D1616] text-white border-[#1D1616]'
                                                                                        : 'bg-white text-[#1D1616] border-[#E0E0E0] hover:bg-gray-50 hover:border-gray-300'
                                                                                }`}
                                                                                title="Buka / Tutup Rincian Unit Fisik"
                                                                            >
                                                                                <Layers size={13} className={isExpanded ? 'text-white' : 'text-[#D84040]'} />
                                                                                <span>Detail Unit ({item.units?.length || 0})</span>
                                                                                {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                                                                            </button>
                                                                            <Link
                                                                                href={`/admin/qrcode?barang_id=${item.id}`}
                                                                                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-gray-50 text-[#1D1616] hover:text-[#D84040] border border-[#E0E0E0] hover:border-[#D84040] text-[11px] font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                                                                                title="Lihat & Cetak QR Code Unit"
                                                                            >
                                                                                <QrCode size={13} className="text-[#D84040]" />
                                                                                <span>QR Code</span>
                                                                            </Link>
                                                                        </>
                                                                    )}
                                                                    <button
                                                                        onClick={() => openEditModal(item)}
                                                                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1D1616] hover:bg-[#EEEEEE] transition-colors cursor-pointer"
                                                                        title="Edit Barang"
                                                                    >
                                                                        <Edit2 size={15} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => openDeleteModal(item)}
                                                                        className="p-1.5 rounded-lg text-[#D84040] hover:bg-[#D84040]/10 transition-colors cursor-pointer"
                                                                        title="Hapus Barang"
                                                                    >
                                                                        <Trash2 size={15} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        {/* SUB-ROW ACCORDION: DETAIL UNIT FISIK */}
                                                        {isExpanded && item.tipe_kategori !== 'habis_pakai' && (
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
                                                                                            <th className="pb-2">Foto & Kode Unit Fisik</th>
                                                                                            <th className="pb-2">Status Peminjaman</th>
                                                                                            <th className="pb-2">Kondisi Fisik</th>
                                                                                            <th className="pb-2 text-right">Aksi Unit</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="divide-y divide-[#E0E0E0]/60">
                                                                                        {item.units.map((u) => (
                                                                                            <tr key={u.id} className="hover:bg-gray-50/70">
                                                                                                <td className="py-2.5 font-mono font-bold text-[#1D1616]">
                                                                                                    <div className="flex items-center gap-2.5">
                                                                                                        <div
                                                                                                            onClick={() => u.gambar_url && setPreviewModalImage({ url: u.gambar_url, nama: item.nama_barang, kode: u.kode_unit, kategori: item.nama_kategori })}
                                                                                                            className={`w-9 h-9 rounded-lg bg-[#EEEEEE] border border-[#E0E0E0] overflow-hidden flex items-center justify-center shrink-0 relative group ${u.gambar_url ? 'cursor-pointer hover:ring-2 hover:ring-[#D84040]/50' : ''}`}
                                                                                                            title={u.unit_gambar_url ? 'Foto khusus unit fisik (Klik untuk perbesar)' : u.gambar_url ? 'Foto barang (Klik untuk perbesar)' : 'Belum ada foto'}
                                                                                                        >
                                                                                                            {u.gambar_url ? (
                                                                                                                <>
                                                                                                                    <img src={u.gambar_url} alt={u.kode_unit} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                                                                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                                                                                                        <Eye size={12} />
                                                                                                                    </div>
                                                                                                                </>
                                                                                                            ) : (
                                                                                                                <ImageIcon size={14} className="text-[#8C93A0]" />
                                                                                                            )}
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#EEEEEE] border border-[#E0E0E0]">
                                                                                                                <Tag size={12} className="text-[#6B7280]" />
                                                                                                                {u.kode_unit}
                                                                                                            </span>
                                                                                                            {u.unit_gambar_url ? (
                                                                                                                <span className="block text-[9.5px] font-sans font-bold text-emerald-600 mt-0.5">
                                                                                                                    • Foto Khusus Unit
                                                                                                                </span>
                                                                                                            ) : u.gambar_url ? (
                                                                                                                <span className="block text-[9.5px] font-sans font-medium text-[#8C93A0] mt-0.5">
                                                                                                                    • Ikut Master
                                                                                                                </span>
                                                                                                            ) : null}
                                                                                                        </div>
                                                                                                    </div>
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
                                                                                                            title="Edit Status & Foto Unit"
                                                                                                        >
                                                                                                            <Edit2 size={13} />
                                                                                                        </button>
                                                                                                        <button
                                                                                                            onClick={() => openDeleteUnitModal(u)}
                                                                                                            className="p-1 rounded text-[#D84040] hover:bg-rose-50 transition-colors cursor-pointer"
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
                                        <span className="font-bold text-[#1D1616]">{barangList.total || 0}</span> barang
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
                                            <th className="p-4">Nama Barang</th>
                                            <th className="p-4">Kategori & Lokasi</th>
                                            <th className="p-4 text-center">Status Unit</th>
                                            <th className="p-4 text-center">Kondisi</th>
                                            <th className="p-4 text-right">Aksi Unit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E0E0E0]">
                                        {isTableLoading ? (
                                            [1, 2, 3, 4, 5].map((idx) => (
                                                <tr key={`skel-unit-${idx}`} className="bg-white">
                                                    <td className="p-4">
                                                        <div className="w-28 h-7 rounded-lg shimmer-box" />
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-lg shimmer-box shrink-0" />
                                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                                <div className="w-40 h-3.5 rounded shimmer-box" />
                                                                <div className="w-24 h-2.5 rounded shimmer-box opacity-60" />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="space-y-1.5">
                                                            <div className="w-24 h-5 rounded-full shimmer-box opacity-75" />
                                                            <div className="w-28 h-2.5 rounded shimmer-box opacity-50" />
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="w-24 h-6 mx-auto rounded-full shimmer-box" />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="w-16 h-6 mx-auto rounded-full shimmer-box" />
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <div className="w-7 h-7 rounded-lg shimmer-box" />
                                                            <div className="w-7 h-7 rounded-lg shimmer-box" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : allFlatUnits.length === 0 ? (
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
                                                                        <img src={unit.gambar_url} alt={unit.nama_barang} loading="lazy" decoding="async" className="w-full h-full object-cover" />
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
                                                                onClick={() => openDeleteUnitModal(unit)}
                                                                className="p-1.5 rounded-lg text-[#D84040] hover:bg-[#D84040]/10 transition-colors cursor-pointer"
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
            {modalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1D1616]/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E0E0E0]">
                            <div>
                                <h3 className="text-base font-bold text-[#1D1616]">
                                    {editingBarang ? 'Edit Barang' : 'Tambah Barang Baru'}
                                </h3>
                                <p className="text-xs text-[#6B7280] mt-0.5">
                                    {editingBarang ? 'Perbarui informasi dan spesifikasi barang' : 'Lengkapi formulir untuk mendaftarkan barang baru ke inventaris'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="p-1.5 text-[#6B7280] hover:text-[#1D1616] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Kolom Kiri: Informasi Pokok Barang */}
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-[#1D1616] mb-1">
                                                Kategori
                                            </label>
                                            <select
                                                value={data.kategori_id}
                                                onChange={(e) => setData('kategori_id', e.target.value)}
                                                required
                                                className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-semibold focus:outline-none focus:border-[#D84040]"
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
                                            <label className="block text-xs font-bold text-[#1D1616] mb-1">
                                                Kode Barang Master (Unik)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.kode_barang}
                                                onChange={(e) => setData('kode_barang', e.target.value)}
                                                placeholder="Contoh: BOR-101"
                                                required
                                                className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-mono focus:outline-none focus:border-[#D84040]"
                                            />
                                            {errors.kode_barang && <p className="text-[#D84040] text-xs mt-1">{errors.kode_barang}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#1D1616] mb-1">
                                            Nama Barang
                                        </label>
                                        <input
                                            type="text"
                                            value={data.nama_barang}
                                            onChange={(e) => setData('nama_barang', e.target.value)}
                                            placeholder="Contoh: Mesin Bor Cordless 18V"
                                            required
                                            className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                        />
                                        {errors.nama_barang && <p className="text-[#D84040] text-xs mt-1">{errors.nama_barang}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#1D1616] mb-1">
                                            Lokasi Rak / Lemari
                                        </label>
                                        <input
                                            type="text"
                                            value={data.lokasi}
                                            onChange={(e) => setData('lokasi', e.target.value)}
                                            placeholder="Contoh: Lemari B-01 / Rak A-02"
                                            className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#1D1616] mb-1">
                                            Detail Spesifikasi Teknis
                                        </label>
                                        <textarea
                                            value={data.detail_spesifikasi}
                                            onChange={(e) => setData('detail_spesifikasi', e.target.value)}
                                            rows={2}
                                            placeholder="Spesifikasi kelengkapan alat, daya, kapasitas..."
                                            className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040] resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Kolom Kanan: Pengaturan Tipe, Foto & Kebijakan */}
                                <div className="space-y-3">
                                    {/* Pengaturan Tipe (Bahan Habis Pakai vs Aset Fisik) */}
                                    {(() => {
                                        const selectedCat = categories.find((c) => String(c.id) === String(data.kategori_id));
                                        const isHabisPakai = selectedCat?.tipe === 'habis_pakai';

                                        if (isHabisPakai) {
                                            return (
                                                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Boxes size={15} className="text-amber-700" />
                                                        <span className="text-xs font-bold text-amber-900">Pengaturan Bahan Habis Pakai</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                        <div>
                                                            <label className="block text-[11px] font-bold text-[#1D1616] mb-1">
                                                                Satuan
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={data.satuan}
                                                                onChange={(e) => setData('satuan', e.target.value)}
                                                                placeholder="pcs, roll"
                                                                required
                                                                className="w-full px-2.5 py-1.5 bg-white border border-[#E0E0E0] rounded-lg text-xs text-[#1D1616] focus:outline-none focus:border-amber-600"
                                                            />
                                                            {errors.satuan && <p className="text-[#D84040] text-[10px] mt-0.5">{errors.satuan}</p>}
                                                        </div>
                                                        {!editingBarang && (
                                                            <div>
                                                                <label className="block text-[11px] font-bold text-[#1D1616] mb-1">
                                                                    Stok Awal
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    step="any"
                                                                    min="0"
                                                                    value={data.stok_saat_ini}
                                                                    onChange={(e) => setData('stok_saat_ini', e.target.value)}
                                                                    placeholder="0"
                                                                    className="w-full px-2.5 py-1.5 bg-white border border-[#E0E0E0] rounded-lg text-xs text-[#1D1616] font-bold focus:outline-none focus:border-amber-600"
                                                                />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <label className="block text-[11px] font-bold text-[#1D1616] mb-1">
                                                                Batas Min.
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                min="0"
                                                                value={data.stok_minimum}
                                                                onChange={(e) => setData('stok_minimum', e.target.value)}
                                                                placeholder="5"
                                                                required
                                                                className="w-full px-2.5 py-1.5 bg-white border border-[#E0E0E0] rounded-lg text-xs text-[#1D1616] font-bold focus:outline-none focus:border-amber-600"
                                                            />
                                                            {errors.stok_minimum && <p className="text-[#D84040] text-[10px] mt-0.5">{errors.stok_minimum}</p>}
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-amber-800 leading-tight">
                                                        Kuantitas agregat dilacak otomatis tanpa unit fisik.
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return !editingBarang ? (
                                            <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-emerald-900">Jumlah Unit Fisik Awal (Batch Generate)</span>
                                                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">Opsional</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="50"
                                                    value={data.jumlah_unit}
                                                    onChange={(e) => setData('jumlah_unit', e.target.value)}
                                                    placeholder="Contoh: 1, 3, atau 5 unit"
                                                    className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs text-[#1D1616] font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                />
                                                <p className="text-[10.5px] text-emerald-700 leading-tight">
                                                    {data.jumlah_unit && parseInt(data.jumlah_unit) > 0 ? (
                                                        <>Auto-generate <span className="font-bold">{data.jumlah_unit} unit fisik</span>: <span className="font-mono font-bold">{data.kode_barang ? `${data.kode_barang}-01..${data.kode_barang}-${String(data.jumlah_unit).padStart(2, '0')}` : `KODE-01..`}</span></>
                                                    ) : (
                                                        <>Kosongkan jika nomor seri unit fisik akan ditambahkan nanti.</>
                                                    )}
                                                </p>
                                            </div>
                                        ) : null;
                                    })()}

                                    {/* Upload / Ganti / Hapus Gambar Master Barang */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-xs font-bold text-[#1D1616]">
                                                Foto / Gambar Barang
                                            </label>
                                            <span className="text-[10px] text-[#6B7280]">Opsional (Maks. 2MB)</span>
                                        </div>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                            className="hidden"
                                        />

                                        {/* Kondisi 1: Preview file baru yang dipilih */}
                                        {imagePreview ? (
                                            <div className="p-2.5 bg-rose-50/20 border border-rose-200 rounded-xl flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview Baru"
                                                        className="w-12 h-12 rounded-lg object-cover border border-rose-300 shrink-0 bg-white"
                                                    />
                                                    <div className="min-w-0">
                                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 mb-0.5">
                                                            <CheckCircle2 size={9} /> Gambar Baru Terpilih
                                                        </span>
                                                        <p className="text-xs font-bold text-[#1D1616] truncate">
                                                            {data.gambar?.name || 'File dipilih'}
                                                        </p>
                                                        <p className="text-[10px] text-[#6B7280]">
                                                            {data.gambar?.size ? `${(data.gambar.size / 1024).toFixed(1)} KB` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="px-2 py-1 text-xs font-bold text-[#1D1616] bg-white border border-[#E0E0E0] rounded-lg hover:bg-gray-50 cursor-pointer transition-colors shadow-2xs"
                                                    >
                                                        Ganti
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveSelectedFile}
                                                        className="p-1 text-[#D84040] hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
                                                        title="Batal pilih gambar"
                                                    >
                                                        <X size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : editingBarang?.gambar_url && !data.hapus_gambar ? (
                                            /* Kondisi 2: Sedang Edit dan memiliki gambar yang sudah ada */
                                            <div className="p-2.5 bg-[#EEEEEE]/50 border border-[#E0E0E0] rounded-xl flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <img
                                                        src={editingBarang.gambar_url}
                                                        alt={editingBarang.nama_barang}
                                                        className="w-12 h-12 rounded-lg object-cover border border-[#E0E0E0] shrink-0 bg-white"
                                                    />
                                                    <div className="min-w-0">
                                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 mb-0.5">
                                                            <ImageIcon size={9} /> Gambar Saat Ini
                                                        </span>
                                                        <p className="text-xs font-bold text-[#1D1616] truncate">
                                                            {editingBarang.nama_barang}
                                                        </p>
                                                        <p className="text-[10px] text-[#6B7280]">
                                                            Klik untuk mengganti atau menghapus
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="px-2 py-1 text-xs font-bold text-[#1D1616] bg-white border border-[#E0E0E0] rounded-lg hover:bg-gray-50 cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                                                    >
                                                        <UploadCloud size={12} /> Ganti
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveExistingImage}
                                                        className="p-1 text-[#D84040] hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                                        title="Hapus foto dari barang ini"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Kondisi 3: Belum ada gambar / gambar dihapus */
                                            <div>
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="border-2 border-dashed border-[#E0E0E0] hover:border-[#D84040] rounded-xl py-2.5 px-3 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-rose-50/10 group flex items-center justify-center gap-3"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-[#EEEEEE] group-hover:bg-rose-50 flex items-center justify-center text-[#6B7280] group-hover:text-[#D84040] transition-colors shrink-0">
                                                        <UploadCloud size={16} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-xs font-bold text-[#1D1616]">
                                                            Pilih atau unggah foto barang
                                                        </p>
                                                        <p className="text-[10px] text-[#6B7280]">
                                                            PNG, JPG, JPEG, WEBP (Maks. 2 MB)
                                                        </p>
                                                    </div>
                                                </div>
                                                {data.hapus_gambar && (
                                                    <div className="mt-1.5 flex items-center justify-between text-xs text-[#D84040] bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                                                        <span className="text-[11px]">Foto saat ini akan dihapus saat disimpan.</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setData('hapus_gambar', false)}
                                                            className="text-xs font-bold underline cursor-pointer text-[#D84040] hover:text-[#8E1616]"
                                                        >
                                                            Batalkan
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {errors.gambar && (
                                            <p className="text-[#D84040] text-xs font-bold mt-1 flex items-center gap-1">
                                                <AlertTriangle size={12} /> {errors.gambar}
                                            </p>
                                        )}
                                    </div>

                                    {/* Pengaturan Izin / Approval Admin */}
                                    <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl">
                                        <label className="flex items-start gap-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(data.perlu_persetujuan)}
                                                onChange={(e) => setData('perlu_persetujuan', e.target.checked)}
                                                className="mt-0.5 rounded border-amber-300 text-[#D84040] focus:ring-[#D84040] h-4 w-4 cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1D1616]">
                                                    <ShieldAlert size={14} className="text-amber-600 shrink-0" />
                                                    <span>Wajib Izin Langsung Admin (Multi-Step Approval)</span>
                                                </div>
                                                <p className="text-[10.5px] text-[#6B7280] mt-0.5 leading-tight">
                                                    Peminjaman barang ini wajib diverifikasi dan disetujui (approve) oleh Admin di Logbook sebelum dapat diambil.
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E0E0E0]">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7280] hover:bg-[#EEEEEE] transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 bg-[#D84040] hover:bg-[#8E1616] text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer shadow-sm shadow-red-200"
                                >
                                    {processing ? 'Menyimpan...' : (editingBarang ? 'Simpan Perubahan' : 'Simpan Barang')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal Form Tambah / Edit Unit Fisik */}
            {unitModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1616]/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl max-w-md w-full p-6 shadow-xl my-auto animate-in fade-in zoom-in-95 duration-150">
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
                            {!editingUnit && (
                                <div className="p-3 bg-gray-50 border border-[#E0E0E0] rounded-xl">
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1 flex items-center justify-between">
                                        <span>Jumlah Unit yang Ditambahkan</span>
                                        <span className="text-[11px] font-normal text-[#6B7280]">Default: 1 unit</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={unitForm.data.jumlah_unit || 1}
                                        onChange={(e) => unitForm.setData('jumlah_unit', parseInt(e.target.value) || 1)}
                                        className="w-full px-3 py-1.5 bg-white border border-[#E0E0E0] rounded-lg text-xs text-[#1D1616] font-bold focus:outline-none focus:border-[#D84040]"
                                    />
                                    {unitForm.data.jumlah_unit > 1 && (
                                        <p className="text-[11px] text-[#6B7280] mt-1">
                                            Akan otomatis membuat <span className="font-bold text-[#D84040]">{unitForm.data.jumlah_unit} unit fisik</span> berurutan.
                                        </p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                    {unitForm.data.jumlah_unit > 1 ? 'Awalan Kode Unit / Contoh' : 'Kode Unit Fisik (Unik)'}
                                </label>
                                <input
                                    type="text"
                                    value={unitForm.data.kode_unit}
                                    onChange={(e) => unitForm.setData('kode_unit', e.target.value)}
                                    placeholder="Contoh: BOR-101-01"
                                    required
                                    disabled={unitForm.data.jumlah_unit > 1}
                                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs text-[#1D1616] font-mono focus:outline-none focus:border-[#D84040] ${unitForm.data.jumlah_unit > 1 ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-white border-[#E0E0E0]'}`}
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

                            {/* Unggah Foto Unit Fisik (Hanya untuk 1 unit atau saat Edit) */}
                            {(!unitForm.data.jumlah_unit || unitForm.data.jumlah_unit === 1) && (
                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1.5 flex items-center justify-between">
                                        <span>Foto Spesifik Unit Fisik (Opsional)</span>
                                        <span className="text-[11px] font-normal text-[#6B7280]">Maks. 2MB (JPG, PNG, WebP)</span>
                                    </label>

                                    <input
                                        type="file"
                                        ref={unitFileInputRef}
                                        onChange={handleUnitImageChange}
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        className="hidden"
                                    />

                                    {unitImagePreview ? (
                                        /* Preview foto baru dipilih */
                                        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <img
                                                    src={unitImagePreview}
                                                    alt="Preview Unit"
                                                    className="w-12 h-12 rounded-lg object-cover border border-emerald-300 shrink-0 bg-white"
                                                />
                                                <div className="min-w-0">
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mb-0.5">
                                                        <CheckCircle2 size={10} /> Foto Baru Dipilih
                                                    </span>
                                                    <p className="text-[11px] text-[#6B7280] truncate">
                                                        {unitForm.data.gambar?.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => unitFileInputRef.current?.click()}
                                                    className="px-2.5 py-1 text-xs font-bold text-[#1D1616] bg-white border border-[#E0E0E0] rounded-lg hover:bg-gray-50 cursor-pointer shadow-2xs"
                                                >
                                                    Ganti
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveUnitSelectedFile}
                                                    className="p-1.5 text-[#D84040] hover:bg-rose-100 rounded-lg cursor-pointer"
                                                    title="Batal pilih foto"
                                                >
                                                    <X size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : editingUnit?.unit_gambar_url && !unitForm.data.hapus_gambar ? (
                                        /* Foto spesifik unit saat ini */
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
                                                    onClick={() => unitFileInputRef.current?.click()}
                                                    className="px-2.5 py-1 text-xs font-bold text-[#1D1616] bg-white border border-[#E0E0E0] rounded-lg hover:bg-gray-50 cursor-pointer shadow-2xs flex items-center gap-1"
                                                >
                                                    <UploadCloud size={12} /> Ganti
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveExistingUnitImage}
                                                    className="p-1.5 text-[#D84040] hover:bg-rose-50 rounded-lg cursor-pointer"
                                                    title="Hapus foto khusus unit ini (akan ikut foto barang)"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Belum ada foto unit */
                                        <div>
                                            <div
                                                onClick={() => unitFileInputRef.current?.click()}
                                                className="border-2 border-dashed border-[#E0E0E0] hover:border-[#D84040] rounded-xl p-3.5 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-rose-50/10 group"
                                            >
                                                <div className="w-8 h-8 mx-auto rounded-full bg-[#EEEEEE] group-hover:bg-rose-50 flex items-center justify-center text-[#6B7280] group-hover:text-[#D84040] transition-colors mb-1.5">
                                                    <UploadCloud size={16} />
                                                </div>
                                                <p className="text-xs font-bold text-[#1D1616]">
                                                    Klik untuk unggah foto khusus unit
                                                </p>
                                                <p className="text-[10.5px] text-[#6B7280] mt-0.5">
                                                    Jika dikosongkan, unit akan otomatis menggunakan foto Barang
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {unitForm.errors.gambar && (
                                        <p className="text-[#D84040] text-xs mt-1">{unitForm.errors.gambar}</p>
                                    )}
                                </div>
                            )}

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
                </div>,
                document.body
            )}

            {/* Lightbox / Preview Foto Master Barang */}
            {previewModalImage && typeof document !== 'undefined' && createPortal(
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
                </div>,
                document.body
            )}

            {/* Pop-up Card Alert Konfirmasi Hapus */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => !isDeleting && setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmDelete}
                title={deleteModal.title}
                message={deleteModal.message}
                itemBadge={deleteModal.itemBadge}
                confirmText="Hapus"
                cancelText="Batal"
                variant="danger"
                processing={isDeleting}
            />

            {/* Modal Restock Bahan Habis Pakai */}
            {restockModal.isOpen && restockModal.barang && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1616]/60 backdrop-blur-none animate-in fade-in duration-150">
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E0E0E0]">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                    <Plus size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-[#1D1616]">
                                        Restock: {restockModal.barang.nama_barang}
                                    </h3>
                                    <p className="text-[11px] text-[#6B7280]">
                                        Sisa Stok Saat Ini: <span className="font-bold text-[#1D1616]">{restockModal.barang.stok_saat_ini} {restockModal.barang.satuan}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setRestockModal({ isOpen: false, barang: null })}
                                className="text-[#6B7280] hover:text-[#1D1616]"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleRestockSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                    Jumlah Restock Masuk ({restockModal.barang.satuan || 'unit'})
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    min="0.01"
                                    value={restockData.jumlah}
                                    onChange={(e) => setRestockData('jumlah', e.target.value)}
                                    placeholder="Contoh: 10, 50, 100"
                                    required
                                    autoFocus
                                    className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-sm font-extrabold text-[#1D1616] focus:outline-none focus:border-emerald-600"
                                />
                                {restockErrors.jumlah && (
                                    <p className="text-[#D84040] text-xs mt-1">{restockErrors.jumlah}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                    Keterangan / Nomor Faktur / Toko
                                </label>
                                <input
                                    type="text"
                                    value={restockData.keterangan}
                                    onChange={(e) => setRestockData('keterangan', e.target.value)}
                                    placeholder="Contoh: Pembelian Faktur #INV-9821 Toko Baut Jaya"
                                    className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-emerald-600"
                                />
                                {restockErrors.keterangan && (
                                    <p className="text-[#D84040] text-xs mt-1">{restockErrors.keterangan}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRestockModal({ isOpen: false, barang: null })}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7280] hover:bg-[#EEEEEE]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={restockProcessing}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                                >
                                    {restockProcessing ? 'Memproses...' : 'Simpan Restock'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal Kartu Stok & Riwayat Mutasi */}
            {kartuStokModal.isOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1616]/60 backdrop-blur-none animate-in fade-in duration-150">
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0] shrink-0">
                            <div>
                                <h3 className="text-base font-extrabold text-[#1D1616] flex items-center gap-2">
                                    <Clock size={18} className="text-amber-600" />
                                    Kartu Stok: {kartuStokModal.barang?.nama_barang}
                                </h3>
                                <div className="text-xs text-[#6B7280] mt-0.5 flex items-center gap-2">
                                    <span>Kode: <span className="font-mono font-bold text-[#1D1616]">{kartuStokModal.barang?.kode_barang}</span></span>
                                    <span>•</span>
                                    <span>Sisa Saldo: <span className="font-bold text-emerald-700">{kartuStokModal.barang?.stok_saat_ini} {kartuStokModal.barang?.satuan}</span></span>
                                </div>
                            </div>
                            <button
                                onClick={() => setKartuStokModal({ isOpen: false, loading: false, barang: null, mutasi: [] })}
                                className="text-[#6B7280] hover:text-[#1D1616]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 my-4">
                            {kartuStokModal.loading ? (
                                <div className="space-y-2 p-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                                            <div className="w-20 h-3 rounded shimmer-box" />
                                            <div className="w-14 h-4 rounded shimmer-box" />
                                            <div className="w-12 h-3 rounded shimmer-box" />
                                            <div className="w-12 h-3 rounded shimmer-box" />
                                            <div className="w-16 h-3 rounded shimmer-box" />
                                            <div className="w-24 h-3 rounded shimmer-box" />
                                        </div>
                                    ))}
                                </div>
                            ) : kartuStokModal.mutasi.length === 0 ? (
                                <div className="p-8 text-center text-xs text-[#6B7280]">
                                    Belum ada transaksi mutasi stok untuk barang ini.
                                </div>
                            ) : (
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-[#EEEEEE] border-b border-[#E0E0E0] text-[#1D1616] uppercase font-bold text-[10px]">
                                        <tr>
                                            <th className="p-2.5">Tanggal</th>
                                            <th className="p-2.5">Tipe</th>
                                            <th className="p-2.5 text-right">Jumlah</th>
                                            <th className="p-2.5 text-right">Sisa Stok</th>
                                            <th className="p-2.5">Oleh</th>
                                            <th className="p-2.5">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E0E0E0]">
                                        {kartuStokModal.mutasi.map((m) => {
                                            const isMasuk = m.tipe === 'masuk';
                                            return (
                                                <tr key={m.id} className="hover:bg-[#EEEEEE]/40">
                                                    <td className="p-2.5 text-[11px] text-[#6B7280] whitespace-nowrap">
                                                        {m.tanggal}
                                                    </td>
                                                    <td className="p-2.5">
                                                        {isMasuk ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                                MASUK
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                                                KELUAR
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className={`p-2.5 text-right font-bold ${isMasuk ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                        {isMasuk ? `+${m.jumlah}` : `-${m.jumlah}`}
                                                    </td>
                                                    <td className="p-2.5 text-right font-extrabold text-[#1D1616]">
                                                        {m.sisa_stok}
                                                    </td>
                                                    <td className="p-2.5 font-medium text-[#1D1616]">
                                                        {m.user_nama}
                                                    </td>
                                                    <td className="p-2.5 text-[#6B7280]">
                                                        {m.keterangan}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="pt-3 border-t border-[#E0E0E0] flex justify-end shrink-0">
                            <button
                                onClick={() => setKartuStokModal({ isOpen: false, loading: false, barang: null, mutasi: [] })}
                                className="px-4 py-2 bg-[#EEEEEE] hover:bg-gray-200 text-[#1D1616] text-xs font-bold rounded-xl transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AuthenticatedLayout>
    );
}
