<?php

namespace App\Mail;

use App\Models\BarangUnit;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GuestOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $guestNama,
        public string $otpCode,
        public BarangUnit $unit,
        public int $durasiMenit,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Kode Verifikasi OTP Peminjaman Barang - WAMS Workshop',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.guest_otp',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
