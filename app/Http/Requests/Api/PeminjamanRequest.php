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
        ];
    }
}
