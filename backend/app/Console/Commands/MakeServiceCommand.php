<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\GeneratorCommand;

#[Signature('make:service {name}')]
#[Description('Create a new service class')]
class MakeServiceCommand extends GeneratorCommand
{
    /**
     * Tipo de clase que se está generando.
     */
    protected $type = 'Service';

    /**
     * Stub que utilizará Laravel.
     */
    protected function getStub()
    {
        return base_path('stubs/service.stub');
    }

    /**
     * Namespace por defecto.
     */
    protected function getDefaultNamespace($rootNamespace)
    {
        return $rootNamespace . '\\Services';
    }
}