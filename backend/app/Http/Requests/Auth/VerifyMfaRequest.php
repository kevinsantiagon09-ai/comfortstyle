<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;

class VerifyMfaRequest extends MfaChallengeRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'code' => ['required', 'string', 'regex:/\A[0-9]{6}\z/'],
        ]);
    }

    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'code.required' => 'El código de verificación es obligatorio.',
            'code.string' => 'El código debe tener 6 dígitos.',
            'code.regex' => 'El código debe tener 6 dígitos.',
        ]);
    }
}
