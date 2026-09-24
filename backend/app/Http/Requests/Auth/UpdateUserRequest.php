<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('name')) {
            $this->merge([
                'name' => trim(
                    $this->string('name')->toString()
                ),
            ]);
        }

        if ($this->filled('email')) {
            $this->merge([
                'email' => strtolower(
                    trim($this->string('email')->toString())
                ),
            ]);
        }
    }

    public function rules(): array
    {
        $routeUser = $this->route('user');

        $userId = $routeUser instanceof User
            ? $routeUser->getKey()
            : $routeUser;

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')
                    ->ignore($userId, 'id'),
            ],

            'password' => [
                'sometimes',
                'required',
                'string',
                'min:8',
                'confirmed',
            ],

            'first_name' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'last_name' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'phone_number' => [
                'sometimes',
                'nullable',
                'string',
                'max:20',
            ],

            'address' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'city' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],

            'status_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:estados,id',
            ],

            'role_ids' => [
                'sometimes',
                'array',
            ],

            'role_ids.*' => [
                'integer',
                'distinct',
                'exists:roles,id',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre no puede estar vacío.',
            'name.string' => 'El nombre debe ser una cadena de texto.',
            'name.max' => 'El nombre no puede superar los 255 caracteres.',

            'email.required' => 'El correo no puede estar vacío.',
            'email.string' => 'El correo debe ser una cadena de texto.',
            'email.email' => 'Debes proporcionar un correo electrónico válido.',
            'email.max' => 'El correo no puede superar los 255 caracteres.',
            'email.unique' => 'El correo electrónico ya pertenece a otro usuario.',

            'password.required' => 'La contraseña no puede estar vacía.',
            'password.string' => 'La contraseña debe ser una cadena de texto.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',

            'first_name.string' => 'El nombre debe ser una cadena de texto.',
            'first_name.max' => 'El nombre no puede superar los 255 caracteres.',

            'last_name.string' => 'El apellido debe ser una cadena de texto.',
            'last_name.max' => 'El apellido no puede superar los 255 caracteres.',

            'phone_number.string' => 'El teléfono debe ser una cadena de texto.',
            'phone_number.max' => 'El teléfono no puede superar los 20 caracteres.',

            'address.string' => 'La dirección debe ser una cadena de texto.',
            'address.max' => 'La dirección no puede superar los 255 caracteres.',

            'city.string' => 'La ciudad debe ser una cadena de texto.',
            'city.max' => 'La ciudad no puede superar los 100 caracteres.',

            'status_id.integer' => 'El estado debe ser un número entero.',
            'status_id.exists' => 'El estado seleccionado no existe.',

            'role_ids.array' => 'Los roles deben enviarse como una lista.',
            'role_ids.*.integer' => 'Cada rol debe ser un número entero.',
            'role_ids.*.distinct' => 'No puedes repetir el mismo rol.',
            'role_ids.*.exists' => 'Uno de los roles seleccionados no existe.',
        ];
    }
}
