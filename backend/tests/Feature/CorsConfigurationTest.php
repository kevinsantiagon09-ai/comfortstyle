<?php

namespace Tests\Feature;

use Tests\TestCase;

class CorsConfigurationTest extends TestCase
{
    private function preflight(string $origin)
    {
        return $this->call('OPTIONS', '/api/public/properties', server: [
            'HTTP_ORIGIN' => $origin,
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
        ]);
    }

    public function test_frontend_origin_is_allowed_with_credentials(): void
    {
        $this->preflight('http://localhost:5173')
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
            ->assertHeader('Access-Control-Allow-Credentials', 'true');
    }

    public function test_unknown_origin_is_not_allowed(): void
    {
        $this->preflight('https://sitio-desconocido.example')
            ->assertHeaderMissing('Access-Control-Allow-Origin');
    }
}
