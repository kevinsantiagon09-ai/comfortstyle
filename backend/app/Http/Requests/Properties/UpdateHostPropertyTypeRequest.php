<?php

namespace App\Http\Requests\Properties;

class UpdateHostPropertyTypeRequest extends StoreHostPropertyTypeRequest
{
    /** Solo el dueño edita su tipo; los globales y los de otros anfitriones responden 403. */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('propertyType'));
    }

    /** Mismas reglas que al crear, pero el nombre solo se valida si viene. */
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['name'] = ['sometimes', ...$rules['name']];

        return $rules;
    }
}
