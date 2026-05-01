import { proyectoApi } from "@entities/proyecto-tesis/api/proyectoApi";
import type { ProyectoTesis } from "@entities/proyecto-tesis/model/types";
import { ListaProyectos } from "@features/lista-proyectos/ui/ListaProyectos";
import { useSession } from "@shared/session";
import React, { useEffect, useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export function HomeScreen() {
  const { signOut } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [proyectos, setProyectos] = useState<ProyectoTesis[]>([]);
  const [estaCargando, setEstaCargando] = useState(true);

  const ListaProyectosTyped = ListaProyectos as React.ComponentType<{
    proyectos: ProyectoTesis[];
    isLoading: boolean;
  }>;

  const handleLogout = () => {
    Alert.alert(
      "¿Cerrar sesión?",
      "¿Estás seguro de que deseas cerrar sesión?",
      [
        {
          text: "Cancelar",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Cerrar sesión",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
              Alert.alert(
                "Error",
                "No se pudo cerrar la sesión. Intenta nuevamente.",
              );
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  useEffect(() => {
    const buscarProyectos = async (query: string) => {
      setEstaCargando(true);
      try {
        const resultados = query.trim()
          ? await proyectoApi.search(query)
          : await proyectoApi.getAll();
        setProyectos(resultados);
      } catch (error) {
        console.error("Error al buscar proyectos:", error);
      } finally {
        setEstaCargando(false);
      }
    };

    // Debounce para no llamar a la API en cada tecleo
    const timerId = setTimeout(() => {
      buscarProyectos(searchQuery);
    }, 300);

    return () => clearTimeout(timerId);
  }, [searchQuery]);

  return (
    <View style={styles.contenedor}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.header}>Proyectos de Tesis — ESFOT</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Salir</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título o autor..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>
      {/* Asumimos que ListaProyectos puede recibir los proyectos y el estado de carga */}
      <ListaProyectosTyped proyectos={proyectos} isLoading={estaCargando} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F5F7FA" },
  headerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E6EE",
    backgroundColor: "#FFFFFF",
  },
  headerTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  header: { fontSize: 20, fontWeight: "700", color: "#1A3A5C", flex: 1 },
  logoutButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  searchInput: {
    backgroundColor: "#F5F7FA",
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E6EE",
  },
});
