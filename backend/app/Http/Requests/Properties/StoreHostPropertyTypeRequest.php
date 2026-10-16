<?php

namespace App\Http\Requests\Properties;

use App\Models\PropertyType;
use Closure;
use Illuminate\Foundation\Http\FormRequest;

class StoreHostPropertyTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'bail',
                'required',
                'string',
                'max:50',
                $this->uniqueForHost(...),
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
        ];
    }

    /**
     * El anfitrión no puede repetir un tipo global ni uno suyo, sin distinguir mayúsculas:
     * "casa" chocaría con "Casa" en su propio selector.
     */
    protected function uniqueForHost(string $attribute, mixed $value, Closure $fail): void
    {
        $taken = PropertyType::withTrashed()
            ->visibleTo($this->user()->id)
            ->named((string) $value)
            ->when($this->route('propertyType'), fn ($query, PropertyType $current) => $query->whereKeyNot($current->id))
            ->exists();

        if ($taken) {
            $fail('Ya existe un tipo de propiedad con ese nombre.');
        }
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio.',
            'name.string' => 'El nombre debe ser texto.',
            'name.max' => 'El nombre no puede superar 50 caracteres.',
            'description.string' => 'La descripción debe ser texto.',
            'description.max' => 'La descripción no puede superar 255 caracteres.',
            'icon.string' => 'El icono debe ser texto.',
            'icon.max' => 'El icono no puede superar 255 caracteres.',
        ];
    }
}
