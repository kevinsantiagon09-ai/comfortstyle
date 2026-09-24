<?php

namespace App\Http\Requests\Users;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreUserRolesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'role_id' => ['required', 'integer', 'exists:roles,id'],    
        ];
    }


    public function messages(): array
    {
        return [
            'user_id.required' => 'El campo user_id es obligatorio.',
            'user_id.integer' => 'El campo user_id debe ser un número entero.',
            'user_id.exists' => 'El user_id proporcionado no existe en la tabla de usuarios.',
            'role_id.required' => 'El campo role_id es obligatorio.',
            'role_id.integer' => 'El campo role_id debe ser un número entero.',
            'role_id.exists' => 'El role_id proporcionado no existe en la tabla de roles.',
        ];  
}

}
