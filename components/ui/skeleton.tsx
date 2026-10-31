import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, View, ViewStyle } from "react-native";

const SkeletonBaseColor = "#E8E8E8";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Single skeleton placeholder with pulse animation.
 */
export function Skeleton({
  width,
  height,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  const dimensions: ViewStyle = {
    width: (width ?? "100%") as ViewStyle["width"],
    height: (height ?? 20) as ViewStyle["height"],
    borderRadius,
    overflow: "hidden",
  };

  return (
    <View style={[dimensions, style]}>
      <Animated.View
        style={[
          { flex: 1, backgroundColor: SkeletonBaseColor, opacity },
        ]}
      />
    </View>
  );
}
