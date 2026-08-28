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
            <Head title="Scanner - WAMS" />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-2xs">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-[#EEEEEE] rounded-xl text-[#D84040] border border-[#E0E0E0]">
                            <Scan size={24} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-[#1D1616]">Simulator Scanner QR Code</h3>
                            <p className="text-xs text-[#6B7280]">
                                Masukkan payload hasil scan QR kategori (contoh: <code className="text-[#D84040] font-bold">/scan/kategori/1</code>)
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleScan} className="flex gap-2">
                        <input
                            type="text"
                            value={qrInput}
                            onChange={(e) => setQrInput(e.target.value)}
                            placeholder="Contoh: /scan/kategori/1 atau masukkan ID (1, 2, ...)"
                            className="flex-1 px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] placeholder-[#8C93A0] focus:outline-none focus:border-[#D84040] font-mono"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                            <Search size={14} />
                            <span>{loading ? 'Memeriksa...' : 'Scan / Cari'}</span>
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                            <AlertCircle size={16} className="text-[#D84040] shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {categoryData && (
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-[#E0E0E0]">
                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-[#D84040]">Kategori Terdeteksi</span>
                                <h2 className="text-lg font-bold text-[#1D1616] mt-0.5">{categoryData.nama_kategori}</h2>
                            </div>
                            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full flex items-center gap-1">
                                <CheckCircle2 size={13} /> {itemList.length} Master Barang
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {itemList.map((item) => (
                                <div key={item.id} className="p-4 rounded-xl bg-[#EEEEEE] border border-[#E0E0E0] flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[11px] font-mono text-[#D84040] font-bold">{item.kode_barang}</span>
                                            <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-[#E0E0E0]">
                                                {item.tersedia} Tersedia
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-[#1D1616] text-sm">{item.nama_barang}</h4>
                                        <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">{item.detail_spesifikasi || 'Tidak ada detail spesifikasi'}</p>
                                    </div>
                                    <div className="pt-3 mt-3 border-t border-[#E0E0E0] flex items-center justify-between text-[11px] text-[#6B7280]">
                                        <span>Lokasi: {item.lokasi || '-'}</span>
                                        <span className="font-bold text-[#1D1616]">Total: {item.total_unit} Unit</span>
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
