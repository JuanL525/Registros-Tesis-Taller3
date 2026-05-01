import { proyectoApi } from "@entities/proyecto-tesis/api/proyectoApi";
import type { ProyectoTesis } from "@entities/proyecto-tesis/model/types";
import { Feather } from "@expo/vector-icons";
import { AnimatedButton } from "@shared/ui";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProyectoDetalleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [proyecto, setProyecto] = useState<ProyectoTesis | null>(null);
  const [cargando, setCargando] = useState(true);
  const [abriendoDoc, setAbriendoDoc] = useState(false);

  useEffect(() => {
    if (id) {
      setCargando(true);
      proyectoApi
        .getById(id)
        .then((data) => {
          if (data) {
            setProyecto(data);
          } else {
            console.warn(`Proyecto con id ${id} no encontrado.`);
          }
        })
        .catch((error) => {
          console.error("Error cargando el proyecto:", error);
        })
        .finally(() => {
          setCargando(false);
        });
    }
  }, [id]);

  const abrirDocumento = async () => {
    if (proyecto?.documento_url) {
      setAbriendoDoc(true);
      try {
        await WebBrowser.openBrowserAsync(proyecto.documento_url);
      } catch (error) {
        console.error("Error al abrir el documento:", error);
        Alert.alert("Error", "No se pudo abrir el documento.");
      }
      setAbriendoDoc(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#0033A0" />
      </View>
    );
  }

  if (!proyecto) {
    return (
      <View style={styles.centro}>
        <Text style={styles.error}>Proyecto no encontrado.</Text>
        <AnimatedButton
          label="Volver a la lista"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#0033A0" />
        </TouchableOpacity>
        <Text style={styles.titulo}>{proyecto.titulo}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.etiqueta}>Descripción</Text>
        <Text style={styles.valor}>
          {proyecto.descripcion || "Sin descripción."}
        </Text>

        <Text style={styles.etiqueta}>Autores</Text>
        <Text style={styles.valor}>{proyecto.autores}</Text>

        <Text style={styles.etiqueta}>Tutor Docente</Text>
        <Text style={styles.valor}>{proyecto.tutor_docente}</Text>

        <Text style={styles.etiqueta}>Tecnologías</Text>
        <Text style={styles.valor}>{proyecto.tecnologias_utilizadas}</Text>

        <View style={styles.fila}>
          <View style={styles.columna}>
            <Text style={styles.etiqueta}>Inicio</Text>
            <Text style={styles.valor}>{proyecto.fecha_inicio}</Text>
          </View>
          <View style={styles.columna}>
            <Text style={styles.etiqueta}>Fin</Text>
            <Text style={styles.valor}>{proyecto.fecha_fin || "En curso"}</Text>
          </View>
        </View>
      </View>

      {proyecto.documento_url ? (
        <AnimatedButton
          onPress={abrirDocumento}
          style={styles.botonDocumento}
          disabled={abriendoDoc}
        >
          {abriendoDoc ? (
            <ActivityIndicator color="#0033A0" />
          ) : (
            <Text style={styles.botonDocumentoTexto}>Ver Documento PDF</Text>
          )}
        </AnimatedButton>
      ) : (
        <Text style={styles.sinDocumento}>Sin documento adjunto</Text>
      )}

      <AnimatedButton
        label="Editar Proyecto"
        onPress={() => router.push(`/proyecto/editar/${id}`)}
        style={styles.botonEditar}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  centro: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A3A5C",
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  etiqueta: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
    marginTop: 16,
    textTransform: "uppercase",
  },
  valor: {
    fontSize: 16,
    color: "#333",
    marginTop: 4,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  columna: {
    flex: 1,
  },
  botonEditar: {
    backgroundColor: "#0033A0",
    marginTop: 20,
  },
  botonDocumento: {
    backgroundColor: "#EBF5FB",
    borderWidth: 1,
    borderColor: "#BCE0FD",
  },
  botonDocumentoTexto: {
    color: "#0033A0",
  },
  sinDocumento: {
    textAlign: "center",
    color: "#888",
    fontStyle: "italic",
    marginTop: 16,
  },
  error: {
    fontSize: 16,
    color: "#C41230",
    marginBottom: 20,
    textAlign: "center",
  },
});
