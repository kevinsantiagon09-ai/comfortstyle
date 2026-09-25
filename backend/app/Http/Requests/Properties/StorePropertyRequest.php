<?php

namespace App\Http\Requests\Properties;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('currency')) {
            $this->merge([
                'currency' => strtoupper(
                    trim($this->string('currency')->toString())
                ),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'user_id' =>[
                'required',
                'integer',
                'exists:users,id',
            ],

            'name' => [
                'required',
                'string',
                'max:150',
            ],

            'description' => [
                'required',
                'string',
                'max:3000',
            ],

            'property_type' => [
                'required',
                'string',
                'max:50',
            ],

            'address' => [
                'required',
                'string',
                'max:255',
            ],

            'department' => [
                'required',
                'string',
                'max:100',
            ],

            'city' => [
                'required',
                'string',
                'max:100',
            ],

            'max_guests' => [
                'required',
                'integer',
                'min:1',
                'max:100',
            ],

            'bathrooms' => [
                
                'integer',
                'min:1',
                'max:50',
            ],

            'bedrooms' => [
                
                'integer',
                'min:1',
                'max:100',
            ],

            'beds' => [
              
                'integer',
                'min:1',
                'max:200',
            ],

            'price' => [
               
                'numeric',
                'min:0',
            ],

            'currency' => [
                'sometimes',
                'string',
                'size:3',
                Rule::in(['COP', 'USD', 'EUR']),
            ],

            'check_in_time' => [
                'nullable',
                'date_format:H:i',
            ],

            'check_out_time' => [
                'nullable',
                'date_format:H:i',
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
            'user_id.required' => 'El anfitrión es obligatorio.',
            'user_id.exists' => 'El anfitrión seleccionado no existe.',

            'name.required' => 'El nombre del alojamiento es obligatorio.',
            'name.max' => 'El nombre no puede superar los 150 caracteres.',

            'description.required' => 'La descripción es obligatoria.',
            'description.max' => 'La descripción no puede superar los 3000 caracteres.',

            'property_type.required' => 'El tipo de propiedad es obligatorio.',

            'address.required' => 'La dirección es obligatoria.',
            'department.required' => 'El departamento es obligatorio.',
            'city.required' => 'La ciudad es obligatoria.',


            'max_guests.required' => 'La capacidad máxima de huéspedes es obligatoria.',
            'max_guests.min' => 'La propiedad debe aceptar al menos un huésped.',

            'bathrooms.min' => 'Debe existir al menos un baño.',
            'bedrooms.min' => 'Debe existir al menos una habitación.',
            'beds.min' => 'Debe existir al menos una cama.',

            'price.required' => 'El precio base es obligatorio.',
            'price.numeric' => 'El precio base debe ser numérico.',
            'price.min' => 'El precio base no puede ser negativo.',

            'currency.size' => 'La moneda debe tener exactamente tres caracteres.',
            'currency.in' => 'La moneda debe ser COP, USD o EUR.',

            'check_in_time.date_format' => 'La hora de entrada debe tener el formato HH:MM.',
            'check_out_time.date_format' => 'La hora de salida debe tener el formato HH:MM.',

            'is_active.boolean' => 'El estado debe ser verdadero o falso.',
        ];
    }
}
