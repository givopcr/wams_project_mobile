import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Scan, Search, Package, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function ScannerIndex() {
    const [qrInput, setQrInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [categoryData, setCategoryData] = useState(null);
    const [itemList, setItemList] = useState([]);
    const [error, setError] = useState(null);

    const handleScan = async (e) => {
        e.preventDefault();
        setError(null);
        setCategoryData(null);
        setItemList([]);

        // Extract ID dari QR format /scan/kategori/{id} atau input ID langsung
        let categoryId = qrInput.trim();
        const match = categoryId.match(/\/scan\/kategori\/(\d+)/);
        if (match) {
            categoryId = match[1];
        }

        if (!categoryId) {
            setError('Format QR Code tidak valid.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`/api/kategori/${categoryId}/barang`);
            if (response.data.success) {
                setCategoryData(response.data.kategori);
                setItemList(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Kategori barang tidak ditemukan untuk QR Code ini.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout title="Scanner & Simulator QR Kategori">
            <Head title="Scanner" />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                            <Scan size={24} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">Simulator Scanner QR Code</h3>
                            <p className="text-xs text-slate-400">
                                Masukkan payload hasil scan QR kategori (contoh: <code className="text-blue-400">/scan/kategori/1</code>)
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleScan} className="flex gap-2">
                        <input
                            type="text"
                            value={qrInput}
                            onChange={(e) => setQrInput(e.target.value)}
                            placeholder="Contoh: /scan/kategori/1 atau masukkan ID (1, 2, ...)"
                            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            <Search size={14} />
                            <span>{loading ? 'Memeriksa...' : 'Scan / Cari'}</span>
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                            <AlertCircle size={16} className="text-rose-400 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {categoryData && (
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">Kategori Terdeteksi</span>
                                <h2 className="text-lg font-bold text-white mt-0.5">{categoryData.nama_kategori}</h2>
                            </div>
                            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1">
                                <CheckCircle2 size={13} /> {itemList.length} Master Barang
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {itemList.map((item) => (
                                <div key={item.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[11px] font-mono text-blue-400 font-bold">{item.kode_barang}</span>
                                            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                                {item.tersedia} Tersedia
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-white text-sm">{item.nama_barang}</h4>
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.detail_spesifikasi || 'Tidak ada detail spesifikasi'}</p>
                                    </div>
                                    <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                                        <span>Lokasi: {item.lokasi || '-'}</span>
                                        <span>Total: {item.total_unit} Unit</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
