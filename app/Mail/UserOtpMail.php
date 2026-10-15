<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userNama,
        public string $otpCode,
        public string $tipe, // 'reset_password' | 'change_email'
        public ?string $extraInfo = null,
    ) {}

    public function envelope(): Envelope
    {
        $subject = match ($this->tipe) {
            'reset_password' => 'Kode OTP Reset Kata Sandi - WAMS Workshop',
            'change_email' => 'Kode OTP Verifikasi Perubahan Email - WAMS Workshop',
            default => 'Kode Verifikasi OTP Akun - WAMS Workshop',
        };

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.user_otp',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
