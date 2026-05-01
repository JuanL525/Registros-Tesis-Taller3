import { useEffect } from "react";
import {
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from "react-native-reanimated";

export function useEntranceAnimation(index: number, delay = 80) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);

  useEffect(() => {
    const d = index * delay;
    opacity.value = withDelay(d, withTiming(1, { duration: 350 }));
    translateY.value = withDelay(
      d,
      withSpring(0, { damping: 14, stiffness: 100 }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { opacity, translateY };
}
