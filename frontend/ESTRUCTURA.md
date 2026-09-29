# Estructura del frontend

Convención vigente desde el 29 de septiembre de 2026. Todo código nuevo sigue estas reglas.

```text
src/
├── main.tsx          Arranque de React
├── App.tsx           Proveedores (React Query) + RouterProvider
├── routes/           router.tsx (todas las rutas), paths.ts (URLs), guards (ProtectedRoute, RoleRoute)
├── api/              Peticiones HTTP, un archivo por recurso; queryKeys.ts con todas las claves de caché
├── hooks/<dominio>/  TODA la lógica: consultas, mutaciones y la lógica de cada página o componente
├── types/            TODOS los tipos, por dominio (incluye las props de los componentes)
├── components/<dominio>/  Componentes visuales: reciben datos del hook y los muestran
├── pages/<área>/     Pantallas (public, guest, host): componen componentes y llaman a su hook  
├── layouts/          Estructuras compartidas (MainLayout, AuthLayout)
├── constants/        Valores fijos (pasos del registro, límites de fotos, clases de estilo)
├── utils/            Funciones puras sin React
├── store/            Estado local del navegador (Zustand), solo lo que no viene del servidor
└── lib/              Configuración de librerías (queryClient)
```

## Reglas

1. **Datos del servidor = React Query.** Cada `useQuery` o `useMutation` vive en su propio hook en `hooks/<dominio>/`, con su clave tomada de `api/queryKeys.ts`. Nunca llames a `api/` directamente desde un componente.
2. **Lógica en hooks.** Páginas y componentes no tienen `useState` de negocio, ni validaciones ni `mutate`: llaman a un hook (`useHostDashboard`, `usePropertyEditForm`…) y pintan lo que devuelve.
3. **Tipos en `types/`.** No declares `interface` ni `type` dentro de componentes, hooks o `api/`.
4. **Rutas en `routes/`.** Toda ruta nueva se agrega en `router.tsx` y su URL en `paths.ts`. En `Link` o `navigate` usa `paths.*` o sus funciones (`hostPropertyEditPath(id)`), nunca texto escrito a mano.
5. **Un archivo, una responsabilidad.** Si un componente crece, divídelo en subcomponentes dentro de `components/<dominio>/`.
6. **Sesión.** `useAuth()` lee la sesión de la caché de React Query; no hay Context. Login, registro y logout actualizan esa caché (`useLogin`, `useRegister`, `useLogout`).

## Agregar una funcionalidad (ejemplo: reservas)

1. `types/reservation.ts`: tipos y props.
2. `api/reservations.api.ts` + claves nuevas en `api/queryKeys.ts`.
3. `hooks/reservations/useReservations.ts`, `useCreateReservation.ts`, y el hook de la página.
4. `components/reservations/…` y `pages/guest/ReservationsPage.tsx`.
5. Ruta en `routes/router.tsx` y URL en `routes/paths.ts`.
