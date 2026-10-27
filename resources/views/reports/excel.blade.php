<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Laporan Eksekutif WAMS - {{ $filters['period_label'] }}</title>
    <!--[if gte mso 9]>
    <xml>
        <{{"x:ExcelWorkbook"}}>
            <{{"x:ExcelWorksheets"}}>
                <{{"x:ExcelWorksheet"}}>
                    <{{"x:Name"}}>Laporan WAMS<{{"/x:Name"}}>
                    <{{"x:WorksheetOptions"}}>
                        <{{"x:DisplayGridlines"}}/>
                    <{{"/x:WorksheetOptions"}}>
                <{{"/x:ExcelWorksheet"}}>
            <{{"/x:ExcelWorksheets"}}>
        <{{"/x:ExcelWorkbook"}}>
    </xml>
    <![endif]-->
    <style>
        body {
            font-family: Calibri, 'Segoe UI', Arial, sans-serif;
            font-size: 10pt;
            color: #1E293B;
            background-color: #FFFFFF;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            table-layout: fixed;
        }
        .text-str {
            mso-number-format: "\@";
        }
        .num-int {
            mso-number-format: "#,##0";
        }
        .banner-title {
            background-color: #8E1616;
            color: #FFFFFF;
            font-size: 13pt;
            font-weight: bold;
            padding: 10px 14px;
            border: 1.5pt solid #5E0D0D;
            text-align: left;
            vertical-align: middle;
        }
        .meta-bar {
            background-color: #F8FAFC;
            color: #334155;
            font-size: 9.5pt;
            padding: 7px 12px;
            border: 1pt solid #CBD5E1;
            vertical-align: middle;
        }
        .sec-hdr {
            background-color: #A82020;
            color: #FFFFFF;
            font-size: 10.5pt;
            font-weight: bold;
            padding: 8px 12px;
            border-top: 1.5pt solid #7F1D1D;
            border-bottom: 1.5pt solid #7F1D1D;
            border-left: 1pt solid #7F1D1D;
            border-right: 1pt solid #7F1D1D;
            text-transform: uppercase;
            vertical-align: middle;
        }
        .th-c {
            background-color: #E2E8F0;
            color: #0F172A;
            font-weight: bold;
            font-size: 9pt;
            padding: 7px 8px;
            border: 1pt solid #94A3B8;
            text-align: center;
            vertical-align: middle;
        }
        .th-l {
            background-color: #E2E8F0;
            color: #0F172A;
            font-weight: bold;
            font-size: 9pt;
            padding: 7px 10px;
            border: 1pt solid #94A3B8;
            text-align: left;
            vertical-align: middle;
        }
        .td-c {
            padding: 6px 8px;
            border: 1pt solid #CBD5E1;
            font-size: 9.5pt;
            color: #1E293B;
            text-align: center;
            vertical-align: middle;
            background-color: #FFFFFF;
        }
        .td-l {
            padding: 6px 10px;
            border: 1pt solid #CBD5E1;
            font-size: 9.5pt;
            color: #1E293B;
            text-align: left;
            vertical-align: middle;
            background-color: #FFFFFF;
        }
        .td-r {
            padding: 6px 10px;
            border: 1pt solid #CBD5E1;
            font-size: 9.5pt;
            color: #1E293B;
            text-align: right;
            vertical-align: middle;
            background-color: #FFFFFF;
        }
        .td-alt-c {
            padding: 6px 8px;
            border: 1pt solid #CBD5E1;
            font-size: 9.5pt;
            color: #1E293B;
            text-align: center;
            vertical-align: middle;
            background-color: #F8FAFC;
        }
        .td-alt-l {
            padding: 6px 10px;
            border: 1pt solid #CBD5E1;
            font-size: 9.5pt;
            color: #1E293B;
            text-align: left;
            vertical-align: middle;
            background-color: #F8FAFC;
        }
        .td-alt-r {
            padding: 6px 10px;
            border: 1pt solid #CBD5E1;
            font-size: 9.5pt;
            color: #1E293B;
            text-align: right;
            vertical-align: middle;
            background-color: #F8FAFC;
        }
        .bold {
            font-weight: bold;
        }
        .badge-ok {
            background-color: #DCFCE7;
            color: #166534;
            font-weight: bold;
            text-align: center;
        }
        .badge-warn {
            background-color: #FEF3C7;
            color: #92400E;
            font-weight: bold;
            text-align: center;
        }
        .badge-err {
            background-color: #FEE2E2;
            color: #991B1B;
            font-weight: bold;
            text-align: center;
        }
        .spacer-row td {
            height: 14px;
            border: none;
            background-color: #FFFFFF;
        }
    </style>
</head>
<body>
    <table>
        <!-- STANDARDIZED 12-COLUMN GRID (TOTAL WIDTH: ~1350px) -->
        <colgroup>
            <col style="width: 45px;" />  <!-- Col 1: No -->
            <col style="width: 140px;" /> <!-- Col 2: Peminjam / Nama / Subtitle -->
            <col style="width: 110px;" /> <!-- Col 3: NIP / Identitas -->
            <col style="width: 150px;" /> <!-- Col 4: Nama Barang / Keterangan -->
            <col style="width: 95px;" />  <!-- Col 5: Kode Barang / Model -->
            <col style="width: 90px;" />  <!-- Col 6: Kode Unit / Total Unit -->
            <col style="width: 100px;" /> <!-- Col 7: Kategori / Unit Tersedia -->
            <col style="width: 110px;" /> <!-- Col 8: Waktu Pinjam / Lokasi / Unit Dipinjam -->
            <col style="width: 110px;" /> <!-- Col 9: Waktu Kembali / Unit Maintenance -->
            <col style="width: 85px;" />  <!-- Col 10: Durasi / Metrik Angka -->
            <col style="width: 110px;" /> <!-- Col 11: Status Transaksi -->
            <col style="width: 205px;" /> <!-- Col 12: Kondisi & Ketepatan / Analisis -->
        </colgroup>

        <!-- ========================================== -->
        <!-- HEADER UTAMA DOKUMEN                       -->
        <!-- ========================================== -->
        <tr>
            <td colspan="12" class="banner-title">
                WORKSHOP ASSET MANAGEMENT SYSTEM (WAMS) &mdash; LAPORAN EKSEKUTIF &amp; STATISTIK
            </td>
        </tr>
        <tr>
            <td colspan="4" class="meta-bar"><strong>Periode Filter:</strong> {{ $filters['period_label'] }}</td>
            <td colspan="5" class="meta-bar"><strong>Waktu Unduh:</strong> {{ now()->timezone('Asia/Jakarta')->translatedFormat('d F Y, H:i:s') }} WIB</td>
            <td colspan="3" class="meta-bar"><strong>Diunduh Oleh:</strong> {{ auth()->user()?->nama ?? 'Administrator WAMS' }}</td>
        </tr>

        <tr class="spacer-row"><td colspan="12"></td></tr>

        <!-- ========================================== -->
        <!-- SECTION 1: RINGKASAN STATISTIK UTAMA       -->
        <!-- ========================================== -->
        <tr>
            <td colspan="12" class="sec-hdr">SECTION 1 &mdash; RINGKASAN STATISTIK UTAMA WORKSHOP</td>
        </tr>
        <tr>
            <th class="th-c">No</th>
            <th colspan="4" class="th-l">Indikator Metrik</th>
            <th colspan="2" class="th-c">Jumlah</th>
            <th colspan="5" class="th-l">Keterangan Operasional</th>
        </tr>
        <tr>
            <td class="td-c bold">1</td>
            <td colspan="4" class="td-l bold">Total Peminjaman</td>
            <td colspan="2" class="td-c bold num-int">{{ $summary['total_peminjaman'] }}</td>
            <td colspan="5" class="td-l">Jumlah transaksi sirkulasi dalam periode laporan</td>
        </tr>
        <tr>
            <td class="td-alt-c bold">2</td>
            <td colspan="4" class="td-alt-l bold">Total Pengembalian</td>
            <td colspan="2" class="td-alt-c bold num-int">{{ $summary['total_pengembalian'] }}</td>
            <td colspan="5" class="td-alt-l">Unit yang telah selesai dikembalikan ke workshop</td>
        </tr>
        <tr>
            <td class="td-c bold">3</td>
            <td colspan="4" class="td-l bold">Total Keterlambatan</td>
            <td colspan="2" class="td-c badge-err num-int">{{ $summary['total_keterlambatan'] }}</td>
            <td colspan="5" class="td-l">Transaksi yang melewati batas waktu pengembalian</td>
        </tr>
        <tr>
            <td class="td-alt-c bold">4</td>
            <td colspan="4" class="td-alt-l bold">Total Unit Fisik Terdaftar</td>
            <td colspan="2" class="td-alt-c bold num-int">{{ $summary['total_unit'] }}</td>
            <td colspan="5" class="td-alt-l">Seluruh unit peralatan aset yang terdaftar di workshop</td>
        </tr>
        <tr>
            <td class="td-c bold">5</td>
            <td colspan="4" class="td-l bold">Unit Tersedia (Siap Pakai)</td>
            <td colspan="2" class="td-c badge-ok num-int">{{ $summary['unit_tersedia'] }}</td>
            <td colspan="5" class="td-l">Unit siap dipinjam oleh teknisi / pengguna</td>
        </tr>
        <tr>
            <td class="td-alt-c bold">6</td>
            <td colspan="4" class="td-alt-l bold">Unit Sedang Dipinjam</td>
            <td colspan="2" class="td-alt-c badge-warn num-int">{{ $summary['unit_dipinjam'] }}</td>
            <td colspan="5" class="td-alt-l">Unit sedang aktif digunakan di lapangan</td>
        </tr>
        <tr>
            <td class="td-c bold">7</td>
            <td colspan="4" class="td-l bold">Unit Maintenance / Perbaikan</td>
            <td colspan="2" class="td-c badge-err num-int">{{ $summary['unit_maintenance'] }}</td>
            <td colspan="5" class="td-l">Unit sedang dalam pemeliharaan atau mengalami kerusakan</td>
        </tr>

        <tr class="spacer-row"><td colspan="12"></td></tr>

        <!-- ========================================== -->
        <!-- SECTION 2: KONDISI FISIK ASET WORKSHOP     -->
        <!-- ========================================== -->
        <tr>
            <td colspan="12" class="sec-hdr">SECTION 2 &mdash; KONDISI FISIK ASET WORKSHOP</td>
        </tr>
        <tr>
            <th class="th-c">No</th>
            <th colspan="5" class="th-l">Status Kondisi Fisik</th>
            <th colspan="2" class="th-c">Jumlah Unit</th>
            <th colspan="4" class="th-c">Persentase Terhadap Total Aset</th>
        </tr>
        <tr>
            <td class="td-c bold">1</td>
            <td colspan="5" class="td-l bold">Layak Pakai / Kondisi Baik</td>
            <td colspan="2" class="td-c badge-ok num-int">{{ $asset_conditions['baik']['count'] }}</td>
            <td colspan="4" class="td-c bold">{{ $asset_conditions['baik']['percentage'] }}%</td>
        </tr>
        <tr>
            <td class="td-alt-c bold">2</td>
            <td colspan="5" class="td-alt-l bold">Kondisi Rusak</td>
            <td colspan="2" class="td-alt-c badge-err num-int">{{ $asset_conditions['rusak']['count'] }}</td>
            <td colspan="4" class="td-alt-c bold">{{ $asset_conditions['rusak']['percentage'] }}%</td>
        </tr>
        <tr>
            <td class="td-c bold">3</td>
            <td colspan="5" class="td-l bold">Status Pemeliharaan (Maintenance)</td>
            <td colspan="2" class="td-c badge-warn num-int">{{ $asset_conditions['maintenance']['count'] }}</td>
            <td colspan="4" class="td-c bold">{{ $asset_conditions['maintenance']['percentage'] }}%</td>
        </tr>

        <tr class="spacer-row"><td colspan="12"></td></tr>

        <!-- ========================================== -->
        <!-- SECTION 3: STATISTIK PER KATEGORI BARANG   -->
        <!-- ========================================== -->
        <tr>
            <td colspan="12" class="sec-hdr">SECTION 3 &mdash; STATISTIK PER KATEGORI BARANG</td>
        </tr>
        <tr>
            <th class="th-c">No</th>
            <th colspan="3" class="th-l">Nama Kategori</th>
            <th class="th-c">Model Barang</th>
            <th class="th-c">Total Unit</th>
            <th class="th-c">Tersedia</th>
            <th class="th-c">Dipinjam</th>
            <th class="th-c">Maintenance</th>
            <th colspan="3" class="th-c">Frekuensi &amp; Pangsa Pinjam</th>
        </tr>
        @forelse($category_stats as $idx => $cat)
        @php $isEven = $idx % 2 === 0; @endphp
        <tr>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} bold">{{ $idx + 1 }}</td>
            <td colspan="3" class="{{ $isEven ? 'td-l' : 'td-alt-l' }} bold">{{ $cat['nama_kategori'] }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} num-int">{{ $cat['total_barang'] }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} bold num-int">{{ $cat['total_unit'] }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} num-int">{{ $cat['unit_tersedia'] }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} num-int">{{ $cat['unit_dipinjam'] }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} num-int">{{ $cat['unit_maintenance'] }}</td>
            <td colspan="3" class="{{ $isEven ? 'td-c' : 'td-alt-c' }} bold">{{ $cat['frekuensi_pinjam'] }} kali ({{ $cat['persentase_utilisasi'] }}%)</td>
        </tr>
        @empty
        <tr>
            <td colspan="12" class="td-c">Belum ada data kategori barang</td>
        </tr>
        @endforelse

        <tr class="spacer-row"><td colspan="12"></td></tr>

        <!-- ========================================== -->
        <!-- SECTION 4: UTILISASI ASET (PALING SERING)   -->
        <!-- ========================================== -->
        <tr>
            <td colspan="12" class="sec-hdr">SECTION 4 &mdash; UTILISASI ASET (BARANG PALING SERING DIPINJAM)</td>
        </tr>
        <tr>
            <th class="th-c">No</th>
            <th colspan="3" class="th-l">Nama Barang</th>
            <th class="th-c">Kode Barang</th>
            <th colspan="2" class="th-l">Kategori</th>
            <th class="th-l">Lokasi Simpan</th>
            <th class="th-c">Total Unit</th>
            <th class="th-c">Dipinjam</th>
            <th colspan="2" class="th-c">Frekuensi Peminjaman</th>
        </tr>
        @forelse($asset_utilization as $idx => $asset)
        @php $isEven = $idx % 2 === 0; @endphp
        <tr>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} bold">{{ $idx + 1 }}</td>
            <td colspan="3" class="{{ $isEven ? 'td-l' : 'td-alt-l' }} bold">{{ $asset['nama_barang'] }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} text-str bold">{{ $asset['kode_barang'] }}</td>
            <td colspan="2" class="{{ $isEven ? 'td-l' : 'td-alt-l' }}">{{ $asset['kategori'] }}</td>
            <td class="{{ $isEven ? 'td-l' : 'td-alt-l' }}">{{ $asset['lokasi'] ?: '-' }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} num-int">{{ $asset['total_unit'] }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} num-int">{{ $asset['active_borrowed'] }}</td>
            <td colspan="2" class="{{ $isEven ? 'td-c' : 'td-alt-c' }} bold">{{ $asset['frekuensi_pinjam'] }} kali ({{ $asset['persentase_utilisasi'] }}%)</td>
        </tr>
        @empty
        <tr>
            <td colspan="12" class="td-c">Belum ada data utilisasi barang</td>
        </tr>
        @endforelse

        <tr class="spacer-row"><td colspan="12"></td></tr>

        <!-- ========================================== -->
        <!-- SECTION 5: REKAP LOGBOOK TRANSAKSI         -->
        <!-- ========================================== -->
        <tr>
            <td colspan="12" class="sec-hdr">SECTION 5 &mdash; REKAP LOGBOOK PEMINJAMAN &amp; PENGEMBALIAN LENGKAP</td>
        </tr>
        <tr>
            <th class="th-c">No</th>
            <th class="th-l">Peminjam / Teknisi</th>
            <th class="th-c">NIP / Identitas</th>
            <th class="th-l">Nama Barang</th>
            <th class="th-c">Kode Barang</th>
            <th class="th-c">Kode Unit</th>
            <th class="th-l">Kategori</th>
            <th class="th-c">Waktu Pinjam</th>
            <th class="th-c">Waktu Kembali</th>
            <th class="th-c">Durasi</th>
            <th class="th-c">Status Transaksi</th>
            <th class="th-c">Kondisi &amp; Ketepatan</th>
        </tr>
        @forelse($logbooks as $idx => $log)
        @php
            $isEven = $idx % 2 === 0;
            $statusClass = $log['status_transaksi'] === 'dikembalikan'
                ? 'badge-ok'
                : ($log['is_terlambat'] ? 'badge-err' : 'badge-warn');
        @endphp
        <tr>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} bold">{{ $idx + 1 }}</td>
            <td class="{{ $isEven ? 'td-l' : 'td-alt-l' }} bold">{{ $log['user_nama'] }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} text-str">{{ $log['user_nip'] ?: '-' }}</td>
            <td class="{{ $isEven ? 'td-l' : 'td-alt-l' }} bold">{{ $log['nama_barang'] }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} text-str bold">{{ $log['kode_barang'] }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} text-str bold">{{ $log['kode_unit'] }}</td>
            <td class="{{ $isEven ? 'td-l' : 'td-alt-l' }}">{{ $log['kategori'] }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} text-str">{{ $log['tanggal_pinjam_formatted'] }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} text-str">{{ $log['tanggal_kembali_formatted'] }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }}">{{ $log['durasi'] }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} {{ $statusClass }}">
                {{ ucfirst(str_replace('_', ' ', $log['status_transaksi'])) }}
            </td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }}">
                Kondisi: {{ ucfirst($log['kondisi_kembali']) }} | {{ $log['is_terlambat'] ? 'Terlambat' : 'Tepat Waktu' }}
            </td>
        </tr>
        @empty
        <tr>
            <td colspan="12" class="td-c">Tidak ada data transaksi pada periode ini</td>
        </tr>
        @endforelse

        <tr class="spacer-row"><td colspan="12"></td></tr>

        <!-- ========================================== -->
        <!-- SECTION 6: LAPORAN PEMELIHARAAN & RUSAK    -->
        <!-- ========================================== -->
        <tr>
            <td colspan="12" class="sec-hdr">SECTION 6 &mdash; LAPORAN PEMELIHARAAN &amp; UNIT KONDISI RUSAK</td>
        </tr>
        <tr>
            <th class="th-c">No</th>
            <th class="th-c">Kode Unit</th>
            <th colspan="2" class="th-l">Nama Barang</th>
            <th class="th-l">Kategori</th>
            <th class="th-c">Status Unit</th>
            <th class="th-c">Kondisi Fisik</th>
            <th class="th-c">Terakhir Update</th>
            <th colspan="2" class="th-l">Pelapor / Pengguna</th>
            <th colspan="2" class="th-l">Catatan Teknis</th>
        </tr>
        @forelse($maintenance_reports as $idx => $m)
        @php
            $isEven = $idx % 2 === 0;
            $kondisiClass = $m['kondisi'] === 'baik' ? 'badge-ok' : 'badge-err';
        @endphp
        <tr>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} bold">{{ $idx + 1 }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} text-str bold">{{ $m['kode_unit'] }}</td>
            <td colspan="2" class="{{ $isEven ? 'td-l' : 'td-alt-l' }} bold">{{ $m['nama_barang'] }}</td>
            <td class="{{ $isEven ? 'td-l' : 'td-alt-l' }}">{{ $m['kategori'] }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} badge-warn">{{ ucfirst($m['status']) }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} {{ $kondisiClass }}">{{ ucfirst($m['kondisi']) }}</td>
            <td class="{{ $isEven ? 'td-c' : 'td-alt-c' }} text-str">{{ $m['tanggal_update'] }}</td>
            <td colspan="2" class="{{ $isEven ? 'td-l' : 'td-alt-l' }}">{{ $m['pelapor_terakhir'] }}</td>
            <td colspan="2" class="{{ $isEven ? 'td-l' : 'td-alt-l' }}">{{ $m['catatan'] }}</td>
        </tr>
        @empty
        <tr>
            <td colspan="12" class="td-c badge-ok">Seluruh unit fisik dalam kondisi baik dan siap digunakan.</td>
        </tr>
        @endforelse
    </table>
</body>
</html>
