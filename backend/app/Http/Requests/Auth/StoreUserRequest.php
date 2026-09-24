<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

   
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'phone_number' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'status_id' => ['required', 'integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El campo name es obligatorio.',
            'name.max' => 'El campo name no debe exceder los 255 caracteres.',
            'email.required' => 'El campo email es obligatorio.',
            'email.email' => 'El campo email debe ser una dirección de correo electrónico válida.',
            'email.max' => 'El campo email no debe exceder los 255 caracteres.',
            'email.unique' => 'El correo electrónico ya está en uso.',
            'password.required' => 'El campo password es obligatorio.',
            'password.string' => 'El campo password debe ser una cadena de texto.',
            'password.min' => 'El campo password debe tener al menos 8 caracteres.',
            // Mensajes para los campos opcionales
            'first_name.max' => 'El campo first_name no debe exceder los 255 caracteres.',
            'last_name.string' => 'El campo last_name debe ser una cadena de texto.',
            'last_name.max' => 'El campo last_name no debe exceder los 255 caracteres.',
            'phone_number.string' => 'El campo phone_number debe ser una cadena de texto.',
            'phone_number.max' => 'El campo phone_number no debe exceder los 20 caracteres.',
            'address.string' => 'El campo address debe ser una cadena de texto.',
            'address.max' => 'El campo address no debe exceder los 255 caracteres.',
            'city.string' => 'El campo city debe ser una cadena de texto.',
            'city.max' => 'El campo city no debe exceder los 100 caracteres.',
        ];
    }   
}


