<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class LoginRequest extends FormRequest
{
    private ?User $authenticatedUser = null;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('email')) {
            $this->merge(['email' => trim($this->string('email')->toString())]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => [
                'bail',
                'required',
                'email',
                'max:255',
                Rule::exists('users', 'email')->whereNull('deleted_at'),
            ],
            'password' => [
                'required',
                'string',
            ],
        ];
    }

    /**
     * Verifica la contraseña y luego el estado de la cuenta, solo si los campos son válidos.
     * El estado se revela únicamente a quien conoce la contraseña.
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $user = User::with('status')->where('email', $this->input('email'))->first();

                if (! Hash::check($this->input('password'), $user->password)) {
                    $validator->errors()->add('password', 'La contraseña es incorrecta.');

                    return;
                }

                if (! $user->isActive()) {
                    $validator->errors()->add('email', 'Tu cuenta está inactiva. Comunícate con el administrador.');

                    return;
                }

                $this->authenticatedUser = $user;
            },
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico no es válido.',
            'email.max' => 'El correo electrónico no puede superar los 255 caracteres.',
            'email.exists' => 'No existe una cuenta con este correo.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.string' => 'La contraseña no es válida.',
        ];
    }

    /** Usuario con credenciales verificadas y cuenta activa. */
    public function authenticatedUser(): User
    {
        return $this->authenticatedUser;
    }
}
