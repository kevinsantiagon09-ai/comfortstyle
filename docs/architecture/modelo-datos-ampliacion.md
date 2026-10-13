# ComfortStyle: modelo de datos para los nuevos requerimientos

Fecha: 13 de octubre de 2026. Estado: propuesta de diseño, pendiente de implementación.

Este documento cubre los 30 requerimientos de las imágenes y parte de las migraciones y servicios actuales. No modifica el esquema ni acredita que las funcionalidades propuestas estén implementadas.

Diagrama completo: [modelo-datos-ampliacion.mmd](modelo-datos-ampliacion.mmd). Vista visual por módulos: [modelo-datos-ampliacion.svg](modelo-datos-ampliacion.svg).

## 1. Base existente y decisiones

Se conservan `users`, `roles`, `user_roles`, `estados`, `departments`, `cities`, `properties`, `property_images`, `property_panoramas`, `amenities`, `amenity_property` y `reservations`. También se conservan las tablas técnicas de autenticación, sesiones, caché y colas. `cache` no representa información de negocio.

La configuración local selecciona PostgreSQL. El diseño mantiene una aplicación Laravel con módulos de negocio y relaciones explícitas. No necesita microservicios para cubrir estos requisitos.

Supuestos que guían la propuesta:

- Una reserva ocupa una propiedad completa; no se vende inventario independiente por habitación.
- El anfitrión acepta el arrendamiento antes del pago. La aceptación crea una ventana de pago con vencimiento configurable.
- Los servicios locales pueden contratarse con o sin alojamiento: `service_bookings.reservation_id` es opcional.
- El transporte es un tipo de servicio con una extensión específica para trayecto, vehículo y conductor.
- Un evento pertenece a una propiedad ya registrada. Recomendar un evento a otras propiedades es una relación adicional.
- El rango del usuario representa reputación, separado de sus roles y permisos.
- No se incluyen entradas vendidas para eventos, múltiples monedas en un mismo pedido, reservas por habitación ni pagos divididos entre varios compradores: necesitarían ampliar este modelo.

## 2. Convenciones del diccionario

Cada tabla nueva tiene `id BIGINT` como PK y `created_at`, `updated_at`, salvo registros inmutables de eventos, que necesitan solamente `created_at`. Las entidades expuestas en la API tienen además `uuid UUID UNIQUE NOT NULL`; las tablas puente no lo necesitan. Los nombres de FK indican la tabla destino; las excepciones se explican.

`?` significa nullable. Dinero: `DECIMAL(14,2)`; moneda: `CHAR(3)`; porcentajes: `DECIMAL(7,4)`; coordenadas: `DECIMAL(10,7)`; fechas de estancia: `DATE`; instantes: timestamps con zona horaria, guardados en UTC. La propiedad conserva la zona local para interpretar horarios de entrada y salida.

Los campos de texto corto son `VARCHAR`, las descripciones y mensajes son `TEXT`, las cantidades son enteros y los indicadores son booleanos. `status`, `type`, `category` y `reason_code` deben tener valores controlados y documentados; no son texto libre. Los valores de estado indicados abajo son propuestas.

No aplicar borrado lógico a todas las tablas. Catálogos y perfiles pueden desactivarse; reservas, pagos, consentimientos, verificaciones y auditoría conservan su historial. El borrado físico de registros referenciados por operaciones se restringe. Los datos personales requieren una política de retención y anonimización definida por el negocio.

## 3. Identidad, consentimiento y prestadores

| Tabla nueva | Campos específicos | Relaciones y restricciones |
| --- | --- | --- |
| `legal_documents` | `type`, `version`, `title`, `content_path`, `content_hash`, `effective_at`, `retired_at?` | UNIQUE(`type`, `version`). Versiones publicadas inmutables. Tipos: términos, tratamiento de datos. |
| `user_consents` | `user_id`, `legal_document_id`, `accepted_at`, `revoked_at?`, `ip_hash?`, `user_agent?` | N:1 usuario y documento. UNIQUE(`user_id`, `legal_document_id`). Revocación sin borrar la aceptación. |
| `login_attempts` | `user_id?`, `network_key_hash`, `identifier_hash`, `succeeded`, `attempted_at` | Índice (`network_key_hash`, `attempted_at`). Nunca guardar contraseñas. Historial con retención limitada. |
| `providers` | `user_id`, `business_name`, `description?`, `document_type`, `document_number_encrypted`, `document_fingerprint`, `verification_status`, `is_active` | UNIQUE(`user_id`); UNIQUE(`document_type`, `document_fingerprint`). Usuario 1:0..1 perfil prestador. No confundir verificación con rol. |
| `drivers` | `provider_id`, `license_number_encrypted`, `license_fingerprint`, `license_category`, `license_expires_on`, `verification_status`, `is_active` | UNIQUE(`provider_id`), UNIQUE(`license_fingerprint`). Un conductor también es prestador. |
| `provider_verifications` | `provider_id`, `driver_id?`, `document_kind`, `private_file_path`, `status`, `reviewed_by?`, `reviewed_at?`, `rejection_reason?`, `expires_on?` | `reviewed_by` → users. Si hay conductor, debe pertenecer al prestador. Conserva cada envío y revisión; documentos fuera del almacenamiento público. |
| `audit_logs` | `actor_user_id?`, `action`, `entity_type`, `entity_uuid`, `changes_redacted?`, `request_id?` | Actor → users. Historial inmutable. Referencia descriptiva al recurso, sin FK polimórfica; no almacenar secretos. |

El bloqueo tras diez intentos necesita un contador atómico con TTL en la caché compartida, además del registro de intentos. Definir ventana de conteo, duración del bloqueo y qué significa “misma red”: IP pública o prefijo. Propuesta inicial: diez fallos en quince minutos por IP pública y bloqueo de quince minutos; no está especificado en el requisito. Debe aplicarse antes de validar credenciales y usar la IP obtenida con una configuración confiable de proxies.

Los administradores usan las tablas de roles actuales y autorización del servidor. No necesitan otra tabla de administradores. Registrar cambios sensibles en `audit_logs`.

## 4. Reservas, disponibilidad y cotizaciones

| Tabla nueva | Campos específicos | Relaciones y restricciones |
| --- | --- | --- |
| `quotes` | `user_id`, `property_id`, `check_in`, `check_out`, `adults`, `children`, `currency`, `subtotal`, `discount_amount`, `tax_amount`, `total_amount`, `expires_at`, `status` | Usuario y propiedad N:1. CHECK salida > entrada, adultos > 0, niños >= 0. Estado: emitida, aceptada, vencida. No bloquea fechas. |
| `quote_items` | `quote_id`, `kind`, `description`, `quantity`, `unit_amount`, `total_amount` | N:1 cotización. Desglose de noches, cargos, impuestos y descuentos. Cantidad > 0; importes de descuento positivos identificados por tipo. |
| `property_calendar_blocks` | `property_id`, `reservation_id?`, `start_date`, `end_date`, `kind`, `expires_at?`, `released_at?`, `created_by?`, `reason?` | Reserva UNIQUE cuando no es null. `created_by` → users. Intervalo [inicio, fin), fin > inicio. Tipos: reserva, mantenimiento, bloqueo anfitrión. |
| `reservation_status_history` | `reservation_id`, `from_status?`, `to_status`, `actor_user_id?`, `reason?` | N:1 reserva; actor → users. Registro inmutable de aceptación, cancelación, llegada y salida. |

`property_calendar_blocks` es la fuente única de ocupación: evita que bloqueos del anfitrión y reservas tengan reglas independientes. En PostgreSQL, una restricción de exclusión por propiedad y rango debe impedir el solapamiento de filas con `released_at IS NULL`. Es una propuesta de integridad que debe probarse sobre el motor real antes de implementarse.

Los bloqueos temporales tienen `expires_at`. Una tarea libera vencidos; además, toda adquisición libera los vencidos de esa propiedad dentro de la misma transacción. No usar la hora actual en el predicado de la restricción: una fila no cambia automáticamente al vencer. Mantener el bloqueo transaccional de la propiedad que ya utiliza `ReservationService`; todos los flujos que ocupan o liberan fechas deben usarlo.

Aceptar una cotización exige recalcular o validar su vigencia y adquirir disponibilidad atómicamente. La cotización por sí sola no garantiza inventario. Al confirmar un pago, bloquear y revisar reserva y calendario: un pago tardío no puede recuperar fechas ocupadas por otra reserva; requiere conciliación y, si procede, reembolso.

## 5. Servicios, transporte, eventos y ubicación

| Tabla nueva | Campos específicos | Relaciones y restricciones |
| --- | --- | --- |
| `services` | `provider_id`, `city_id`, `name`, `description`, `type`, `base_price`, `currency`, `capacity`, `is_active`, `latitude?`, `longitude?` | N:1 prestador y ciudad. Tipo: restaurante, domicilio, actividad, transporte. Capacidad > 0. |
| `service_slots` | `service_id`, `starts_at`, `ends_at`, `capacity`, `status` | N:1 servicio. UNIQUE(`service_id`, `starts_at`, `ends_at`). Fin > inicio. Inventario por franja. |
| `service_bookings` | `user_id`, `reservation_id?`, `service_slot_id`, `quantity`, `unit_price`, `total_amount`, `currency`, `status`, `hold_expires_at?`, `notes?` | N:1 usuario, reserva opcional y franja. La franja determina el servicio. No duplicar `service_id`. Cantidad > 0. |
| `vehicles` | `provider_id`, `license_plate`, `vehicle_type`, `brand`, `model?`, `passenger_capacity`, `has_air_conditioning`, `is_4x4`, `is_active` | N:1 prestador; UNIQUE(`license_plate`) normalizada. Capacidad > 0. |
| `driver_vehicles` | `driver_id`, `vehicle_id`, `authorized_from`, `authorized_until?`, `is_active` | N:M conductores y vehículos; UNIQUE(`driver_id`, `vehicle_id`). Permite conducir vehículos de otro prestador autorizado. |
| `transport_bookings` | `service_booking_id`, `driver_id?`, `vehicle_id?`, `pickup_address`, `pickup_latitude`, `pickup_longitude`, `dropoff_address`, `dropoff_latitude`, `dropoff_longitude`, `pickup_at`, `estimated_end_at`, `passengers`, `status` | UNIQUE(`service_booking_id`); extensión 1:0..1 de servicio transporte. Conductor elegido y vehículo se validan conjuntamente. |
| `events` | `property_id`, `created_by`, `title`, `description`, `category`, `starts_at`, `ends_at`, `price?`, `currency?`, `capacity?`, `status`, `image_path?` | N:1 propiedad y creador → users. Fin > inicio. La ubicación se deriva de la propiedad. Crear evento requiere permiso sobre ella. |
| `places` | `city_id`, `name`, `category`, `description?`, `address`, `latitude`, `longitude`, `is_active` | N:1 ciudad. Lugares cercanos que no son propiedades, servicios ni eventos. |
| `property_recommendations` | `property_id`, `place_id?`, `event_id?`, `service_id?`, `reason_code`, `reason_text`, `priority`, `is_active` | EXACTAMENTE uno de los tres destinos con FK. UNIQUE parcial por (`property_id`, destino) para cada tipo. Explica por qué se recomienda. |
| `property_access` | `property_id`, `road_type`, `road_condition`, `recommended_vehicle`, `requires_4x4`, `distance_from_main_road_km?`, `public_transport_available`, `parking_available`, `arrival_instructions?`, `accessibility_notes?`, `last_verified_at?` | UNIQUE(`property_id`). Información vigente de acceso; no sustituye el historial de opiniones. |
| `road_reports` | `reservation_id`, `condition`, `comment?`, `observed_at`, `moderation_status` | N:1 reserva; UNIQUE(`reservation_id`). Usuario y propiedad se derivan de la reserva. Reportar después de iniciar la estancia; se propone exigir estancia completada. |

Reservar servicios requiere bloquear la franja y sumar cantidades de reservas vigentes; confirmar que no excedan `capacity` dentro de la transacción. Liberar pendientes vencidos antes del cálculo. El transporte también necesita impedir cruces de intervalos para conductor y vehículo, validar autorización y capacidad de pasajeros. Las FK por sí solas no aseguran estas reglas.

El permiso de geolocalización se solicita en el navegador. Consultar cercanía no requiere guardar un historial permanente de coordenadas del huésped. Para las búsquedas, validar pares completos de coordenadas y sus rangos; definir un radio y calcular distancias. Incorporar índice espacial si las mediciones lo requieren. No guardar distancias calculadas como valores permanentes sin mecanismo de actualización.

## 6. Pagos, comisiones, reembolsos y disputas

| Tabla nueva | Campos específicos | Relaciones y restricciones |
| --- | --- | --- |
| `orders` | `user_id`, `reservation_id?`, `service_booking_id?`, `currency`, `subtotal`, `discount_amount`, `tax_amount`, `total_amount`, `status`, `expires_at?` | EXACTAMENTE un destino con FK. UNIQUE parcial por cada destino. Un pedido por reserva o contratación; usuario debe ser el comprador del destino. |
| `order_items` | `order_id`, `description`, `kind`, `quantity`, `unit_amount`, `gross_amount`, `discount_amount`, `tax_amount`, `total_amount`, `beneficiary_user_id`, `commission_rule_id?`, `commission_rate`, `commission_amount`, `net_amount` | N:1 pedido; beneficiario → users. Copias históricas del precio y comisión al aceptar. |
| `commission_rules` | `scope`, `service_type?`, `provider_id?`, `percentage`, `fixed_amount`, `currency?`, `valid_from`, `valid_until?`, `is_active` | Prestador opcional. Ámbitos: alojamiento o servicio. Precedencia explícita: prestador > tipo de servicio > regla general. Evitar reglas ambiguas y periodos solapados con igual precedencia. |
| `payment_attempts` | `order_id`, `provider`, `provider_reference?`, `idempotency_key`, `payment_method`, `amount`, `currency`, `status`, `failure_reason?`, `paid_at?` | N:1 pedido. UNIQUE(`provider`, `idempotency_key`); UNIQUE parcial (`provider`, `provider_reference`). Varios intentos no equivalen a varios cobros autorizados. |
| `payment_webhook_events` | `provider`, `external_event_id`, `payment_attempt_id?`, `payload_redacted`, `received_at`, `processed_at?`, `status`, `attempts`, `last_error?` | UNIQUE(`provider`, `external_event_id`). Bandeja persistente de eventos; permite conciliación cuando el intento aún no se encuentra. |
| `refunds` | `payment_attempt_id`, `requested_by`, `approved_by?`, `provider_reference?`, `idempotency_key`, `amount`, `reason`, `status`, `processed_at?` | Solicitante y aprobador → users. UNIQUE(`idempotency_key`), referencia externa única por proveedor mediante el intento. Múltiples reembolsos parciales. |
| `payment_disputes` | `payment_attempt_id`, `provider_reference`, `reason`, `amount`, `status`, `response_due_at?`, `resolved_at?` | N:1 intento. Referencia única por proveedor. Disputa financiera separada de reportes de conducta. |
| `dispute_evidence` | `payment_dispute_id`, `uploaded_by`, `private_file_path`, `description?`, `submitted_at?` | N:1 disputa; autor → users. Evidencias privadas. |

Se propone un pedido por alojamiento o servicio para simplificar cobros, cancelaciones y reembolsos independientes. Un carrito que cobre varios destinos en una sola transacción necesitaría un modelo de asignación de pagos adicional.

La cotización describe una oferta; el pedido conserva la obligación de pago aceptada; un intento describe la interacción con la pasarela. Son conceptos distintos.

Reglas financieras:

1. Calcular importes en el servidor usando aritmética decimal o unidades monetarias menores; el código actual de reservas usa `float` y debe evolucionar cuando se implementen pagos.
2. Por partida: `total_amount = gross_amount - discount_amount + tax_amount`. Propuesta: comisión sobre el importe después del descuento, sin impuestos; `net_amount = gross_amount - discount_amount - commission_amount`. Las tarifas de pasarela no se incluyen todavía. Definir quién las asume antes de liquidar.
3. Congelar reglas e importes en `order_items`; cambiar una regla no recalcula operaciones anteriores. Sumar partidas para obtener los totales del pedido.
4. Verificar firma del webhook antes de aceptarlo; insertar con clave externa única, procesar con bloqueo del pago/pedido y registrar `processed_at` en la misma transacción del cambio. El estado pagado llega de la pasarela o conciliación verificada.
5. Evitar crear otro cobro mientras uno está pendiente o confirmado. Los eventos duplicados o desordenados no deben repetir confirmaciones ni degradar estados definitivos. Un segundo cobro externo confirmado exige conciliación y devolución.
6. Bajo bloqueo del pago, impedir que reembolsos pendientes o completados excedan lo capturado, y controlar su interacción con disputas. Nunca borrar cobros ni guardar datos de tarjeta.

Este alcance calcula el neto, pero no ejecuta transferencias a anfitriones/prestadores. Si el sistema debe liquidarles dinero, añadir un libro de movimientos y desembolsos antes de activar esa operación.

## 7. Reputación, reportes y soporte

| Tabla nueva | Campos específicos | Relaciones y restricciones |
| --- | --- | --- |
| `property_reviews` | `reservation_id`, `rating`, `comment?`, `host_reply?`, `host_replied_at?`, `moderation_status` | UNIQUE(`reservation_id`), puntuación 1..5. Autor y propiedad derivados de la reserva completada. |
| `service_reviews` | `service_booking_id`, `rating`, `comment?`, `provider_reply?`, `moderation_status` | UNIQUE(`service_booking_id`), puntuación 1..5. Solo comprador de contratación completada. |
| `user_reviews` | `reservation_id`, `reviewer_user_id`, `reviewed_user_id`, `rating`, `comment?`, `moderation_status` | UNIQUE(`reservation_id`, `reviewer_user_id`, `reviewed_user_id`); autor != destinatario. Solo huésped y anfitrión de esa estancia completada. Base explícita para calificación de usuarios. |
| `reports` | `reporter_user_id`, `reported_user_id?`, `property_id?`, `reason_code`, `description`, `status`, `assigned_to?`, `resolution?`, `resolved_at?` | EXACTAMENTE un objetivo usuario o propiedad. Responsable → users. No mezclar denuncias con reseñas. |
| `reputation_tiers` | `name`, `min_rating`, `min_reviews`, `priority`, `is_active` | UNIQUE(`name`); umbrales controlados y prioridad única. No da permisos administrativos. |
| `user_reputation` | `user_id`, `reputation_tier_id?`, `rating_sum`, `rating_count`, `calculated_at` | UNIQUE(`user_id`). Proyección recalculable de `user_reviews` publicadas; promedio derivado. |
| `support_tickets` | `user_id`, `reservation_id?`, `service_booking_id?`, `assigned_to?`, `subject`, `status`, `priority`, `closed_at?` | N:1 usuario; contexto opcional, máximo uno. Responsable → users. |
| `support_messages` | `support_ticket_id`, `sender_user_id`, `body`, `is_internal` | N:1 ticket y autor. Notas internas excluidas de respuestas al cliente. |
| `support_ratings` | `support_ticket_id`, `rating`, `comment?` | UNIQUE(`support_ticket_id`), puntuación 1..5. Solo creador de ticket cerrado. |

La media de calificaciones de propiedades o servicios no califica automáticamente al usuario. `user_reviews` hace explícita la fuente del rango; ampliar a interacciones con prestadores requiere definir quién puede evaluar a quién y añadir su contexto verificable.

## 8. Campañas, descuentos, mensajes y encuestas

| Tabla nueva | Campos específicos | Relaciones y restricciones |
| --- | --- | --- |
| `marketing_campaigns` | `name`, `message`, `starts_at`, `ends_at`, `status`, `created_by` | Creador → users. Fin > inicio; estado borrador, programada, activa, finalizada. |
| `campaign_tiers` | `marketing_campaign_id`, `reputation_tier_id` | UNIQUE del par. Segmentación N:M por rango. |
| `promotions` | `marketing_campaign_id?`, `code`, `discount_type`, `discount_value`, `currency?`, `starts_at`, `ends_at`, `max_uses?`, `max_uses_per_user`, `minimum_order_amount?`, `is_active` | UNIQUE(`code`) normalizado. Porcentaje 0..100 o monto fijo con moneda. |
| `promotion_redemptions` | `promotion_id`, `user_id`, `order_id`, `discount_amount`, `status`, `expires_at?`, `redeemed_at?` | UNIQUE(`order_id`) para una promoción por pedido. Reservar cupo atómicamente y liberar pendientes vencidos/cancelados. |
| `notification_preferences` | `user_id`, `channel`, `transactional_enabled`, `marketing_enabled` | UNIQUE(`user_id`, `channel`). Separar comunicaciones operativas y consentimiento comercial. |
| `notifications` | `user_id`, `order_id?`, `reservation_id?`, `service_booking_id?`, `marketing_campaign_id?`, `type`, `channel`, `subject`, `body`, `deduplication_key`, `scheduled_at`, `status`, `sent_at?`, `read_at?` | UNIQUE(`deduplication_key`). Contextos opcionales explícitos; solo combinaciones coherentes con el mismo comprador. |
| `notification_deliveries` | `notification_id`, `attempt_number`, `provider_reference?`, `status`, `attempted_at`, `error?` | UNIQUE(`notification_id`, `attempt_number`). Historial de reintentos. |
| `survey_responses` | `reservation_id`, `type`, `score?`, `comment?`, `submitted_at` | UNIQUE(`reservation_id`, `type`). Tipos llegada y salida. Autor derivado de la reserva; puntuación opcional 1..5. |

No enviar marketing sin preferencia habilitada. Las notificaciones de pago y estancia se generan desde cambios confirmados del negocio. Guardar su intención en la misma transacción y entregar por cola, con clave de deduplicación y reintentos. Las tablas actuales `jobs` y `failed_jobs` siguen siendo infraestructura; no sustituyen el historial de notificaciones.

## 9. Cambios previstos en tablas existentes

Estos cambios están documentados, no ejecutados.

| Tabla | Ampliación necesaria |
| --- | --- |
| `reservations` | Añadir `quote_id? UNIQUE`, `adults`, `children`, `accepted_at?`, `accepted_by?` → users, `hold_expires_at?`, `cancelled_at?`, `cancellation_reason?`, `checked_in_at?`, `checked_out_at?`, `special_requests?`. Conservar nombres actuales `check_in`, `check_out`, `user_id`. `guests = adults + children`; `total_price` sigue representando alojamiento, y el pedido conserva el desglose de cobro. |
| `properties` | Añadir `timezone` (valor inicial propuesto `America/Bogota`). Ya tiene `city_id`, coordenadas, capacidad y precio; no duplicar departamento, ciudad ni dirección en otras tablas de la misma propiedad. |
| `users` | Añadir `city_id?` → cities, migrar progresivamente el texto `city`; completar UUID existentes antes de exigir NOT NULL. |
| `user_roles` | Añadir `assigned_by?` → users para trazabilidad y registrar asignación/revocación en auditoría. Mantener UNIQUE(`user_id`, `role_id`). |

Estados de reserva propuestos: `SOLICITADA` → `PENDIENTE_PAGO` → `CONFIRMADA` → `EN_CURSO` → `COMPLETADA`; alternativas `RECHAZADA`, `VENCIDA`, `CANCELADA`. Solicitud y pendiente de pago tienen vencimiento. La cancelación inicia una decisión de reembolso; no significa que el dinero ya haya sido devuelto.

Pedido: pendiente, pagado, cancelado, parcialmente reembolsado, reembolsado. Intento: creado, pendiente, exitoso, fallido, cancelado. Mantener separados los estados operativos y financieros.

La consulta actual `Reservation::scopeOverlapping()` excluye solamente `CANCELADA`; debe reemplazarse por la fuente de calendario al implementar la ampliación. No agregar estados vencidos manteniendo esa consulta. Migrar las reservas confirmadas actuales a bloques activos y conciliarlas antes de activar las restricciones.

## 10. Trazabilidad de los 30 requerimientos

| Nº | Requerimiento | Soporte del modelo |
| --- | --- | --- |
| 1 | Buscar por ubicación, fechas y capacidad | properties, cities, departments; property_calendar_blocks. |
| 2 | Cotizar | quotes, quote_items. |
| 3 | Reservar sin doble reserva | reservations ampliada, property_calendar_blocks y transacción. |
| 4 | Elegir medio tras aceptación | accepted_at/accepted_by, orders, payment_attempts. |
| 5 | Procesar pago | orders, order_items, payment_attempts. |
| 6 | Webhook idempotente | payment_webhook_events y claves únicas. |
| 7 | Comisión y neto | commission_rules, copias en order_items. |
| 8 | Reembolso | refunds. |
| 9 | Disputa | payment_disputes, dispute_evidence. |
| 10 | Seguimiento de arrendamiento | reservation_status_history y marcas de estancia. |
| 11 | Evento sobre propiedad registrada | events.property_id. |
| 12 | Servicio local | providers, services, service_slots, service_bookings. |
| 13 | Transporte y conductor | drivers, vehicles, driver_vehicles, transport_bookings. |
| 14 | Login y bloqueo por red | users y sesiones existentes; login_attempts y contador atómico en caché. |
| 15 | Aceptar términos y datos | legal_documents, user_consents. |
| 16 | Registrar/verificar prestador o conductor | providers, drivers, provider_verifications. |
| 17 | Administradores | roles y user_roles existentes; audit_logs. |
| 18 | Mapa y permiso de ubicación | Coordenadas actuales; permiso del navegador. |
| 19 | Detalle en mapa | properties, imágenes y panoramas existentes. |
| 20 | Cercanía y razón de recomendación | places, events, services, property_recommendations. |
| 21 | Calificar servicio | service_reviews. |
| 22 | Reportar usuario o propiedad | reports. |
| 23 | Rango según calificación | user_reviews, reputation_tiers, user_reputation. |
| 24 | Promociones por rango y notificación | campaign_tiers, promotions, notifications. |
| 25 | Campañas | marketing_campaigns. |
| 26 | Avisos de pago/arrendamiento | notifications, notification_deliveries. |
| 27 | Llegada, salida y encuesta | Marcas de estancia, notifications, survey_responses. |
| 28 | Calificar vías tras estancia | road_reports con reserva completada. |
| 29 | Consultar vías por lugar | property_access y road_reports vía propiedad/ciudad. |
| 30 | Atención al cliente y calificación | support_tickets, support_messages, support_ratings. |

## 11. Orden de implementación e integridad

1. Consentimientos, auditoría y perfiles de prestador/conductor. Conservar el sistema actual de roles.
2. Cotizaciones, estados de reserva y calendario; migrar ocupaciones actuales y probar concurrencia.
3. Servicios, franjas y transporte. Verificar capacidad y agendas bajo transacciones.
4. Pedidos, comisiones, pagos, webhooks, reembolsos y disputas. Probar duplicados, eventos fuera de orden y pagos después del vencimiento.
5. Eventos, recomendaciones y acceso/vías.
6. Reseñas, reputación, soporte, notificaciones y campañas. Los avisos transaccionales deben incorporarse junto con reservas/pagos, sin esperar al marketing.

Crear migraciones nuevas; no reescribir migraciones aplicadas. Añadir columnas opcionales primero, completar datos existentes, validar y finalmente activar restricciones. Evitar cascadas que borren historial financiero. Índices en FK y filtros frecuentes: estados/vencimientos, usuario/fecha, servicio/franja, propiedad/rango y cola de notificaciones por estado/fecha programada.

Las reglas de participación, pertenencia, cupos, límites acumulados, selección de comisión y transiciones se verifican en servicios con transacciones y autorización; las FK, UNIQUE, CHECK y restricciones de intervalos refuerzan la integridad. El diagrama representa relaciones estructurales; los CHECK de destino exclusivo y estas reglas completan su significado.

## 12. Fuentes del proyecto revisadas

- `backend/database/migrations/*.php`: esquema actual.
- `backend/app/Models/Reservation.php`: estados y búsqueda de solapamientos.
- `backend/app/Services/Reservations/ReservationService.php`: bloqueo de propiedad, precio y cancelación.
- `backend/app/Http/Requests/Auth/LoginRequest.php`: validación actual de login.
- `backend/app/Services/Auth/AuthService.php`, `backend/app/Models/User.php` y `backend/routes/api.php`: sesión, roles y administración.
- `docs/architecture/README.md`: arquitectura y relaciones existentes.

Las propuestas de estados, plazos, comisiones y reglas de calificación son decisiones iniciales para revisión del equipo; las imágenes no especifican sus valores exactos.
