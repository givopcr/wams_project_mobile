<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode Verifikasi Peminjaman Barang - WAMS</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #F4F4F5;
            margin: 0;
            padding: 24px;
            color: #1D1616;
        }
        .container {
            max-width: 540px;
            margin: 0 auto;
            background: #FFFFFF;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #E4E4E7;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: #1D1616;
            padding: 28px 32px;
            text-align: center;
        }
        .header h1 {
            color: #FFFFFF;
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .header span {
            color: #D84040;
        }
        .content {
            padding: 32px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 16px;
            color: #1D1616;
        }
        .message {
            font-size: 14px;
            line-height: 1.6;
            color: #52525B;
            margin-bottom: 24px;
        }
        .item-box {
            background-color: #FAFAFA;
            border: 1px solid #E4E4E7;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
        }
        .item-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            margin-bottom: 8px;
        }
        .item-row:last-child {
            margin-bottom: 0;
        }
        .item-label {
            color: #71717A;
        }
        .item-value {
            font-weight: 600;
            color: #1D1616;
        }
        .otp-box {
            text-align: center;
            background: #FEF2F2;
            border: 2px dashed #D84040;
            border-radius: 14px;
            padding: 24px;
            margin: 24px 0;
        }
        .otp-title {
            font-size: 12px;
            font-weight: 700;
            color: #D84040;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        .otp-code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 10px;
            color: #8E1616;
            margin: 0;
        }
        .otp-validity {
            font-size: 12px;
            color: #71717A;
            margin-top: 8px;
        }
        .footer {
            background-color: #F8FAFC;
            padding: 20px 32px;
            border-top: 1px solid #E4E4E7;
            font-size: 12px;
            color: #A1A1AA;
            text-align: center;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>WAMS <span>WORKSHOP</span></h1>
        </div>
        <div class="content">
            <div class="greeting">Halo, <strong>{{ $guestNama }}</strong>!</div>
            <div class="message">
                Anda sedang mengajukan peminjaman alat dengan durasi lebih dari batas standar tamu. Untuk melanjutkan proses peminjaman, gunakan kode verifikasi (OTP) berikut:
            </div>

            <div class="item-box">
                <div class="item-row">
                    <span class="item-label">Barang:</span>
                    <span class="item-value">{{ $unit->barang?->nama_barang ?? 'Alat Workshop' }}</span>
                </div>
                <div class="item-row">
                    <span class="item-label">Kode Unit:</span>
                    <span class="item-value">{{ $unit->kode_unit }}</span>
                </div>
                <div class="item-row">
                    <span class="item-label">Durasi Pinjam:</span>
                    <span class="item-value">
                        @if ($durasiMenit >= 1440)
                            {{ round($durasiMenit / 1440, 1) }} Hari ({{ $durasiMenit }} Menit)
                        @elseif ($durasiMenit >= 60)
                            {{ round($durasiMenit / 60, 1) }} Jam ({{ $durasiMenit }} Menit)
                        @else
                            {{ $durasiMenit }} Menit
                        @endif
                    </span>
                </div>
            </div>

            <div class="otp-box">
                <div class="otp-title">Kode Verifikasi OTP</div>
                <div class="otp-code">{{ $otpCode }}</div>
                <div class="otp-validity">Kode ini berlaku selama <strong>10 Menit</strong>. Jangan berikan kode ini kepada siapa pun.</div>
            </div>

            <div class="message" style="font-size: 12px; margin-bottom: 0;">
                Jika Anda tidak merasa mengajukan peminjaman ini, abaikan email ini. Pastikan barang dirawat dengan baik dan dikembalikan tepat waktu setelah digunakan.
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Workshop Asset Management System (WAMS).<br>
            Sistem Inventaris & Peminjaman Peralatan Laboratorium & Workshop.
        </div>
    </div>
</body>
</html>
