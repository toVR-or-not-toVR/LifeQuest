import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Card } from '../components/common/Card';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { Notification } from '../types';
import { formatRelativeTime } from '../utils/dateUtils';

const TYPE_ICONS: Record<Notification['type'], string> = {
  milestone: '🎯',
  badge: '🏅',
  streak: '🔥',
  levelup: '⭐',
  tip: '✨',
};

const TYPE_COLORS: Record<Notification['type'], string> = {
  milestone: Colors.primary,
  badge: Colors.gold,
  streak: '#FF8C42',
  levelup: Colors.secondary,
  tip: Colors.primary,
};

export function NotificationsScreen() {
  const navigation = useNavigation();
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    dispatch({ type: 'MARK_NOTIFICATIONS_READ' });
  }, []);

  function renderItem({ item }: { item: Notification }) {
    const color = TYPE_COLORS[item.type];
    return (
      <Card
        style={[styles.notifCard, !item.read ? styles.unread : undefined]}
        borderColor={!item.read ? color + '44' : undefined}
      >
        <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
          <Text style={styles.icon}>{TYPE_ICONS[item.type]}</Text>
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.time}>{formatRelativeTime(item.timestamp)}</Text>
        </View>
      </Card>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={state.notifications}
        keyExtractor={(item: Notification) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.textPrimary,
  },
  list: { padding: Theme.spacing.md, gap: Theme.spacing.sm },
  notifCard: { flexDirection: 'row', gap: Theme.spacing.md, alignItems: 'flex-start' },
  unread: { backgroundColor: Colors.cardLight },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: { fontSize: 20 },
  textWrap: { flex: 1 },
  title: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  body: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  time: { fontSize: Theme.fontSize.xs, color: Colors.textMuted },
  empty: { alignItems: 'center', paddingTop: 80, gap: Theme.spacing.md },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: Theme.fontSize.lg, color: Colors.textSecondary },
});
