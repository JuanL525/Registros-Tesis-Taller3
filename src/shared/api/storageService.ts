import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "./supabase";

/**
 * Sube un archivo PDF a Supabase Storage.
 * @param fileUri La URI local del archivo.
 * @param fileName El nombre del archivo.
 * @param userId El ID del usuario que sube el archivo.
 * @returns La URL pública del archivo subido.
 */
export const uploadPdf = async (
  fileUri: string,
  fileName: string,
  userId: string,
): Promise<string> => {
  try {
    console.log("--- INICIANDO SUBIDA DE PDF ---");
    console.log("Paso 1: Copiando archivo a caché...");
    console.log("URI Origen:", fileUri);
    const newFileUri = `${(FileSystem as any).cacheDirectory}${fileName.replace(/\s/g, "_")}`;
    await FileSystem.copyAsync({
      from: fileUri,
      to: newFileUri,
    });
    console.log("Paso 1.1: Copia exitosa a:", newFileUri);

    console.log("Paso 2: Creando objeto FormData para la subida...");
    // Usar FormData es un método más robusto en React Native para subir archivos,
    // ya que evita inconsistencias con la implementación de `Blob` y `fetch`.
    const formData = new FormData();
    formData.append("file", {
      uri: newFileUri,
      name: fileName,
      type: "application/pdf",
    } as any);
    console.log("Paso 2.1: FormData creado exitosamente.");

    console.log("Paso 3: Subiendo a Supabase...");
    const filePath = `${userId}/${Date.now()}_${fileName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documentos-proyectos")
      .upload(filePath, formData, {
        upsert: false,
      });

    if (uploadError) {
      console.error("Error DETALLADO de Supabase al subir:", uploadError);
      throw uploadError;
    }
    console.log("Paso 3.1: Subida a Supabase exitosa:", uploadData);

    console.log("Paso 4: Obteniendo URL pública...");
    const { data: urlData } = supabase.storage
      .from("documentos-proyectos")
      .getPublicUrl(filePath);

    console.log("Paso 4.1: URL Pública obtenida:", urlData.publicUrl);
    console.log("--- SUBIDA DE PDF COMPLETADA ---");
    return urlData.publicUrl;
  } catch (error) {
    // Este catch atrapará cualquier error de los pasos anteriores.
    console.error("--- ERROR FATAL EN uploadPdf ---");
    console.error(JSON.stringify(error, null, 2));

    if (error instanceof Error && error.message === "Network request failed") {
      throw new Error(
        "Fallo en la solicitud de red. Verifica la conexión a internet de tu emulador/dispositivo y que la URL de Supabase sea correcta.",
      );
    }
    throw error;
  }
};

