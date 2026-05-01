# Guía de Implementación - Reto Supabase Storage (Carga de PDF)

Eres un asistente experto en React Native, Expo Router y la arquitectura Feature-Sliced Design (FSD). Tu objetivo es integrar Supabase Storage en la aplicación para permitir que el formulario de registro/edición de proyectos tenga un campo **"Documento"** que suba un archivo PDF y persista su URL en la base de datos.

Respeta estrictamente las capas de FSD en cada paso.

---

## CONTEXTO DEL PROYECTO

- **Backend:** Supabase (cliente ya configurado).
- **Formulario existente:** `src/features/registro-proyecto/ui/RegistroProyectoForm.tsx` con `react-hook-form`.
- **Entidad:** `src/entities/proyecto-tesis/` con su modelo `Proyecto` y su `proyectoApi.tsx`.
- **Arquitectura:** Feature-Sliced Design estricto.

---

## PASO 1: Instalar la dependencia de selector de archivos

**Por favor, ejecuta el siguiente comando e instala la librería:**

```bash
npx expo install expo-document-picker
```

> `expo-document-picker` permite al usuario seleccionar archivos del sistema (incluyendo PDFs) tanto en iOS como en Android. No requiere configuración nativa adicional en Expo Go o development builds estándar.

---

## PASO 2: Configurar el Bucket en Supabase

**Por favor, guíame para hacer lo siguiente en el dashboard de Supabase (https://supabase.com/dashboard):**

1. Ve a **Storage** en el menú lateral.
2. Crea un nuevo bucket llamado `documentos-proyectos`.
3. Configúralo como **público** (Public bucket) para que las URLs de descarga sean accesibles sin token adicional. Si la app requiere privacidad, configúralo como privado y usa URLs firmadas (explícame ambas opciones).
4. En **Storage > Policies**, añade las siguientes políticas RLS para el bucket:
   ```sql
   -- Permitir a usuarios autenticados subir archivos
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'documentos-proyectos');

   -- Permitir lectura pública de los archivos
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'documentos-proyectos');

   -- Permitir al dueño eliminar su archivo
   CREATE POLICY "Owner can delete"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'documentos-proyectos' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

---

## PASO 3: Servicio de Storage en la capa `shared`

**Por favor, implementa lo siguiente:**

1. Crea el archivo `src/shared/api/storageService.ts`.
2. Implementa la función `uploadPdf(fileUri: string, fileName: string, userId: string): Promise<string>`:
   - Convierte el archivo desde su URI local a un `Blob` o `ArrayBuffer` usando `fetch(fileUri).then(r => r.blob())`.
   - Sube el archivo a Supabase Storage en la ruta `${userId}/${Date.now()}_${fileName}` dentro del bucket `documentos-proyectos`.
   - Retorna la URL pública del archivo usando `supabase.storage.from('documentos-proyectos').getPublicUrl(path).data.publicUrl`.
3. Implementa también `deletePdf(filePath: string): Promise<void>` para limpiar archivos huérfanos cuando se edite o elimine un proyecto.
4. Maneja los errores lanzando excepciones descriptivas.
5. Exporta desde `src/shared/api/index.ts`.

---

## PASO 4: Actualizar el modelo de Proyecto

**Por favor, implementa lo siguiente:**

1. Abre `src/entities/proyecto-tesis/model/types.ts` (o donde esté definida la interfaz `Proyecto`).
2. Agrega el campo opcional:
   ```ts
   documento_url?: string | null;
   ```
3. En `src/entities/proyecto-tesis/api/proyectoApi.tsx`, asegúrate de que los métodos `create()` y `update()` incluyan el campo `documento_url` en el payload enviado a Supabase.

---

## PASO 5: Componente `DocumentoPicker` en la capa `shared`

**Por favor, implementa lo siguiente:**

1. Crea `src/shared/ui/DocumentoPicker/DocumentoPicker.tsx`.
2. El componente recibe las siguientes props:
   ```ts
   interface DocumentoPickerProps {
     value?: string | null;       // URL actual del documento (si ya existe)
     onChange: (uri: string, name: string) => void; // Callback con URI local y nombre
     onClear: () => void;          // Callback para quitar el archivo seleccionado
   }
   ```
3. Internamente:
   - Usa `DocumentPicker.getDocumentAsync({ type: 'application/pdf' })` de `expo-document-picker` para abrir el selector.
   - Si el usuario selecciona un archivo, llama a `onChange(uri, name)`.
   - Muestra el nombre del archivo seleccionado o "Sin documento" si no hay ninguno.
   - Muestra un botón "Seleccionar PDF" y, si ya hay un archivo o URL, un botón "Quitar" (ícono de X en rojo `#C41230`).
   - Si `value` es una URL (string que comienza con `https://`), muestra un enlace/botón "Ver documento actual".
4. Estílalo con bordes redondeados, ícono de documento (puedes usar `@expo/vector-icons` con el ícono `Feather/file-text`) y colores institucionales.
5. Exporta desde `src/shared/ui/index.ts`.

---

## PASO 6: Integrar en el Formulario de Registro

**Por favor, implementa lo siguiente:**

1. Abre `src/features/registro-proyecto/ui/RegistroProyectoForm.tsx`.
2. Importa el componente `DocumentoPicker` desde `@shared/ui`.
3. Importa `uploadPdf` desde `@shared/api`.
4. Agrega al formulario (con `react-hook-form`) un campo controlado para el documento:
   ```tsx
   const [localFileUri, setLocalFileUri] = useState<string | null>(null);
   const [localFileName, setLocalFileName] = useState<string | null>(null);
   ```
5. Añade el componente `DocumentoPicker` en el formulario, debajo de los campos existentes, antes del botón de submit:
   ```tsx
   <DocumentoPicker
     value={watch('documento_url')}
     onChange={(uri, name) => {
       setLocalFileUri(uri);
       setLocalFileName(name);
     }}
     onClear={() => {
       setLocalFileUri(null);
       setLocalFileName(null);
       setValue('documento_url', null);
     }}
   />
   ```
6. En la función `onSubmit`, **antes** de llamar a `proyectoApi.create()` o `update()`, sube el archivo si hay uno nuevo:
   ```ts
   let documento_url = getValues('documento_url');
   if (localFileUri && localFileName) {
     const userId = (await supabase.auth.getUser()).data.user?.id ?? 'anonimo';
     documento_url = await uploadPdf(localFileUri, localFileName, userId);
   }
   // Luego pasa documento_url en el payload
   ```
7. Muestra un `ActivityIndicator` durante la subida del archivo para informar al usuario.

---

## PASO 7: Mostrar el Documento en la Vista de Detalle

**Por favor, implementa lo siguiente:**

1. Abre `app/proyecto/[id].tsx` (pantalla de detalle del proyecto).
2. Si `proyecto.documento_url` existe, muestra un botón "Ver Documento PDF".
3. Al presionarlo, usa `expo-web-browser`:
   ```ts
   import * as WebBrowser from 'expo-web-browser';
   await WebBrowser.openBrowserAsync(proyecto.documento_url);
   ```
   Esto abrirá el PDF en el navegador nativo del dispositivo.
4. Si no hay documento, muestra una etiqueta de texto "Sin documento adjunto" con estilo gris y en cursiva.

---

## PASO 8: Manejo de Documento al Editar un Proyecto

**Por favor, implementa lo siguiente:**

1. En `app/proyecto/editar/[id].tsx`, carga los datos actuales del proyecto, incluyendo `documento_url`.
2. Pasa `documento_url` como valor inicial al `DocumentoPicker` para mostrar el documento existente.
3. Si el usuario selecciona un nuevo PDF y hace submit:
   - Sube el nuevo archivo a Storage con `uploadPdf()`.
   - Llama a `deletePdf()` con la ruta del archivo anterior para no acumular archivos huérfanos en el bucket.
   - Actualiza `documento_url` en la base de datos con la nueva URL.

---

## VERIFICACIÓN FINAL

Una vez implementado todo, confirma que:
- [ ] Al registrar un nuevo proyecto con un PDF, el archivo aparece en el bucket de Supabase Storage.
- [ ] La URL del documento se guarda correctamente en la columna `documento_url` de la tabla de proyectos.
- [ ] Desde la pantalla de detalle, el botón "Ver Documento" abre el PDF correctamente.
- [ ] Si no hay documento, la UI lo indica claramente.
- [ ] Al editar un proyecto y cambiar el PDF, el archivo antiguo se elimina del bucket.
- [ ] Si el usuario cancela la selección de archivo, el formulario no se ve afectado.
- [ ] Se corre `npx expo lint` y no hay violaciones de fronteras FSD.