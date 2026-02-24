import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { xpForCurrentLevel } from '../../utils/xpUtils';

interface Props {
  xp: number;
  level: number;
  xpToNextLevel: number;
  animated?: boolean;
  showLabels?: boolean;
}

export function XPBar({ xp, level, xpToNextLevel, animated = true, showLabels = true }: Props) {
  const progress = xpForCurrentLevel(xp);
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(widthAnim, {
        toValue: progress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      widthAnim.setValue(progress);
    }
  }, [progress, animated]);

  return (
    <View style={styles.container}>
      {showLabels && (
        <View style={styles.labels}>
          <Text style={styles.levelLabel}>Level {level}</Text>
          <Text style={styles.xpLabel}>
            {xp} / {xp + xpToNextLevel} XP
          </Text>
        </View>
      )}
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={Colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        {/* Glow dot at the tip */}
        <Animated.View
          style={[
            styles.glowDot,
            {
              left: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '97%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Theme.spacing.xs,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelLabel: {
    color: Colors.primary,
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.bold,
  },
  xpLabel: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.xs,
  },
  track: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: Theme.borderRadius.pill,
    overflow: 'visible',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: Theme.borderRadius.pill,
    overflow: 'hidden',
  },
  glowDot: {
    position: 'absolute',
    top: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
    ...Theme.shadow.glow(Colors.primary),
  },
});
