import { Colors } from '@constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
 
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        headerStyle: { backgroundColor: Colors.light.primary },
        headerTintColor: '#fff',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Proyectos',
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="list" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="registro"
        options={{
          title: 'Registrar',
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="add-circle" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}