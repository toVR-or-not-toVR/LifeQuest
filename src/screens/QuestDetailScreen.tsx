import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { Milestone } from '../types';
import {
  getQuestProgress,
  getQuestProgressText,
  getCategoryEmoji,
  getCategoryLabel,
} from '../utils/questUtils';
import { suggestNextStep } from '../services/aiService';
import { HomeStackParamList } from '../navigation/HomeStackNavigator';

type RouteT = RouteProp<HomeStackParamList, 'QuestDetail'>;

export function QuestDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteT>();
  const { questId } = route.params;
  const { state, dispatch } = useAppContext();
  const quest = state.quests.find((q) => q.id === questId);
  const [tip, setTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(true);

  useEffect(() => {
    if (!quest) return;
    suggestNextStep(quest).then((t) => {
      setTip(t);
      setLoadingTip(false);
    });
  }, [questId]);

  if (!quest) {
    return (
      <ScreenWrapper>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Quest not found</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const progress = getQuestProgress(quest);

  async function handlePhotoUpload(milestoneId: string) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to add milestone memories.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled) {
      dispatch({
        type: 'ADD_MILESTONE_PHOTO',
        payload: { questId, milestoneId, uri: result.assets[0].uri },
      });
    }
  }

  function handleDelete() {
    Alert.alert(
      'Delete Quest',
      `Delete "${quest!.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'DELETE_QUEST', payload: { questId } });
            navigation.goBack();
          },
        },
      ]
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero banner */}
        <LinearGradient
          colors={[quest.color + '44', Colors.background]}
          style={styles.heroBanner}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={22} color={Colors.danger} />
          </TouchableOpacity>
          <View style={[styles.questIconWrap, { backgroundColor: quest.color + '33' }]}>
            <Text style={styles.questIcon}>{getCategoryEmoji(quest.category)}</Text>
          </View>
          <Text style={styles.questTitle}>{quest.title}</Text>
          <Text style={styles.questCategory}>{getCategoryLabel(quest.category)}</Text>
          {!!quest.description && (
            <Text style={styles.questDesc}>{quest.description}</Text>
          )}
          {progress >= 1 && (
            <View style={styles.completeBadge}>
              <Text style={styles.completeText}>⚔️ Quest Complete!</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.content}>
          {/* Progress */}
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>{getQuestProgressText(quest)}</Text>
            </View>
            <ProgressBar progress={progress} color={quest.color} height={10} showPercent />
          </Card>

          {/* AI tip */}
          <Card style={styles.tipCard} borderColor={Colors.primary + '44'}>
            <View style={styles.tipHeader}>
              <Text style={styles.tipIcon}>✨</Text>
              <Text style={styles.tipTitle}>Lumi says</Text>
            </View>
            {loadingTip ? (
              <ActivityIndicator color={Colors.primary} size="small" />
            ) : (
              <Text style={styles.tipText}>{tip}</Text>
            )}
          </Card>

          {/* Milestones */}
          <Text style={styles.sectionTitle}>Milestones</Text>
          {quest.milestones.map((milestone: Milestone, index: number) => (
            <MilestoneRow
              key={milestone.id}
              milestone={milestone}
              index={index + 1}
              questColor={quest.color}
              onComplete={() =>
                dispatch({ type: 'COMPLETE_MILESTONE', payload: { questId, milestoneId: milestone.id } })
              }
              onPhotoUpload={() => handlePhotoUpload(milestone.id)}
            />
          ))}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

function MilestoneRow({
  milestone,
  index,
  questColor,
  onComplete,
  onPhotoUpload,
}: {
  milestone: Milestone;
  index: number;
  questColor: string;
  onComplete: () => void;
  onPhotoUpload: () => void;
}) {
  return (
    <Card
      style={[styles.milestoneCard, milestone.completed ? styles.milestoneDone : undefined]}
      borderColor={milestone.completed ? questColor + '66' : undefined}
    >
      <View style={styles.milestoneRow}>
        <TouchableOpacity
          onPress={onComplete}
          disabled={milestone.completed}
          style={[
            styles.checkbox,
            milestone.completed && { backgroundColor: questColor, borderColor: questColor },
          ]}
          activeOpacity={0.7}
        >
          {milestone.completed && (
            <Ionicons name="checkmark" size={16} color={Colors.textPrimary} />
          )}
        </TouchableOpacity>
        <View style={styles.milestoneContent}>
          <View style={styles.milestoneHeader}>
            <Text style={styles.milestoneIdx}>{index}</Text>
            <Text
              style={[styles.milestoneTitle, milestone.completed && styles.milestoneTitleDone]}
            >
              {milestone.title}
            </Text>
          </View>
          <Text style={styles.milestoneDesc}>{milestone.description}</Text>
          <View style={styles.milestoneFooter}>
            <Text style={styles.milestoneXP}>+{milestone.xpReward} XP</Text>
            {milestone.completedAt && (
              <Text style={styles.completedAt}>✓ Completed</Text>
            )}
          </View>
        </View>
      </View>

      {milestone.photo ? (
        <Image source={{ uri: milestone.photo }} style={styles.photo} />
      ) : milestone.completed ? (
        <TouchableOpacity onPress={onPhotoUpload} style={styles.addPhotoBtn}>
          <Ionicons name="camera-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.addPhotoText}>Add memory photo</Text>
        </TouchableOpacity>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  heroBanner: {
    paddingTop: 60,
    paddingBottom: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card + 'AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card + 'AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  questIcon: { fontSize: 40 },
  questTitle: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  questCategory: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Theme.spacing.sm,
  },
  questDesc: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  completeBadge: {
    marginTop: Theme.spacing.md,
    backgroundColor: Colors.gold + '22',
    borderRadius: Theme.borderRadius.pill,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  completeText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.gold,
  },
  content: { padding: Theme.spacing.md },
  progressCard: { marginBottom: Theme.spacing.md },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  progressLabel: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  progressValue: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.primary,
  },
  tipCard: { marginBottom: Theme.spacing.lg },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  tipIcon: { fontSize: 20 },
  tipTitle: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tipText: { fontSize: Theme.fontSize.md, color: Colors.textSecondary, lineHeight: 22 },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  milestoneCard: { marginBottom: Theme.spacing.sm },
  milestoneDone: { opacity: 0.85 },
  milestoneRow: { flexDirection: 'row', gap: Theme.spacing.sm, alignItems: 'flex-start' },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  milestoneContent: { flex: 1 },
  milestoneHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  milestoneIdx: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
    fontWeight: Theme.fontWeight.bold,
    width: 16,
  },
  milestoneTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textPrimary,
    flex: 1,
  },
  milestoneTitleDone: { textDecorationLine: 'line-through', color: Colors.textSecondary },
  milestoneDesc: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
    marginLeft: 22,
  },
  milestoneFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginLeft: 22,
  },
  milestoneXP: { fontSize: Theme.fontSize.xs, color: Colors.gold, fontWeight: Theme.fontWeight.bold },
  completedAt: { fontSize: Theme.fontSize.xs, color: Colors.primary },
  photo: {
    width: '100%',
    height: 160,
    borderRadius: Theme.borderRadius.md,
    marginTop: Theme.spacing.sm,
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Theme.spacing.sm,
    padding: Theme.spacing.sm,
    backgroundColor: Colors.cardLight,
    borderRadius: Theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  addPhotoText: { fontSize: Theme.fontSize.sm, color: Colors.textSecondary },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: Colors.textSecondary, fontSize: Theme.fontSize.lg },
});
