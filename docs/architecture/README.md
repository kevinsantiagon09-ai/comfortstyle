# ComfortStyle · Arquitectura de software

Estado observado: **5 de octubre de 2026**. Diagramas derivados del código y la configuración del repositorio.

[Ver diagrama visual en SVG](comfortstyle-arquitectura.svg). SVG vectorial, escalable y utilizable en presentaciones; abrir en el navegador para visualizarlo o imprimirlo como PDF.

El sistema combina una SPA React con un monolito Laravel organizado por capas. El frontend presenta alojamientos, reservas y recorridos virtuales; el backend controla autenticación, permisos, validación, reglas de negocio y persistencia. Los módulos pertenecen a una sola aplicación backend.

## Vista de contenedores

```mermaid
flowchart LR
    people["Visitante / Huésped / Anfitrión"]
    admin["Administrador del sistema"]
    subgraph system["ComfortStyle"]
        spa["SPA React 19 + TypeScript<br/>Vite · React Router<br/>Catálogo · paneles · recorridos 360°"]
        api["Backend Laravel 13 / PHP 8.3<br/>API REST y rutas de autenticación<br/>Sanctum · roles · Policies"]
        db[("Base de datos relacional<br/>PostgreSQL: configuración local<br/>SQLite: .env.example")]
        files["Almacenamiento local público<br/>Fotos · panoramas · vistas previas<br/>storage/app/public"]
    end
    people -->|Interacción| spa
    spa -->|"Axios · HTTP / JSON · cookies y XSRF"| api
    admin -->|"API protegida · SYSTEM_ADMIN"| api
    api -->|"Eloquent · SQL · transacciones"| db
    api -->|"Storage · carga y eliminación"| files
    spa -.->|"Lectura de archivos: /storage/*"| files
    classDef frontend fill:#eff6ff,stroke:#2563eb,color:#0f172a
    classDef backend fill:#f0fdfa,stroke:#0d9488,color:#0f172a
    classDef persistence fill:#fffbeb,stroke:#d97706,color:#0f172a
    classDef media fill:#f5f3ff,stroke:#7c3aed,color:#0f172a
    class spa frontend
    class api backend
    class db persistence
    class files media
```

## Vista de componentes y responsabilidades

```mermaid
flowchart TB
    subgraph browser["Frontend · frontend/src"]
        pages["pages + components + layouts<br/>Pantallas y presentación"]
        routing["routes<br/>ProtectedRoute / RoleRoute"]
        hooks["hooks por funcionalidad<br/>Coordinación de consultas y acciones"]
        query["React Query<br/>Caché de datos remotos y sesión"]
        store["Zustand + localStorage<br/>Borrador del asistente de alojamientos"]
        client["api/*.api.ts → api/http.ts<br/>Cliente Axios"]
        viewer["Photo Sphere Viewer + Three.js<br/>Recorridos 360°"]
        routing --> pages
        pages --> hooks
        pages --> viewer
        hooks --> query
        hooks --> store
        hooks --> client
    end
    subgraph backend["Backend · backend/app"]
        routes["routes/api.php + routes/web.php"]
        security["Middleware<br/>Sanctum / RequireRole / CSRF"]
        controllers["Controllers<br/>Coordinación HTTP y respuesta JSON"]
        requests["FormRequests<br/>Validación y autorización según operación"]
        policies["PropertyPolicy / ReservationPolicy<br/>Acceso a recursos"]
        services["Services<br/>Auth / Properties / Reservations<br/>Usuarios / Roles / Estados"]
        models["Models Eloquent<br/>Relaciones y consultas"]
        storage["Storage · disco public"]
        routes --> security --> controllers
        controllers --> requests
        controllers --> policies
        controllers --> services
        services --> models
        services --> storage
        controllers -->|"Catálogos y consultas directas según controlador"| models
    end
    client -->|"HTTP · /api y rutas de sesión"| routes
    models --> db[(Base de datos)]
    storage --> files[Archivos públicos]
    viewer -.->|"Descarga de panoramas"| files
```

Las flechas de componentes representan dependencias y responsabilidades; el orden exacto de validación y autorización depende de la ruta y del FormRequest. Las consultas de catálogos y algunas lecturas usan modelos directamente: la capa de servicios no es obligatoria en todos los controladores.

## Flujo de creación de una reserva

```mermaid
sequenceDiagram
    actor Guest as Huésped
    participant UI as React / formulario
    participant API as Axios
    participant HTTP as Laravel / middleware y Request
    participant C as ReservationController
    participant S as ReservationService
    participant DB as Base de datos
    Guest->>UI: Seleccionar alojamiento, fechas y huéspedes
    UI->>API: Crear reserva
    API->>HTTP: POST /api/reservations + cookies / XSRF
    HTTP->>HTTP: Autenticar, exigir HUESPED y validar entrada
    HTTP->>C: Datos validados
    C->>S: create(guest, data)
    S->>DB: Iniciar transacción y bloquear alojamiento
    DB-->>S: Alojamiento
    S->>S: Comprobar activo, propietario y capacidad
    S->>DB: Consultar reservas que se solapan
    alt Datos válidos y fechas disponibles
        S->>S: Calcular noches e importe con precio del servidor
        S->>DB: Guardar reserva CONFIRMADA y confirmar transacción
        S-->>C: Reserva y relaciones
        C-->>API: Respuesta JSON
        API-->>UI: Resultado
        UI-->>Guest: Mostrar reserva
    else Regla de negocio incumplida
        S-->>HTTP: ValidationException / revertir transacción
        HTTP-->>API: Error de validación 422
        API-->>UI: Errores de campos
        UI-->>Guest: Mostrar motivo
    end
```

`lockForUpdate()` expresa la estrategia de concurrencia implementada; su comportamiento depende del motor de base de datos. El diagrama describe el código, sin afirmar una prueba de concurrencia en producción.

## Modelo de dominio resumido

```mermaid
erDiagram
    USERS ||--o{ PROPERTIES : "publica"
    USERS ||--o{ RESERVATIONS : "reserva"
    USERS ||--o{ USER_ROLES : "tiene"
    ROLES ||--o{ USER_ROLES : "asigna"
    ESTADOS ||--o{ USERS : "estado"
    DEPARTMENTS ||--o{ CITIES : "contiene"
    CITIES ||--o{ PROPERTIES : "ubica"
    PROPERTIES ||--o{ PROPERTY_IMAGES : "fotos"
    PROPERTIES ||--o{ PROPERTY_PANORAMAS : "recorrido"
    PROPERTIES ||--o{ RESERVATIONS : "recibe"
    PROPERTIES ||--o{ AMENITY_PROPERTY : "incluye"
    AMENITIES ||--o{ AMENITY_PROPERTY : "asocia"
```

Vista de relaciones de negocio, no inventario completo de tablas técnicas ni especificación de nulabilidad de claves foráneas.

## Alcance y fuentes

- **Frontend:** `frontend/package.json`, `frontend/src/routes/router.tsx`, `frontend/src/api/http.ts`, `frontend/src/hooks/auth/useAuth.ts` y `frontend/src/store/propertySetupStore.ts`.
- **Backend:** `backend/composer.json`, `backend/bootstrap/app.php`, `backend/routes/api.php`, `backend/routes/web.php`, `backend/app/Services/`, `backend/app/Policies/` y `backend/app/Models/`.
- **Persistencia:** `backend/database/migrations/`, `backend/config/filesystems.php` y `backend/.env.example`. La configuración local selecciona PostgreSQL; no se reproducen credenciales.

No se encontró un panel React específico para SYSTEM_ADMIN; sus operaciones están disponibles en rutas de API protegidas. Los diagramas no atribuyen al sistema infraestructura desplegada, pasarela de pagos, CDN o servicios cloud. La configuración de S3 disponible en Laravel no acredita su uso: los servicios de imágenes y panoramas escriben explícitamente en el disco `public`.

El documento raíz `ARQUITECTURA.md` conserva propuestas de evolución. Esta carpeta registra la implementación observada y no sustituye ese documento.
