<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class PeminjamanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'barang_id' => ['required', 'exists:barang,id'],
            'barang_unit_id' => ['nullable', 'exists:barang_unit,id'],
            'barang_unit_ids' => ['nullable', 'array'],
            'barang_unit_ids.*' => ['exists:barang_unit,id'],
            'keperluan' => ['nullable', 'string', 'max:500'],
            'batas_kembali' => ['nullable', 'date'],
        ];
    }
}
