# Entender el frontend de ComfortStyle

Guia basada en los archivos revisados el 28 de septiembre de 2026. Los numeros de linea se refieren a esa version. No se modifico el codigo de la aplicacion.

## 1. Primero: que estas construyendo

El frontend es la parte que se ejecuta en el navegador: muestra alojamientos, recibe datos de formularios y presenta respuestas. Laravel es el backend: recibe peticiones, valida datos, administra la sesion y accede a la base de datos.

Tu frontend utiliza:

| Herramienta | Trabajo en este proyecto |
| --- | --- |
| React | Construir y actualizar la interfaz mediante componentes. |
| TypeScript | Revisar los tipos del codigo antes de ejecutarlo. |
| JSX/TSX | Escribir una descripcion de la interfaz dentro del codigo. |
| React Router | Seleccionar pantallas segun la URL. |
| Axios | Enviar peticiones HTTP al backend. |
| TanStack Query, tambien llamado React Query | Gestionar datos remotos, carga, errores y cache. |
| Context de React | Compartir la informacion de sesion entre componentes. |
| Tailwind CSS | Aplicar estilos mediante clases. |
| Vite | Servidor de desarrollo y construccion de archivos para desplegar. |

Una peticion HTTP es un mensaje entre el navegador y el servidor. GET consulta; POST envia una operacion. La respuesta suele tener un cuerpo JSON, es decir, datos estructurados.

## 2. Carpetas y archivos

```text
frontend/
  public/          Archivos accesibles por URL, como imagenes de respaldo.
  src/            Codigo fuente de la aplicacion.
    api/          Funciones que se comunican con Laravel.
    assets/       Recursos que pueden importarse desde el codigo.
    auth/         Contexto de sesion y controles de acceso a pantallas.
    components/   Piezas visuales reutilizables.
    hooks/        Logica reutilizable para componentes.
    layouts/      Estructuras visuales compartidas por varias rutas.
    pages/        Pantallas completas.
      guest/      Pantallas del huesped.
      host/       Pantallas del anfitrion.
    types/        Descripciones TypeScript de los datos.
    utils/        Funciones auxiliares.
    main.tsx      Arranque de React.
    App.tsx       Definicion de las rutas.
    index.css     Entrada de estilos utilizada por main.tsx.
    App.css       Estilos de plantilla, sin importar en el codigo revisado.
  index.html      Documento donde se monta React.
  package.json    Dependencias y comandos del proyecto.
  vite.config.ts  Configuracion de Vite y proxy de desarrollo.
  tsconfig*.json  Configuracion de TypeScript.
  eslint.config.js Reglas para analizar el codigo.
```

`node_modules/`, cuando esta instalado, contiene codigo de dependencias. `dist/`, cuando se construye el proyecto, contiene el resultado para desplegar. No son carpetas donde normalmente escribes funcionalidades.

## 3. Vocabulario para leer tu codigo

### Componente, render y JSX

Un componente es una funcion que describe una parte de la interfaz:

```tsx
function Saludo() {
    return <h1>Hola</h1>;
}
```

`Saludo` comienza con mayuscula para usarlo como `<Saludo />`. `h1` es una etiqueta HTML. JSX se parece a HTML, pero permite insertar expresiones de JavaScript con `{...}`.

Renderizar significa que React ejecuta los componentes para calcular que mostrar. Cuando cambian datos relevantes, calcula la nueva interfaz y actualiza el DOM, la estructura de elementos del navegador. No significa recargar toda la pagina.

`<>...</>` es un fragmento: agrupa elementos sin agregar un `div`. `className` establece las clases CSS. `return` termina la funcion y entrega su resultado.

### Props

Las props son los argumentos de un componente, recibidos en un objeto. El padre proporciona datos al hijo:

```tsx
<PropertyCard property={property} />
```

Aqui el nombre de la prop es `property`; la expresion a la derecha es la variable que contiene el alojamiento. El hijo la recibe mediante `function PropertyCard({ property }: PropertyCardProps)`.

El hijo debe tratar las props como datos de solo lectura. Para comunicar una accion al padre puede recibir una funcion como prop y ejecutarla. `children` es la prop que representa lo escrito entre las etiquetas de un componente.

`<AuthForm registerMode />` equivale a `<AuthForm registerMode={true} />`. Sin esa prop, tu componente usa su valor predeterminado `false`.

### Estado y useState

El estado es informacion que React conserva entre renders de una instancia de componente. En `usePasswordField.ts`:

```tsx
const [visible, setVisible] = useState(false);
const toggleVisibility = () => setVisible((value) => !value);
```

`false` es el valor inicial; `visible` es el valor del render actual; `setVisible` solicita una actualizacion. La funcion `value => !value` invierte el valor anterior. React vuelve a renderizar y el campo cambia entre `password` y `text`. El setter no cambia la variable de la funcion que ya esta ejecutandose. Una variable local normal no conserva este estado ni solicita renders al asignarla. [Referencia oficial de useState](https://react.dev/reference/react/useState).

Cada campo de contrasena tiene su propio estado. Llamar al mismo hook desde dos componentes no comparte automaticamente sus valores.

### Hook y el prefijo use

Un hook permite utilizar capacidades de React desde componentes o desde otros hooks. `useState`, `useContext` y `useId` vienen de React. `useQuery` viene de TanStack Query. `useAuth`, `useProperties` y `usePasswordField` son funciones de tu proyecto.

El prefijo `use` es una convencion para identificar hooks; no significa por si solo que se llame al servidor. Los hooks como `useState` deben llamarse en el nivel superior del componente o hook, sin ponerlos dentro de condiciones, bucles o manejadores de clic.

Tu `usePropertyCard` actualmente solo calcula valores y crea un manejador: no llama a hooks de React. Podria ser una funcion auxiliar normal; el nombre no le agrega estado.

React tambien tiene una API llamada literalmente `use`, que puede leer un contexto o una promesa e integrarse con Suspense. Es distinta del prefijo de tus funciones; no se utiliza en este proyecto. Tiene reglas particulares, como permitir ciertas llamadas condicionales. [Referencia oficial de use](https://react.dev/reference/react/use).

### useEffect

`useEffect` sincroniza un componente con algo externo, por ejemplo un evento del navegador. Este ejemplo es didactico y NO pertenece a tu codigo actual:

```tsx
import { useEffect, useState } from 'react';

function AnchoVentana() {
    const [ancho, setAncho] = useState(window.innerWidth);

    useEffect(() => {
        const actualizar = () => setAncho(window.innerWidth);
        window.addEventListener('resize', actualizar);
        return () => window.removeEventListener('resize', actualizar);
    }, []);

    return <p>Ancho: {ancho}</p>;
}
```

El efecto registra un listener; su funcion de limpieza lo retira. `[]` indica que no depende de valores reactivos cambiantes. Con `[valor]` se vuelve a sincronizar cuando cambia ese valor; sin arreglo, se ejecuta despues de cada commit. En desarrollo, StrictMode puede hacer un ciclo adicional de configuracion y limpieza. No necesitas un efecto para cada calculo ni para manejar un clic. Tu proyecto delega las consultas remotas a React Query y no contiene llamadas a `useEffect`. [Referencia oficial de useEffect](https://react.dev/reference/react/useEffect).

### React Query

React Query administra el estado de datos del servidor: resultado, peticion en curso, error y cache. Axios hace el transporte HTTP dentro de la funcion que React Query ejecuta.

En tu proyecto, `useQuery` consulta alojamientos o sesion; `useMutation` ejecuta login, registro y logout. Una mutation no se ejecuta simplemente al renderizar: se activa mediante `mutate(...)`. `QueryClient` administra la cache y `QueryClientProvider` permite acceder a ella.

`queryKey` identifica una consulta. Los consumidores con la misma clave dentro del mismo cliente comparten su entrada de cache. `staleTime: 60_000` significa que los datos se consideran frescos durante un minuto; no es un temporizador que consulte cada minuto. Cuando estan obsoletos, eventos como volver a montar un consumidor o recuperar el foco pueden provocar consultas, segun la configuracion. `staleTime` tampoco determina cuanto dura una entrada inactiva en memoria. [Valores predeterminados de TanStack Query](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults).

En tus consultas, `isPending` indica que aun no hay un resultado exitoso y el estado es pendiente; `isFetching` indica que se esta ejecutando la peticion. Puede haber datos visibles mientras una peticion los actualiza en segundo plano. La cache configurada aqui vive en memoria: no hay persistencia en localStorage implementada.

### Context

Context permite que un proveedor entregue un valor a los componentes descendientes sin pasarlo como prop en cada nivel. En tu proyecto:

```text
QueryClientProvider
  AuthProvider: consulta la sesion con useSession
    App
      Navbar: obtiene el usuario mediante useAuth
      ProtectedRoute: obtiene el estado de autenticacion mediante useAuth
```

`createContext` crea el canal; `AuthContext.Provider` entrega el valor; `useContext` lo lee. Context no inicia sesion ni guarda cookies: comparte el resultado que obtiene `useSession`. `useAuth` tampoco hace una nueva peticion por cada consumidor.

### Modal y modelo

Un modal es un dialogo sobre la pantalla, por ejemplo una confirmacion para eliminar un alojamiento. Puede controlar su apertura con estado. Un modal completo tambien gestiona foco, cierre con Escape y accesibilidad. No hay un componente modal en los archivos revisados.

Un modelo es otra cosa: `backend/app/Models/PropertyImage.php` pertenece al backend. Una interfaz TypeScript como `PropertyImage` describe la forma de datos en el frontend; no consulta una tabla ni crea registros.

### Sintaxis que se repite

| Sintaxis | Significado |
| --- | --- |
| `import X from './archivo'` | Importa la exportacion predeterminada. |
| `import { X } from './archivo'` | Importa una exportacion con nombre. |
| `import type { X }` | Importa un tipo para TypeScript, sin codigo de ejecucion. |
| `export` / `export default` | Permite importar un valor desde otros archivos. |
| `const { user } = objeto` | Extrae la propiedad `user`: desestructuracion. |
| `const [valor, setter] = ...` | Extrae elementos de un arreglo. |
| `async` / `await` | Trabaja con promesas; espera un resultado sin bloquear el navegador. |
| `Promise<AuthUser>` | Promesa que, si se resuelve, entrega un usuario. |
| `string`, `number`, `boolean` | Texto, numero y verdadero/falso. |
| `AuthUser \| null` | Puede ser un usuario o la ausencia explicita de usuario. |
| `campo?: string` | Campo opcional. |
| `Property[]` | Arreglo de alojamientos. |
| `objeto?.campo` | Accede al campo solo si el objeto no es null/undefined. |
| `valor ?? alternativa` | Usa la alternativa si valor es null/undefined. |
| `valor \|\| alternativa` | Usa la alternativa para cualquier valor falsy, incluido texto vacio. |
| `condicion ? a : b` | Elige a o b. |
| `condicion && <Elemento />` | Aqui se usa para mostrar un elemento si la condicion es verdadera. |
| `...options` | Copia propiedades de un objeto. |
| `() => accion()` | Funcion flecha. Se ejecuta cuando alguien la llama. |
| `as UserRole` | Afirmacion de tipo; no valida ni transforma el dato real. |
| `.map(...)` | Transforma cada elemento de un arreglo. |
| `.find(...)` | Encuentra el primer elemento que cumple la condicion. |
| `.some(...)` | Responde si al menos un elemento cumple la condicion. |

## 4. Recorrido al abrir la pagina

```text
index.html -> main.tsx -> proveedores -> App.tsx -> pagina segun la URL

HomePage -> useProperties -> getProperties -> Axios -> proxy Vite -> Laravel
    ^                            respuesta JSON                         |
    +------------------------ React Query <-----------------------------+

AuthProvider -> useSession -> me -> Laravel
      |             |
      +---- comparte user, loading e isAuthenticated mediante Context
```

Al recibir datos, React vuelve a ejecutar los componentes que consumen el estado actualizado. HomePage transforma los alojamientos en tarjetas con `.map(...)`.

## 5. Archivos explicados por linea

Las lineas vacias separan visualmente bloques. Las llaves, parentesis y etiquetas de cierre terminan el bloque abierto correspondiente; se agrupan con el bloque para no repetir esa explicacion en cada archivo.

### index.html

- L1: declara un documento HTML moderno.
- L2: abre HTML y declara ingles como idioma; el contenido visible del proyecto esta en espanol.
- L3: abre metadatos.
- L4: UTF-8 permite representar caracteres como tildes.
- L5: indica el icono de la pestana.
- L6: ajusta la escala inicial y el ancho a la pantalla del dispositivo.
- L7: texto de la pestana: `frontend`.
- L8-9: cierra metadatos y abre el cuerpo visible.
- L10: contenedor `root` donde React monta la aplicacion.
- L11: carga `main.tsx` como modulo mediante Vite.
- L12-13: cierran el documento.

### src/main.tsx

- L1: importa StrictMode, que activa comprobaciones adicionales de desarrollo.
- L2: importa el cliente y proveedor de React Query.
- L3: importa la funcion que crea la raiz React en el DOM.
- L4: importa el componente principal.
- L5: importa el proveedor de autenticacion.
- L6: carga los estilos globales.
- L8: crea un cliente de consultas fuera del componente para reutilizarlo.
- L10-12: busca `root`, crea la raiz y comienza a renderizar. `!` afirma a TypeScript que el elemento existe; no lo crea ni comprueba su existencia en ejecucion.
- L13: activa StrictMode.
- L14: proporciona `queryClient` a sus descendientes.
- L15: proporciona la sesion. Esta dentro de QueryClientProvider porque useSession usa React Query.
- L16: monta App.
- L17-20: cierran los proveedores y la llamada a render.

### src/App.tsx

- L1-5: importa BrowserRouter, Route y Routes.
- L6: importa el control que requiere sesion.
- L7: importa el control que requiere un rol.
- L8-9: importa las estructuras de huesped y anfitrion.
- L10-14: importa los dos paneles, inicio, login y registro.
- L16-19: define App y activa el router basado en la URL del navegador.
- L20: `/` muestra HomePage.
- L21: `/login` muestra LoginPage.
- L22-25: `/register` muestra RegisterPage.
- L27: agrupa rutas que primero pasan por ProtectedRoute.
- L28-32: exige el rol HUESPED a esta rama.
- L33: aplica GuestLayout.
- L34-37: `/guest` muestra GuestDashboard dentro de esa estructura.
- L38-39: cierran la rama de huesped.
- L41-45: exige ANFITRION a la siguiente rama.
- L46: aplica HostLayout.
- L47-50: `/host` muestra HostDashboard.
- L51-53: cierran esa rama y el grupo autenticado.
- L55-58: `*` muestra pagina no encontrada para una URL no reconocida.
- L59-62: cierran router y componente.

Una ruta anidada aparece en el `Outlet` de su padre. Los controles de React deciden que pantalla mostrar; los permisos de acceso a datos tambien deben comprobarse en Laravel.

### src/api/http.ts

- L1: importa Axios.
- L3: toma VITE_API_URL o `/api`; elimina una barra final mediante una expresion regular.
- L4: elimina `/api` al final para obtener la base del backend.
- L5: abre opciones compartidas.
- L6: habilita credenciales, como cookies, para las peticiones aplicables; el navegador sigue aplicando sus reglas de cookies.
- L7: habilita el envio del encabezado XSRF a partir de la cookie correspondiente.
- L8: pide respuestas JSON mediante Accept.
- L9: termina las opciones.
- L10: crea el cliente de API con esas opciones y apiUrl.
- L11: crea otro cliente para sesion, usando VITE_AUTH_URL o las alternativas indicadas.
- L12: exporta el cliente de API como predeterminado.

Con los valores de `.env.example`, `http.get('/public/properties')` solicita `/api/public/properties`. El cliente de sesion usa `/backend`; Vite quita ese prefijo antes de reenviar a Laravel.

### src/api/auth.api.ts

- L1: importa sessionHttp y lo renombra localmente a http.
- L2-7: importa los tipos de respuesta, usuario y formularios.
- L9: declara una funcion asincrona exportable llamada login.
- L10: recibe credenciales con correo y contrasena.
- L11: declara que el resultado exitoso sera AuthResponse.
- L12: solicita la cookie CSRF antes de enviar el formulario.
- L13: inicia un POST y describe el tipo esperado del cuerpo de respuesta.
- L14: ruta de inicio de sesion.
- L15: cuerpo enviado: credentials.
- L16: termina la llamada.
- L18: devuelve el cuerpo JSON que Axios guardo en response.data.
- L19: termina login.
- L21-23: declara register con datos de registro y resultado AuthResponse.
- L24: prepara la cookie CSRF.
- L25-28: hace POST a `/register` con esos datos.
- L30-31: devuelve el JSON y termina register.
- L33: logout devuelve una promesa sin un valor util de retorno.
- L34-35: solicita cerrar sesion y termina.
- L36: me consulta el usuario y acepta una senal opcional de cancelacion.
- L37: GET a `/me`; el JSON esperado es `{ data: usuario }`.
- L38: primer `.data` es el cuerpo de Axios; segundo `.data` es el campo del JSON de Laravel.
- L39: termina me.

CSRF es una proteccion para peticiones autenticadas mediante cookies. La cookie CSRF no significa que el usuario ya este autenticado. En este frontend se usa sesion por cookies, no un token guardado manualmente en localStorage.

### src/api/properties.api.ts

- L1: importa el cliente de API.
- L2: importa la forma de un alojamiento.
- L4: define el objeto de paginacion esperado.
- L5: pagina actual.
- L6: arreglo de alojamientos de esa pagina.
- L7: ultima pagina.
- L8: cantidad por pagina.
- L9: total de resultados.
- L10: cierra el tipo.
- L12-15: describe la respuesta exterior: mensaje y objeto paginado.
- L17: funcion asincrona que entrega un arreglo de alojamientos y admite cancelacion.
- L18-19: consulta el endpoint publico.
- L20-25: proporciona signal y el parametro de consulta `solo_activos: true`.
- L26: termina GET.
- L28: extrae el arreglo: cuerpo Axios -> data de Laravel -> data de paginacion.
- L29: termina la funcion.

La funcion descarta los metadatos de paginacion. La pantalla actual no permite cambiar de pagina: muestra la pagina que devuelve esa peticion.

### src/hooks/useProperties.ts

- L1: importa useQuery.
- L2: importa la funcion de red.
- L4: declara el hook.
- L5: registra/observa la consulta.
- L6: clave que identifica los alojamientos publicos en cache.
- L7: funcion ejecutada para obtenerlos; pasa la senal de cancelacion a Axios.
- L8: los considera frescos durante 60 segundos.
- L9: permite un reintento despues del primer fallo.
- L10: termina opciones.
- L12: construye lo que recibira HomePage.
- L13: entrega datos o un arreglo vacio si todavia no existen.
- L14: marca carga inicial o una peticion sin datos disponibles.
- L15-17: muestra un mensaje si hay error y ya no se esta consultando.
- L18: expone refetch con el nombre reload para reintentar manualmente.
- L19-20: cierran retorno y hook.

### src/hooks/useSession.ts

- L1: importa una comprobacion para identificar errores de Axios.
- L2: importa useQuery.
- L3: importa todas las funciones de autenticacion bajo authApi.
- L4: importa el tipo usuario.
- L6: define una clave compartida; `as const` conserva tipos literales y una tupla readonly para TypeScript.
- L8-10: abre el hook y configura la consulta con esa clave.
- L11: funcion que puede devolver usuario o null.
- L12-13: intenta consultar me, esperando el resultado para capturar un posible rechazo.
- L14: recibe el error si falla.
- L15-16: si el servidor responde 401, considera que no hay sesion y devuelve null.
- L17-19: otros errores se vuelven a lanzar para que React Query los registre.
- L20: termina la funcion de consulta.
- L21: los datos no se vuelven obsoletos por tiempo; aun pueden actualizarse explicitamente.
- L22: desactiva reintentos automaticos.
- L23: desactiva consulta al volver el foco a la ventana.
- L24: termina opciones.
- L25: normaliza la ausencia de datos a null.
- L27-31: expone usuario, carga y un booleano que indica si hay usuario.
- L32: termina el hook.

Observa una limitacion real: aunque React Query registra errores distintos de 401, el hook no los devuelve. Sin datos previos, un fallo de red puede terminar presentandose a otros componentes como ausencia de usuario. Ademas, una sesion que expira en el servidor no se detecta automaticamente por el simple paso del tiempo con esta configuracion.

### src/auth/auth-context.ts

- L1: importa createContext.
- L2: importa AuthUser.
- L4: declara la forma del valor compartido.
- L5: usuario o null.
- L6: indicador de carga.
- L7: indicador de autenticacion.
- L8: termina la interfaz.
- L10: crea el contexto con undefined como valor predeterminado para detectar la ausencia de proveedor.

### src/auth/AuthContext.tsx

- L1: importa ReactNode, tipo para contenido renderizable.
- L2: importa el contexto creado en el otro archivo.
- L3: importa el hook que consulta la sesion.
- L5: define AuthProvider y recibe children.
- L6: obtiene la sesion.
- L8: proporciona ese valor a sus descendientes.
- L9: muestra el contenido envuelto, en este proyecto App.
- L10-11: cierran proveedor y funcion.

Aunque los nombres se parecen, un archivo crea el contexto y el otro define el componente proveedor.

### src/hooks/useAuth.ts

- L1: importa useContext.
- L2: importa AuthContext.
- L4: declara el hook de acceso.
- L5: lee el valor del proveedor mas cercano.
- L7: detecta que no existe un proveedor aplicable.
- L8-10: lanza un error explicativo para el programador.
- L11: termina la condicion.
- L13: devuelve el valor del contexto.
- L14: termina la funcion.

### src/hooks/useRoleAccess.ts

- L1-2: importa UserRole y useAuth.
- L4: recibe el rol que se quiere comprobar.
- L5: obtiene el usuario.
- L7: `some` verifica si algun rol coincide; sin usuario devuelve false mediante `??`.
- L8: termina el hook.

### src/auth/ProtectedRoute.tsx

- L1: importa Navigate para redirigir y Outlet para continuar con rutas hijas.
- L2: importa el acceso a la sesion.
- L4-5: define el componente y obtiene autenticacion/carga.
- L7: mientras carga, muestra un estado accesible.
- L9-11: sin sesion redirige al login; replace sustituye la entrada actual del historial.
- L13: con sesion permite renderizar la ruta hija.
- L14: termina el componente.

### src/auth/RoleRoute.tsx

- L1-3: importa navegacion, comprobacion de rol y su tipo.
- L5-7: describe la prop obligatoria allowedRole.
- L9-11: recibe esa prop al crear el componente.
- L12: calcula si el usuario tiene permiso para esta rama visual.
- L14-16: si no tiene el rol, redirige a inicio.
- L18: si lo tiene, muestra la ruta hija.
- L19: termina el componente.

### src/hooks/useAuthForm.ts

- L1: importa estado local y el tipo de evento de formulario.
- L2: importa la deteccion de errores Axios.
- L3: importa mutations y acceso al cliente de cache.
- L4: importa las funciones de autenticacion.
- L5: importa tipos de respuesta y rol.
- L6-7: importa la sesion compartida y su clave de cache.
- L9: recibe si es formulario de registro.
- L10: obtiene usuario y carga de sesion.
- L11: obtiene el QueryClient proporcionado en main.
- L12: crea estado para un error de validacion local.
- L13: define que hacer despues de autenticarse correctamente.
- L14: cancela consultas de sesion pendientes para que no sobrescriban el resultado nuevo.
- L15: guarda el usuario recibido en la cache de sesion.
- L16: termina ese manejador.
- L17: prepara la mutation de login y su callback de exito.
- L18: prepara la mutation de registro con el mismo callback.
- L19: selecciona cual se usa segun registerMode.
- L20: determina si alguna operacion esta pendiente.
- L21: inicialmente prioriza el error local.
- L23: si no hay error local, revisa errores de la operacion remota.
- L24: comprueba que sea de Axios y describe su posible cuerpo JSON.
- L25: obtiene ese cuerpo si existe.
- L26: toma mensajes por campo, aplana los arreglos y los une con espacios.
- L27: si no existen, utiliza message o un mensaje de conexion.
- L28-30: para otros errores utiliza un mensaje general.
- L31: termina el manejo de errores.
- L33: define una funcion para limpiar errores.
- L34: vacia el mensaje local.
- L35-38: si no hay peticiones pendientes, reinicia los estados de ambas mutations. Esto no vacia los inputs.
- L39: termina resetErrors.
- L40: define el manejador de envio del formulario.
- L41: impide el envio HTML tradicional que recargaria/navegaria la pagina.
- L42: evita otro envio mientras hay una operacion pendiente.
- L43: limpia los errores anteriores.
- L44: lee los campos del formulario por su atributo name mediante FormData.
- L45: extrae correo, garantiza texto y elimina espacios en los extremos.
- L46: extrae contrasena sin eliminar espacios.
- L48: entra en el flujo de registro.
- L49: obtiene confirmacion de contrasena.
- L50-53: si no coinciden, guarda un error y detiene el envio.
- L54: inicia la mutation de registro.
- L55: obtiene nombre y elimina espacios externos.
- L56-57: incluye email y password; es abreviatura de `email: email` y `password: password`.
- L58: incluye la confirmacion con el nombre que espera el backend.
- L59: extrae el rol y afirma su tipo. El backend debe validar que sea permitido.
- L60: termina la llamada de registro.
- L61-63: para login envia solo correo y contrasena.
- L64: termina submit.
- L66-67: empieza el objeto de retorno e incluye la carga de sesion.
- L68-70: sin usuario no redirige; con ANFITRION va a `/host`, con otro usuario va a `/guest`.
- L71: incluye el estado de la operacion del formulario.
- L72: incluye el mensaje de error.
- L73: incluye la funcion de envio, sin ejecutarla todavia.
- L74: incluye la funcion para limpiar errores.
- L75-76: cierran objeto y hook.

Estos formularios son principalmente no controlados: el navegador conserva los valores de los inputs y submit los lee con FormData. No existe un useState por cada campo. Un input controlado tendria `value={estado}` y `onChange` para actualizar ese estado.

### src/hooks/useNavbar.ts

- L1-4: importa mutations, cliente de cache, API, sesion y clave.
- L6-8: define el hook, lee usuario/autenticacion y obtiene el cliente.
- L9-10: prepara una mutation que llama a logout.
- L11: al tener exito comienza la limpieza local.
- L12: cancela consultas pendientes.
- L13-15: elimina entradas de cache cuya primera parte de la clave no sea auth, incluida la de propiedades publicas.
- L16: guarda null en la cache de sesion.
- L17-18: termina callback y configuracion.
- L20-22: define el manejador que activa logout solo si no esta pendiente.
- L24-27: expone usuario, autenticacion y manejador.
- L28: expone el estado pendiente.
- L29: expone un mensaje si fallo el logout.
- L30-31: cierran retorno y hook.

Cambiar la cache de sesion actualiza useSession y el contexto. Por eso Navbar deja de mostrar el nombre sin tener que manipular HTML a mano.

### src/hooks/usePasswordField.ts

- L1: importa identificadores y estado de React.
- L3: recibe el texto de la etiqueta.
- L4: crea un identificador para relacionar label e input; no es un id de base de datos.
- L5: empieza con contrasena oculta.
- L6: prepara la funcion para invertir visibilidad.
- L8-10: devuelve id y estado visible.
- L11: calcula el tipo HTML del input.
- L12: calcula el texto accesible de la accion usando una plantilla de texto.
- L13: devuelve la funcion de alternancia.
- L14-15: cierran retorno y hook.

### src/hooks/usePropertyCard.ts

- L1-3: importa el tipo de evento, Property y auxiliares de imagen.
- L5: recibe un alojamiento.
- L6: busca la primera imagen marcada como portada.
- L7: si no encuentra portada, toma la primera imagen disponible.
- L8: define el manejador de error de carga de imagen.
- L9: comprueba que no se este usando ya la imagen de respaldo.
- L10: cambia el src del elemento que disparo el evento.
- L11-12: cierran condicion y manejador.
- L14: empieza el retorno.
- L15: convierte la ruta de portada a una URL utilizable.
- L16: usa caption o nombre del alojamiento como texto alternativo.
- L17: convierte el precio textual en numero y lo formatea para Colombia; no convierte moneda.
- L18: entrega el manejador.
- L19-20: cierran retorno y funcion.

### src/utils/imageUrl.ts

- L1: importa la base del backend.
- L2: construye la URL de la imagen de respaldo usando la base de Vite.
- L3: acepta una ruta opcional o null y devuelve texto.
- L4: si no hay contenido despues de quitar espacios, devuelve el respaldo.
- L5: elimina espacios externos.
- L6: una expresion regular reconoce http/https; devuelve esas URLs tal como estan.
- L7: usa VITE_STORAGE_URL o la ruta storage del backend; elimina barras finales.
- L8: une la base con la ruta, quitando barras iniciales y un prefijo storage duplicado.
- L9: termina la funcion.

### src/components/PasswordField.tsx

- L1: importa su hook.
- L3: declara las props.
- L4: texto de label.
- L5: nombre usado por FormData.
- L6: admite dos valores de autocompletado relacionados con contrasenas.
- L7: longitud minima opcional.
- L8: termina el tipo.
- L10: recibe y desestructura las props.
- L11: obtiene identificador, visibilidad y accion del hook.
- L13: empieza el contenedor.
- L14: htmlFor conecta la etiqueta con el id del input.
- L15: contenedor relativo para posicionar el boton.
- L16: input con id, nombre, tipo dinamico, autocompletado, obligatoriedad y longitud minima.
- L17: boton que alterna visibilidad; type=button evita enviar el formulario. aria-label lo nombra; aria-controls identifica el campo y title ofrece un texto emergente.
- L18: clases para posicion y apariencia del boton.
- L19: abre un icono SVG decorativo oculto al lector de pantalla.
- L20: dibuja el contorno del icono.
- L21: dibuja su circulo central.
- L22: agrega una linea cuando la contrasena es visible.
- L23-27: cierran icono, boton, contenedores y componente.

### src/components/AuthForm.tsx

- L1-4: importa enlaces/redireccion, logica, barra y campo de contrasena.
- L6: prop opcional registerMode, false de forma predeterminada.
- L7: obtiene estados y funciones del hook.
- L8: muestra carga mientras se comprueba la sesion.
- L9: redirige si ya hay usuario.
- L10: reutiliza una cadena de clases CSS para inputs.
- L11-13: abre fragmento, muestra Navbar y el contenedor principal.
- L14: cambia el titulo segun el modo.
- L15: conecta submit al envio y resetErrors a los cambios del formulario.
- L16: solo en registro aparece nombre, obligatorio y con longitud maxima.
- L17: campo de correo; type=email activa validacion basica del navegador.
- L18: campo de contrasena; cambia autocompletado y longitud minima segun modo.
- L19: abre contenido exclusivo del registro.
- L20: muestra orientacion sobre la contrasena; ese texto por si solo no valida letras y numeros.
- L21: solicita confirmacion.
- L22: selecciona rol; defaultValue establece HUESPED inicialmente.
- L23: termina contenido exclusivo.
- L24: presenta un error accesible si existe.
- L25: boton de envio, deshabilitado durante la operacion. Sin type explicito dentro del formulario actua como submit.
- L26: cierra el formulario.
- L27: enlace que alterna login/registro y limpia errores al pulsarlo.
- L28-30: cierran la estructura y el componente.

### src/components/Navbar.tsx

- L1-2: importa Link y el hook de la barra.
- L4-5: define componente y obtiene datos/acciones.
- L7-9: abre cabecera y navegacion con estilos.
- L10-15: enlace de marca hacia `/`; Link permite navegacion dentro de la aplicacion.
- L17: agrupa acciones.
- L18: decide si mostrar el contenido autenticado.
- L19-22: fragmento con saludo y nombre.
- L24-29: boton de logout conectado al manejador, deshabilitado mientras espera.
- L30: cambia su texto durante el cierre.
- L31-33: cierra la rama autenticada y abre la alternativa.
- L34-37: enlace de inicio de sesion.
- L39-44: enlace de registro.
- L45-46: termina la alternativa.
- L47: muestra un error de logout si existe.
- L48-52: cierra contenedores y componente.

### src/components/PropertyCard.tsx

- L1-2: importa calculos de tarjeta y tipo Property.
- L4-6: exige una prop property de ese tipo.
- L8-10: recibe el alojamiento.
- L11: obtiene imagen, texto alternativo, precio y manejador de error.
- L13-14: abre retorno y article; las clases agregan borde redondeado, sombra y movimiento al pasar el cursor.
- L15: abre imagen.
- L16: key provoca que React reemplace ese elemento si cambia imageUrl.
- L17: URL que carga el navegador.
- L18: loading=lazy permite aplazar la carga de imagenes lejanas a la parte visible.
- L19: si falla, ejecuta el manejador de respaldo.
- L20: texto alternativo.
- L21-22: dimensiones/recorte y cierre de imagen.
- L24-26: contenedores y encabezado del alojamiento.
- L27: nombre recibido del backend.
- L28-33: cierra encabezado y muestra una etiqueta fija de Nuevo; no es una valoracion calculada.
- L35-37: ciudad y departamento.
- L39-41: descripcion limitada visualmente a dos lineas.
- L43-45: precio formateado con simbolo dolar literal.
- L46: `{' '}` introduce un espacio explicito despues de strong.
- L47: codigo de moneda y texto por noche.
- L48-52: cierran tarjeta y funcion.

### src/pages/HomePage.tsx

- L1-3: importa barra, tarjeta y consulta.
- L5: declara la pagina.
- L6-11: obtiene alojamientos, carga, error y funcion de reintento.
- L13-15: inicia contenido y muestra barra.
- L17-26: contenedor principal, titulo y descripcion.
- L28-32: mensaje de carga si loading es verdadero.
- L34-36: bloque de error y su mensaje.
- L38-44: boton que llama reload al pulsarse; `void` descarta el valor de retorno de la promesa, no la espera ni captura errores por si mismo.
- L45-46: termina bloque de error.
- L48-50: mensaje vacio si termino la carga, no hay error y no hay resultados.
- L52-53: muestra la rejilla cuando no esta cargando ni hay error.
- L54: transforma cada alojamiento en un elemento visual con map.
- L55: crea PropertyCard.
- L56: key identifica establemente la tarjeta entre sus hermanas; no se recibe como una prop normal.
- L57: entrega el alojamiento mediante prop.
- L58-61: cierran tarjeta, map, rejilla y condicion.
- L62-65: cierran pagina y funcion.

### src/pages/LoginPage.tsx y RegisterPages.tsx

En ambos, L1 importa AuthForm. L2 declara/exporta una pagina que lo muestra. LoginPage usa el modo predeterminado. RegisterPage pasa registerMode=true. El archivo del registro se llama RegisterPages.tsx, pero el componente exportado se llama RegisterPage; eso es valido.

### src/pages/guest/GuestDashboard.tsx y host/HostDashboard.tsx

Ambos tienen la misma estructura de 13 lineas:

- L1: define y exporta el componente correspondiente.
- L2-3: comienza retorno y section.
- L4-6: titulo del panel, huesped o anfitrion.
- L8-10: texto sobre reservas/servicios o administracion de alojamientos.
- L11-13: cierran section, retorno y funcion.

Actualmente son pantallas iniciales con texto; no implementan todavia esas operaciones.

### src/layouts/GuestLayout.tsx

- L1-2: importa Outlet y Navbar.
- L4: declara la estructura compartida.
- L5-7: abre retorno/fragmento y muestra Navbar.
- L9: contenedor principal con ancho maximo y espaciado.
- L10: Outlet coloca la pagina hija de la ruta.
- L11-14: cierran estructura y funcion.

### src/layouts/HostLayout.tsx

L1 reexporta GuestLayout como exportacion predeterminada. Ambos roles comparten ahora el mismo diseno de barra y contenedor. Esto no elimina sus diferencias de rutas ni roles.

### src/types/auth.ts

- L1: UserRole solo admite los textos HUESPED y ANFITRION.
- L3-6: AuthRole contiene id numerico y name restringido a UserRole.
- L8: comienza AuthUser.
- L9: id numerico.
- L10: identificador UUID como texto.
- L11: nombre.
- L12: correo.
- L13: arreglo de roles.
- L14: termina usuario.
- L16-19: LoginCredentials exige email y password textuales.
- L21: comienza RegisterData.
- L22-26: exige nombre, correo, contrasena, confirmacion y rol.
- L27: termina el tipo de registro.
- L29-32: AuthResponse exige un mensaje y un usuario dentro de data.

### src/types/property.ts

- L1: comienza PropertyImage.
- L2: id numerico de la imagen.
- L3: UUID textual.
- L4: id del alojamiento asociado.
- L5: ruta de imagen.
- L6: descripcion de imagen o null.
- L7: indica si es portada.
- L8: orden de presentacion.
- L9: indica si esta activa.
- L10: termina imagen.
- L12-17: PropertyHost tiene id, UUID, nombre y correo.
- L19: comienza Property.
- L20-22: id, UUID y user_id del propietario.
- L23-25: nombre, descripcion y tipo de alojamiento.
- L26-28: direccion, departamento y ciudad.
- L29-32: capacidad maxima, banos, habitaciones y camas.
- L33: precio declarado como texto; usePropertyCard lo convierte a numero para mostrarlo.
- L34: codigo de moneda.
- L35-36: horarios de entrada/salida, que pueden ser null.
- L37: estado activo.
- L38: anfitrion opcional.
- L39: arreglo de imagenes.
- L40: termina Property.

Los tipos no validan JSON en tiempo de ejecucion. Escribir `http.get<PropertiesResponse>` informa al compilador de lo esperado; no demuestra que Laravel realmente lo haya enviado.

## 6. Estilos y recursos

### src/index.css

L1 importa Tailwind. main.tsx carga este archivo y vite.config.ts activa el plugin que procesa sus estilos.

Estas clases de tu proyecto se leen asi:

| Clase | Efecto |
| --- | --- |
| `flex` / `grid` | Activa distribucion flex o rejilla. |
| `items-center` | Centra en el eje transversal de flex. |
| `justify-between` | Separa elementos a lo largo del eje principal. |
| `mx-auto` | Margenes horizontales automaticos. |
| `max-w-7xl` | Limita el ancho con un valor de la escala del tema. |
| `px-4`, `py-8` | Espaciado interior horizontal y vertical. |
| `mt-2`, `mb-8`, `gap-6` | Margen superior, inferior y separacion entre elementos. |
| `text-3xl`, `font-bold` | Tamano de texto y peso de fuente. |
| `bg-white`, `text-red-700` | Color de fondo y texto. |
| `rounded-lg`, `shadow-sm` | Esquinas redondeadas y sombra. |
| `sm:grid-cols-2` | Dos columnas desde el breakpoint sm. |
| `lg:grid-cols-3`, `xl:grid-cols-4` | Mas columnas en anchos mayores. |
| `hover:shadow-lg` | Sombra al colocar el cursor. |
| `disabled:opacity-50` | Reduce opacidad cuando esta deshabilitado. |

### src/App.css

Este archivo no esta importado por los archivos actuales revisados. Sus reglas no afectan las pantallas solo por existir. Es CSS de una plantilla anterior; este es su recorrido:

- L1-9: `.counter` configura fuente, padding, radio, colores mediante variables CSS, borde transparente, transicion y margen inferior.
- L11-13: `&:hover` cambia el borde del mismo selector al pasar el cursor.
- L14-18: `&:focus-visible` dibuja y separa un contorno para foco visible; cierra counter.
- L20-21: `.hero` establece una referencia de posicion.
- L23-28: los hijos base/framework/vite reciben posiciones horizontales y margenes comunes.
- L30-34: base define ancho, posicion relativa y nivel de apilamiento.
- L36-39: framework y vite usan posicion absoluta.
- L41-47: framework define nivel, posicion vertical, altura y transformacion 3D.
- L49-57: vite define su propia posicion, tamano y transformacion; cierra hero.
- L59-65: center usa flex en columna, separacion, alineacion y crecimiento.
- L67-71: con ancho de hasta 1024px ajusta espaciado; cierra center.
- L73-76: next-steps usa flex, borde superior y texto a la izquierda.
- L78-84: sus div hijos directos crecen por igual y tienen padding adaptable.
- L86-90: dimensiona iconos y su margen inferior.
- L92-96: en pantallas mas estrechas cambia a columna y centra texto.
- L98-105: docs tiene borde derecho que se cambia por borde inferior en pantallas estrechas.
- L107-112: la lista elimina vinetas/padding, usa flex y establece separacion/margen.
- L114-116: altura del logo.
- L118-128: los enlaces reciben color, fuente, esquinas, fondo, flex, padding, alineacion y transicion de sombra.
- L130-132: sombra al pasar el cursor.
- L133-137: dimensiones del icono del boton y cierre del enlace.
- L139-142: adapta margen, salto de linea y centrado de la lista.
- L144-146: cada item toma aproximadamente la mitad del ancho disponible.
- L148-154: enlaces ocupan el ancho y centran contenido; border-box incluye borde/padding en el ancho.
- L156-162: spacer crea un espacio vertical con borde y menor altura en pantallas estrechas.
- L164-167: ticks se posiciona relativamente y ocupa el ancho.
- L168-174: crea dos pseudoelementos vacios posicionados, con bordes transparentes.
- L176-179: coloca uno a la izquierda y colorea su borde izquierdo.
- L180-184: coloca otro a la derecha y colorea su borde derecho; cierra la regla.

`var(--nombre)` busca una variable CSS definida en otra regla. `&` refiere al selector padre. `@media` aplica reglas solo cuando se cumple la condicion de pantalla. Estas reglas no son hooks ni logica de React.

### public/ y src/assets/

`public/property-placeholder.svg` es la imagen de respaldo utilizada por imageUrl.ts. `public/favicon.svg` se referencia desde index.html. `public/icons.svg` es otro recurso estatico. Los SVG contienen instrucciones de dibujo, no componentes de la aplicacion.

`src/assets/hero.png`, `react.svg` y `vite.svg` estan disponibles, pero no aparecen importados por los componentes revisados. Un PNG contiene datos binarios, por lo que no tiene lineas de codigo que ejecutar. Un recurso en assets normalmente se integra mediante import; uno en public se solicita por URL.

## 7. Configuracion explicada

### vite.config.ts

- L1-3: importa plugins de Tailwind/React y helpers de Vite.
- L5: exporta configuracion que depende del modo, por ejemplo development.
- L6: carga variables de entorno desde el directorio actual; el prefijo vacio permite leerlas en esta configuracion, no implica exponerlas todas al navegador.
- L7: destino del backend o localhost:8000 por defecto.
- L8-12: configura proxy con destino, cambio de Host hacia el destino y eliminacion del atributo Domain de cookies reenviadas.
- L14-15: entrega configuracion y activa plugins.
- L16-17: abre configuracion del servidor de desarrollo y proxy.
- L18: reenvia `/api` a Laravel conservando el prefijo.
- L19: reenvia `/storage`.
- L20-23: reenvia `/backend` quitando ese prefijo.
- L24-27: cierran la configuracion.

Ejemplo: el navegador pide `/backend/login`; Vite lo reenvia como `/login` al backend. Este proxy pertenece al servidor de desarrollo. El despliegue necesita sus propias rutas o configuracion equivalente.

### .env.example

- L1: comentario sobre el proxy local.
- L2: base de endpoints de datos: `/api`.
- L3: base de autenticacion: `/backend`.
- L4: base de imagenes: `/storage`.
- L5: servidor al que Vite reenvia esas rutas.
- L6: recuerda configurar el despliegue.

El archivo .env aporta los valores locales. Las variables VITE_ pueden incorporarse al codigo del navegador: no deben contener secretos. No es necesario publicar contrasenas del backend para usar esta configuracion.

### package.json

- L1-5: objeto de configuracion, nombre, marca privada, version y modulos ES.
- L6-11: comandos. dev inicia Vite; build comprueba TypeScript y despues construye; lint ejecuta ESLint; preview sirve una construccion existente para revisarla.
- L12-18: dependencias de aplicacion: React Query, Axios, React, React DOM y Router.
- L19-32: herramientas de desarrollo: reglas ESLint, tipos para Node/React, plugin de React, TypeScript y Vite.
- L33: termina el archivo.

Una dependencia declarada no garantiza que este instalada. `npm install` instala lo que describe el proyecto. El archivo package-lock.json, si esta presente, registra resoluciones exactas para instalaciones reproducibles; no contiene logica de tus pantallas. La configuracion importa ademas el plugin de Tailwind: para entender su resolucion tambien cuenta la instalacion del repositorio padre.

### tsconfig.json

- L1-2: abre configuracion sin una lista propia de archivos.
- L3-6: referencia dos configuraciones: aplicacion del navegador y configuracion de Vite.
- L7: cierra el objeto.

### tsconfig.app.json

- L2: abre opciones del compilador.
- L3: ubicacion de informacion auxiliar para compilacion incremental.
- L4: objetivo de JavaScript ES2023.
- L5: tipos de APIs ES2023 y DOM del navegador.
- L6: modulos ES modernos.
- L7: incluye tipos de Vite como import.meta.env.
- L8: permite resolver extensiones arbitrarias con las declaraciones apropiadas.
- L9: omite comprobacion interna de archivos de declaraciones de librerias.
- L11: comentario que agrupa opciones de bundler.
- L12: resuelve imports siguiendo convenciones de herramientas de empaquetado.
- L13: permite extensiones TypeScript en imports.
- L14: conserva la sintaxis de modulos y distingue imports de tipos.
- L15: trata archivos como modulos.
- L16: TypeScript comprueba sin emitir JavaScript; Vite realiza la construccion.
- L17: utiliza la transformacion moderna de JSX.
- L19: comentario sobre comprobaciones.
- L20-21: detecta variables y parametros no usados.
- L22: restringe sintaxis TypeScript a la que puede borrarse al transformar.
- L23: detecta ciertos casos de switch que pasan al siguiente sin terminar.
- L24-26: termina opciones e incluye src.

### tsconfig.node.json

- L2-4: opciones, ruta auxiliar de compilacion y objetivo ES2023.
- L5: APIs ES2023, sin incluir DOM.
- L6: tipos de Node para herramientas como Vite.
- L7: omite comprobacion interna de declaraciones de librerias.
- L9: comentario organizativo.
- L10: modulos y resolucion compatibles con Node mediante nodenext.
- L11-14: permite imports con extension TS, conserva sintaxis, fuerza modulos y no emite codigo.
- L16: comentario organizativo.
- L17-20: detecta elementos no usados, limita sintaxis borrable y controla switch.
- L21-23: termina opciones e incluye vite.config.ts.

### eslint.config.js

- L1: reglas recomendadas de JavaScript.
- L2: lista de variables globales conocidas.
- L3: reglas para uso correcto de hooks.
- L4: reglas relacionadas con actualizacion de componentes en desarrollo.
- L5: soporte/reglas para TypeScript.
- L6: helpers de configuracion.
- L8: exporta el arreglo de configuraciones.
- L9: excluye dist.
- L10-11: aplica el bloque a archivos ts/tsx.
- L12-17: combina los conjuntos recomendados.
- L18-20: reconoce variables del navegador, como window y document.
- L21-22: termina configuracion.

### .gitignore y README.md

`.gitignore` L1-8 ignora logs; L10-13 ignora dependencias, resultados de build y archivos .local; L15-24 ignora archivos de editores/sistema, con una excepcion para extensiones recomendadas de VS Code. Ignorar un archivo no elimina uno que Git ya estuviera siguiendo.

README.md es documentacion de la plantilla: L1-12 presenta React/Vite y menciona el compilador de React; L14-45 explica opciones adicionales de lint; L47-75 muestra plugins opcionales y ejemplos. Esos bloques son ejemplos documentales: no se ejecutan ni instalan herramientas automaticamente.

## 8. Login completo, conectado paso a paso

1. App selecciona LoginPage por la URL `/login`.
2. LoginPage muestra AuthForm con registerMode=false.
3. AuthForm obtiene logica y estado mediante useAuthForm.
4. Al enviar, submit evita la navegacion del formulario y lee email/password.
5. login.mutate activa authApi.login.
6. authApi.login solicita la cookie CSRF y envia POST `/login` mediante el cliente de sesion.
7. Laravel responde con un usuario dentro de data si la autenticacion es exitosa.
8. updateSession cancela una consulta antigua y coloca el usuario en la cache `['auth', 'me']`.
9. useSession observa ese cambio y AuthProvider comparte la nueva sesion.
10. useAuthForm calcula redirectTo segun los roles; AuthForm renderiza Navigate.
11. ProtectedRoute comprueba sesion, RoleRoute comprueba rol y el layout muestra el panel.

Si falla, el estado de la mutation cambia y el formulario muestra el mensaje. El flujo no necesita recargar manualmente la pagina.

## 9. Como distinguir que herramienta necesitas

| Necesidad | Lugar o herramienta en este proyecto |
| --- | --- |
| Mostrar/ocultar una contrasena | useState dentro de usePasswordField. |
| Pasar un alojamiento a una tarjeta | Prop property. |
| Saber quien esta conectado desde Navbar | useAuth y Context. |
| Consultar alojamientos y manejar cache | useProperties y useQuery. |
| Enviar el login | useMutation y authApi.login. |
| Cambiar la URL y pantalla | React Router. |
| Compartir barra y contenedor | Layout con Outlet. |
| Describir los campos de una respuesta | Interface/type de TypeScript. |
| Formatear una ruta de imagen | Funcion auxiliar en utils. |
| Escuchar un evento externo mientras existe un componente | useEffect con limpieza, cuando sea necesario. |
| Pedir confirmacion sobre la pantalla | Componente modal; no implementado actualmente. |

## 10. Pequenos ejercicios de lectura

1. Abre usePasswordField.ts. Sigue el valor false hasta el type del input en PasswordField.tsx. Al pulsar el boton, el siguiente valor sera true y el type sera text.
2. Abre HomePage.tsx. Busca de donde sale property: cada elemento de properties.map. Luego sigue la prop hasta PropertyCard.
3. Abre auth.api.ts. Distingue response.data, el JSON de Axios, de response.data.data, el usuario dentro de ese JSON.
4. Abre main.tsx. Comprueba por que AuthProvider necesita estar dentro de QueryClientProvider: useSession llama a useQuery.
5. Abre useProperties.ts. Cambiar staleTime cambia la frescura de cache; no crea un intervalo de actualizacion.

Orden sugerido de estudio: componente/JSX -> props -> useState -> hooks propios -> peticiones async/Axios -> React Query -> Context -> rutas. Puedes recorrer esta guia al lado del archivo correspondiente, sin memorizar todos los nombres de una vez.
