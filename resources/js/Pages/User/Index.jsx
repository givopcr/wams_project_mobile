import React, { useState } from 'react';
import { Head, useForm, router, usePoll, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Shield,
    User as UserIcon,
    Mail,
    CreditCard,
    Eye,
    EyeOff
} from 'lucide-react';
import ConfirmModal from '@/Components/ConfirmModal';

export default function UserIndex({ users, filters }) {
    const { auth } = usePage().props;
    const currentAdminId = auth?.user?.id;

    const [search, setSearch] = useState(filters.q || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showModalPassword, setShowModalPassword] = useState(false);

    // Auto-refresh daftar user agar akun baru (mis. login via Google dari mobile/web)
    // langsung muncul tanpa perlu refresh halaman manual.
    usePoll(10000, { only: ['users'] });

    const { data, setData, post, put, processing, reset, errors } = useForm({
        nama: '',
        email: '',
        nip: '',
        role: 'user',
        password: '',
    });

    const handleQuickRoleChange = (u, newRole) => {
        if (u.role === newRole) return;
        router.put(
            `/admin/users/${u.id}`,
            {
                role: newRole,
                quick_role_toggle: true,
            },
            {
                preserveScroll: true,
            }
        );
    };

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get('/admin/users', { q: search, role: selectedRole }, { preserveState: true });
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setShowModalPassword(false);
        reset();
        setData({
            nama: '',
            email: '',
            nip: '',
            role: 'user',
            password: '',
        });
        setModalOpen(true);
    };

    const openEditModal = (u) => {
        setEditingUser(u);
        setShowModalPassword(false);
        setData({
            nama: u.nama,
            email: u.email,
            nip: u.nip || '',
            role: u.role,
            password: '',
        });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            put(`/admin/users/${editingUser.id}`, {
                preserveScroll: true,
                onSuccess: () => setModalOpen(false),
            });
        } else {
            post('/admin/users', {
                preserveScroll: true,
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const openDeleteModal = (u) => {
        if (isDeleting) return;
        setDeleteModal({ isOpen: true, user: u });
    };

    const handleConfirmDelete = () => {
        if (!deleteModal.user || isDeleting) return;
        const targetId = deleteModal.user.id;
        setIsDeleting(true);
        router.delete(`/admin/users/${targetId}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteModal({ isOpen: false, user: null }),
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModal({ isOpen: false, user: null });
            },
        });
    };

    return (
        <AuthenticatedLayout title="Manajemen Pengguna">
            <Head title="Manajemen User - WAMS" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Filter & Action Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <form onSubmit={handleFilter} className="relative w-full sm:w-64">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama / email / NIP..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] placeholder-[#8C93A0] focus:outline-none focus:border-[#D84040]"
                            />
                            <Search size={16} className="absolute left-3.5 top-3 text-[#6B7280]" />
                        </form>

                        <select
                            value={selectedRole}
                            onChange={(e) => {
                                setSelectedRole(e.target.value);
                                router.get('/admin/users', { q: search, role: e.target.value }, { preserveState: true });
                            }}
                            className="py-2.5 px-3.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-semibold focus:outline-none focus:border-[#D84040]"
                        >
                            <option value="">Semua Role</option>
                            <option value="admin">Administrator</option>
                            <option value="user">User / Teknisi</option>
                        </select>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                        <Plus size={16} />
                        <span>Tambah User Baru</span>
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white border border-[#E0E0E0] rounded-2xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#EEEEEE] border-b border-[#E0E0E0] text-[#1D1616] uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="p-4">Pengguna</th>
                                    <th className="p-4">NIP</th>
                                    <th className="p-4">Role Akun</th>
                                    <th className="p-4 text-center">Riwayat Pinjam</th>
                                    <th className="p-4 text-center">Pinjaman Aktif</th>
                                    <th className="p-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E0E0E0]">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-[#6B7280] bg-white">
                                            Tidak ada user ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((u) => {
                                        const isSelf = Number(u.id) === Number(currentAdminId);
                                        return (
                                            <tr key={u.id} className="hover:bg-[#EEEEEE]/50 bg-white transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {u.avatar && /^https?:\/\//.test(u.avatar) ? (
                                                            <img
                                                                src={u.avatar}
                                                                alt={u.nama}
                                                                referrerPolicy="no-referrer"
                                                                className="w-9 h-9 rounded-xl border border-[#E0E0E0] object-cover shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-xl bg-[#EEEEEE] border border-[#E0E0E0] flex items-center justify-center font-bold text-[#D84040] text-sm shrink-0">
                                                                {u.nama.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-bold text-[#1D1616] text-sm">{u.nama}</span>
                                                                {isSelf && (
                                                                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                                                                        Anda
                                                                    </span>
                                                                )}
                                                                {u.google_id && (
                                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#EEEEEE] border border-[#E0E0E0] text-[10px] font-bold text-[#1D1616]">
                                                                        <img src="/images/google_logo.png" alt="" className="w-2.5 h-2.5" />
                                                                        Google
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] text-[#6B7280]">{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono text-[#1D1616] font-semibold">
                                                    {u.nip || '-'}
                                                </td>
                                                <td className="p-4">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <select
                                                            value={u.role}
                                                            disabled={isSelf}
                                                            onChange={(e) => handleQuickRoleChange(u, e.target.value)}
                                                            title={isSelf ? 'Role akun sendiri tidak dapat diturunkan' : 'Klik untuk mengganti role (User <-> Admin)'}
                                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                                                                u.role === 'admin'
                                                                    ? 'bg-[#D84040] text-white border-[#D84040]'
                                                                    : 'bg-[#EEEEEE] text-[#1D1616] border-[#E0E0E0] hover:border-[#D84040]'
                                                            } ${isSelf ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                                                        >
                                                            <option value="user" className="bg-white text-[#1D1616] font-bold">
                                                                USER (TEKNISI)
                                                            </option>
                                                            <option value="admin" className="bg-white text-[#1D1616] font-bold">
                                                                ADMIN
                                                            </option>
                                                        </select>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center font-bold text-[#1D1616]">
                                                    {u.total_transaksi}
                                                </td>
                                                <td className="p-4 text-center font-extrabold text-[#D84040]">
                                                    {u.transaksi_aktif}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(u)}
                                                            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1D1616] hover:bg-[#EEEEEE] transition-colors cursor-pointer"
                                                            title="Edit Profil & Role"
                                                        >
                                                            <Edit2 size={15} />
                                                        </button>
                                                        {!isSelf && (
                                                            <button
                                                                onClick={() => openDeleteModal(u)}
                                                                className="p-1.5 rounded-lg text-[#D84040] hover:bg-[#D84040]/10 transition-colors cursor-pointer"
                                                                title="Hapus Akun Pengguna"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Form User */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1616]/60">
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E0E0E0]">
                            <h3 className="text-base font-bold text-[#1D1616]">
                                {editingUser ? 'Edit Pengguna' : 'Tambah User Baru'}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-[#6B7280] hover:text-[#1D1616]">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    placeholder="Nama teknisi / admin"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                />
                                {errors.nama && <p className="text-[#D84040] text-xs mt-1">{errors.nama}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@wams.test"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                />
                                {errors.email && <p className="text-[#D84040] text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                        NIP
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nip}
                                        onChange={(e) => setData('nip', e.target.value)}
                                        placeholder="NIP / No Identitas"
                                        className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-mono focus:outline-none focus:border-[#D84040]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                        Role Akun
                                    </label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-semibold focus:outline-none focus:border-[#D84040]"
                                    >
                                        <option value="user">User (Teknisi)</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            {!editingUser && (
                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                        Password Pengguna
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showModalPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Minimal 6 karakter"
                                            required
                                            className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowModalPassword(!showModalPassword)}
                                            className="absolute right-3 top-2.5 text-[#6B7280] hover:text-[#D84040] cursor-pointer"
                                        >
                                            {showModalPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                        {errors.password && <p className="text-[#D84040] text-xs mt-1">{errors.password}</p>}
                                    </div>
                                </div>
                            )}

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

            {/* Modal Confirm Delete */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => !isDeleting && setDeleteModal({ isOpen: false, user: null })}
                onConfirm={handleConfirmDelete}
                processing={isDeleting}
                title="Hapus Pengguna"
                message="Apakah Anda yakin ingin menghapus akun pengguna ini? Akses pengguna ke sistem akan dicabut secara permanen."
                itemBadge={deleteModal.user ? `${deleteModal.user.nama} (${deleteModal.user.email})` : null}
                confirmText="Hapus"
            />
        </AuthenticatedLayout>
    );
}
