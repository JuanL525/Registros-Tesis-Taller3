# Guía de Implementación - Reto Autenticación con Supabase Auth

Eres un asistente experto en React Native, Expo Router y la arquitectura Feature-Sliced Design (FSD). Tu objetivo es implementar un sistema de autenticación completo usando Supabase Auth, protegiendo las rutas de la aplicación para que solo los usuarios autenticados puedan acceder a ver y registrar proyectos.

Respeta estrictamente las capas de FSD (`shared`, `entities`, `features`, `widgets`, `pages`, `app`) en cada paso.

---

## CONTEXTO DEL PROYECTO

- **Backend:** Supabase (ya configurado con su cliente en `src/shared/api/supabaseClient.ts` o similar).
- **Navegación:** Expo Router con grupos de rutas `(tabs)` o similar ya existente.
- **Arquitectura:** Feature-Sliced Design estricto.
- **Librería de formularios:** `react-hook-form` (ya en `package.json`).

---

## PASO 1: Entidad de Sesión en la capa `shared`

**Por favor, implementa lo siguiente:**

1. Abre o crea `src/shared/session/model/sessionStore.ts`. Este será el store global de sesión usando React Context (sin librerías externas).
2. Define la interfaz de sesión:
   ```ts
   interface SessionState {
     user: import('@supabase/supabase-js').User | null;
     isLoading: boolean;
   }
   ```
3. Crea un `SessionContext` con `createContext` y un `SessionProvider` que:
   - En su `useEffect`, llame a `supabase.auth.getSession()` al montar para restaurar la sesión si ya existe.
   - Se suscriba a `supabase.auth.onAuthStateChange(...)` para reaccionar a login/logout en tiempo real.
   - Exponga `user`, `isLoading` y las funciones `signIn(email, password)` y `signOut()`.
4. Crea un hook `useSession()` que consuma el contexto y lance un error claro si se usa fuera del provider.
5. Exporta todo desde `src/shared/session/index.ts`.

---

## PASO 2: Feature de Login

**Por favor, implementa lo siguiente respetando FSD:**

1. Crea la carpeta `src/features/auth-login/`.
2. Dentro de `src/features/auth-login/ui/LoginForm.tsx`, construye el formulario de login usando `react-hook-form`:
   - Campo `email`: tipo email, requerido, validación de formato.
   - Campo `password`: tipo password, requerido, mínimo 6 caracteres.
   - Botón "Iniciar Sesión" que muestre un `ActivityIndicator` mientras se procesa.
   - Muestra un mensaje de error general debajo del botón si Supabase devuelve un error (ej: "Credenciales inválidas").
3. El componente llama a `useSession().signIn(email, password)` al hacer submit.
4. Usa los colores institucionales ya definidos (`#0033A0` para el botón principal).
5. Exporta desde `src/features/auth-login/index.ts`.

---

## PASO 3: Pantalla de Login en la capa `pages`

**Por favor, implementa lo siguiente:**

1. Crea `src/pages/login/ui/LoginScreen.tsx`.
2. Esta pantalla debe:
   - Mostrar el logo o nombre de la institución (ESFOT - EPN) en la parte superior.
   - Renderizar el componente `LoginForm` de la feature anterior.
   - Ser visualmente limpia, con fondo blanco o azul institucional suave.
3. Exporta desde `src/pages/login/index.ts`.

---

## PASO 4: Ruta de Login en Expo Router

**Por favor, implementa lo siguiente:**

1. Crea el archivo `app/login.tsx` que simplemente renderice `LoginScreen` desde la capa `pages`.
2. Asegúrate de que esta ruta NO esté dentro del grupo de rutas protegidas (por ejemplo, si usas un grupo `(app)` o `(tabs)`, `login.tsx` debe quedar fuera de él).

---

## PASO 5: Guardia de Navegación (Route Guard)

**Por favor, implementa lo siguiente usando el layout raíz de Expo Router:**

1. Abre o crea `app/_layout.tsx` (el layout raíz).
2. Envuelve toda la aplicación con el `SessionProvider` creado en el Paso 1.
3. Dentro del layout, crea un componente interno `AuthGuard` (o usa el hook `useSession` directamente) que:
   - Mientras `isLoading` sea `true`, muestre un `ActivityIndicator` centrado en pantalla para evitar el parpadeo de rutas.
   - Si `user` es `null` (no autenticado), use `router.replace('/login')` para redirigir.
   - Si `user` existe, permita renderizar los `<Slot />` normales.
4. Asegúrate de que la ruta `/login` quede excluida de la redirección para evitar bucles infinitos (puedes usar `useSegments()` de Expo Router para detectar en qué ruta está el usuario).

---

## PASO 6: Botón de Cerrar Sesión

**Por favor, implementa lo siguiente:**

1. En la pantalla principal (`HomeScreen` o en el header/tab bar), agrega un botón o ícono de "Cerrar Sesión".
2. Al presionar, usa `Alert.alert` para pedir confirmación: "¿Deseas cerrar sesión?".
3. Si el usuario confirma, llama a `useSession().signOut()`.
4. La guardia del Paso 5 se encargará automáticamente de redirigir a `/login`.

---

## PASO 7: Asociar Proyectos al Usuario Autenticado (opcional pero recomendado)

**Por favor, implementa lo siguiente:**

1. En `src/entities/proyecto-tesis/api/proyectoApi.tsx`, al crear un proyecto con `create(data)`, incluye el `user_id` del usuario autenticado:
   ```ts
   const { data: { user } } = await supabase.auth.getUser();
   const payload = { ...data, user_id: user?.id };
   ```
2. Asegúrate de que en tu tabla de Supabase exista la columna `user_id` (tipo `uuid`, referencia a `auth.users`).
3. Activa **Row Level Security (RLS)** en la tabla de proyectos en el dashboard de Supabase con una política que permita al usuario solo ver y modificar sus propios registros:
   ```sql
   -- Política de SELECT
   CREATE POLICY "Users can view own projects"
   ON public.proyectos FOR SELECT
   USING (auth.uid() = user_id);

   -- Política de INSERT
   CREATE POLICY "Users can insert own projects"
   ON public.proyectos FOR INSERT
   WITH CHECK (auth.uid() = user_id);
   ```
4. Actualiza el método `getAll()` para que el filtro de RLS se aplique automáticamente (con el cliente de Supabase autenticado, esto ocurre solo).

---

## VERIFICACIÓN FINAL

Una vez implementado todo, confirma que:
- [ ] Un usuario no autenticado que abre la app es redirigido a `/login`.
- [ ] Tras un login exitoso, la app navega automáticamente a la pantalla principal.
- [ ] Al cerrar sesión, la app regresa a `/login`.
- [ ] Las capas FSD no tienen imports cruzados incorrectos (corre `npx expo lint`).
- [ ] El formulario de login muestra errores si se envía vacío o con credenciales incorrectas.