import "react-native-url-polyfill/auto";
import { SessionProvider, useSession } from "@shared/session";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

/**
 * Componente de guardia de autenticación
 * Redirige a /login si el usuario no está autenticado
 * Muestra un loading mientras se restaura la sesión
 */
function AuthGuard() {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    // Si no hay usuario autenticado
    if (!user) {
      // Si no estamos ya en la ruta de login, redirigir
      if (segments[0] !== "login") {
        router.replace("/login");
      }
    } else {
      // Si hay usuario y estamos en login, redirigir al home
      if (segments[0] === "login") {
        router.replace("/(tabs)");
      }
    }
  }, [user, isLoading, segments, router]);

  // Mostrar loading mientras se restaura la sesión
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0033A0" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <AuthGuard />
    </SessionProvider>
  );
}
