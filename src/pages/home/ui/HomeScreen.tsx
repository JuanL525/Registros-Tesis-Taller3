import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ListaProyectos } from '@features/lista-proyectos/ui/ListaProyectos';
 
export function HomeScreen() {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.header}>Proyectos de Tesis — ESFOT</Text>
      <ListaProyectos />
    </View>
  );
}
 
const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { fontSize: 20, fontWeight: '700', color: '#1A3A5C',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#E0E6EE' },
});