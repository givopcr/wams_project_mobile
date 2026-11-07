import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    QrCode,
    Download,
    Boxes,
    Check,
    Smartphone,
    ExternalLink,
    Search,
    Wrench,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Layers
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function QrCodeIndex({ categories = [], units = [] }) {
    const [activeTab, setActiveTab] = useState('units'); // 'units' (Guest Web) | 'categories' (Rak)
    const [unitSearch, setUnitSearch] = useState('');
    const [downloadingId, setDownloadingId] = useState(null);
    const [isDownloadingAll, setIsDownloadingAll] = useState(false);

    // Filter units
    const filteredUnits = units.filter((u) => {
        const q = unitSearch.toLowerCase();
        return (
            u.kode_unit.toLowerCase().includes(q) ||
            u.nama_barang.toLowerCase().includes(q) ||
            u.kategori.toLowerCase().includes(q)
        );
    });

    // Download Label QR Unit Fisik (Siap cetak stiker alat)
    const downloadUnitQR = (unit) => {
        setDownloadingId(`unit-${unit.id}`);
        const svg = document.getElementById(`qr-unit-${unit.id}`);
        if (!svg) {
            setDownloadingId(null);
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            const width = 540;
            const height = 670;
            canvas.width = width;
            canvas.height = height;

            const drawRoundedRect = (c, x, y, w, h, r) => {
                c.beginPath();
                if (c.roundRect) {
                    c.roundRect(x, y, w, h, r);
                } else {
                    const radius = typeof r === 'number' ? r : (Array.isArray(r) ? r[0] : 8);
                    c.moveTo(x + radius, y);
                    c.lineTo(x + w - radius, y);
                    c.arcTo(x + w, y, x + w, y + radius, radius);
                    c.lineTo(x + w, y + h - radius);
                    c.arcTo(x + w, y + h, x + w - radius, y + h, radius);
                    c.lineTo(x + radius, y + h);
                    c.arcTo(x, y + h, x, y + h - radius, radius);
                    c.lineTo(x, y + radius);
                    c.arcTo(x, y, x + radius, y, radius);
                    c.closePath();
                }
            };

            // 1. Bersihkan Canvas (Transparan di luar box stiker)
            ctx.clearRect(0, 0, width, height);

            const cardRadius = 18;

            // Clip ke bentuk box stiker ber-radius
            ctx.save();
            drawRoundedRect(ctx, 0, 0, width, height, cardRadius);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.clip();

            // 2. Header Banner Merah WAMS (Menempel pas di batas atas box stiker)
            const bannerH = 70;
            ctx.fillStyle = '#D84040';
            ctx.fillRect(0, 0, width, bannerH);

            // Judul Besar WAMS
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '900 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('WAMS', width / 2, bannerH / 2);
            ctx.textBaseline = 'alphabetic';

            // 3. Kode Unit Badge (Hitam)
            const codeText = unit.kode_unit || 'KODE-UNIT';

            let codeFontSize = 17;
            ctx.font = `bold ${codeFontSize}px "SF Mono", "Courier New", monospace`;
            let codeMetrics = ctx.measureText(codeText);

            while (codeMetrics.width > width - 80 && codeFontSize > 11) {
                codeFontSize -= 1;
                ctx.font = `bold ${codeFontSize}px "SF Mono", "Courier New", monospace`;
                codeMetrics = ctx.measureText(codeText);
            }

            const badgePaddingX = 28;
            const badgeWidth = Math.min(width - 40, Math.max(codeMetrics.width + badgePaddingX, 160));
            const badgeHeight = 38;
            const badgeX = (width - badgeWidth) / 2;
            const badgeY = 88;

            ctx.fillStyle = '#1D1616';
            drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 8);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold ${codeFontSize}px "SF Mono", "Courier New", monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(codeText, width / 2, badgeY + (badgeHeight / 2));
            ctx.textBaseline = 'alphabetic';

            // 4. Container & QR Code (Di tengah dan terbingkai rapi)
            const qrCardSize = 380;
            const qrCardX = (width - qrCardSize) / 2;
            const qrCardY = 142;

            ctx.fillStyle = '#F8FAFC';
            drawRoundedRect(ctx, qrCardX, qrCardY, qrCardSize, qrCardSize, 16);
            ctx.fill();
            ctx.strokeStyle = '#E2E8F0';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw QR Code
            const qrSize = 340;
            const qrX = (width - qrSize) / 2;
            const qrY = qrCardY + (qrCardSize - qrSize) / 2;
            ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

            // 5. Nama / Jenis Barang (Tetap Dipertahankan)
            const rawNama = unit.nama_barang || 'Peralatan Workshop';
            let namaFontSize = 26;
            ctx.font = `900 ${namaFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            while (ctx.measureText(rawNama).width > width - 60 && namaFontSize > 15) {
                namaFontSize -= 1;
                ctx.font = `900 ${namaFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            }

            ctx.fillStyle = '#1D1616';
            ctx.textAlign = 'center';
            ctx.fillText(rawNama, width / 2, 558);

            // 6. Kategori Badge Pill (Tetap Dipertahankan)
            const kategoriLabel = `Kategori: ${unit.kategori || 'Peralatan'}`;
            ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            const katMetrics = ctx.measureText(kategoriLabel);
            const katPillW = katMetrics.width + 24;
            const katPillX = (width - katPillW) / 2;
            const katPillY = 576;
            const katPillH = 25;

            ctx.fillStyle = '#F1F5F9';
            drawRoundedRect(ctx, katPillX, katPillY, katPillW, katPillH, 6);
            ctx.fill();
            ctx.strokeStyle = '#CBD5E1';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#475569';
            ctx.textBaseline = 'middle';
            ctx.fillText(kategoriLabel, width / 2, katPillY + (katPillH / 2));
            ctx.textBaseline = 'alphabetic';

            // 7. Footer Watermark
            ctx.fillStyle = '#94A3B8';
            ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('WAMS • WORKSHOP ASSET MANAGEMENT SYSTEM', width / 2, 636);
            ctx.textBaseline = 'alphabetic';

            ctx.restore();

            // 8. Garis Tepi Box Stiker (Border Luar)
            ctx.strokeStyle = '#CBD5E1';
            ctx.lineWidth = 2;
            drawRoundedRect(ctx, 1, 1, width - 2, height - 2, cardRadius);
            ctx.stroke();

            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            const safeFileName = codeText.replace(/[^a-zA-Z0-9_-]/g, '_');
            downloadLink.download = `Stiker_QR_${safeFileName}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
            URL.revokeObjectURL(url);
            setDownloadingId(null);
        };

        img.onerror = () => {
            setDownloadingId(null);
            URL.revokeObjectURL(url);
        };

        img.src = url;
    };

    // Download Label QR Kategori
    const downloadSingleCategoryQR = (kat) => {
        setDownloadingId(`kat-${kat.id}`);
        const svg = document.getElementById(`qr-svg-${kat.id}`);
        if (!svg) {
            setDownloadingId(null);
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            const width = 540;
            const height = 670;
            canvas.width = width;
            canvas.height = height;

            const drawRoundedRect = (c, x, y, w, h, r) => {
                c.beginPath();
                if (c.roundRect) {
                    c.roundRect(x, y, w, h, r);
                } else {
                    const radius = typeof r === 'number' ? r : (Array.isArray(r) ? r[0] : 8);
                    c.moveTo(x + radius, y);
                    c.lineTo(x + w - radius, y);
                    c.arcTo(x + w, y, x + w, y + radius, radius);
                    c.lineTo(x + w, y + h - radius);
                    c.arcTo(x + w, y + h, x + w - radius, y + h, radius);
                    c.lineTo(x + radius, y + h);
                    c.arcTo(x, y + h, x, y + h - radius, radius);
                    c.lineTo(x, y + radius);
                    c.arcTo(x, y, x + radius, y, radius);
                    c.closePath();
                }
            };

            // 1. Bersihkan Canvas (Transparan di luar box stiker)
            ctx.clearRect(0, 0, width, height);

            const cardRadius = 18;

            // Clip ke bentuk box stiker ber-radius
            ctx.save();
            drawRoundedRect(ctx, 0, 0, width, height, cardRadius);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.clip();

            // 2. Header Banner Merah WAMS
            const bannerH = 70;
            ctx.fillStyle = '#D84040';
            ctx.fillRect(0, 0, width, bannerH);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '900 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('WAMS', width / 2, bannerH / 2);
            ctx.textBaseline = 'alphabetic';

            // 3. ID Badge
            const idText = `KATEGORI ID #${kat.id}`;
            ctx.fillStyle = '#1D1616';
            drawRoundedRect(ctx, width / 2 - 90, 88, 180, 38, 8);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px "SF Mono", "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(idText, width / 2, 88 + 19);
            ctx.textBaseline = 'alphabetic';

            // 4. QR Card
            const qrCardSize = 380;
            const qrCardX = (width - qrCardSize) / 2;
            const qrCardY = 142;
            ctx.fillStyle = '#F8FAFC';
            drawRoundedRect(ctx, qrCardX, qrCardY, qrCardSize, qrCardSize, 16);
            ctx.fill();
            ctx.strokeStyle = '#E2E8F0';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            const qrSize = 340;
            const qrX = (width - qrSize) / 2;
            const qrY = qrCardY + (qrCardSize - qrSize) / 2;
            ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

            // 5. Nama Kategori (Auto-scaled)
            const namaKat = kat.nama_kategori || 'Kategori';
            let katFontSize = 26;
            ctx.font = `900 ${katFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            while (ctx.measureText(namaKat).width > width - 60 && katFontSize > 15) {
                katFontSize -= 1;
                ctx.font = `900 ${katFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            }
            ctx.fillStyle = '#1D1616';
            ctx.textAlign = 'center';
            ctx.fillText(namaKat, width / 2, 558);

            // 6. Info Count Pill
            const infoText = `${kat.total_barang} Model Barang • ${kat.total_unit} Unit`;
            ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            const infoMetrics = ctx.measureText(infoText);
            const infoPillW = infoMetrics.width + 24;
            const infoPillX = (width - infoPillW) / 2;
            const infoPillY = 576;
            const infoPillH = 25;

            ctx.fillStyle = '#F1F5F9';
            drawRoundedRect(ctx, infoPillX, infoPillY, infoPillW, infoPillH, 6);
            ctx.fill();
            ctx.strokeStyle = '#CBD5E1';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#475569';
            ctx.textBaseline = 'middle';
            ctx.fillText(infoText, width / 2, infoPillY + (infoPillH / 2));
            ctx.textBaseline = 'alphabetic';

            // 7. Footer Watermark
            ctx.fillStyle = '#94A3B8';
            ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('WAMS • WORKSHOP ASSET MANAGEMENT SYSTEM', width / 2, 636);
            ctx.textBaseline = 'alphabetic';

            ctx.restore();

            // 8. Garis Tepi Box Stiker (Border Luar)
            ctx.strokeStyle = '#CBD5E1';
            ctx.lineWidth = 2;
            drawRoundedRect(ctx, 1, 1, width - 2, height - 2, cardRadius);
            ctx.stroke();

            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            const safeName = kat.nama_kategori.replace(/[^a-zA-Z0-9_-]/g, '_');
            downloadLink.download = `Stiker_QR_Kategori_${safeName}_ID${kat.id}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
            URL.revokeObjectURL(url);
            setDownloadingId(null);
        };

        img.onerror = () => {
            setDownloadingId(null);
            URL.revokeObjectURL(url);
        };

        img.src = url;
    };

    return (
        <AuthenticatedLayout title="Generate & Cetak QR Code">
            <Head title="Generate QR Code - WAMS" />

            <div className="space-y-6 max-w-7xl mx-auto pb-10">
                {/* Tabs Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0E0E0] pb-4">
                    <div className="flex items-center gap-2 bg-[#EEEEEE] p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setActiveTab('units')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'units'
                                    ? 'bg-white text-[#D84040] shadow-xs'
                                    : 'text-[#6B7280] hover:text-[#1D1616]'
                            }`}
                        >
                            <Smartphone size={15} />
                            <span>QR Unit</span>
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#D84040] text-white">
                                {units.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('categories')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'categories'
                                    ? 'bg-white text-[#D84040] shadow-xs'
                                    : 'text-[#6B7280] hover:text-[#1D1616]'
                            }`}
                        >
                            <Boxes size={15} />
                            <span>QR Kategori</span>
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#EEEEEE] text-[#1D1616] border border-[#E0E0E0]">
                                {categories.length}
                            </span>
                        </button>
                    </div>

                    {activeTab === 'units' && (
                        <div className="relative w-full sm:w-72">
                            <input
                                type="text"
                                value={unitSearch}
                                onChange={(e) => setUnitSearch(e.target.value)}
                                placeholder="Cari unit atau barang..."
                                className="w-full pl-9 pr-4 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] placeholder-[#8C93A0] focus:outline-none focus:border-[#D84040]"
                            />
                            <Search size={14} className="absolute left-3 top-2.5 text-[#6B7280]" />
                        </div>
                    )}
                </div>

                {/* TAB 1: UNIT FISIK (KHUSUS TAMU) */}
                {activeTab === 'units' && (
                    <div className="space-y-4">
                        {/* Info Banner */}
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-[#D84040] text-white rounded-xl shrink-0">
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-[#1D1616]">
                                        QR Code Peminjaman Tamu (Mobile Web Tanpa Instal Aplikasi)
                                    </h3>
                                    <p className="text-[11px] text-[#6B7280] mt-0.5 max-w-3xl leading-relaxed">
                                        Stiker QR ini ditempelkan pada fisik alat. Ketika tamu memindai menggunakan kamera HP, kamera otomatis membuka link website tamu (<code className="text-[#D84040] font-mono font-bold">/scan/[kode_unit]</code>) untuk mengisi nama, email, durasi, dan verifikasi OTP jika lebih dari 4 jam.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Grid Unit QR */}
                        {filteredUnits.length === 0 ? (
                            <div className="p-12 text-center bg-white border border-[#E0E0E0] rounded-2xl text-xs text-[#6B7280]">
                                Tidak ada unit fisik yang cocok dengan pencarian.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {filteredUnits.map((u) => {
                                    const isAvailable = u.status === 'tersedia';
                                    const isDipinjam = u.status === 'dipinjam';

                                    return (
                                        <div
                                            key={u.id}
                                            className="bg-white border border-[#E0E0E0] rounded-2xl p-5 flex flex-col items-center text-center relative overflow-hidden transition-all hover:shadow-md shadow-2xs group"
                                        >
                                            {/* Status Badge */}
                                            <div className="w-full flex items-center justify-between text-xs mb-3">
                                                <span className="font-mono bg-[#EEEEEE] px-2 py-0.5 rounded-md text-[11px] font-black text-[#1D1616]">
                                                    {u.kode_unit}
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                        isAvailable
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : isDipinjam
                                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                    }`}
                                                >
                                                    {u.status}
                                                </span>
                                            </div>

                                            {/* QR Code Canvas */}
                                            <div className="bg-white p-3 rounded-xl mb-3 border-2 border-[#E0E0E0] relative group-hover:border-[#D84040] transition-colors">
                                                <QRCodeSVG
                                                    id={`qr-unit-${u.id}`}
                                                    value={u.qr_payload}
                                                    size={140}
                                                    level="H"
                                                    includeMargin={false}
                                                    fgColor="#1D1616"
                                                />
                                            </div>

                                            <h4 className="font-extrabold text-[#1D1616] text-sm truncate w-full">
                                                {u.nama_barang}
                                            </h4>
                                            <p className="text-[11px] text-[#6B7280] mb-3">
                                                {u.kategori}
                                            </p>

                                            {/* Tautan URL Langsung */}
                                            <a
                                                href={`/scan/${u.kode_unit}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-1.5 px-2 bg-red-50 hover:bg-red-100 text-[#D84040] rounded-lg text-[11px] font-mono font-bold flex items-center justify-center gap-1 mb-3 transition-colors"
                                                title="Klik untuk membuka tampilan web tamu di tab baru"
                                            >
                                                <span>/scan/{u.kode_unit}</span>
                                                <ExternalLink size={12} />
                                            </a>

                                            {/* Tombol Unduh Stiker Label */}
                                            <button
                                                type="button"
                                                onClick={() => downloadUnitQR(u)}
                                                disabled={downloadingId === `unit-${u.id}`}
                                                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1D1616] hover:bg-[#D84040] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                            >
                                                <Download size={13} />
                                                <span>
                                                    {downloadingId === `unit-${u.id}`
                                                        ? 'Memproses...'
                                                        : 'Unduh Stiker QR (PNG)'}
                                                </span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: KATEGORI (RAK WORKSHOP) */}
                {activeTab === 'categories' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map((kat) => (
                                <div
                                    key={kat.id}
                                    className="bg-white border border-[#E0E0E0] rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden transition-all hover:shadow-md shadow-2xs group"
                                >
                                    <div className="w-full flex items-center justify-between text-xs text-[#6B7280] mb-4">
                                        <span className="font-bold flex items-center gap-1.5 text-[#D84040]">
                                            <Boxes size={14} /> WAMS QR
                                        </span>
                                        <span className="font-mono bg-[#EEEEEE] px-2 py-0.5 rounded-md text-[11px] font-bold text-[#1D1616]">
                                            ID: #{kat.id}
                                        </span>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl mb-4 border-2 border-[#E0E0E0] relative">
                                        <QRCodeSVG
                                            id={`qr-svg-${kat.id}`}
                                            value={kat.qr_code}
                                            size={150}
                                            level="H"
                                            includeMargin={false}
                                            fgColor="#1D1616"
                                        />
                                    </div>

                                    <h3 className="font-extrabold text-[#1D1616] text-base mb-1">
                                        {kat.nama_kategori}
                                    </h3>
                                    <p className="text-xs font-mono text-[#D84040] mb-4 font-bold">
                                        {kat.qr_code}
                                    </p>

                                    <div className="w-full mb-4">
                                        <button
                                            type="button"
                                            onClick={() => downloadSingleCategoryQR(kat)}
                                            disabled={downloadingId === `kat-${kat.id}`}
                                            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#EEEEEE] hover:bg-[#D84040] hover:text-white text-[#1D1616] text-xs font-bold rounded-xl transition-all cursor-pointer border border-[#E0E0E0]"
                                        >
                                            <Download size={14} />
                                            <span>
                                                {downloadingId === `kat-${kat.id}`
                                                    ? 'Memproses...'
                                                    : 'Unduh QR Label (PNG)'}
                                            </span>
                                        </button>
                                    </div>

                                    <div className="w-full pt-3 border-t border-[#E0E0E0] flex items-center justify-between text-xs text-[#6B7280]">
                                        <span>{kat.total_barang} Barang</span>
                                        <span className="font-bold text-[#1D1616]">
                                            {kat.total_unit} Total Unit
                                        </span>
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
