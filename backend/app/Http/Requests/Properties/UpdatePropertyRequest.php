<?php

namespace App\Http\Requests\Properties;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePropertyRequest extends FormRequest
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
            'user_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:users,id',
            ],

            'name' => [
                'sometimes',
                'required',
                'string',
                'max:150',
            ],

            'description' => [
                'sometimes',
                'required',
                'string',
                'max:3000',
            ],

            'property_type' => [
                'sometimes',
                'required',
                'string',
                'max:50',
            ],

            'address' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'department' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],

            'city' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],

            'max_guests' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
                'max:100',
            ],

            'bathrooms' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
                'max:50',
            ],

            'bedrooms' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
                'max:100',
            ],

            'beds' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
                'max:200',
            ],

            'price' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
            ],

            'currency' => [
                'sometimes',
                'required',
                'string',
                'size:3',
                Rule::in(['COP', 'USD', 'EUR']),
            ],

            'check_in_time' => [
                'sometimes',
                'nullable',
                'date_format:H:i',
            ],

            'check_out_time' => [
                'sometimes',
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
            'user_id.integer' => 'El identificador del anfitrión debe ser un número entero.',
            'user_id.exists' => 'El anfitrión seleccionado no existe.',

            'name.required' => 'El nombre del alojamiento es obligatorio.',
            'name.string' => 'El nombre debe ser una cadena de texto.',
            'name.max' => 'El nombre no puede superar los 150 caracteres.',

            'description.required' => 'La descripción es obligatoria.',
            'description.string' => 'La descripción debe ser una cadena de texto.',
            'description.max' => 'La descripción no puede superar los 3000 caracteres.',

            'property_type.required' => 'El tipo de propiedad es obligatorio.',
            'property_type.string' => 'El tipo de propiedad debe ser texto.',
            'property_type.max' => 'El tipo de propiedad no puede superar los 50 caracteres.',

            'address.required' => 'La dirección es obligatoria.',
            'address.max' => 'La dirección no puede superar los 255 caracteres.',

            'department.required' => 'El departamento es obligatorio.',
            'department.max' => 'El departamento no puede superar los 100 caracteres.',

            'city.required' => 'La ciudad es obligatoria.',
            'city.max' => 'La ciudad no puede superar los 100 caracteres.',

            'max_guests.required' => 'La capacidad máxima es obligatoria.',
            'max_guests.integer' => 'La capacidad máxima debe ser un número entero.',
            'max_guests.min' => 'La propiedad debe aceptar al menos un huésped.',

            'bathrooms.integer' => 'La cantidad de baños debe ser un número entero.',
            'bathrooms.min' => 'Debe existir al menos un baño.',

            'bedrooms.integer' => 'La cantidad de habitaciones debe ser un número entero.',
            'bedrooms.min' => 'Debe existir al menos una habitación.',

            'beds.integer' => 'La cantidad de camas debe ser un número entero.',
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