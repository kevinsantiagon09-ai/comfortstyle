<?php

namespace App\Http\Requests\Properties;

use App\Models\Property;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePropertyRequest extends FormRequest
{
    public const MAX_IMAGES = 10;

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
            'user_id' => ['prohibited'],

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

            'department' => ['prohibited'],

            'city' => ['prohibited'],
            'city_id' => ['required', 'integer', 'exists:cities,id'],

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
                'required',
                'numeric',
                'decimal:0,2',
                'min:0',
                'max:'.Property::MAX_PRICE,
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

            'images' => [
                'required',
                'array',
                'min:1',
                'max:'.self::MAX_IMAGES,
            ],

            'images.*' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
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
            'price.decimal' => 'El precio base admite como máximo dos decimales.',
            'price.max' => 'El precio base no puede superar 9.999.999.999,99.',

            'currency.size' => 'La moneda debe tener exactamente tres caracteres.',
            'currency.in' => 'La moneda debe ser COP, USD o EUR.',

            'check_in_time.date_format' => 'La hora de entrada debe tener el formato HH:MM.',
            'check_out_time.date_format' => 'La hora de salida debe tener el formato HH:MM.',

            'is_active.boolean' => 'El estado debe ser verdadero o falso.',

            'images.required' => 'Agrega al menos una fotografía del alojamiento.',
            'images.array' => 'Las fotografías enviadas no son válidas.',
            'images.min' => 'Agrega al menos una fotografía del alojamiento.',
            'images.max' => 'Puedes agregar como máximo '.self::MAX_IMAGES.' fotografías.',
            'images.*.image' => 'Cada archivo debe ser una imagen.',
            'images.*.mimes' => 'Las fotografías deben ser JPG, PNG o WEBP.',
            'images.*.max' => 'Cada fotografía puede pesar como máximo 5 MB.',
            'images.*.uploaded' => 'Una fotografía no se pudo subir. Verifica que pese menos de 5 MB.',
        ];
    }
}
