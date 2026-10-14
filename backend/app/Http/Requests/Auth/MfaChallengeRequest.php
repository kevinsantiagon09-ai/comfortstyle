<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class MfaChallengeRequest extends FormRequest
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
            'challenge_id' => ['required', 'uuid'],
        ];
    }

    public function messages(): array
    {
        return [
            'challenge_id.required' => 'Debes iniciar la verificación de tu cuenta.',
            'challenge_id.uuid' => 'La verificación de tu cuenta no es válida.',
        ];
    }
}
