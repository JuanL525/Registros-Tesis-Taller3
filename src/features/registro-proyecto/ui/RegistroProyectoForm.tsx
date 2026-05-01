import type {
  CreateProyectoDto,
  EstadoProyecto,
} from "@entities/proyecto-tesis/model/types";
import { DocumentoPicker } from "@shared/api/DocumentoPicker";
import { uploadPdf } from "@shared/api/storageService";
import { useSession } from "@shared/session";
import { AnimatedButton, AnimatedInput } from "@shared/ui";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { createProyecto } from "../api/createProyecto";

const FORM_INICIAL: CreateProyectoDto = {
  titulo: "",
  descripcion: "",
  autores: "",
  tutor_docente: "",
  tecnologias_utilizadas: "",
  fecha_inicio: "",
  fecha_fin: "",
  repositorio_github: "",
  estado: "En Progreso",
};

const ESTADOS: EstadoProyecto[] = ["En Progreso", "Completado", "Suspendido"];

interface Props {
  onSuccess?: () => void;
  initialValue?: CreateProyectoDto;
  submitLabel?: string;
  onSubmit?: (dto: CreateProyectoDto) => Promise<void>;
}

// 1. EXTRAEMOS EL COMPONENTE 'Campo' AFUERA
interface CampoProps {
  label: string;
  campo: keyof CreateProyectoDto;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: "default" | "url";
  valor: string;
  error?: string;
  onChangeText: (campo: keyof CreateProyectoDto, valor: string) => void;
  onBlur?: () => void;
  onlyLetters?: boolean;
}

const Campo = ({
  label,
  campo,
  placeholder,
  multiline = false,
  keyboardType = "default",
  valor,
  error,
  onChangeText,
  onlyLetters = false,
}: CampoProps) => {
  const handleChange = (val: string) => {
    if (onlyLetters) {
      // Solo permite letras, espacios, comas, puntos y guiones
      const soloLetras = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s,.\-]/g, "");
      onChangeText(campo, soloLetras);
    } else {
      onChangeText(campo, val);
    }
  };

  return (
    <View style={styles.campoContenedor}>
      <Text style={styles.etiqueta}>{label}</Text>
      <AnimatedInput
        style={[
          multiline && styles.inputMultiline,
          error ? styles.inputError : null,
        ]}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={valor}
        onChangeText={handleChange}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
        autoCapitalize={campo === "repositorio_github" ? "none" : "sentences"}
        hasError={!!error}
      />
      {error ? <Text style={styles.textoError}>{error}</Text> : null}
    </View>
  );
};

export function RegistroProyectoForm({
  onSuccess,
  initialValue,
  submitLabel,
  onSubmit,
}: Props) {
  const { user } = useSession();
  const [localFile, setLocalFile] = useState<{
    uri: string;
    name: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<CreateProyectoDto>({
    defaultValues: initialValue ?? FORM_INICIAL,
    mode: "onBlur",
  });

  useEffect(() => {
    reset(initialValue ?? FORM_INICIAL);
  }, [initialValue, reset]);

  const estadoActual = watch("estado");

  const onSubmitForm = async (data: CreateProyectoDto) => {
    if (!user) {
      Alert.alert(
        "Error de autenticación",
        "No se pudo identificar al usuario. Por favor, inicia sesión de nuevo.",
      );
      return;
    }

    try {
      let documentoUrl = data.documento_url;
      if (localFile) {
        documentoUrl = await uploadPdf(localFile.uri, localFile.name, user.id);
      }

      const finalData = { ...data, documento_url: documentoUrl };

      if (onSubmit) {
        await onSubmit(finalData);
      } else {
        await createProyecto(finalData);
      }

      Alert.alert(
        "¡Éxito!",
        onSubmit
          ? "Proyecto actualizado correctamente."
          : "Proyecto de tesis registrado correctamente.",
        [
          {
            text: "OK",
            onPress: () => {
              if (!onSubmit) {
                reset(FORM_INICIAL);
                setLocalFile(null);
              }
              onSuccess?.();
            },
          },
        ],
      );
    } catch (error) {
      // Logueamos el objeto de error completo para tener más detalles en la consola.
      console.error("Error capturado en el formulario:", error);
      console.error("Error (stringified):", JSON.stringify(error, null, 2));

      // Lógica mejorada para extraer el mensaje de error real de Supabase.
      let mensajeError =
        "Ocurrió un error inesperado. Revisa la consola para más detalles.";
      if (error instanceof Error) {
        mensajeError = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as any).message === "string"
      ) {
        // A veces el error de Supabase no es una instancia de Error, pero tiene un mensaje.
        mensajeError = (error as { message: string }).message;
      }

      Alert.alert(
        "Error",
        onSubmit
          ? `No se pudo actualizar el proyecto: ${mensajeError}`
          : `No se pudo guardar el proyecto: ${mensajeError}`,
      );
    }
  };

  const handleInvalid = () => {
    Alert.alert("Formulario incompleto", "Revisa los campos marcados en rojo.");
  };

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>
        {onSubmit ? "Editar Proyecto de Tesis" : "Nuevo Proyecto de Tesis"}
      </Text>
      <Text style={styles.subtitulo}>
        {onSubmit
          ? "Actualiza los datos del proyecto y guarda los cambios"
          : "ESFOT — Tecnología Superior en Desarrollo de Software"}
      </Text>

      <Controller
        control={control}
        name="titulo"
        rules={{ required: "El título es obligatorio" }}
        render={({ field, fieldState }) => (
          <Campo
            label="Título del Proyecto *"
            campo="titulo"
            placeholder="Ej: Sistema de gestión de inventarios para PYMES"
            valor={field.value ?? ""}
            error={fieldState.error?.message}
            onChangeText={(_, valor) => field.onChange(valor)}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="descripcion"
        render={({ field, fieldState }) => (
          <Campo
            label="Descripción"
            campo="descripcion"
            placeholder="Describe brevemente el objetivo del proyecto..."
            multiline
            valor={field.value ?? ""}
            error={fieldState.error?.message}
            onChangeText={(_, valor) => field.onChange(valor)}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="autores"
        rules={{ required: "Ingresa al menos un autor" }}
        render={({ field, fieldState }) => (
          <Campo
            label="Autores * (separa con comas)"
            campo="autores"
            placeholder="Ej: Ana Torres, Luis Pérez"
            valor={field.value ?? ""}
            error={fieldState.error?.message}
            onChangeText={(_, valor) => field.onChange(valor)}
            onBlur={field.onBlur}
            onlyLetters={true}
          />
        )}
      />
      <Controller
        control={control}
        name="tutor_docente"
        rules={{ required: "El tutor docente es obligatorio" }}
        render={({ field, fieldState }) => (
          <Campo
            label="Tutor Docente *"
            campo="tutor_docente"
            placeholder="Ej: Ing. Juan Carlos Gonzalez Msc."
            valor={field.value ?? ""}
            error={fieldState.error?.message}
            onChangeText={(_, valor) => field.onChange(valor)}
            onBlur={field.onBlur}
            onlyLetters={true}
          />
        )}
      />
      <Controller
        control={control}
        name="tecnologias_utilizadas"
        rules={{ required: "Especifica las tecnologías" }}
        render={({ field, fieldState }) => (
          <Campo
            label="Tecnologías Utilizadas * (separa con comas)"
            campo="tecnologias_utilizadas"
            placeholder="Ej: React Native, Node.js, PostgreSQL, AWS"
            valor={field.value ?? ""}
            error={fieldState.error?.message}
            onChangeText={(_, valor) => field.onChange(valor)}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="fecha_inicio"
        rules={{
          required: "La fecha de inicio es obligatoria",
          pattern: {
            value: /^\d{4}-\d{2}-\d{2}$/,
            message: "Formato: AAAA-MM-DD",
          },
        }}
        render={({ field, fieldState }) => (
          <Campo
            label="Fecha de Inicio * (AAAA-MM-DD)"
            campo="fecha_inicio"
            placeholder="Ej: 2025-03-01"
            valor={field.value ?? ""}
            error={fieldState.error?.message}
            onChangeText={(_, valor) => field.onChange(valor)}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="fecha_fin"
        rules={{
          pattern: {
            value: /^\d{4}-\d{2}-\d{2}$/,
            message: "Formato: AAAA-MM-DD",
          },
        }}
        render={({ field, fieldState }) => (
          <Campo
            label="Fecha de Fin (AAAA-MM-DD)"
            campo="fecha_fin"
            placeholder="Ej: 2025-12-31 (dejar vacío si está en progreso)"
            valor={field.value ?? ""}
            error={fieldState.error?.message}
            onChangeText={(_, valor) => field.onChange(valor)}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="repositorio_github"
        rules={{
          pattern: {
            value: /^https?:\/\/.+/,
            message: "Debe ser una URL válida",
          },
        }}
        render={({ field, fieldState }) => (
          <Campo
            label="Repositorio GitHub"
            campo="repositorio_github"
            placeholder="https://github.com/usuario/repositorio"
            keyboardType="url"
            valor={field.value ?? ""}
            error={fieldState.error?.message}
            onChangeText={(_, valor) => field.onChange(valor)}
            onBlur={field.onBlur}
          />
        )}
      />

      <View style={styles.campoContenedor}>
        <Text style={styles.etiqueta}>Estado del Proyecto</Text>
        <View style={styles.estadoContenedor}>
          {ESTADOS.map((est) => (
            <TouchableOpacity
              key={est}
              style={[
                styles.estadoBoton,
                estadoActual === est && styles.estadoBotonActivo,
              ]}
              onPress={() => setValue("estado", est)}
            >
              <Text
                style={[
                  styles.estadoTexto,
                  estadoActual === est && styles.estadoTextoActivo,
                ]}
              >
                {est}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.campoContenedor}>
        <Text style={styles.etiqueta}>Documento del Proyecto (PDF)</Text>
        <Controller
          control={control}
          name="documento_url"
          render={({ field }) => (
            <DocumentoPicker
              value={field.value}
              onChange={(uri, name) => {
                setLocalFile({ uri, name });
              }}
              onClear={() => {
                setLocalFile(null);
                // Limpia el valor en el formulario de react-hook-form
                setValue("documento_url", null, { shouldValidate: true });
              }}
            />
          )}
        />
      </View>

      <AnimatedButton
        label={
          isSubmitting
            ? ""
            : (submitLabel ??
              (onSubmit ? "Actualizar Proyecto" : "Registrar Proyecto"))
        }
        onPress={handleSubmit(onSubmitForm, handleInvalid)}
        disabled={isSubmitting}
        style={[styles.botonGuardar, isSubmitting && styles.botonDeshabilitado]}
      />
    </ScrollView>
  );
}

// ── ESTILOS ──────────────────────────────────────────────────
const AZUL = "#0033A0"; // Color institucional ESFOT
const AZUL_CLARO = "#0033A0"; // Usamos el mismo azul para el estado activo

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F5F7FA" },
  scroll: { padding: 20, paddingBottom: 40 },
  titulo: { fontSize: 22, fontWeight: "700", color: AZUL, marginBottom: 4 },
  subtitulo: { fontSize: 13, color: "#666", marginBottom: 24 },
  campoContenedor: { marginBottom: 16 },
  etiqueta: { fontSize: 13, fontWeight: "600", color: "#444", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DDE2E8",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 15,
    color: "#1A1A1A",
  },
  inputMultiline: { height: 80, textAlignVertical: "top", paddingTop: 10 },
  inputError: { borderColor: "#E74C3C", borderWidth: 1.5 },
  textoError: { color: "#E74C3C", fontSize: 12, marginTop: 4 },
  estadoContenedor: { flexDirection: "row", gap: 10 },
  estadoBoton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDE2E8",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  estadoBotonActivo: { backgroundColor: AZUL_CLARO, borderColor: AZUL_CLARO },
  estadoTexto: { fontSize: 13, color: "#555" },
  estadoTextoActivo: { color: "#fff", fontWeight: "700" },
  botonGuardar: {
    backgroundColor: AZUL,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
