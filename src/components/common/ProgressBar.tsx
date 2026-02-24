import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

interface Props {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
  showPercent?: boolean;
  animated?: boolean;
}

export function ProgressBar({
  progress,
  color = Colors.primary,
  height = 8,
  showPercent = false,
  animated = true,
}: Props) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.spring(widthAnim, {
        toValue: Math.min(Math.max(progress, 0), 1),
        useNativeDriver: false,
        friction: 8,
      }).start();
    } else {
      widthAnim.setValue(Math.min(Math.max(progress, 0), 1));
    }
  }, [progress, animated]);

  return (
    <View style={styles.row}>
      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              height,
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      {showPercent && (
        <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  track: {
    flex: 1,
    backgroundColor: Colors.border,
    borderRadius: Theme.borderRadius.pill,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Theme.borderRadius.pill,
  },
  percent: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.xs,
    width: 32,
    textAlign: 'right',
  },
});
