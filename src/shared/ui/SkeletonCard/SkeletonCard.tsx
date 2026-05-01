import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

/**
 * SkeletonCard con animación de shimmer (parpadeo) usando react-native-reanimated.
 * Se muestra mientras se cargan los datos de los proyectos.
 */
export function SkeletonCard() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    // Crea una animación de opacidad infinita que va de 1 a 0.3 y viceversa.
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0.3, { duration: 700 }),
      ),
      -1, // -1 significa repetir infinitamente
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 10,
  },
  titlePlaceholder: {
    height: 20,
    backgroundColor: "#D1D5DB",
    borderRadius: 6,
    width: "70%",
  },
  linePlaceholder: {
    height: 14,
    backgroundColor: "#D1D5DB",
    borderRadius: 6,
    width: "100%",
  },
  shortLine: { width: "50%" },
});
