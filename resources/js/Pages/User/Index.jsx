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
        <AuthenticatedLayout title="Manajemen Pengguna (User Management)">
            <Head title="Manajemen User" />

            {/* Filter & Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <form onSubmit={handleFilter} className="relative w-full sm:w-64">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama / email / NIP..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                        <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
                    </form>

                    <select
                        value={selectedRole}
                        onChange={(e) => {
                            setSelectedRole(e.target.value);
                            router.get('/admin/users', { q: search, role: e.target.value }, { preserveState: true });
                        }}
                        className="py-2.5 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                    >
                        <option value="">Semua Role</option>
                        <option value="admin">Administrator</option>
                        <option value="user">User / Teknisi</option>
                    </select>
                </div>

                <button
                    onClick={openCreateModal}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                >
                    <Plus size={16} />
                    <span>Tambah User Baru</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="p-4">Nama Lengkap</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">NIP (Nomor Induk)</th>
                                <th className="p-4">Role</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        Tidak ada data pengguna ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((u) => {
                                    const isAdmin = u.role === 'admin';
                                    return (
                                        <tr key={u.id} className="hover:bg-slate-800/30">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">
                                                        {u.nama.charAt(0)}
                                                    </div>
                                                    <div className="font-bold text-white text-sm">{u.nama}</div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-300">
                                                <div className="flex items-center gap-1.5">
                                                    <Mail size={13} className="text-slate-500" />
                                                    {u.email}
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-slate-300">
                                                <div className="flex items-center gap-1.5">
                                                    <CreditCard size={13} className="text-slate-500" />
                                                    {u.nip || '-'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                                        isAdmin
                                                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    }`}
                                                >
                                                    {isAdmin ? <Shield size={12} /> : <UserIcon size={12} />}
                                                    {isAdmin ? 'Admin' : 'User'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(u)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                                                        title="Edit User"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                                                        title="Hapus User"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
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

            {/* Modal Form User */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-white">
                                {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    placeholder="Contoh: Budi Pratama"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                                />
                                {errors.nama && <p className="text-rose-400 text-xs mt-1">{errors.nama}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="teknisi@wams.test"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                                />
                                {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                        NIP (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nip}
                                        onChange={(e) => setData('nip', e.target.value)}
                                        placeholder="19950315..."
                                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                                    />
                                    {errors.nip && <p className="text-rose-400 text-xs mt-1">{errors.nip}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                        Role
                                    </label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="user">User / Teknisi</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Password {editingUser && '(Kosongkan jika tidak ingin mengubah)'}
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    required={!editingUser}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                                />
                                {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password}</p>}
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
