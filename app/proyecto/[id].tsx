import { Colors } from '@constants/theme';
import { proyectoApi } from '@entities/proyecto-tesis/api/proyectoApi';
import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
// Componente para mostrar una fila de detalle (etiqueta y valor)
const DetailRow = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
};

export default function ProyectoDetalleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [proyecto, setProyecto] = useState<ProyectoTesis | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProyecto = async () => {
      try {
        setCargando(true);
        const data = await proyectoApi.getById(id);
        setProyecto(data);
      } catch (err) {
        setError('No se pudo cargar el proyecto. Inténtalo de nuevo.');
        console.error(err);
      } finally {
        setCargando(false);
      }
    };

    fetchProyecto();
  }, [id]);

  const handleOpenUrl = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', `No se puede abrir esta URL: ${url}`);
    }
  };

  if (cargando) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#1A3A5C" /></View>;
  }

  if (error || !proyecto) {
    return <View style={styles.centered}><Text style={styles.errorText}>{error || 'Proyecto no encontrado.'}</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen options={{ title: 'Detalle del Proyecto', headerBackTitle: 'Volver' }} />
      
      <View style={styles.headerSection}>
        <Text style={styles.titulo}>{proyecto.titulo}</Text>
        <View style={[
          styles.badge,
          proyecto.estado === 'En Progreso' ? styles.badgeEnProgreso :
          proyecto.estado === 'Completado' ? styles.badgeCompletado :
          styles.badgeSuspendido
        ]}>
          <Text style={styles.badgeText}>{proyecto.estado}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.descripcion}>{proyecto.descripcion || 'No hay descripción disponible.'}</Text>
      </View>

      <View style={styles.card}>
        <DetailRow label="Autores" value={proyecto.autores} />
        <DetailRow label="Tutor Docente" value={proyecto.tutor_docente} />
        <DetailRow label="Tecnologías" value={proyecto.tecnologias_utilizadas} />
      </View>

      <View style={styles.card}>
        <DetailRow label="Fecha de Inicio" value={new Date(proyecto.fecha_inicio).toLocaleDateString('es-EC')} />
        {proyecto.fecha_fin && <DetailRow label="Fecha de Fin" value={new Date(proyecto.fecha_fin).toLocaleDateString('es-EC')} />}
      </View>

      {proyecto.repositorio_github && (
        <TouchableOpacity 
          style={styles.githubButton} 
          onPress={() => handleOpenUrl(proyecto.repositorio_github!)}
        >
          <Text style={styles.githubButtonText}>Ver Repositorio en GitHub</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => router.push(`/proyecto/editar/${proyecto.id}`)}
      >
        <Text style={styles.editButtonText}>Editar proyecto</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  contentContainer: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#E74C3C', textAlign: 'center' },
  headerSection: { marginBottom: 16 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1A3A5C', marginBottom: 12 },
  descripcion: { fontSize: 16, lineHeight: 24, color: '#333' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E6EE',
  },
  detailRow: { marginBottom: 14 },
  detailLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 4 },
  detailValue: { fontSize: 15, color: '#1A1A1A' },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeEnProgreso: { backgroundColor: '#3498DB' },
  badgeCompletado: { backgroundColor: '#2ECC71' },
  badgeSuspendido: { backgroundColor: Colors.light.danger },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  githubButton: {
    backgroundColor: '#24292E',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  githubButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  editButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});