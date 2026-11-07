<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Eksekutif WAMS - {{ $filters['period_label'] }}</title>
    <style>
        @page {
            size: a4 landscape;
            margin: 10mm 12mm 10mm 12mm;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1E293B;
            background: #FFFFFF;
            font-size: 9.5px;
            line-height: 1.4;
        }
        .container {
            width: 100%;
        }

        /* Formal Document Header Table */
        .doc-header-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #1E293B;
            border-top: 4.5px solid #D84040;
            margin-bottom: 12px;
            background: #FFFFFF;
        }
        .doc-header-table td {
            padding: 10px 14px;
            vertical-align: middle;
        }
        .brand-logo {
            display: inline-block;
            width: 36px;
            height: 36px;
            background-color: #D84040;
            color: #FFFFFF;
            text-align: center;
            line-height: 36px;
            font-size: 18px;
            font-weight: bold;
            border-radius: 6px;
            vertical-align: middle;
            margin-right: 10px;
        }
        .header-title-box {
            display: inline-block;
            vertical-align: middle;
        }
        .title {
            font-size: 14px;
            font-weight: bold;
            color: #0F172A;
            letter-spacing: -0.2px;
            text-transform: uppercase;
        }
        .subtitle {
            font-size: 9px;
            color: #475569;
            margin-top: 2px;
            font-weight: 500;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5px;
        }
        .meta-table td {
            padding: 2.5px 6px;
            border: 1px solid #CBD5E1;
        }
        .meta-table td.meta-label {
            background-color: #F1F5F9;
            font-weight: bold;
            color: #334155;
            text-transform: uppercase;
            width: 40%;
        }
        .meta-table td.meta-val {
            background-color: #FFFFFF;
            font-weight: bold;
            color: #0F172A;
            width: 60%;
        }

        /* Section Box */
        .section-box {
            border: 1.2px solid #94A3B8;
            margin-bottom: 12px;
            background: #FFFFFF;
            page-break-inside: avoid;
        }
        .section-box.allow-break {
            page-break-inside: auto;
        }
        .section-header-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #1E293B;
            border-bottom: 2px solid #D84040;
        }
        .section-header-table td {
            padding: 6px 10px;
            color: #FFFFFF;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .section-header-table td.sec-sub {
            text-align: right;
            font-size: 8.5px;
            color: #CBD5E1;
            font-weight: normal;
            text-transform: none;
        }
        .section-body {
            padding: 8px;
        }
        .section-body-nopad {
            padding: 0;
        }

        /* KPI Table */
        .kpi-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 6px 0;
            margin-bottom: 8px;
        }
        .kpi-cell {
            border: 1px solid #CBD5E1;
            border-top: 3px solid #1E293B;
            background-color: #F8FAFC;
            padding: 6px 4px;
            text-align: center;
            vertical-align: middle;
            width: 14.28%;
        }
        .kpi-cell.blue { border-top-color: #2563EB; background-color: #EFF6FF; }
        .kpi-cell.emerald { border-top-color: #059669; background-color: #ECFDF5; }
        .kpi-cell.red { border-top-color: #D84040; background-color: #FEF2F2; }
        .kpi-cell.amber { border-top-color: #D97706; background-color: #FFFBEB; }

        .kpi-label {
            font-size: 7.5px;
            font-weight: bold;
            text-transform: uppercase;
            color: #475569;
            letter-spacing: 0.2px;
            line-height: 1.1;
        }
        .kpi-value {
            font-size: 14px;
            font-weight: bold;
            color: #0F172A;
            margin-top: 2px;
        }

        /* Condition Strip Table */
        .condition-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 6px 0;
        }
        .condition-cell {
            border: 1px solid #CBD5E1;
            background-color: #F8FAFC;
            padding: 5px 8px;
            font-size: 8.5px;
            vertical-align: middle;
            width: 33.33%;
        }
        .condition-cell table {
            width: 100%;
            border-collapse: collapse;
        }
        .condition-cell td {
            border: none;
            padding: 0;
            font-size: 8.5px;
        }

        /* Two Column Layout Table */
        .two-col-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .two-col-table td.col-left {
            width: 50%;
            vertical-align: top;
            padding-right: 6px;
        }
        .two-col-table td.col-right {
            width: 50%;
            vertical-align: top;
            padding-left: 6px;
        }

        /* Formal Bordered Data Tables */
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5px;
        }
        table.data-table th {
            background-color: #F1F5F9;
            color: #0F172A;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 8px;
            letter-spacing: 0.2px;
            text-align: left;
            padding: 5px 6px;
            border: 1px solid #94A3B8;
        }
        table.data-table td {
            padding: 4.5px 6px;
            border: 1px solid #CBD5E1;
            color: #1E293B;
            vertical-align: middle;
        }
        table.data-table tr.even td {
            background-color: #F8FAFC;
        }

        /* Status Badges */
        .badge {
            display: inline-block;
            padding: 1.5px 5px;
            font-size: 7.5px;
            font-weight: bold;
            text-transform: uppercase;
            border-radius: 2px;
            border: 0.5px solid transparent;
        }
        .badge-success { background-color: #DCFCE7; color: #166534; border-color: #86EFAC; }
        .badge-danger { background-color: #FEE2E2; color: #991B1B; border-color: #FCA5A5; }
        .badge-warning { background-color: #FEF3C7; color: #92400E; border-color: #FCD34D; }
        .badge-info { background-color: #DBEAFE; color: #1E40AF; border-color: #93C5FD; }

        /* Footer & Sign Box */
        .footer-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.2px solid #94A3B8;
            background-color: #F8FAFC;
            margin-top: 12px;
            page-break-inside: avoid;
        }
        .footer-table td {
            padding: 8px 12px;
            vertical-align: middle;
        }
        .footer-note {
            font-size: 8px;
            color: #475569;
            line-height: 1.4;
        }
        .sign-cell {
            width: 220px;
            text-align: center;
            border-left: 1px dashed #CBD5E1;
        }
        .sign-title {
            font-size: 8px;
            font-weight: bold;
            color: #334155;
            margin-bottom: 24px;
        }
        .sign-line {
            border-top: 1px solid #334155;
            font-size: 8.5px;
            font-weight: bold;
            color: #0F172A;
            padding-top: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- 1. HEADER DOKUMEN RESMI -->
        <table class="doc-header-table">
            <tr>
                <td style="width: 65%;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 44px; padding: 0; vertical-align: middle;">
                                <div class="brand-logo">W</div>
                            </td>
                            <td style="padding: 0 0 0 8px; vertical-align: middle;">
                                <div class="title">WORKSHOP ASSET MANAGEMENT SYSTEM (WAMS)</div>
                                <div class="subtitle">Laporan Resmi Sirkulasi Peminjaman, Pengembalian, Utilisasi & Kondisi Aset Workshop</div>
                            </td>
                        </tr>
                    </table>
                </td>
                <td style="width: 35%; padding-left: 10px;">
                    <table class="meta-table">
                        <tr>
                            <td class="meta-label">Periode</td>
                            <td class="meta-val" style="color: #D84040;">{{ $filters['period_label'] }}</td>
                        </tr>
                        <tr>
                            <td class="meta-label">Tgl Cetak</td>
                            <td class="meta-val">{{ now()->timezone('Asia/Jakarta')->translatedFormat('d F Y, H:i') }} WIB</td>
                        </tr>
                        <tr>
                            <td class="meta-label">Pencetak</td>
                            <td class="meta-val">{{ auth()->user()?->nama ?? 'Administrator WAMS' }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- SECTION 1: RINGKASAN STATISTIK UTAMA -->
        <div class="section-box">
            <table class="section-header-table">
                <tr>
                    <td>Section 1 &mdash; Ringkasan Statistik Utama & Kondisi Fisik Aset</td>
                    <td class="sec-sub">Ikhtisar indikator performa sirkulasi dan kesiapan unit</td>
                </tr>
            </table>
            <div class="section-body">
                <!-- 7 KPI Cards -->
                <table class="kpi-table">
                    <tr>
                        <td class="kpi-cell blue">
                            <div class="kpi-label">Peminjaman</div>
                            <div class="kpi-value">{{ $summary['total_peminjaman'] }}</div>
                        </td>
                        <td class="kpi-cell emerald">
                            <div class="kpi-label">Pengembalian</div>
                            <div class="kpi-value" style="color: #059669;">{{ $summary['total_pengembalian'] }}</div>
                        </td>
                        <td class="kpi-cell red">
                            <div class="kpi-label">Terlambat</div>
                            <div class="kpi-value" style="color: #D84040;">{{ $summary['total_keterlambatan'] }}</div>
                        </td>
                        <td class="kpi-cell">
                            <div class="kpi-label">Total Unit</div>
                            <div class="kpi-value">{{ $summary['total_unit'] }}</div>
                        </td>
                        <td class="kpi-cell blue">
                            <div class="kpi-label">Unit Tersedia</div>
                            <div class="kpi-value" style="color: #2563EB;">{{ $summary['unit_tersedia'] }}</div>
                        </td>
                        <td class="kpi-cell amber">
                            <div class="kpi-label">Dipinjam</div>
                            <div class="kpi-value" style="color: #D97706;">{{ $summary['unit_dipinjam'] }}</div>
                        </td>
                        <td class="kpi-cell red">
                            <div class="kpi-label">Maintenance</div>
                            <div class="kpi-value" style="color: #B91C1C;">{{ $summary['unit_maintenance'] }}</div>
                        </td>
                    </tr>
                </table>

                <!-- 3 Condition Strip -->
                <table class="condition-table">
                    <tr>
                        <td class="condition-cell">
                            <table>
                                <tr>
                                    <td style="color: #334155; font-weight: bold;">Kondisi Baik / Layak Pakai:</td>
                                    <td style="text-align: right; font-weight: bold; color: #059669;">
                                        {{ $asset_conditions['baik']['count'] }} Unit ({{ $asset_conditions['baik']['percentage'] }}%)
                                    </td>
                                </tr>
                            </table>
                        </td>
                        <td class="condition-cell">
                            <table>
                                <tr>
                                    <td style="color: #334155; font-weight: bold;">Kondisi Rusak:</td>
                                    <td style="text-align: right; font-weight: bold; color: #B91C1C;">
                                        {{ $asset_conditions['rusak']['count'] }} Unit ({{ $asset_conditions['rusak']['percentage'] }}%)
                                    </td>
                                </tr>
                            </table>
                        </td>
                        <td class="condition-cell">
                            <table>
                                <tr>
                                    <td style="color: #334155; font-weight: bold;">Maintenance / Servis:</td>
                                    <td style="text-align: right; font-weight: bold; color: #D97706;">
                                        {{ $asset_conditions['maintenance']['count'] }} Unit ({{ $asset_conditions['maintenance']['percentage'] }}%)
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- SECTION 2 & 3: STATISTIK KATEGORI & UTILISASI ASET -->
        <table class="two-col-table">
            <tr>
                <!-- SECTION 2 -->
                <td class="col-left">
                    <div class="section-box" style="margin-bottom: 0;">
                        <table class="section-header-table">
                            <tr>
                                <td>Section 2 &mdash; Statistik per Kategori</td>
                                <td class="sec-sub">{{ count($category_stats) }} Kategori</td>
                            </tr>
                        </table>
                        <div class="section-body-nopad">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th style="width: 22px; text-align: center;">No</th>
                                        <th>Kategori</th>
                                        <th style="text-align: center; width: 34px;">Model</th>
                                        <th style="text-align: center; width: 34px;">Unit</th>
                                        <th style="text-align: center; width: 34px;">Siap</th>
                                        <th style="text-align: center; width: 40px;">Pinjam</th>
                                        <th style="text-align: center; width: 70px;">Frekuensi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($category_stats as $idx => $cat)
                                    <tr class="{{ $idx % 2 === 1 ? 'even' : '' }}">
                                        <td style="text-align: center; font-weight: bold;">{{ $idx + 1 }}</td>
                                        <td><strong>{{ $cat['nama_kategori'] }}</strong></td>
                                        <td style="text-align: center;">{{ $cat['total_barang'] }}</td>
                                        <td style="text-align: center; font-weight: bold;">{{ $cat['total_unit'] }}</td>
                                        <td style="text-align: center; color: #059669; font-weight: bold;">{{ $cat['unit_tersedia'] }}</td>
                                        <td style="text-align: center; color: #D97706; font-weight: bold;">{{ $cat['unit_dipinjam'] }}</td>
                                        <td style="text-align: center;"><strong>{{ $cat['frekuensi_pinjam'] }}x</strong> ({{ $cat['persentase_utilisasi'] }}%)</td>
                                    </tr>
                                    @empty
                                    <tr>
                                        <td colspan="7" style="text-align: center; color: #64748B; padding: 10px;">Belum ada data kategori</td>
                                    </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>
                </td>

                <!-- SECTION 3 -->
                <td class="col-right">
                    <div class="section-box" style="margin-bottom: 0;">
                        <table class="section-header-table">
                            <tr>
                                <td>Section 3 &mdash; Utilisasi Aset Teratas</td>
                                <td class="sec-sub">Peringkat Peminjaman</td>
                            </tr>
                        </table>
                        <div class="section-body-nopad">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th style="width: 22px; text-align: center;">No</th>
                                        <th>Nama Barang</th>
                                        <th style="width: 60px;">Kode</th>
                                        <th style="width: 65px;">Kategori</th>
                                        <th style="text-align: center; width: 40px;">Unit</th>
                                        <th style="text-align: center; width: 75px;">Frekuensi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse(collect($asset_utilization)->take(8) as $idx => $item)
                                    <tr class="{{ $idx % 2 === 1 ? 'even' : '' }}">
                                        <td style="text-align: center; font-weight: bold;">{{ $idx + 1 }}</td>
                                        <td><strong>{{ $item['nama_barang'] }}</strong></td>
                                        <td style="font-family: Courier, monospace; font-weight: bold;">{{ $item['kode_barang'] }}</td>
                                        <td>{{ $item['kategori'] }}</td>
                                        <td style="text-align: center;">{{ $item['total_unit'] }}</td>
                                        <td style="text-align: center;"><strong>{{ $item['frekuensi_pinjam'] }}x</strong> ({{ $item['persentase_utilisasi'] }}%)</td>
                                    </tr>
                                    @empty
                                    <tr>
                                        <td colspan="6" style="text-align: center; color: #64748B; padding: 10px;">Belum ada data utilisasi</td>
                                    </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>
                </td>
            </tr>
        </table>

        <!-- SECTION 4: REKAP LOGBOOK PEMINJAMAN & PENGEMBALIAN -->
        <div class="section-box allow-break">
            <table class="section-header-table">
                <tr>
                    <td>Section 4 &mdash; Rekap Logbook Peminjaman & Pengembalian</td>
                    <td class="sec-sub">Total {{ count($logbooks) }} Transaksi Tercatat</td>
                </tr>
            </table>
            <div class="section-body-nopad">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 20px; text-align: center;">No</th>
                            <th>Peminjam / Teknisi</th>
                            <th style="width: 70px;">NIP / ID</th>
                            <th>Nama Barang</th>
                            <th style="width: 75px;">Kode Unit</th>
                            <th style="width: 65px;">Kategori</th>
                            <th style="width: 85px;">Waktu Pinjam</th>
                            <th style="width: 85px;">Waktu Kembali</th>
                            <th style="text-align: center; width: 55px;">Durasi</th>
                            <th style="text-align: center; width: 65px;">Status</th>
                            <th style="text-align: center; width: 50px;">Kondisi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($logbooks as $idx => $l)
                        <tr class="{{ $idx % 2 === 1 ? 'even' : '' }}">
                            <td style="text-align: center; font-weight: bold;">{{ $idx + 1 }}</td>
                            <td><strong>{{ $l['user_nama'] }}</strong></td>
                            <td style="font-family: Courier, monospace;">{{ $l['user_nip'] }}</td>
                            <td><strong>{{ $l['nama_barang'] }}</strong></td>
                            <td style="font-family: Courier, monospace; font-weight: bold;">{{ $l['kode_unit'] }}</td>
                            <td>{{ $l['kategori'] }}</td>
                            <td>{{ $l['tanggal_pinjam_formatted'] }}</td>
                            <td>{{ $l['tanggal_kembali_formatted'] }}</td>
                            <td style="text-align: center;">{{ $l['durasi'] }}</td>
                            <td style="text-align: center;">
                                @if($l['status_transaksi'] === 'dipinjam')
                                    <span class="badge {{ $l['is_terlambat'] ? 'badge-danger' : 'badge-warning' }}">
                                        {{ $l['is_terlambat'] ? 'Terlambat' : 'Dipinjam' }}
                                    </span>
                                @elseif($l['status_transaksi'] === 'dikembalikan')
                                    <span class="badge badge-success">Kembali</span>
                                @else
                                    <span class="badge badge-info">{{ ucfirst(str_replace('_', ' ', $l['status_transaksi'])) }}</span>
                                @endif
                            </td>
                            <td style="text-align: center;">
                                @if($l['kondisi_kembali'] === 'baik')
                                    <span class="badge badge-success">Baik</span>
                                @elseif($l['kondisi_kembali'] === 'rusak')
                                    <span class="badge badge-danger">Rusak</span>
                                @else
                                    <span style="color: #94A3B8; font-weight: bold;">-</span>
                                @endif
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="11" style="text-align: center; color: #64748B; padding: 12px;">Tidak ada data transaksi pada periode ini</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- SECTION 5: LAPORAN PEMELIHARAAN & UNIT RUSAK -->
        <div class="section-box allow-break">
            <table class="section-header-table">
                <tr>
                    <td>Section 5 &mdash; Laporan Pemeliharaan & Unit Kondisi Rusak</td>
                    <td class="sec-sub">{{ count($maintenance_reports) }} Unit Tercatat</td>
                </tr>
            </table>
            <div class="section-body-nopad">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 20px; text-align: center;">No</th>
                            <th style="width: 80px;">Kode Unit</th>
                            <th>Nama Barang</th>
                            <th style="width: 70px;">Kategori</th>
                            <th style="text-align: center; width: 65px;">Status</th>
                            <th style="text-align: center; width: 60px;">Kondisi</th>
                            <th style="width: 90px;">Update Terakhir</th>
                            <th>Pelapor Terakhir</th>
                            <th>Catatan Teknis</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($maintenance_reports as $idx => $m)
                        <tr class="{{ $idx % 2 === 1 ? 'even' : '' }}">
                            <td style="text-align: center; font-weight: bold;">{{ $idx + 1 }}</td>
                            <td style="font-family: Courier, monospace; font-weight: bold;">{{ $m['kode_unit'] }}</td>
                            <td><strong>{{ $m['nama_barang'] }}</strong></td>
                            <td>{{ $m['kategori'] }}</td>
                            <td style="text-align: center;"><span class="badge badge-warning">{{ ucfirst($m['status']) }}</span></td>
                            <td style="text-align: center;"><span class="badge {{ $m['kondisi'] === 'baik' ? 'badge-success' : 'badge-danger' }}">{{ ucfirst($m['kondisi']) }}</span></td>
                            <td>{{ $m['tanggal_update'] }}</td>
                            <td>{{ $m['pelapor_terakhir'] }}</td>
                            <td>{{ $m['catatan'] }}</td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="9" style="text-align: center; color: #059669; font-weight: bold; padding: 10px;">
                                Seluruh unit fisik dalam kondisi baik dan tidak ada antrian maintenance.
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- FOOTER & PENGESAHAN -->
        <table class="footer-table">
            <tr>
                <td>
                    <div class="footer-note">
                        <strong>WORKSHOP ASSET MANAGEMENT SYSTEM (WAMS)</strong><br>
                        Dokumen laporan resmi ini digenerate secara otomatis dari database sistem WAMS pada {{ now()->timezone('Asia/Jakarta')->translatedFormat('d F Y, H:i:s') }} WIB.<br>
                        Seluruh statistik dan riwayat sirkulasi mengacu pada transaksi aktual pada periode: <strong>{{ $filters['period_label'] }}</strong>.
                    </div>
                </td>
                <td class="sign-cell">
                    <div class="sign-title">Mengetahui, Administrator Workshop</div>
                    <div class="sign-line">{{ auth()->user()?->nama ?? 'Administrator WAMS' }}</div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
