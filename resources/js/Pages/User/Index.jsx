import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
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
    CreditCard
} from 'lucide-react';

export default function UserIndex({ users, filters }) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        nama: '',
        email: '',
        nip: '',
        role: 'user',
        password: '',
    });

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get('/admin/users', { q: search, role: selectedRole }, { preserveState: true });
    };

    const openCreateModal = () => {
        setEditingUser(null);
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
                onSuccess: () => setModalOpen(false),
            });
        } else {
            post('/admin/users', {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus user ini?')) {
            router.delete(`/admin/users/${id}`);
        }
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
                                className="w-full pl-10 pr-4 py-2.5 bg-[#FFF2DB] border border-[#F0DFC4] rounded-xl text-xs text-[#1E232A] placeholder-[#8C93A0] focus:outline-none focus:border-[#F62440]"
                            />
                            <Search size={16} className="absolute left-3.5 top-3 text-[#6B7280]" />
                        </form>

                        <select
                            value={selectedRole}
                            onChange={(e) => {
                                setSelectedRole(e.target.value);
                                router.get('/admin/users', { q: search, role: e.target.value }, { preserveState: true });
                            }}
                            className="py-2.5 px-3.5 bg-[#FFF2DB] border border-[#F0DFC4] rounded-xl text-xs text-[#1E232A] font-semibold focus:outline-none focus:border-[#F62440]"
                        >
                            <option value="">Semua Role</option>
                            <option value="admin">Administrator</option>
                            <option value="user">User / Teknisi</option>
                        </select>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F62440] hover:bg-[#D91A33] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                        <Plus size={16} />
                        <span>Tambah User Baru</span>
                    </button>
                </div>

                {/* Flat Table */}
                <div className="bg-[#FFF2DB] border border-[#F0DFC4] rounded-2xl overflow-hidden shadow-none">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#FFE5BF] border-b border-[#F0DFC4] text-[#1E232A] uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="p-4">Pengguna</th>
                                    <th className="p-4">NIP</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4 text-center">Riwayat Pinjam</th>
                                    <th className="p-4 text-center">Pinjaman Aktif</th>
                                    <th className="p-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0DFC4]">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-[#6B7280] bg-[#FFFAF3]">
                                            Tidak ada user ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((u) => (
                                        <tr key={u.id} className="hover:bg-[#FFE5BF]/40 bg-[#FFFAF3] transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-[#FFE5BF] border border-[#F0DFC4] flex items-center justify-center font-bold text-[#F62440] text-sm shrink-0">
                                                        {u.nama.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-[#1E232A] text-sm">{u.nama}</div>
                                                        <div className="text-[11px] text-[#6B7280]">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-[#1E232A] font-semibold">
                                                {u.nip || '-'}
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                                        u.role === 'admin'
                                                            ? 'bg-[#F62440] text-white'
                                                            : 'bg-[#FFE5BF] text-[#1E232A]'
                                                    }`}
                                                >
                                                    <Shield size={12} />
                                                    {u.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center font-bold text-[#1E232A]">
                                                {u.total_transaksi}
                                            </td>
                                            <td className="p-4 text-center font-extrabold text-[#F62440]">
                                                {u.transaksi_aktif}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(u)}
                                                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1E232A] hover:bg-[#FFE5BF] transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
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

            {/* Modal Form User */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E232A]/50">
                    <div className="bg-[#FFFAF3] border border-[#F0DFC4] rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0DFC4]">
                            <h3 className="text-base font-bold text-[#1E232A]">
                                {editingUser ? 'Edit Pengguna' : 'Tambah User Baru'}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-[#6B7280] hover:text-[#1E232A]">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#1E232A] mb-1.5">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    placeholder="Nama teknisi / admin"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-[#FFF2DB] border border-[#F0DFC4] rounded-xl text-xs text-[#1E232A] focus:outline-none focus:border-[#F62440]"
                                />
                                {errors.nama && <p className="text-[#F62440] text-xs mt-1">{errors.nama}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1E232A] mb-1.5">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@wams.test"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-[#FFF2DB] border border-[#F0DFC4] rounded-xl text-xs text-[#1E232A] focus:outline-none focus:border-[#F62440]"
                                />
                                {errors.email && <p className="text-[#F62440] text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#1E232A] mb-1.5">
                                        NIP
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nip}
                                        onChange={(e) => setData('nip', e.target.value)}
                                        placeholder="NIP / No Identitas"
                                        className="w-full px-3.5 py-2.5 bg-[#FFF2DB] border border-[#F0DFC4] rounded-xl text-xs text-[#1E232A] font-mono focus:outline-none focus:border-[#F62440]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#1E232A] mb-1.5">
                                        Role Akun
                                    </label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-[#FFF2DB] border border-[#F0DFC4] rounded-xl text-xs text-[#1E232A] font-semibold focus:outline-none focus:border-[#F62440]"
                                    >
                                        <option value="user">User (Teknisi)</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1E232A] mb-1.5">
                                    Password {editingUser && '(Kosongkan jika tidak diubah)'}
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Minimal 6 karakter"
                                    required={!editingUser}
                                    className="w-full px-3.5 py-2.5 bg-[#FFF2DB] border border-[#F0DFC4] rounded-xl text-xs text-[#1E232A] focus:outline-none focus:border-[#F62440]"
                                />
                                {errors.password && <p className="text-[#F62440] text-xs mt-1">{errors.password}</p>}
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
