import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Badge } from '../../types';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

interface Props {
  badge: Badge;
  locked?: boolean;
  size?: 'sm' | 'md';
}

export function BadgeTile({ badge, locked = false, size = 'md' }: Props) {
  const dim = size === 'sm' ? 56 : 72;
  const iconSize = size === 'sm' ? 22 : 28;
  const titleSize = size === 'sm' ? Theme.fontSize.xs : Theme.fontSize.sm;

  return (
    <View style={[styles.container, { opacity: locked ? 0.35 : 1 }]}>
      <View
        style={[
          styles.iconCircle,
          { width: dim, height: dim, borderRadius: dim / 2 },
        ]}
      >
        <Text style={{ fontSize: iconSize }}>{locked ? '🔒' : badge.icon}</Text>
      </View>
      <Text style={[styles.title, { fontSize: titleSize }]} numberOfLines={2}>
        {locked ? '???' : badge.title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Theme.spacing.xs,
    width: 80,
  },
  iconCircle: {
    backgroundColor: Colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  title: {
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: Theme.fontWeight.medium,
  },
});
