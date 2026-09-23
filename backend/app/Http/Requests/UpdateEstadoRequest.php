<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEstadoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('codigo')) {
            $this->merge([
                'codigo' => strtoupper(trim($this->string('codigo')->toString())),
            ]);
        }

        if ($this->filled('modulo')) {
            $this->merge([
                'modulo' => strtoupper(trim($this->string('modulo')->toString())),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $estado = $this->route('estado');

        return [
            'codigo' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('estados', 'codigo')
                    ->where('modulo', $this->input('modulo', $estado->modulo))
                    ->ignore($estado->id),
            ],
            'nombre' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],
            'modulo' => [
                'sometimes',
                'required',
                'string',
                'max:50',
            ],
            'descripcion' => [
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

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'codigo.required' => 'El código del estado es obligatorio.',
            'codigo.max' => 'El código no puede superar 50 caracteres.',
            'codigo.unique' => 'Ya existe un estado con este código en el módulo indicado.',
            'nombre.required' => 'El nombre del estado es obligatorio.',
            'nombre.max' => 'El nombre no puede superar 100 caracteres.',
            'modulo.required' => 'El módulo del estado es obligatorio.',
            'modulo.max' => 'El módulo no puede superar 50 caracteres.',
            'descripcion.max' => 'La descripción no puede superar 255 caracteres.',
            'is_active.boolean' => 'El estado debe ser verdadero o falso.',
        ];
    }
}
