import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Card } from '../components/common/Card';
import { XPBar } from '../components/common/XPBar';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { Quest } from '../types';
import { getQuestProgress, getCategoryEmoji, getCategoryLabel } from '../utils/questUtils';
import { getLevelTitle } from '../utils/xpUtils';
import { HomeStackParamList } from '../navigation/HomeStackNavigator';

type Nav = StackNavigationProp<HomeStackParamList, 'Home'>;

function QuestCard({ quest, onPress }: { quest: Quest; onPress: () => void }) {
  const progress = getQuestProgress(quest);
  const done = quest.milestones.filter((m) => m.completed).length;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.questCard} borderColor={quest.color + '44'}>
        <View style={styles.questHeader}>
          <View style={[styles.questIconWrap, { backgroundColor: quest.color + '22' }]}>
            <Text style={styles.questIcon}>{getCategoryEmoji(quest.category)}</Text>
          </View>
          <View style={styles.questMeta}>
            <Text style={styles.questTitle} numberOfLines={1}>{quest.title}</Text>
            <Text style={styles.questCategory}>{getCategoryLabel(quest.category)}</Text>
          </View>
          <Text style={styles.questCount}>{done}/{quest.milestones.length}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round(progress * 100)}%` as any, backgroundColor: quest.color },
            ]}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { state } = useAppContext();
  const { user, quests } = state;
  const activeQuests = quests.filter((q) => !q.completedAt);
  const completedQuests = quests.filter((q) => !!q.completedAt);
  const unreadCount = state.notifications.filter((n) => !n.read).length;
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View style={[styles.header, { opacity: headerAnim }]}>
          <View>
            <Text style={styles.greeting}>Good day, adventurer 👋</Text>
            <Text style={styles.heroName}>{user.avatar} {user.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Card style={styles.xpCard} elevated>
          <View style={styles.xpRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNum}>{user.level}</Text>
            </View>
            <View style={styles.xpInfo}>
              <Text style={styles.levelTitle}>{getLevelTitle(user.level)}</Text>
              <XPBar xp={user.xp} level={user.level} xpToNextLevel={user.xpToNextLevel} showLabels={false} />
              <Text style={styles.xpSub}>{user.xpToNextLevel} XP to next level</Text>
            </View>
          </View>
        </Card>

        <View style={styles.statsRow}>
          {[
            { icon: '🔥', value: user.streak, label: 'Day Streak' },
            { icon: '⚔️', value: activeQuests.length, label: 'Active' },
            { icon: '🏆', value: user.totalQuestsCompleted, label: 'Completed' },
          ].map((s) => (
            <Card key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </Card>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Active Quests</Text>
        {activeQuests.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={styles.emptyTitle}>No active quests</Text>
            <Text style={styles.emptySub}>
              Tap the + button to create your first quest!
            </Text>
          </Card>
        ) : (
          activeQuests.map((q) => (
            <QuestCard
              key={q.id}
              quest={q}
              onPress={() => navigation.navigate('QuestDetail', { questId: q.id })}
            />
          ))
        )}

        {completedQuests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed ✨</Text>
            {completedQuests.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                onPress={() => navigation.navigate('QuestDetail', { questId: q.id })}
              />
            ))}
          </View>
        )}

        {user.badges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Badges</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {user.badges.slice(-5).map((b) => (
                <View key={b.id} style={styles.badgeChip}>
                  <Text style={styles.badgeIcon}>{b.icon}</Text>
                  <Text style={styles.badgeName}>{b.title}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Theme.spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.lg,
  },
  greeting: { fontSize: Theme.fontSize.sm, color: Colors.textSecondary, marginBottom: 2 },
  heroName: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.extrabold,
    color: Colors.textPrimary,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: { color: Colors.textPrimary, fontSize: 9, fontWeight: Theme.fontWeight.bold },
  xpCard: { marginBottom: Theme.spacing.md },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  levelBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary + '22',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNum: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.extrabold,
    color: Colors.primary,
  },
  xpInfo: { flex: 1, gap: Theme.spacing.xs },
  levelTitle: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  xpSub: { fontSize: Theme.fontSize.xs, color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', gap: Theme.spacing.sm, marginBottom: Theme.spacing.lg },
  statCard: { flex: 1, alignItems: 'center', gap: 2, padding: Theme.spacing.sm },
  statIcon: { fontSize: 22 },
  statValue: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.extrabold,
    color: Colors.textPrimary,
  },
  statLabel: { fontSize: Theme.fontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  section: { marginBottom: Theme.spacing.md },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  questCard: { marginBottom: Theme.spacing.sm },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  questIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questIcon: { fontSize: 20 },
  questMeta: { flex: 1 },
  questTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  questCategory: { fontSize: Theme.fontSize.xs, color: Colors.textSecondary },
  questCount: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.textSecondary,
  },
  progressTrack: { height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  emptyCard: { alignItems: 'center', gap: Theme.spacing.sm, paddingVertical: Theme.spacing.xl },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.textPrimary,
  },
  emptySub: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  badgeChip: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.sm,
    marginRight: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
    minWidth: 64,
  },
  badgeIcon: { fontSize: 24 },
  badgeName: { fontSize: Theme.fontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
});
