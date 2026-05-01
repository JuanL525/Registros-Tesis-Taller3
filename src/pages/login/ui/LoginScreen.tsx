import { LoginForm } from "@features/auth-login";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.institutionName}>ESFOT - EPN</Text>
          <Text style={styles.subtitle}>Sistema de Registro de Tesis</Text>
        </View>

        {/* Formulario de Login */}
        <LoginForm />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  institutionName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0033A0",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});
