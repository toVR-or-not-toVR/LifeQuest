import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  colors?: [string, string];
  size?: 'sm' | 'md' | 'lg';
}

export function GradientButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  colors = Colors.gradientPrimary,
  size = 'md',
}: Props) {
  const height = size === 'sm' ? 40 : size === 'lg' ? 60 : 52;
  const fontSize = size === 'sm' ? Theme.fontSize.sm : size === 'lg' ? Theme.fontSize.lg : Theme.fontSize.md;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.wrapper, { opacity: disabled ? 0.5 : 1 }, style]}
    >
      <LinearGradient
        colors={disabled ? [Colors.textMuted, Colors.textMuted] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, { height }]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.textPrimary} size="small" />
        ) : (
          <Text style={[styles.label, { fontSize }, textStyle]}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Theme.borderRadius.pill,
    overflow: 'hidden',
    ...Theme.shadow.md,
  },
  gradient: {
    paddingHorizontal: Theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: Colors.textPrimary,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 0.5,
  },
});
