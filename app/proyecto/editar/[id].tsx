import { proyectoApi } from '@entities/proyecto-tesis/api/proyectoApi';
import type { CreateProyectoDto, ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import { RegistroProyectoForm } from '@features/registro-proyecto/ui/RegistroProyectoForm';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function EditarProyectoScreen() {
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
        console.error(err);
        setError('No se pudo cargar el proyecto para editar.');
      } finally {
        setCargando(false);
      }
    };

    fetchProyecto();
  }, [id]);

  const handleUpdate = async (form: CreateProyectoDto) => {
    if (!id) throw new Error('ID de proyecto no encontrado');
    await proyectoApi.update(id, form);
  };

  if (cargando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1A3A5C" />
      </View>
    );
  }

  if (error || !proyecto) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'No se encontró el proyecto.'}</Text>
      </View>
    );
  }

  const initialValue: CreateProyectoDto = {
    titulo: proyecto.titulo,
    descripcion: proyecto.descripcion,
    autores: proyecto.autores,
    tutor_docente: proyecto.tutor_docente,
    tecnologias_utilizadas: proyecto.tecnologias_utilizadas,
    fecha_inicio: proyecto.fecha_inicio,
    fecha_fin: proyecto.fecha_fin ?? '',
    repositorio_github: proyecto.repositorio_github ?? '',
    estado: proyecto.estado,
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Editar Proyecto', headerBackTitle: 'Volver' }} />
      <RegistroProyectoForm
        initialValue={initialValue}
        submitLabel="Guardar cambios"
        onSubmit={handleUpdate}
        onSuccess={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#E74C3C', textAlign: 'center' },
});
