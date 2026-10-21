<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Eksekutif WAMS - {{ $filters['period_label'] }}</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
            color: #1E293B;
            background: #F8FAFC;
            font-size: 10.5px;
            line-height: 1.45;
            padding: 24px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        .document-sheet {
            max-width: 1180px;
            margin: 0 auto;
            background: #FFFFFF;
            border: 2px solid #1E293B;
            border-radius: 10px;
            padding: 24px;
            box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
        }

        /* Top Action Bar (Hidden on Print) */
        .print-btn-bar {
            max-width: 1180px;
            margin: 0 auto 16px auto;
            background: #1D1616;
            color: #FFFFFF;
            padding: 12px 20px;
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid #374151;
        }
        .btn-print {
            background: #D84040;
            color: #FFFFFF;
            border: 1px solid #F87171;
            padding: 8px 18px;
            border-radius: 6px;
            font-weight: 700;
            cursor: pointer;
            font-size: 11.5px;
            letter-spacing: 0.2px;
        }
        .btn-print:hover {
            background: #B91C1C;
        }

        /* Formal Document Header Box */
        .doc-header {
            border: 1.5px solid #1E293B;
            border-top: 5px solid #D84040;
            border-radius: 8px;
            padding: 16px 20px;
            margin-bottom: 18px;
            background: #FFFFFF;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .brand-block {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .brand-mark {
            width: 44px;
            height: 44px;
            background: #D84040;
            color: #FFFFFF;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: 900;
            border: 1.5px solid #991B1B;
        }
        .title {
            font-size: 17px;
            font-weight: 900;
            color: #0F172A;
            letter-spacing: -0.3px;
            text-transform: uppercase;
        }
        .subtitle {
            font-size: 10.5px;
            color: #475569;
            margin-top: 2px;
            font-weight: 600;
        }
        .meta-table {
            width: auto;
            border-collapse: collapse;
            margin: 0;
            font-size: 9.5px;
        }
        .meta-table td {
            padding: 3px 8px;
            border: 1px solid #CBD5E1;
        }
        .meta-table td.meta-label {
            background: #F1F5F9;
            font-weight: 700;
            color: #334155;
            text-transform: uppercase;
        }
        .meta-table td.meta-val {
            background: #FFFFFF;
            font-weight: 700;
            color: #0F172A;
        }

        /* Section Box with Full Border */
        .section-box {
            border: 1.5px solid #94A3B8;
            border-radius: 8px;
            margin-bottom: 16px;
            background: #FFFFFF;
            overflow: hidden;
            page-break-inside: avoid;
        }
        .section-box.allow-break {
            page-break-inside: auto;
        }
        .section-header {
            background: #1E293B;
            color: #FFFFFF;
            padding: 8px 14px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.4px;
            text-transform: uppercase;
            border-bottom: 2px solid #D84040;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .section-header span.sec-sub {
            font-size: 9.5px;
            font-weight: 600;
            color: #CBD5E1;
            text-transform: none;
        }
        .section-body {
            padding: 12px;
        }
        .section-body.no-pad {
            padding: 0;
        }

        /* KPI Grid inside Section 1 */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 8px;
        }
        .kpi-card {
            border: 1.5px solid #CBD5E1;
            border-top: 3px solid #1E293B;
            border-radius: 6px;
            padding: 8px 10px;
            background: #F8FAFC;
            text-align: center;
        }
        .kpi-card.accent-red { border-top-color: #D84040; background: #FEF2F2; }
        .kpi-card.accent-blue { border-top-color: #2563EB; background: #EFF6FF; }
        .kpi-card.accent-emerald { border-top-color: #059669; background: #ECFDF5; }
        .kpi-card.accent-amber { border-top-color: #D97706; background: #FFFBEB; }

        .kpi-card .kpi-label {
            font-size: 8.5px;
            font-weight: 800;
            text-transform: uppercase;
            color: #475569;
            letter-spacing: 0.2px;
        }
        .kpi-card .kpi-value {
            font-size: 17px;
            font-weight: 900;
            color: #0F172A;
            margin-top: 3px;
        }

        /* Two Column Layout for Sections 2 & 3 */
        .two-col-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-bottom: 16px;
        }
        .two-col-grid .section-box {
            margin-bottom: 0;
        }

        /* Formal Bordered Data Tables */
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.8px;
        }
        table.data-table th {
            background-color: #F1F5F9;
            color: #0F172A;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 8.8px;
            letter-spacing: 0.3px;
            text-align: left;
            padding: 7px 8px;
            border: 1px solid #94A3B8;
        }
        table.data-table td {
            padding: 6px 8px;
            border: 1px solid #CBD5E1;
            color: #1E293B;
            vertical-align: middle;
        }
        table.data-table tbody tr:nth-child(even) td {
            background-color: #F8FAFC;
        }
        table.data-table tfoot td {
            background-color: #F1F5F9;
            font-weight: 800;
            border: 1px solid #94A3B8;
        }

        /* Condition Summary Strip */
        .condition-strip {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 10px;
        }
        .cond-box {
            border: 1px solid #CBD5E1;
            border-radius: 6px;
            padding: 7px 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #F8FAFC;
        }
        .cond-box strong {
            font-size: 12px;
            color: #0F172A;
        }

        /* Status Badges */
        .badge {
            display: inline-block;
            padding: 2px 7px;
            border-radius: 4px;
            font-size: 8.5px;
            font-weight: 800;
            text-transform: uppercase;
            border: 1px solid transparent;
        }
        .badge-success { background: #DCFCE7; color: #166534; border-color: #86EFAC; }
        .badge-danger { background: #FEE2E2; color: #991B1B; border-color: #FCA5A5; }
        .badge-warning { background: #FEF3C7; color: #92400E; border-color: #FCD34D; }
        .badge-info { background: #DBEAFE; color: #1E40AF; border-color: #93C5FD; }

        /* Document Footer & Sign-off Box */
        .doc-footer-box {
            border: 1.5px solid #94A3B8;
            border-radius: 8px;
            padding: 12px 16px;
            margin-top: 16px;
            background: #F8FAFC;
            display: flex;
            justify-content: space-between;
            align-items: center;
            page-break-inside: avoid;
        }
        .footer-note {
            font-size: 9px;
            color: #475569;
            line-height: 1.5;
        }
        .sign-box {
            text-align: center;
            min-width: 180px;
            border-left: 1px dashed #CBD5E1;
            padding-left: 16px;
        }
        .sign-title {
            font-size: 9px;
            font-weight: 700;
            color: #334155;
            margin-bottom: 28px;
        }
        .sign-line {
            border-top: 1px solid #334155;
            font-size: 9px;
            font-weight: 800;
            color: #0F172A;
            padding-top: 3px;
        }

        @media print {
            .print-btn-bar {
                display: none !important;
            }
            body {
                background: #FFFFFF;
                padding: 0;
            }
            .document-sheet {
                max-width: 100%;
                box-shadow: none;
                padding: 14px;
                border: 1.5px solid #1E293B;
            }
            @page {
                size: A4 landscape;
                margin: 10mm;
            }
        }
    </style>
</head>
<body>
    <div class="print-btn-bar">
        <div>
            <strong>WAMS Official Report Preview</strong> &bull; Format Laporan Berborder Siap Cetak / Simpan PDF (A4 Landscape)
        </div>
        <button class="btn-print" onclick="window.print()">Cetak / Simpan PDF</button>
    </div>

    <div class="document-sheet">
        <!-- HEADER DOKUMEN RESMI -->
        <div class="doc-header">
            <div class="brand-block">
                <div class="brand-mark">W</div>
                <div>
                    <div class="title">WORKSHOP ASSET MANAGEMENT SYSTEM (WAMS)</div>
                    <div class="subtitle">Laporan Resmi Sirkulasi Peminjaman, Pengembalian, Utilisasi & Kondisi Aset Workshop</div>
                </div>
            </div>
            <table class="meta-table">
                <tr>
                    <td class="meta-label">Periode Laporan</td>
                    <td class="meta-val" style="color: #D84040;">{{ $filters['period_label'] }}</td>
                </tr>
                <tr>
                    <td class="meta-label">Tanggal Cetak</td>
                    <td class="meta-val">{{ now()->timezone('Asia/Jakarta')->translatedFormat('d F Y, H:i') }} WIB</td>
                </tr>
                <tr>
                    <td class="meta-label">Dicetak Oleh</td>
                    <td class="meta-val">{{ auth()->user()?->nama ?? 'Administrator WAMS' }}</td>
                </tr>
            </table>
        </div>

        <!-- SECTION 1: RINGKASAN STATISTIK UTAMA -->
        <div class="section-box">
            <div class="section-header">
                <span>Section 1 &mdash; Ringkasan Statistik Utama & Kondisi Fisik Aset</span>
                <span class="sec-sub">Ikhtisar indikator performa sirkulasi dan kesiapan unit</span>
            </div>
            <div class="section-body">
                <div class="kpi-grid" style="margin-bottom: 10px;">
                    <div class="kpi-card accent-blue">
                        <div class="kpi-label">Total Peminjaman</div>
                        <div class="kpi-value">{{ $summary['total_peminjaman'] }}</div>
                    </div>
                    <div class="kpi-card accent-emerald">
                        <div class="kpi-label">Total Pengembalian</div>
                        <div class="kpi-value" style="color: #059669;">{{ $summary['total_pengembalian'] }}</div>
                    </div>
                    <div class="kpi-card accent-red">
                        <div class="kpi-label">Keterlambatan</div>
                        <div class="kpi-value" style="color: #D84040;">{{ $summary['total_keterlambatan'] }}</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Total Unit Fisik</div>
                        <div class="kpi-value">{{ $summary['total_unit'] }}</div>
                    </div>
                    <div class="kpi-card accent-blue">
                        <div class="kpi-label">Unit Tersedia</div>
                        <div class="kpi-value" style="color: #2563EB;">{{ $summary['unit_tersedia'] }}</div>
                    </div>
                    <div class="kpi-card accent-amber">
                        <div class="kpi-label">Sedang Dipinjam</div>
                        <div class="kpi-value" style="color: #D97706;">{{ $summary['unit_dipinjam'] }}</div>
                    </div>
                    <div class="kpi-card accent-red">
                        <div class="kpi-label">Unit Maintenance</div>
                        <div class="kpi-value" style="color: #B91C1C;">{{ $summary['unit_maintenance'] }}</div>
                    </div>
                </div>

                <div class="condition-strip" style="margin-bottom: 0;">
                    <div class="cond-box">
                        <span>Kondisi Layak Pakai / Baik:</span>
                        <strong>{{ $asset_conditions['baik']['count'] }} Unit ({{ $asset_conditions['baik']['percentage'] }}%)</strong>
                    </div>
                    <div class="cond-box">
                        <span>Kondisi Rusak:</span>
                        <strong style="color: #B91C1C;">{{ $asset_conditions['rusak']['count'] }} Unit ({{ $asset_conditions['rusak']['percentage'] }}%)</strong>
                    </div>
                    <div class="cond-box">
                        <span>Dalam Pemeliharaan (Maintenance):</span>
                        <strong style="color: #D97706;">{{ $asset_conditions['maintenance']['count'] }} Unit ({{ $asset_conditions['maintenance']['percentage'] }}%)</strong>
                    </div>
                </div>
            </div>
        </div>

        <!-- SECTION 2 & 3: STATISTIK KATEGORI & UTILISASI ASET -->
        <div class="two-col-grid">
            <!-- SECTION 2 -->
            <div class="section-box">
                <div class="section-header">
                    <span>Section 2 &mdash; Statistik per Kategori Barang</span>
                    <span class="sec-sub">{{ count($category_stats) }} Kategori</span>
                </div>
                <div class="section-body no-pad">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th style="width: 32px; text-align: center;">No</th>
                                <th>Nama Kategori</th>
                                <th style="text-align: center;">Model</th>
                                <th style="text-align: center;">Unit</th>
                                <th style="text-align: center;">Siap</th>
                                <th style="text-align: center;">Dipinjam</th>
                                <th style="text-align: center;">Frekuensi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($category_stats as $idx => $cat)
                            <tr>
                                <td style="text-align: center; font-weight: 700;">{{ $idx + 1 }}</td>
                                <td><strong>{{ $cat['nama_kategori'] }}</strong></td>
                                <td style="text-align: center;">{{ $cat['total_barang'] }}</td>
                                <td style="text-align: center; font-weight: 700;">{{ $cat['total_unit'] }}</td>
                                <td style="text-align: center; color: #059669; font-weight: 700;">{{ $cat['unit_tersedia'] }}</td>
                                <td style="text-align: center; color: #D97706; font-weight: 700;">{{ $cat['unit_dipinjam'] }}</td>
                                <td style="text-align: center;"><strong>{{ $cat['frekuensi_pinjam'] }}x</strong> ({{ $cat['persentase_utilisasi'] }}%)</td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="7" style="text-align: center; color: #64748B; padding: 12px;">Belum ada data kategori</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- SECTION 3 -->
            <div class="section-box">
                <div class="section-header">
                    <span>Section 3 &mdash; Utilisasi Aset Teratas</span>
                    <span class="sec-sub">Peringkat Peminjaman Barang</span>
                </div>
                <div class="section-body no-pad">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th style="width: 32px; text-align: center;">No</th>
                                <th>Nama Barang</th>
                                <th>Kode</th>
                                <th>Kategori</th>
                                <th style="text-align: center;">Total Unit</th>
                                <th style="text-align: center;">Frekuensi Pinjam</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse(collect($asset_utilization)->take(8) as $idx => $item)
                            <tr>
                                <td style="text-align: center; font-weight: 700;">{{ $idx + 1 }}</td>
                                <td><strong>{{ $item['nama_barang'] }}</strong></td>
                                <td style="font-family: monospace; font-weight: 700;">{{ $item['kode_barang'] }}</td>
                                <td>{{ $item['kategori'] }}</td>
                                <td style="text-align: center;">{{ $item['total_unit'] }}</td>
                                <td style="text-align: center;"><strong>{{ $item['frekuensi_pinjam'] }}x</strong> ({{ $item['persentase_utilisasi'] }}%)</td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="6" style="text-align: center; color: #64748B; padding: 12px;">Belum ada data utilisasi</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- SECTION 4: REKAP LOGBOOK PEMINJAMAN & PENGEMBALIAN -->
        <div class="section-box allow-break">
            <div class="section-header">
                <span>Section 4 &mdash; Rekap Logbook Peminjaman & Pengembalian</span>
                <span class="sec-sub">Total {{ count($logbooks) }} Transaksi Tercatat</span>
            </div>
            <div class="section-body no-pad">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 32px; text-align: center;">No</th>
                            <th>Peminjam / Teknisi</th>
                            <th>NIP / Identitas</th>
                            <th>Nama Barang</th>
                            <th>Kode Unit</th>
                            <th>Kategori</th>
                            <th>Waktu Pinjam</th>
                            <th>Waktu Kembali</th>
                            <th style="text-align: center;">Durasi</th>
                            <th style="text-align: center;">Status</th>
                            <th style="text-align: center;">Kondisi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($logbooks as $idx => $l)
                        <tr>
                            <td style="text-align: center; font-weight: 700;">{{ $idx + 1 }}</td>
                            <td><strong>{{ $l['user_nama'] }}</strong></td>
                            <td style="font-family: monospace;">{{ $l['user_nip'] }}</td>
                            <td><strong>{{ $l['nama_barang'] }}</strong></td>
                            <td style="font-family: monospace; font-weight: 700;">{{ $l['kode_unit'] }}</td>
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
                                    <span class="badge badge-success">Dikembalikan</span>
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
                                    <span style="color: #94A3B8; font-weight: 700;">-</span>
                                @endif
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="11" style="text-align: center; color: #64748B; padding: 16px;">Tidak ada data transaksi pada periode ini</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- SECTION 5: LAPORAN PEMELIHARAAN & UNIT RUSAK -->
        <div class="section-box allow-break">
            <div class="section-header">
                <span>Section 5 &mdash; Laporan Pemeliharaan & Unit Kondisi Rusak</span>
                <span class="sec-sub">{{ count($maintenance_reports) }} Unit Tercatat</span>
            </div>
            <div class="section-body no-pad">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 32px; text-align: center;">No</th>
                            <th>Kode Unit</th>
                            <th>Nama Barang</th>
                            <th>Kategori</th>
                            <th style="text-align: center;">Status Unit</th>
                            <th style="text-align: center;">Kondisi Fisik</th>
                            <th>Terakhir Diperbarui</th>
                            <th>Pelapor / Peminjam Terakhir</th>
                            <th>Catatan / Keterangan Teknis</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($maintenance_reports as $idx => $m)
                        <tr>
                            <td style="text-align: center; font-weight: 700;">{{ $idx + 1 }}</td>
                            <td style="font-family: monospace; font-weight: 800;">{{ $m['kode_unit'] }}</td>
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
                            <td colspan="9" style="text-align: center; color: #059669; font-weight: 700; padding: 14px;">
                                Seluruh unit fisik dalam kondisi baik dan tidak ada antrian maintenance.
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- FOOTER & PENGESAHAN -->
        <div class="doc-footer-box">
            <div class="footer-note">
                <strong>WORKSHOP ASSET MANAGEMENT SYSTEM (WAMS)</strong><br>
                Dokumen laporan ini digenerate secara otomatis dari database sistem WAMS pada {{ now()->timezone('Asia/Jakarta')->translatedFormat('d F Y, H:i:s') }} WIB.<br>
                Seluruh angka statistik dan log sirkulasi mengacu pada rekaman transaksi aktual sesuai periode filter yang dipilih.
            </div>
            <div class="sign-box">
                <div class="sign-title">Mengetahui, Administrator Workshop</div>
                <div class="sign-line">{{ auth()->user()?->nama ?? 'Administrator WAMS' }}</div>
            </div>
        </div>
    </div>
</body>
</html>
