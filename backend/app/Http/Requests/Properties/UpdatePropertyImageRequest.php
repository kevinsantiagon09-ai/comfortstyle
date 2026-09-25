<?php

namespace App\Http\Requests\Properties;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $data = [];

        if ($this->has('is_cover')) {
            $data['is_cover'] = $this->boolean('is_cover');
        }

        if ($this->has('is_active')) {
            $data['is_active'] = $this->boolean('is_active');
        }

        $this->merge($data);
    }

    public function rules(): array
    {
        return [
            'property_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:properties,id',
            ],

            'image' => [
                'sometimes',
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'caption' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'is_cover' => [
                'sometimes',
                'boolean',
            ],

            'display_order' => [
                'sometimes',
                'required',
                'integer',
                'min:0',
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
            'property_id.required' =>'La propiedad es obligatoria.',
            'property_id.integer' =>'El identificador de la propiedad debe ser un número entero.',
            'property_id.exists' =>'La propiedad seleccionada no existe.',
            'image.required' =>'Debe seleccionar una imagen.',
            'image.image' =>'El archivo seleccionado debe ser una imagen.',
            'image.mimes' =>'La imagen debe ser de tipo JPG, JPEG, PNG o WEBP.',
            'image.max' =>'La imagen no puede superar los 5 MB.',
            'caption.string' =>'La descripción debe ser un texto.',
            'caption.max' =>'La descripción no puede superar los 255 caracteres.',
            'is_cover.boolean' =>'El campo de portada debe ser verdadero o falso.',
            'display_order.required' =>'El orden es obligatorio cuando se envía.',
            'display_order.integer' =>'El orden debe ser un número entero.',
            'display_order.min' =>'El orden no puede ser negativo.',
            'is_active.boolean' =>'El estado debe ser verdadero o falso.',
        ];
    }
}