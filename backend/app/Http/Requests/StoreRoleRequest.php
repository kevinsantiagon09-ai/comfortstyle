<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('name')) {
            $this->merge([
                'name' => strtoupper(trim($this->string('name')->toString())),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:50',
                'unique:roles,name',
            ],
            'description' => [
                'nullable',
                'string',
                'max:255',
            ],
            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del rol es obligatorio.',
            'name.max' => 'El nombre del rol no puede superar 50 caracteres.',
            'name.unique' => 'Ya existe un rol con este nombre.',
            'description.max' => 'La descripción no puede superar 255 caracteres.',
            'is_active.boolean' => 'El estado del rol debe ser verdadero o falso.',
        ];
    }
}