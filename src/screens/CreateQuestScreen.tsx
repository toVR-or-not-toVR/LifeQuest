import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Card } from '../components/common/Card';
import { GradientButton } from '../components/common/GradientButton';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { QuestCategory, Milestone } from '../types';
import {
  getCategoryEmoji,
  getCategoryLabel,
  generateMapPosition,
  getQuestColor,
} from '../utils/questUtils';
import { generateQuestMilestones } from '../services/aiService';
import { uuid } from '../utils/uuid';

const CATEGORIES: QuestCategory[] = [
  'health', 'career', 'education', 'personal', 'finance', 'relationships',
];

export function CreateQuestScreen() {
  const navigation = useNavigation();
  const { dispatch, state } = useAppContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>('personal');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    if (!title.trim()) return;
    setGenerating(true);
    const generated = await generateQuestMilestones(title.trim(), category);
    setMilestones(generated);
    setGenerating(false);
  }

  function handleCreate() {
    if (!title.trim()) return;
    const finalMilestones: Milestone[] =
      milestones.length > 0
        ? milestones
        : [
            {
              id: uuid(),
              title: 'Get started',
              description: 'Take your first step',
              completed: false,
              xpReward: 100,
            },
          ];

    dispatch({
      type: 'ADD_QUEST',
      payload: {
        id: uuid(),
        title: title.trim(),
        description: description.trim(),
        category,
        milestones: finalMilestones,
        createdAt: new Date().toISOString(),
        mapPosition: generateMapPosition(state.quests),
        color: getQuestColor(category),
      },
    });
    navigation.goBack();
  }

  function removeMilestone(id: string) {
    setMilestones((prev: Milestone[]) => prev.filter((m) => m.id !== id));
  }

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Quest</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
            {CATEGORIES.map((cat) => {
              const selected = category === cat;
              const color = Colors.categoryColors[cat];
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catChip,
                    selected && { backgroundColor: color + '22', borderColor: color },
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.catEmoji}>{getCategoryEmoji(cat)}</Text>
                  <Text style={[styles.catLabel, selected && { color }]}>
                    {getCategoryLabel(cat)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Title */}
          <Text style={styles.label}>Quest Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Run a 5K marathon"
            placeholderTextColor={Colors.textMuted}
            maxLength={60}
          />

          {/* Description */}
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Why does this goal matter to you?"
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            maxLength={200}
          />

          {/* AI Generate button */}
          <TouchableOpacity
            style={[styles.aiBtn, (!title.trim() || generating) && { opacity: 0.5 }]}
            onPress={handleGenerate}
            disabled={!title.trim() || generating}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.aiBtnInner}
            >
              {generating ? (
                <View style={styles.aiBtnRow}>
                  <ActivityIndicator color={Colors.textPrimary} size="small" />
                  <Text style={styles.aiBtnText}>Crafting milestones...</Text>
                </View>
              ) : (
                <View style={styles.aiBtnRow}>
                  <Text style={styles.aiIcon}>✨</Text>
                  <Text style={styles.aiBtnText}>
                    {milestones.length > 0 ? 'Regenerate with AI' : 'Generate Milestones with AI'}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Milestones list */}
          {milestones.length > 0 && (
            <View>
              <Text style={styles.label}>Milestones ({milestones.length})</Text>
              {milestones.map((m: Milestone, index: number) => (
                <Card key={m.id} style={styles.milestoneCard}>
                  <View style={styles.milestoneRow}>
                    <View style={styles.milestoneNum}>
                      <Text style={styles.milestoneNumText}>{index + 1}</Text>
                    </View>
                    <View style={styles.milestoneMeta}>
                      <Text style={styles.milestoneTitle}>{m.title}</Text>
                      <Text style={styles.milestoneDesc}>{m.description}</Text>
                      <Text style={styles.milestoneXP}>+{m.xpReward} XP</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeMilestone(m.id)} style={styles.removeBtn}>
                      <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          )}

          <GradientButton
            label="Create Quest ⚔️"
            onPress={handleCreate}
            disabled={!title.trim()}
            size="lg"
            style={styles.createBtn}
          />
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.textPrimary,
  },
  scroll: { padding: Theme.spacing.md },
  label: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Theme.fontWeight.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
  },
  catRow: { marginBottom: Theme.spacing.sm },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 2,
    borderColor: Colors.border,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    marginRight: Theme.spacing.sm,
  },
  catEmoji: { fontSize: 16 },
  catLabel: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Theme.fontWeight.medium,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    color: Colors.textPrimary,
    fontSize: Theme.fontSize.md,
    marginBottom: Theme.spacing.sm,
  },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: Theme.spacing.sm },
  aiBtn: {
    borderRadius: Theme.borderRadius.pill,
    overflow: 'hidden',
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  aiBtnInner: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    alignItems: 'center',
  },
  aiBtnRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  aiIcon: { fontSize: 18 },
  aiBtnText: {
    color: Colors.textPrimary,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
  },
  milestoneCard: { marginBottom: Theme.spacing.sm, padding: Theme.spacing.sm },
  milestoneRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Theme.spacing.sm },
  milestoneNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '22',
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  milestoneNumText: {
    color: Colors.primary,
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.bold,
  },
  milestoneMeta: { flex: 1 },
  milestoneTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  milestoneDesc: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  milestoneXP: {
    fontSize: Theme.fontSize.xs,
    color: Colors.gold,
    fontWeight: Theme.fontWeight.bold,
  },
  removeBtn: { padding: 4 },
  createBtn: { marginTop: Theme.spacing.lg },
});
