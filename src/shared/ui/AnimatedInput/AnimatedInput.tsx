import React, { useCallback } from "react";
import {
    NativeSyntheticEvent,
    StyleSheet,
    TextInput,
    TextInputFocusEventData,
    TextInputProps,
} from "react-native";
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// Omitimos onFocus y onBlur de TextInputProps para redefinirlos,
// ya que react-hook-form (y otros) pueden pasar una firma diferente.
interface AnimatedInputProps extends Omit<
  TextInputProps,
  "onFocus" | "onBlur"
> {
  errorBorderColor?: string;
  hasError?: boolean;
  // Redefinimos onFocus y onBlur para que sean más flexibles.
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onBlur?: () => void; // Aceptamos un onBlur sin argumentos, como el que pasa react-hook-form.
}

export function AnimatedInput({
  hasError,
  errorBorderColor = "#C41230",
  onFocus,
  onBlur,
  ...props
}: AnimatedInputProps) {
  const focused = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focused.value,
      [0, 1],
      [
        hasError ? errorBorderColor : "#D1D5DB", // Color sin foco
        hasError ? errorBorderColor : "#0033A0", // Color con foco
      ],
    );

    // Interpola el grosor del borde de 1px a 2px basado en el foco
    const borderWidth = interpolate(focused.value, [0, 1], [1, 2]);

    return {
      borderColor,
      borderWidth,
    };
  });

  const handleFocus = useCallback(
    (e: any) => {
      focused.value = withTiming(1, { duration: 250 });
      // Llama al onFocus original si el padre lo proveyó.
      onFocus?.(e);
    },
    [focused, onFocus],
  );

  const handleBlur = useCallback(
    (e: any) => {
      focused.value = withTiming(0, { duration: 200 });
      // Llama al onBlur original (de react-hook-form), que no espera argumentos.
      onBlur?.();
    },
    [focused, onBlur],
  );

  return (
    <AnimatedTextInput
      {...props}
      style={[styles.input, animatedStyle, props.style]}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholderTextColor="#9CA3AF"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: "#FFFFFF",
  },
});
