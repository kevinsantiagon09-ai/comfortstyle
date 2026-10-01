<?php

namespace App\Http\Requests\Reservations;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreReservationRequest extends FormRequest
{
    /**
     * El rol HUESPED lo exige el middleware de la ruta.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * El total no se recibe: lo calcula el servidor. El huésped se toma de la sesión.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'property_id' => ['required', 'integer', 'exists:properties,id'],
            'check_in' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'check_out' => ['required', 'date_format:Y-m-d', 'after:check_in'],
            'guests' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.required' => 'El alojamiento es obligatorio.',
            'property_id.exists' => 'El alojamiento no existe.',
            'check_in.required' => 'Selecciona la fecha de llegada.',
            'check_in.date_format' => 'La fecha de llegada no es válida.',
            'check_in.after_or_equal' => 'La llegada no puede ser una fecha pasada.',
            'check_out.required' => 'Selecciona la fecha de salida.',
            'check_out.date_format' => 'La fecha de salida no es válida.',
            'check_out.after' => 'La salida debe ser posterior a la llegada.',
            'guests.required' => 'Indica el número de huéspedes.',
            'guests.min' => 'Debe haber al menos un huésped.',
        ];
    }
}
