import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Platform,
} from 'react-native';
import type { CreateProyectoDto, EstadoProyecto }
  from '@entities/proyecto-tesis/model/types';
import { createProyecto, validateProyecto }
  from '../api/createProyecto';
 
const FORM_INICIAL: CreateProyectoDto = {
  titulo: '',
  descripcion: '',
  autores: '',
  tutor_docente: '',
  tecnologias_utilizadas: '',
  fecha_inicio: '',
  fecha_fin: '',
  repositorio_github: '',
  estado: 'En Progreso',
};
 
const ESTADOS: EstadoProyecto[] = ['En Progreso', 'Completado', 'Suspendido'];
 
interface Props {
  onSuccess?: () => void;
}

// 1. EXTRAEMOS EL COMPONENTE 'Campo' AFUERA
interface CampoProps {
  label: string;
  campo: keyof CreateProyectoDto;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'url';
  valor: string;
  error?: string;
  onChangeText: (campo: keyof CreateProyectoDto, valor: string) => void;
}

const Campo = ({
  label, campo, placeholder, multiline = false, keyboardType = 'default',
  valor, error, onChangeText
}: CampoProps) => (
  <View style={styles.campoContenedor}>
    <Text style={styles.etiqueta}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        multiline && styles.inputMultiline,
        error ? styles.inputError : null,
      ]}
      placeholder={placeholder}
      placeholderTextColor="#999"
      value={valor}
      onChangeText={val => onChangeText(campo, val)}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      keyboardType={keyboardType}
      autoCapitalize={campo === 'repositorio_github' ? 'none' : 'sentences'}
    />
    {error ? (
      <Text style={styles.textoError}>{error}</Text>
    ) : null}
  </View>
);
 
export function RegistroProyectoForm({ onSuccess }: Props) {
  const [form, setForm] = useState<CreateProyectoDto>(FORM_INICIAL);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(false);
 
  const actualizar = (campo: keyof CreateProyectoDto, valor: string) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: '' }));
  };
 
  const handleGuardar = async () => {
    const validacion = validateProyecto(form);
    if (validacion.length > 0) {
      const mapa: Record<string, string> = {};
      validacion.forEach(e => { mapa[e.field] = e.message; });
      setErrores(mapa);
      Alert.alert('Formulario incompleto', 'Revisa los campos marcados en rojo.');
      return;
    }
 
    try {
      setCargando(true);
      await createProyecto(form);
      Alert.alert('¡Éxito!', 'Proyecto de tesis registrado correctamente.', [
        { text: 'OK', onPress: () => { setForm(FORM_INICIAL); onSuccess?.(); } }
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el proyecto. Verifica tu conexión.');
    } finally {
      setCargando(false);
    }
  };
 
  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>Nuevo Proyecto de Tesis</Text>
      <Text style={styles.subtitulo}>ESFOT — Tecnología Superior en Desarrollo de Software</Text>
 
      {/* 2. AHORA LE PASAMOS EL VALOR, ERROR Y LA FUNCIÓN ONCHANGETEXT POR PROPS */}
      <Campo
        label="Título del Proyecto *"
        campo="titulo"
        placeholder="Ej: Sistema de gestión de inventarios para PYMES"
        valor={form.titulo}
        error={errores.titulo}
        onChangeText={actualizar}
      />
      <Campo
        label="Descripción"
        campo="descripcion"
        placeholder="Describe brevemente el objetivo del proyecto..."
        multiline
        valor={form.descripcion}
        error={errores.descripcion}
        onChangeText={actualizar}
      />
      <Campo
        label="Autores * (separa con comas)"
        campo="autores"
        placeholder="Ej: Ana Torres, Luis Pérez"
        valor={form.autores}
        error={errores.autores}
        onChangeText={actualizar}
      />
      <Campo
        label="Tutor Docente *"
        campo="tutor_docente"
        placeholder="Ej: Ing. Juan Carlos Gonzalez Msc."
        valor={form.tutor_docente}
        error={errores.tutor_docente}
        onChangeText={actualizar}
      />
      <Campo
        label="Tecnologías Utilizadas * (separa con comas)"
        campo="tecnologias_utilizadas"
        placeholder="Ej: React Native, Node.js, PostgreSQL, AWS"
        valor={form.tecnologias_utilizadas}
        error={errores.tecnologias_utilizadas}
        onChangeText={actualizar}
      />
      <Campo
        label="Fecha de Inicio * (AAAA-MM-DD)"
        campo="fecha_inicio"
        placeholder="Ej: 2025-03-01"
        valor={form.fecha_inicio}
        error={errores.fecha_inicio}
        onChangeText={actualizar}
      />
      <Campo
        label="Fecha de Fin (AAAA-MM-DD)"
        campo="fecha_fin"
        placeholder="Ej: 2025-12-31 (dejar vacío si está en progreso)"
        valor={form.fecha_fin as string}
        error={errores.fecha_fin}
        onChangeText={actualizar}
      />
      <Campo
        label="Repositorio GitHub"
        campo="repositorio_github"
        placeholder="https://github.com/usuario/repositorio"
        keyboardType="url"
        valor={form.repositorio_github as string}
        error={errores.repositorio_github}
        onChangeText={actualizar}
      />
 
      {/* Selector de Estado */}
      <View style={styles.campoContenedor}>
        <Text style={styles.etiqueta}>Estado del Proyecto</Text>
        <View style={styles.estadoContenedor}>
          {ESTADOS.map(est => (
            <TouchableOpacity
              key={est}
              style={[
                styles.estadoBoton,
                form.estado === est && styles.estadoBotonActivo,
              ]}
              onPress={() => actualizar('estado', est)}
            >
              <Text style={[
                styles.estadoTexto,
                form.estado === est && styles.estadoTextoActivo,
              ]}>{est}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
 
      <TouchableOpacity
        style={[styles.botonGuardar, cargando && styles.botonDeshabilitado]}
        onPress={handleGuardar}
        disabled={cargando}
      >
        {cargando
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.botonTexto}>Registrar Proyecto</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}
 
// ── ESTILOS ──────────────────────────────────────────────────
const AZUL = '#1A3A5C';
const AZUL_CLARO = '#2E6DA4';
 
const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F7FA' },
  scroll: { padding: 20, paddingBottom: 40 },
  titulo: { fontSize: 22, fontWeight: '700', color: AZUL, marginBottom: 4 },
  subtitulo: { fontSize: 13, color: '#666', marginBottom: 24 },
  campoContenedor: { marginBottom: 16 },
  etiqueta: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDE2E8',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    color: '#1A1A1A',
  },
  inputMultiline: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  inputError: { borderColor: '#E74C3C', borderWidth: 1.5 },
  textoError: { color: '#E74C3C', fontSize: 12, marginTop: 4 },
  estadoContenedor: { flexDirection: 'row', gap: 10 },
  estadoBoton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE2E8',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  estadoBotonActivo: { backgroundColor: AZUL_CLARO, borderColor: AZUL_CLARO },
  estadoTexto: { fontSize: 13, color: '#555' },
  estadoTextoActivo: { color: '#fff', fontWeight: '700' },
  botonGuardar: {
    backgroundColor: AZUL,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});