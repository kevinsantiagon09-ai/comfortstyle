<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /** La API no tiene página en «/»; la ruta de salud confirma que la aplicación arranca. */
    public function test_the_application_returns_a_successful_response(): void
    {
        $this->get('/up')->assertOk();
    }
}
