<?php

namespace App\Http\Requests\Properties;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePropertyTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('property_types', 'name')
                    ->ignore($this->route('property_type'))
                    ->where('user_id', $this->route('property_type')->user_id),
            ],
            'description' => [
                'nullable',
                'string',
                'max:255',
            ],
            'icon' => [
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
            'name.required' => 'El nombre no puede estar vacío.',
            'name.string' => 'El nombre debe ser texto.',
            'name.max' => 'El nombre no puede superar 50 caracteres.',
            'name.unique' => 'Ya existe un tipo de propiedad con ese nombre.',
            'description.string' => 'La descripción debe ser texto.',
            'description.max' => 'La descripción no puede superar 255 caracteres.',
            'icon.string' => 'El icono debe ser texto.',
            'icon.max' => 'El icono no puede superar 255 caracteres.',
            'is_active.boolean' => 'El estado debe ser verdadero o falso.',
        ];
    }
}
