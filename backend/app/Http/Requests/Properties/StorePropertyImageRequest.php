<?php

namespace App\Http\Requests\Properties;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_cover' => $this->boolean('is_cover'),
            'is_active' => $this->has('is_active')
                ? $this->boolean('is_active')
                : true,
        ]);
    }

    public function rules(): array
    {
        return [
            'property_id' => [
                'required',
                'integer',
                'exists:properties,id',
            ],

            'image' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'caption' => [
                'nullable',
                'string',
                'max:255',
            ],

            'is_cover' => [
                'boolean',
            ],

            'display_order' => [
                'integer',
                'min:0',
            ],

            'is_active' => [
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.required' =>'La propiedad es obligatoria.',
            'property_id.integer' =>'El identificador de la propiedad debe ser un número entero.',
            'property_id.exists' =>'La propiedad seleccionada no existe.',
            'image.required' => 'La imagen es obligatoria.',
            'image.image' =>'El archivo seleccionado debe ser una imagen.',
            'image.mimes' =>'La imagen debe ser de tipo JPG, JPEG, PNG o WEBP.',
            'caption.string' =>'La descripción debe ser un texto.',
            'caption.max' =>'La descripción no puede superar los 255 caracteres.',
            'is_cover.boolean' =>'El campo de portada debe ser verdadero o falso.',
            'display_order.integer' =>'El orden debe ser un número entero.',
            'display_order.min' =>'El orden no puede ser negativo.',
            'is_active.boolean' =>'El estado debe ser verdadero o falso.',
        ];
    }
}