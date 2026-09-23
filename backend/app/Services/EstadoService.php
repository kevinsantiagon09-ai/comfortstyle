<?php

namespace App\Services;

use App\Models\Estado;
use Illuminate\Database\Eloquent\Collection;

class EstadoService
{
    public function getAll(): Collection
    {
        return Estado::query()
            ->orderBy('modulo')
            ->orderBy('nombre')
            ->get();
    }

    public function getActive(): Collection
    {
        return Estado::query()
            ->where('is_active', true)
            ->orderBy('modulo')
            ->orderBy('nombre')
            ->get();
    }

    public function create(array $data): Estado
    {
        return Estado::create($data);
    }

    public function update(Estado $estado, array $data): Estado
    {
        $estado->update($data);

        return $estado->fresh();
    }
}
