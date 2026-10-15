<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode OTP Verifikasi - WAMS Workshop</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #F4F4F5;
            margin: 0;
            padding: 24px;
            color: #1D1616;
        }
        .container {
            max-width: 520px;
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
            margin-bottom: 14px;
            color: #1D1616;
        }
        .message {
            font-size: 14px;
            line-height: 1.6;
            color: #52525B;
            margin-bottom: 24px;
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
            font-size: 38px;
            font-weight: 800;
            letter-spacing: 12px;
            color: #8E1616;
            margin: 0;
        }
        .otp-validity {
            font-size: 12px;
            color: #71717A;
            margin-top: 10px;
        }
        .warning-box {
            background-color: #FFFBEB;
            border-left: 4px solid #F59E0B;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 12px;
            color: #92400E;
            line-height: 1.5;
            margin-top: 20px;
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
            <div class="greeting">Halo, <strong>{{ $userNama }}</strong>!</div>
            
            @if ($tipe === 'reset_password')
                <div class="message">
                    Kami menerima permintaan untuk mereset kata sandi akun WAMS Anda. Gunakan kode verifikasi (OTP) 6-digit di bawah ini untuk melanjutkan pembuatan kata sandi baru:
                </div>
            @elseif ($tipe === 'change_email')
                <div class="message">
                    Anda sedang melakukan perubahan alamat email akun WAMS ke alamat email ini. Gunakan kode verifikasi (OTP) 6-digit berikut untuk mengonfirmasi email baru Anda:
                </div>
            @else
                <div class="message">
                    Berikut adalah kode verifikasi OTP akun WAMS Anda:
                </div>
            @endif

            <div class="otp-box">
                <div class="otp-title">Kode Verifikasi OTP</div>
                <div class="otp-code">{{ $otpCode }}</div>
                <div class="otp-validity">Kode ini berlaku selama <strong>10 Menit</strong>.</div>
            </div>

            <div class="warning-box">
                <strong>Penting:</strong> Jangan berikan kode ini kepada siapa pun, termasuk pihak yang mengatasnamakan administrator WAMS. Jika Anda tidak merasa melakukan permintaan ini, segera amankan akun Anda atau abaikan pesan ini.
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Workshop Asset Management System (WAMS).<br>
            Sistem Inventaris & Peminjaman Peralatan Laboratorium & Workshop.
        </div>
    </div>
</body>
</html>
