# Arquitectura de referencia de ComfortStyle

Fecha: 28 de septiembre de 2026.

Estado: referencia en evolución. La sección 11 registra los cambios implementados; el resto conserva la propuesta inicial y sus pendientes. La revisión inicial cubrió el frontend y el flujo principal de propiedades del backend; no constituye una auditoría completa.

## 1. Objetivo y decisiones iniciales

Organizar el proyecto para incorporar alojamientos, comodidades, reservas y pagos con responsabilidades claras y cambios fáciles de probar.

- **Frontend:** arquitectura por funcionalidades, también llamada feature-based.
- **Backend:** arquitectura por capas con el patrón Service Layer, manteniendo una sola aplicación Laravel y agrupando servicios por funcionalidad.
- **Persistencia:** Eloquent como acceso a datos. No agregar Repository por defecto.
- **Evolución:** avanzar por funcionalidades, sin una reorganización total de una sola vez.

La arquitectura organiza el código. Para soportar más tráfico también habrá que medir consultas, índices, paginación, almacenamiento, caché e infraestructura.

## 2. Punto de partida observado

| Área | Ya existe | Propuesta pendiente |
| --- | --- | --- |
| Frontend | Carpetas generales `api`, `hooks`, `components`, `pages`, `types`, `auth`, `layouts` y `utils`. | Agrupar el código específico dentro de funcionalidades. |
| Consultas del frontend | Axios para HTTP y React Query para consultas, mutaciones y caché en memoria. | Conservar estas responsabilidades durante la reorganización. |
| Backend de propiedades | Controller, FormRequests, servicios y modelos. | Completar autorización y definir respuestas con Resources. |
| PropertyService | Búsqueda, paginación, consulta, creación y actualización; transacciones en creación y actualización. | Mantener su alcance centrado en alojamientos. |
| Paneles | Pantallas básicas de huésped y anfitrión. | Implementar sus operaciones conforme se definan los casos de uso. |

## 3. Frontend: organización por funcionalidades

Estructura propuesta, no implementada por este documento:

```text
frontend/src/
├── app/                       Arranque, proveedores y rutas
├── shared/
│   ├── api/                   Cliente HTTP compartido
│   ├── components/            Elementos visuales generales
│   └── utils/                 Utilidades generales
└── features/
    ├── auth/
    ├── properties/
    │   ├── api/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   └── types/
    └── reservations/          Al implementar reservas
```

Cada funcionalidad tendrá únicamente las carpetas que necesite. No crear estructuras vacías por anticipado.

### Responsabilidades

| Parte | Qué hace | Ejemplo |
| --- | --- | --- |
| `app` | Compone la aplicación y configura proveedores y rutas. | Router, QueryClientProvider y AuthProvider. |
| `pages` | Compone una pantalla. | Catálogo de alojamientos. |
| `components` | Muestra datos y recibe interacciones. | PropertyCard. |
| `hooks` | Coordina estado de interfaz, consultas y acciones. | useProperties. |
| `api` | Ejecuta peticiones y extrae sus resultados. | getProperties. |
| `types` | Describe la forma esperada de los datos. | Property y PropertyImage. |
| `shared` | Contiene código de uso general compartido entre funcionalidades. | Cliente Axios y controles visuales comunes. |

Los tipos de TypeScript no validan por sí mismos las respuestas recibidas durante la ejecución.

### Ejemplo con alojamientos

```text
HomePage → useProperties → properties.api → cliente HTTP → Laravel
    ↓
PropertyCard
```

Correspondencias propuestas:

| Archivo actual | Ubicación propuesta |
| --- | --- |
| `src/api/http.ts` | `src/shared/api/http.ts` |
| `src/api/properties.api.ts` | `src/features/properties/api/properties.api.ts` |
| `src/hooks/useProperties.ts` | `src/features/properties/hooks/useProperties.ts` |
| `src/components/PropertyCard.tsx` | `src/features/properties/components/PropertyCard.tsx` |
| `src/types/property.ts` | `src/features/properties/types/property.ts` |

### Reglas de trabajo

- Mantener juntas las piezas de una funcionalidad.
- Permitir que las funcionalidades usen `shared`; evitar que `shared` dependa de una funcionalidad.
- Evitar dependencias circulares entre funcionalidades. Cuando necesiten colaborar, definir una interfaz explícita o coordinarlas desde la composición de la aplicación.
- Conservar los datos remotos en React Query y el estado visual local en los componentes o sus hooks.
- Usar Context para compartir información transversal, como la sesión.
- Mantener en el backend las decisiones definitivas de permisos, disponibilidad y precios.
- Conservar el comportamiento y los contratos HTTP durante movimientos de archivos.

## 4. Backend: capas y Service Layer

Estructura orientativa que conserva las carpetas convencionales de Laravel:

```text
backend/app/
├── Http/
│   ├── Controllers/
│   ├── Requests/
│   └── Resources/             Propuesto
├── Policies/                  Propuesto
├── Services/
│   ├── Auth/                  Existente
│   ├── Properties/            Existente
│   ├── Reservations/          Cuando se necesite
│   └── Payments/              Cuando se necesite
└── Models/
```

### Responsabilidades

| Parte | Responsabilidad | Ejemplo |
| --- | --- | --- |
| Route y middleware | Dirigir peticiones y aplicar controles generales de acceso. | Exigir sesión para administrar alojamientos. |
| FormRequest | Validar entrada y, cuando corresponda, delegar autorización. | Validar capacidad y formato de fechas. |
| Policy | Decidir quién puede realizar una acción sobre un recurso. | Autorizar al propietario a actualizar su alojamiento. |
| Controller | Coordinar la petición HTTP, llamar a la operación y responder. | Recibir datos validados y llamar al servicio. |
| Service | Coordinar reglas de negocio y escrituras relacionadas. | Crear alojamiento y asociar comodidades. |
| Model | Representar persistencia, relaciones y conversiones de datos. | Relación entre alojamiento e imágenes. |
| Resource | Definir la representación JSON de salida. | Campos públicos del alojamiento. |

Flujo conceptual; la autorización puede ejecutarse mediante middleware, FormRequest o una llamada explícita a la Policy:

```text
Petición → autenticación, autorización y validación
         → Controller → Service → modelos/base de datos
         → Resource → respuesta JSON
```

### Alcance de PropertyService

Mantener operaciones relacionadas con alojamientos. Evitar acumular allí lógica de reservas, cobros o notificaciones.

Una transacción agrupa escrituras de base de datos que deben completarse o revertirse juntas. No revierte automáticamente archivos subidos ni llamadas a proveedores externos.

Si un caso de uso crece demasiado, considerar una clase específica, como `ConfirmReservation`, con una responsabilidad concreta. Extraerla cuando la complejidad lo justifique.

### Ejemplo futuro: crear una reserva

1. El Request valida los datos y el formato de las fechas.
2. La autorización comprueba que el usuario puede realizar la operación.
3. El Controller llama al servicio de reservas.
4. El servicio verifica disponibilidad y calcula el importe en el servidor.
5. La operación guarda los datos con transacción y una estrategia de concurrencia adecuada.
6. Un Resource prepara la respuesta.

Consultar disponibilidad y luego guardar no basta para impedir reservas simultáneas. Al implementar reservas habrá que definir restricciones o bloqueos apropiados y probar ese escenario.

## 5. Contrato entre frontend y backend

El contrato es el acuerdo sobre rutas, parámetros, respuestas y errores.

- Definir nombres y tipos de los campos, incluidos importes, monedas y fechas.
- Acordar qué campos son opcionales y cuáles pueden ser `null`.
- Definir datos públicos y datos privados mediante respuestas explícitas.
- Mantener una forma consistente de comunicar errores de validación y autorización.
- Acordar la estructura paginada antes de construir controles de paginación.
- Coordinar los cambios en Resources y tipos del frontend.

Actualmente `getProperties` entrega solo la lista mediante `response.data.data.data`. Si se implementa navegación entre páginas, tendrá que entregar también los metadatos necesarios, como página actual y última página.

## 6. Prioridades para el backend actual

Estas observaciones son puntos de trabajo, no correcciones realizadas:

1. **Revisar autenticación y autorización de las rutas de administración.** En `routes/api.php`, las rutas de propiedades revisadas no declaran directamente middleware de autenticación. Comprobar también la configuración global antes de concluir el acceso efectivo.
2. **Definir cómo se asigna el anfitrión.** `StorePropertyRequest` acepta `user_id` y devuelve `true` en `authorize()`. Para el alta del propio anfitrión, proponer que el propietario se obtenga de la sesión. Un alta en nombre de otro usuario requiere un permiso explícito.
3. **Agregar Policies y aplicarlas.** Crear el archivo no basta: los puntos de entrada deben ejecutar la autorización.
4. **Agregar Resources preservando el contrato existente.** Revisar qué información del anfitrión debe aparecer en las respuestas públicas.
5. **Consolidar las operaciones de alojamientos, imágenes y comodidades.** Definir reglas y límites antes de ampliar los servicios.

## 7. Plan incremental

Marcar cada tarea cuando esté implementada y verificada; no solo cuando exista su archivo.

### Etapa 1: definir y proteger los flujos actuales

- [ ] Inventariar rutas públicas y privadas.
- [ ] Acordar permisos de huésped y anfitrión por operación.
- [ ] Definir asignación del propietario de un alojamiento.
- [ ] Aplicar autenticación y Policies donde corresponda.
- [ ] Probar acceso sin sesión, acceso propio y acceso a recursos ajenos.

### Etapa 2: estabilizar datos y respuestas

- [ ] Definir respuestas públicas y privadas de propiedades.
- [ ] Introducir Resources manteniendo compatibilidad o coordinando cambios.
- [ ] Acordar respuestas de error y paginación.
- [ ] Revisar correspondencia entre respuestas y tipos de TypeScript.

### Etapa 3: organizar el frontend

- [ ] Trasladar primero la funcionalidad de propiedades.
- [ ] Actualizar imports y verificar catálogo, imágenes y estados de carga/error.
- [ ] Organizar autenticación y verificar login, registro, logout y rutas por rol.
- [ ] Ejecutar los comandos de build y lint existentes.

### Etapa 4: incorporar nuevas operaciones

- [ ] Definir reglas de comodidades y su asociación con alojamientos.
- [ ] Definir estados, disponibilidad y cancelación de reservas.
- [ ] Implementar reservas con pruebas de concurrencia relevantes.
- [ ] Definir pagos e integración externa cuando el alcance esté acordado.

## 8. Cuándo agregar más herramientas

| Herramienta o patrón | Cuándo considerarlo |
| --- | --- |
| Repository | Cuando exista una necesidad concreta de abstraer persistencia o distintas fuentes de datos. |
| Clase por caso de uso | Cuando una operación tenga complejidad suficiente para separarla del servicio general. |
| Colas y Jobs | Para trabajo que pueda terminar después de la respuesta, como ciertas notificaciones o procesamiento de imágenes. |
| Caché adicional | Cuando mediciones identifiquen consultas repetidas costosas y se defina su invalidación. |
| Microservicios | Cuando haya necesidades demostradas de despliegue o escalado independiente que compensen su complejidad. |

## 9. Registro de decisiones

Actualizar esta tabla cuando cambie una decisión arquitectónica.

| Fecha | Decisión propuesta | Motivo | Estado |
| --- | --- | --- | --- |
| 2026-09-28 | Frontend por funcionalidades. | Mantener juntas las piezas que cambian por el mismo motivo. | Pendiente de implementación. |
| 2026-09-28 | Backend por capas con servicios por funcionalidad. | Aprovechar la estructura actual y delimitar responsabilidades. | Base existente; consolidación pendiente. |
| 2026-09-28 | Mantener Eloquent sin Repository adicional por ahora. | Evitar abstracciones sin una necesidad concreta. | Criterio propuesto. |
| 2026-09-28 | Priorizar permisos y contratos antes de nuevas capas. | Estabilizar las operaciones actuales. | Pendiente. |

## 10. Archivos de referencia

- [Guía del frontend](frontend/GUIA_FRONTEND.md).
- [API de propiedades del frontend](frontend/src/api/properties.api.ts).
- [Tipos de propiedades](frontend/src/types/property.ts).
- [Rutas de API del backend](backend/routes/api.php).
- [PropertyController](backend/app/Http/Controllers/Properties/PropertyController.php).
- [StorePropertyRequest](backend/app/Http/Requests/Properties/StorePropertyRequest.php).
- [PropertyService](backend/app/Services/Properties/PropertyService.php).
- [Property](backend/app/Models/Property.php).

Para cada cambio futuro: identificar su funcionalidad, asignar cada responsabilidad a la capa correspondiente, implementar el comportamiento y verificar los escenarios relevantes antes de marcarlo como terminado.


## 11. Implementación: ubicación y autorización (28 de septiembre de 2026)

### Datos y contrato

- `departments` contiene nombre y código; `cities` pertenece a un departamento.
- `properties.city_id` referencia una ciudad. El departamento se obtiene desde esa relación, sin duplicarlo en la propiedad.
- Para crear o actualizar alojamientos se envía `city_id`. Los campos de entrada `city`, `department` y `user_id` están prohibidos.
- El propietario se asigna desde la sesión al crear. No se permite transferirlo desde el formulario.
- Las respuestas siguen incluyendo `city` y `department` como nombres para conservar compatibilidad con el catálogo del frontend. La relación interna se llama `location`.
- `GET /api/public/departments` lista departamentos.
- `GET /api/public/departments/{department}/cities` lista únicamente las ciudades de ese departamento.
- El frontend deberá limpiar la ciudad seleccionada cuando cambie el departamento. El formulario con los selectores dependientes aún no está implementado.

El catálogo inicial es de Colombia: 33 agrupaciones departamentales (incluido Bogotá D.C.) y 1.122 registros territoriales del archivo descargado. No se afirma que todos sean ciudades: el conjunto incluye municipios y áreas no municipalizadas. Fuente: [DIVIPOLA, portal Datos Abiertos Colombia](https://www.datos.gov.co/dataset/gdxc-w37w), descarga del 28 de septiembre de 2026. La copia local guarda nombres y códigos; no utiliza coordenadas municipales como ubicación de alojamientos.

`LocationSeeder` carga la copia local y puede repetirse sin duplicar códigos. Ejecutar únicamente este seeder para cargar ubicaciones. El DatabaseSeeder general además carga roles (`SYSTEM_ADMIN`, `ANFITRION`, `HUESPED`), estados (`ACTIVO`, `INACTIVO`) y el administrador del sistema, único usuario creado por seeder; sus datos salen de `ADMIN_NAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` (obligatoria) y repetir la carga no cambia su contraseña.

### Permisos implementados

| Rutas | Acceso |
| --- | --- |
| Catálogo público de alojamientos activos y ubicaciones | Público. |
| Administración de propiedades e imágenes | Sesión y rol activo `ANFITRION`. |
| Lectura y modificación de una propiedad o sus imágenes | Además, debe pertenecer al anfitrión. |
| Usuarios, roles y estados | Sesión y rol activo `SYSTEM_ADMIN`, nombre ya referenciado por el proyecto. |

El middleware `RequireRole` controla roles; `PropertyPolicy` controla propiedad de los recursos. La lista privada se filtra por el anfitrión conectado. El registro público mantiene únicamente `HUESPED` y `ANFITRION`. No se asignaron permisos administrativos a usuarios existentes.

Las rutas de eliminación sin implementación y la ruta de consulta individual de usuario sin implementación no se exponen. Cambiar la propiedad asociada a una imagen está prohibido.

### Migraciones y comprobaciones

Se autorizó borrar datos de desarrollo. Se revirtieron únicamente las migraciones de imágenes y propiedades, conservando usuarios y roles. Se agregó la migración de ubicaciones antes de propiedades y se recrearon las tablas dependientes. Esta edición del historial requiere el mismo tratamiento controlado en cualquier otra base que hubiera aplicado la migración antigua; no es una migración de datos de producción.

La migración de comodidades continúa pendiente en la base de desarrollo. Los archivos físicos de imágenes antiguas no se eliminaron durante el rollback.

Se añadieron pruebas de integración para ciudades por departamento, creación con ciudad válida, roles activos, aislamiento por propietario, imágenes, registro sin escalamiento administrativo y carga repetible del catálogo. Se ajustaron los paréntesis de la expresión UUID de la migración `user_roles` para que el esquema pueda crearse también en SQLite durante las pruebas; los UUID de las asignaciones de prueba se suministran explícitamente.

Sigue pendiente la adopción general de Resources, la reorganización del frontend por funcionalidades y la integración del mapa. Este cambio consolida relaciones y autorización dentro de la arquitectura por capas existente.


## 12. Controladores organizados por funcionalidad

La carpeta `Http/Controllers/Api` se reemplazó por grupos de funcionalidad:

```text
Http/Controllers/
├── Auth/          AuthController: registro y sesión
├── Users/         UserController: administración de usuarios
├── Properties/    PropertyController, PropertyImageController y PublicPropertyController
├── Locations/     LocationController: departamentos y ciudades
├── Roles/         RoleController
├── States/        EstadoController
└── Controller.php
```

Los namespaces y las referencias de rutas siguen esta estructura. Las URL `/api/...`, sus middleware y permisos se conservan: el prefijo HTTP de la API no depende del nombre de la carpeta de controladores. Los servicios, Requests, modelos y Policies conservan sus responsabilidades y ubicaciones actuales.
