<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class PengembalianRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'logbook_id' => ['required', 'exists:logbook,id'],
            'kondisi_kembali' => ['required', 'in:baik,rusak'],
        ];
    }
}
