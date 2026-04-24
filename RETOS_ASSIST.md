# Guía de Implementación - Retos Taller 3 (Arquitectura FSD)

Eres un asistente experto en React Native, Expo Router y la arquitectura Feature-Sliced Design (FSD). Tu objetivo es ayudarme a implementar los siguientes retos en este repositorio paso a paso, respetando estrictamente las capas de FSD (`shared`, `entities`, `features`, `widgets`, `pages`, `app`).

A continuación te daré las instrucciones para cada reto.

---

## PROMPT PARA EL RETO 0: Reglas de Fronteras FSD
**Por favor, implementa lo siguiente:**
Configura reglas en nuestro linter para bloquear imports incorrectos entre las capas de FSD. 
1. Revisa el archivo `eslint.config.js`.
2. Añade configuraciones (usando reglas como `no-restricted-imports` o integrando un plugin de fronteras si es viable) para asegurar que:
   - `shared` no pueda importar de ninguna otra capa.
   - `entities` solo pueda importar de `shared`.
   - `features` solo pueda importar de `entities` y `shared`.
   - `widgets` pueda importar de `features`, `entities` y `shared`.
   - `pages` pueda importar de `widgets`, `features`, `entities` y `shared`.
Explícame brevemente cómo quedó configurado.

---

## PROMPT PARA EL RETO 1: Búsqueda y Filtros
**Por favor, implementa lo siguiente respetando FSD:**
1. En `src/entities/proyecto-tesis/api/proyectoApi.tsx`, agrega un método `search(query: string)` que consulte a Supabase filtrando por el título del proyecto (usando `.ilike` o similar).
2. En `src/pages/home/ui/HomeScreen.tsx`, agrega un estado local para la búsqueda (`searchQuery`).
3. Agrega un componente `TextInput` visualmente agradable en la parte superior de `HomeScreen` que permita escribir el título.
4. Conecta el `TextInput` para que, al escribir, utilice `proyectoApi.search()` y actualice la lista de proyectos renderizada.

---

## PROMPT PARA EL RETO 2: Detalle del Proyecto (Ruta Dinámica)
**Por favor, implementa lo siguiente usando Expo Router:**
1. Crea un nuevo archivo en la ruta `app/proyecto/[id].tsx`.
2. En `src/entities/proyecto-tesis/api/proyectoApi.tsx`, asegúrate de que exista un método `getById(id: string)` para obtener un proyecto individual desde Supabase.
3. En `app/proyecto/[id].tsx`, usa `useLocalSearchParams()` para obtener el ID.
4. Llama a la API para obtener los datos y muestra el "detalle completo" del proyecto en una vista bien diseñada.
5. Actualiza `ProyectoCard.tsx` (o donde se renderice la lista en `HomeScreen`) para que al tocar la tarjeta, navegue a `/proyecto/${id}` usando el router de Expo.

---

## PROMPT PARA EL RETO 3: Edición de Proyecto
**Por favor, implementa lo siguiente:**
1. En `src/entities/proyecto-tesis/api/proyectoApi.tsx`, implementa la función `update(id: string, data: Partial<Proyecto>)` para actualizar el registro en Supabase.
2. Crea una nueva feature/ruta (por ejemplo `app/proyecto/editar/[id].tsx`) para manejar la edición.
3. Reutiliza o adapta el formulario existente (`RegistroProyectoForm.tsx` o crea uno nuevo en la capa `features`) asegurándote de que los campos vengan pre-llenados con los datos actuales del proyecto.
4. Al hacer submit, debe llamar a `update()` y regresar a la pantalla anterior.

---

## PROMPT PARA EL RETO 4: Eliminar Proyecto con Confirmación
**Por favor, implementa lo siguiente:**
1. En `src/entities/proyecto-tesis/api/proyectoApi.tsx`, implementa un método `delete(id: string)` si aún no existe.
2. Abre `src/widgets/proyecto-card/ProyectoCard.tsx`.
3. Agrega un botón o ícono visual para "Eliminar" (puedes usar colores de advertencia, como rojo).
4. Al presionar el botón, NO elimines inmediatamente. Usa `Alert.alert` de React Native para mostrar un diálogo nativo pidiendo confirmación ("¿Estás seguro de eliminar este proyecto?").
5. Solo si el usuario confirma, ejecuta el borrado en Supabase y actualiza la lista.

---

## PROMPT PARA EL RETO 5: Validaciones de Autenticación / Formularios
**Por favor, implementa lo siguiente:**
1. Revisa el formulario en `src/features/registro-proyecto/ui/RegistroProyectoForm.tsx`.
2. Integra controles de validación. Si ya hay una librería de formularios en `package.json` (como `react-hook-form` o `@tanstack/react-form`), utilízala. Si no, recomiéndame una e intégrala.
3. Asegúrate de que los campos requeridos (como título, autor, etc.) tengan validación, que muestren mensajes de error visuales debajo de cada input si el usuario intenta enviar el formulario vacío o con datos inválidos.

---

## PROMPT PARA EL RETO 6: Identidad Visual ESFOT-EPN
**Por favor, implementa lo siguiente en la UI:**
Nuestra aplicación debe reflejar la identidad visual de la ESFOT - Escuela Politécnica Nacional.
1. Revisa `constants/theme.ts` y cualquier archivo de estilos globales o hooks como `useThemeColor`.
2. Actualiza la paleta de colores para usar los colores institucionales:
   - Azul Politécnico: `#0033A0` (para fondos de cabecera, botones principales).
   - Rojo Politécnico: `#C41230` (para botones de eliminar, alertas o detalles secundarios).
3. Asegúrate de que el estilo de los botones, barras de navegación y tarjetas (`ProyectoCard`) se ajusten a esta nueva paleta para darle una apariencia institucional y profesional.