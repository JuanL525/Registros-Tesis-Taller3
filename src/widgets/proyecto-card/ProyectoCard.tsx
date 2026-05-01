import { Colors } from "@constants/theme";
import type { ProyectoTesis } from "@entities/proyecto-tesis/model/types";
import { useEntranceAnimation } from "@shared/hooks/useEntranceAnimation";
import { AnimatedButton } from "@shared/ui";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
const BADGE_COLOR: Record<string, string> = {
  "En Progreso": "#3498DB",
  Completado: "#27AE60",
  Suspendido: Colors.light.danger,
};

interface Props {
  proyecto: ProyectoTesis;
  index?: number;
  onDelete?: (id: string) => Promise<void>;
  onPress?: () => void;
}

export function ProyectoCard({
  proyecto,
  index = 0,
  onDelete,
  onPress,
}: Props) {
  const [eliminando, setEliminando] = useState(false);
  // Animación de entrada
  const { opacity, translateY } = useEntranceAnimation(index);
  // Animación de pulsación para la tarjeta
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    // Solo animar si la tarjeta es presionable (navega a editar)
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    }
  }, [onPress, scale]);

  const handlePressOut = useCallback(() => {
    // La animación se ejecuta siempre al soltar para volver al estado original
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, [scale]);

  const abrirRepo = () => {
    if (proyecto.repositorio_github)
      Linking.openURL(proyecto.repositorio_github);
  };

  const confirmarBorrado = () => {
    if (!onDelete || eliminando) return;

    Alert.alert(
      "Eliminar proyecto",
      "¿Estás seguro de eliminar este proyecto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setEliminando(true);
              await onDelete(proyecto.id);
            } catch {
              Alert.alert(
                "Error",
                "No se pudo eliminar el proyecto. Intenta nuevamente.",
              );
            } finally {
              setEliminando(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.tarjeta}
        onPress={onPress}
        disabled={!onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={onPress ? 0.8 : 1} // Reduce el efecto de opacidad si es presionable
      >
        {/* Encabezado: título + badge de estado */}
        <View style={styles.encabezado}>
          <Text style={styles.titulo} numberOfLines={2}>
            {proyecto.titulo}
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: BADGE_COLOR[proyecto.estado] },
            ]}
          >
            <Text style={styles.badgeTexto}>{proyecto.estado}</Text>
          </View>
        </View>

        {/* Autores */}
        <Text style={styles.etiqueta}>Autores</Text>
        <Text style={styles.valor}>{proyecto.autores}</Text>

        {/* Tutor */}
        <Text style={styles.etiqueta}>Tutor Docente</Text>
        <Text style={styles.valor}>{proyecto.tutor_docente}</Text>

        {/* Tecnologías */}
        <Text style={styles.etiqueta}>Tecnologías</Text>
        <Text style={styles.valor}>{proyecto.tecnologias_utilizadas}</Text>

        {/* Fechas */}
        <View style={styles.filaFechas}>
          <View style={styles.fecha}>
            <Text style={styles.etiqueta}>Inicio</Text>
            <Text style={styles.valor}>{proyecto.fecha_inicio}</Text>
          </View>
          {proyecto.fecha_fin && (
            <View style={styles.fecha}>
              <Text style={styles.etiqueta}>Fin</Text>
              <Text style={styles.valor}>{proyecto.fecha_fin}</Text>
            </View>
          )}
        </View>

        {/* Link a GitHub */}
        {proyecto.repositorio_github && (
          <TouchableOpacity style={styles.repoBoton} onPress={abrirRepo}>
            <Text style={styles.repoTexto}>Ver en GitHub →</Text>
          </TouchableOpacity>
        )}

        {onDelete && (
          <AnimatedButton
            style={[
              styles.deleteButton,
              eliminando && styles.deleteButtonDisabled,
            ]}
            onPress={confirmarBorrado}
            disabled={eliminando}
          >
            {eliminando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            )}
          </AnimatedButton>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titulo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A3A5C",
    flex: 1,
    marginRight: 8,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeTexto: { color: "#fff", fontSize: 11, fontWeight: "700" },
  etiqueta: { fontSize: 11, color: "#888", fontWeight: "600", marginTop: 8 },
  valor: { fontSize: 14, color: "#333", marginTop: 2 },
  filaFechas: { flexDirection: "row", gap: 24 },
  fecha: { flex: 1 },
  repoBoton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#EBF5FB",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  repoTexto: { color: "#2E6DA4", fontSize: 13, fontWeight: "600" },
  deleteButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.danger,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonDisabled: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
});
