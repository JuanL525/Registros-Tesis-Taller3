import { useSession } from "@shared/session";
import { AnimatedButton, AnimatedInput } from "@shared/ui";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, StyleSheet, Text, View } from "react-native";

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const router = useRouter();
  const { signIn, isLoading } = useSession();
  const [generalError, setGeneralError] = useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setGeneralError("");
    try {
      await signIn(data.email, data.password);
      reset();
      // La guardia de navegación en _layout.tsx redirigirá automáticamente
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        "Error al iniciar sesión. Por favor, intenta nuevamente.";
      setGeneralError(errorMessage);
      Alert.alert("Error de Autenticación", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      {/* Campo Email */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Correo Electrónico</Text>
        <Controller
          control={control}
          name="email"
          rules={{
            required: "El correo es requerido",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Por favor ingresa un correo válido",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <AnimatedInput
              style={[errors.email && styles.inputError]}
              placeholder="tu@email.com"
              placeholderTextColor="#999"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              editable={!isLoading}
              autoCapitalize="none"
              hasError={!!errors.email}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email.message}</Text>
        )}
      </View>

      {/* Campo Password */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Contraseña</Text>
        <Controller
          control={control}
          name="password"
          rules={{
            required: "La contraseña es requerida",
            minLength: {
              value: 6,
              message: "La contraseña debe tener al menos 6 caracteres",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <AnimatedInput
              style={[errors.password && styles.inputError]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#999"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              editable={!isLoading}
              hasError={!!errors.password}
            />
          )}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password.message}</Text>
        )}
      </View>

      {/* Error General */}
      {generalError && (
        <View style={styles.generalErrorContainer}>
          <Text style={styles.generalErrorText}>{generalError}</Text>
        </View>
      )}

      {/* Botón Submit */}
      <AnimatedButton
        label="Iniciar Sesión"
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#e74c3c",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    marginTop: 6,
  },
  generalErrorContainer: {
    backgroundColor: "#ffebee",
    borderLeftWidth: 4,
    borderLeftColor: "#e74c3c",
    padding: 12,
    marginBottom: 20,
    borderRadius: 4,
  },
  generalErrorText: {
    color: "#c0392b",
    fontSize: 13,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#0033A0",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
