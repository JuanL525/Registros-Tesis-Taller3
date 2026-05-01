# Guía de Implementación - Reto Animaciones (Reanimated + Uniwind)

Eres un asistente experto en React Native, Expo Router, la arquitectura Feature-Sliced Design (FSD), `react-native-reanimated` y la librería de utilidades de animación `Uniwind`. Tu objetivo es enriquecer visualmente la aplicación con animaciones fluidas y profesionales.

Se deben implementar **2 animaciones obligatorias** y **2 animaciones adicionales** elegidas por el desarrollador.

---

## CONTEXTO DEL PROYECTO

- **Reanimated:** `react-native-reanimated ~4.1.1` ya está en `package.json`. Solo falta verificar que el plugin esté en `babel.config.js`.
- **Uniwind:** Librería de animaciones declarativas para React Native. Sitio oficial: https://uniwind.dev/
- **Arquitectura:** Feature-Sliced Design. Los hooks y componentes animados van en `src/shared/ui/` o `src/shared/hooks/`.
- **Target:** Android e iOS.

---

## CONFIGURACIÓN INICIAL

### Verificar Reanimated
**Por favor, verifica e implementa lo siguiente antes de todo:**

1. Abre `babel.config.js`. Asegúrate de que el plugin de Reanimated esté al final de los plugins:
   ```js
   module.exports = function (api) {
     api.cache(true);
     return {
       presets: ['babel-preset-expo'],
       plugins: [
         'react-native-reanimated/plugin', // DEBE ser el último plugin
       ],
     };
   };
   ```
2. Si no existe `babel.config.js` (solo `app.config.ts`), créalo en la raíz del proyecto con el contenido anterior.
3. Reinicia el servidor de Metro con caché limpia:
   ```bash
   npx expo start --clear
   ```

### Instalar Uniwind
**Por favor, ejecuta:**
```bash
npx expo install uniwind
```
> Uniwind es una librería de animaciones para React Native que provee componentes como `<Animated.View>` con props declarativas de animación (fade, slide, spring, etc.) construidos sobre Reanimated. Consulta la documentación en https://uniwind.dev/ para la API exacta de la versión instalada.

---

## ANIMACIÓN OBLIGATORIA 1: Entrada de Tarjetas de Proyecto (Staggered Fade + Slide)

**Por favor, implementa lo siguiente:**

**Objetivo:** Cada `ProyectoCard` debe aparecer en pantalla con una animación escalonada (stagger): la primera tarjeta entra primero, luego la segunda con un pequeño retraso, y así sucesivamente. Cada tarjeta se desliza desde abajo hacia arriba mientras hace fade-in.

1. Crea el hook `src/shared/hooks/useEntranceAnimation.ts`:
   ```ts
   import { useEffect } from 'react';
   import { useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';

   export function useEntranceAnimation(index: number, delay = 80) {
     const opacity = useSharedValue(0);
     const translateY = useSharedValue(40);

     useEffect(() => {
       const d = index * delay;
       opacity.value = withDelay(d, withTiming(1, { duration: 350 }));
       translateY.value = withDelay(d, withSpring(0, { damping: 14, stiffness: 100 }));
     }, []);

     return { opacity, translateY };
   }
   ```
2. Exporta el hook desde `src/shared/hooks/index.ts`.

3. Abre `src/widgets/proyecto-card/ProyectoCard.tsx`.
4. Importa `Animated` desde `react-native-reanimated` y el hook `useEntranceAnimation`.
5. El componente `ProyectoCard` debe recibir una prop adicional `index: number`.
6. Aplica la animación:
   ```tsx
   import Animated, { useAnimatedStyle } from 'react-native-reanimated';
   import { useEntranceAnimation } from '@shared/hooks';

   export function ProyectoCard({ proyecto, index }: ProyectoCardProps) {
     const { opacity, translateY } = useEntranceAnimation(index);

     const animatedStyle = useAnimatedStyle(() => ({
       opacity: opacity.value,
       transform: [{ translateY: translateY.value }],
     }));

     return (
       <Animated.View style={[styles.card, animatedStyle]}>
         {/* contenido existente de la tarjeta */}
       </Animated.View>
     );
   }
   ```
7. En `HomeScreen.tsx`, pasa el índice al renderizar la lista:
   ```tsx
   <FlatList
     data={proyectos}
     renderItem={({ item, index }) => (
       <ProyectoCard proyecto={item} index={index} />
     )}
   />
   ```

---

## ANIMACIÓN OBLIGATORIA 2: Transición de Borde en Campos del Formulario (Focus Border)

**Por favor, implementa lo siguiente:**

**Objetivo:** Cuando el usuario toca un campo de texto del formulario, el borde del input transiciona suavemente de gris a azul institucional (`#0033A0`) con una animación. Al perder el foco, regresa al color original.

1. Crea el componente `src/shared/ui/AnimatedInput/AnimatedInput.tsx`:
   ```tsx
   import React, { useCallback } from 'react';
   import { TextInput, TextInputProps, StyleSheet } from 'react-native';
   import Animated, {
     useSharedValue,
     useAnimatedStyle,
     withTiming,
     interpolateColor,
   } from 'react-native-reanimated';

   const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

   interface AnimatedInputProps extends TextInputProps {
     errorBorderColor?: string;
     hasError?: boolean;
   }

   export function AnimatedInput({ hasError, errorBorderColor = '#C41230', ...props }: AnimatedInputProps) {
     const focused = useSharedValue(0);

     const animatedStyle = useAnimatedStyle(() => ({
       borderColor: interpolateColor(
         focused.value,
         [0, 1],
         [hasError ? errorBorderColor : '#D1D5DB', hasError ? errorBorderColor : '#0033A0']
       ),
       borderWidth: withTiming(focused.value === 1 ? 2 : 1, { duration: 200 }),
     }));

     const handleFocus = useCallback(() => {
       focused.value = withTiming(1, { duration: 250 });
     }, []);

     const handleBlur = useCallback(() => {
       focused.value = withTiming(0, { duration: 200 });
     }, []);

     return (
       <AnimatedTextInput
         style={[styles.input, animatedStyle, props.style]}
         onFocus={handleFocus}
         onBlur={handleBlur}
         placeholderTextColor="#9CA3AF"
         {...props}
       />
     );
   }

   const styles = StyleSheet.create({
     input: {
       height: 48,
       borderRadius: 10,
       paddingHorizontal: 14,
       fontSize: 15,
       backgroundColor: '#FFFFFF',
     },
   });
   ```
2. Exporta desde `src/shared/ui/index.ts`.
3. Abre `src/features/registro-proyecto/ui/RegistroProyectoForm.tsx`.
4. Reemplaza todos los componentes `<TextInput>` por `<AnimatedInput>`.
5. Pasa la prop `hasError={!!errors.nombreDelCampo}` para que el borde se ponga rojo cuando hay error de validación.

---

## ANIMACIÓN ADICIONAL 3 (Sugerida): Botón con Efecto de Pulsación (Press Scale)

**Objetivo:** El botón principal "Registrar Proyecto" y el de "Iniciar Sesión" escalen ligeramente al ser presionados para dar feedback táctil visual.

**Por favor, implementa lo siguiente:**

1. Crea `src/shared/ui/AnimatedButton/AnimatedButton.tsx`:
   ```tsx
   import React, { useCallback } from 'react';
   import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
   import Animated, {
     useSharedValue,
     useAnimatedStyle,
     withSpring,
   } from 'react-native-reanimated';

   const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

   interface AnimatedButtonProps {
     onPress: () => void;
     label: string;
     style?: ViewStyle;
     textStyle?: TextStyle;
     disabled?: boolean;
   }

   export function AnimatedButton({ onPress, label, style, textStyle, disabled }: AnimatedButtonProps) {
     const scale = useSharedValue(1);

     const animatedStyle = useAnimatedStyle(() => ({
       transform: [{ scale: scale.value }],
     }));

     const handlePressIn = useCallback(() => {
       scale.value = withSpring(0.94, { damping: 10, stiffness: 300 });
     }, []);

     const handlePressOut = useCallback(() => {
       scale.value = withSpring(1, { damping: 10, stiffness: 300 });
     }, []);

     return (
       <AnimatedPressable
         style={[styles.button, style, animatedStyle, disabled && styles.disabled]}
         onPress={onPress}
         onPressIn={handlePressIn}
         onPressOut={handlePressOut}
         disabled={disabled}
       >
         <Text style={[styles.label, textStyle]}>{label}</Text>
       </AnimatedPressable>
     );
   }

   const styles = StyleSheet.create({
     button: {
       backgroundColor: '#0033A0',
       paddingVertical: 14,
       borderRadius: 12,
       alignItems: 'center',
     },
     label: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
     disabled: { opacity: 0.5 },
   });
   ```
2. Exporta desde `src/shared/ui/index.ts`.
3. Reemplaza los botones de submit del formulario de login y de registro de proyecto con `<AnimatedButton>`.

---

## ANIMACIÓN ADICIONAL 4 (Sugerida): Skeleton Loader en la Lista de Proyectos

**Objetivo:** Mientras los proyectos se cargan desde Supabase, mostrar "tarjetas fantasma" con un efecto shimmer pulsante en lugar de un spinner estático. Esto mejora significativamente la percepción de rendimiento.

**Por favor, implementa lo siguiente:**

1. Crea `src/shared/ui/SkeletonCard/SkeletonCard.tsx`:
   ```tsx
   import React, { useEffect } from 'react';
   import { StyleSheet, View } from 'react-native';
   import Animated, {
     useSharedValue,
     useAnimatedStyle,
     withRepeat,
     withSequence,
     withTiming,
   } from 'react-native-reanimated';

   export function SkeletonCard() {
     const opacity = useSharedValue(0.3);

     useEffect(() => {
       opacity.value = withRepeat(
         withSequence(
           withTiming(1, { duration: 700 }),
           withTiming(0.3, { duration: 700 })
         ),
         -1, // infinito
         false
       );
     }, []);

     const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

     return (
       <Animated.View style={[styles.card, animatedStyle]}>
         <View style={styles.titlePlaceholder} />
         <View style={styles.linePlaceholder} />
         <View style={[styles.linePlaceholder, styles.shortLine]} />
       </Animated.View>
     );
   }

   const styles = StyleSheet.create({
     card: {
       backgroundColor: '#E5E7EB',
       borderRadius: 12,
       padding: 16,
       marginHorizontal: 16,
       marginVertical: 8,
       gap: 10,
     },
     titlePlaceholder: { height: 20, backgroundColor: '#D1D5DB', borderRadius: 6, width: '70%' },
     linePlaceholder: { height: 14, backgroundColor: '#D1D5DB', borderRadius: 6, width: '100%' },
     shortLine: { width: '50%' },
   });
   ```
2. Exporta desde `src/shared/ui/index.ts`.
3. En `HomeScreen.tsx`, detecta el estado de carga:
   ```tsx
   if (isLoading) {
     return (
       <View>
         {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
       </View>
     );
   }
   ```

---

## INTEGRACIÓN DE UNIWIND

**Por favor, investiga la documentación oficial de Uniwind (https://uniwind.dev/) e implementa lo siguiente:**

1. Revisa los componentes y utilidades disponibles en la versión instalada.
2. Identifica al menos **un componente o utilidad de Uniwind** que complemente las animaciones ya implementadas con Reanimated. Algunas sugerencias:
   - Un componente de transición de página al navegar entre rutas.
   - Un componente de `AnimatedList` que gestione automáticamente el stagger de elementos.
   - Utilidades de `spring` o `timing` predefinidas que simplifiquen el código de las animaciones 1-4.
3. Integra el componente elegido en la pantalla que más se beneficie de él (probablemente `HomeScreen` o la pantalla de detalle).
4. Documenta brevemente (en comentarios en el código) qué hace Uniwind en ese punto y por qué lo elegiste.

> **Nota:** La API exacta de Uniwind puede variar según la versión. Consulta siempre la documentación oficial antes de implementar. Si alguna feature de Uniwind entra en conflicto con las animaciones de Reanimated ya implementadas, da prioridad a Reanimated y usa Uniwind como complemento.

---

## CONSIDERACIONES DE RENDIMIENTO

Al implementar las animaciones, ten en cuenta:

- **Usa siempre `useAnimatedStyle`** en vez de pasar shared values directamente a `style`, para garantizar que las animaciones corran en el hilo de UI nativo (UI thread) y no en JS.
- **Evita recrear callbacks en cada render:** Usa `useCallback` o ubica las funciones fuera del componente cuando sea posible.
- **`runOnJS`:** Si necesitas actualizar estado de React desde un `worklet` (función de Reanimated), usa `runOnJS`.
- **Prueba en dispositivo físico:** Las animaciones pueden verse muy diferentes en un emulador. Verifica en Android e iOS físicos.

---

## VERIFICACIÓN FINAL

Una vez implementado todo, confirma que:
- [ ] Las tarjetas de proyectos aparecen con animación escalonada al cargar la lista.
- [ ] Los campos del formulario muestran transición de borde azul al recibir foco.
- [ ] El botón de submit tiene el efecto de escala al ser presionado.
- [ ] El skeleton loader aparece mientras se espera la respuesta de Supabase.
- [ ] Al menos un componente de Uniwind está integrado y documentado.
- [ ] Las animaciones funcionan correctamente en Android e iOS.
- [ ] No hay warnings de Reanimated en la consola (especialmente sobre `useNativeDriver`).
- [ ] Se corre `npx expo lint` y no hay violaciones de fronteras FSD.