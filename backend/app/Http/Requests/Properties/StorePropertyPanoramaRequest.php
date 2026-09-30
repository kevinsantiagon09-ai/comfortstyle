<?php

namespace App\Http\Requests\Properties;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePropertyPanoramaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Una foto 360° es equirectangular: el doble de ancha que de alta.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'property_id' => [
                'required',
                'integer',
                'exists:properties,id',
            ],

            'title' => [
                'required',
                'string',
                'max:100',
            ],

            'image' => [
                'required',
                'image',
                'mimes:jpg,jpeg,webp',
                'max:20480',
                'dimensions:ratio=2/1,min_width=2000',
            ],

            'preview' => [
                'required',
                'image',
                'mimes:jpg,jpeg',
                'max:1024',
                'dimensions:ratio=2/1,max_width=2048',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.required' => 'La propiedad es obligatoria.',
            'property_id.exists' => 'La propiedad seleccionada no existe.',
            'title.required' => 'Escribe el nombre del espacio, por ejemplo «Sala».',
            'title.max' => 'El nombre del espacio no puede superar los 100 caracteres.',
            'image.required' => 'Selecciona una foto 360°.',
            'image.image' => 'El archivo seleccionado debe ser una imagen.',
            'image.mimes' => 'La foto 360° debe ser JPG o WEBP.',
            'image.max' => 'La foto 360° no puede superar los 20 MB.',
            'image.dimensions' => 'No parece una foto 360°: debe ser el doble de ancha que de alta (2:1) y tener al menos 2000 px de ancho.',
            'preview.required' => 'No se pudo generar la vista previa de la foto. Inténtalo de nuevo.',
            'preview.*' => 'La vista previa de la foto no es válida. Inténtalo de nuevo.',
        ];
    }
}
