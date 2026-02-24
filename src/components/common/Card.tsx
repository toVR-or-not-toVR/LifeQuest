import React, { ReactNode } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  borderColor?: string;
  padding?: number;
}

export function Card({ children, style, elevated = false, borderColor, padding }: Props) {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        borderColor ? { borderColor, borderWidth: 1 } : null,
        padding !== undefined ? { padding } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    ...Theme.shadow.md,
  },
  elevated: {
    backgroundColor: Colors.cardLight,
    ...Theme.shadow.lg,
  },
});
