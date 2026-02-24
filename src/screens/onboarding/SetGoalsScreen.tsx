import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { GradientButton } from '../../components/common/GradientButton';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { useAppContext } from '../../context/AppContext';
import { OnboardingParamList } from '../../navigation/OnboardingNavigator';
import { QuestCategory } from '../../types';
import { getCategoryEmoji, getCategoryLabel } from '../../utils/questUtils';

type Nav = StackNavigationProp<OnboardingParamList, 'SetGoals'>;

const ALL_CATEGORIES: QuestCategory[] = [
  'health', 'career', 'education', 'personal', 'finance', 'relationships',
];

const CATEGORY_DESCRIPTIONS: Record<QuestCategory, string> = {
  health: 'Fitness, nutrition, sleep & wellness',
  career: 'Work, business & professional growth',
  education: 'Learning, skills & knowledge',
  personal: 'Mindset, habits & self-improvement',
  finance: 'Money, savings & financial goals',
  relationships: 'Family, friends & social life',
};

export function SetGoalsScreen() {
  const navigation = useNavigation<Nav>();
  const { dispatch, state } = useAppContext();
  const [selected, setSelected] = useState<QuestCategory[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 7 }),
    ]).start();
  }, []);

  function toggle(cat: QuestCategory) {
    setSelected((prev: QuestCategory[]) =>
      prev.includes(cat) ? prev.filter((c: QuestCategory) => c !== cat) : [...prev, cat]
    );
  }

  function handleFinish() {
    dispatch({ type: 'SET_ONBOARDED' });
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* Step indicator */}
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, styles.stepDone]} />
          <View style={[styles.stepLine, styles.stepLineDone]} />
          <View style={[styles.stepDot, styles.stepActive]} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
        </View>

        <Text style={styles.title}>{'What do you\nwant to conquer?'}</Text>
        <Text style={styles.subtitle}>
          Pick the areas of life you want to level up.{'\n'}You can always add more later.
        </Text>

        {/* Category cards */}
        <View style={styles.grid}>
          {ALL_CATEGORIES.map((cat) => {
            const isSelected = selected.includes(cat);
            const color = Colors.categoryColors[cat];
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.card,
                  isSelected && {
                    borderColor: color,
                    backgroundColor: Colors.cardLight,
                  },
                ]}
                onPress={() => toggle(cat)}
                activeOpacity={0.75}
              >
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: color }]}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
                <View style={[styles.iconCircle, { backgroundColor: color + '22' }]}>
                  <Text style={styles.catEmoji}>
                    {getCategoryEmoji(cat)}
                  </Text>
                </View>
                <Text style={styles.catName}>{getCategoryLabel(cat)}</Text>
                <Text style={styles.catDesc}>{CATEGORY_DESCRIPTIONS[cat]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Hero name reminder */}
        <View style={styles.heroRow}>
          <Text style={styles.heroAvatar}>{state.user.avatar}</Text>
          <Text style={styles.heroName}>
            Ready, <Text style={styles.heroNameAccent}>{state.user.name}</Text>?
          </Text>
        </View>

        <GradientButton
          label={
            selected.length === 0
              ? 'Skip for now →'
              : `Start My Quest (${selected.length} chosen) →`
          }
          onPress={handleFinish}
          size="lg"
          style={styles.btn}
        />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  container: {
    flexGrow: 1,
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: 60,
    paddingBottom: 48,
  },
  back: { marginBottom: Theme.spacing.md },
  backText: { color: Colors.textSecondary, fontSize: Theme.fontSize.md },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border,
  },
  stepDone: { backgroundColor: Colors.primary },
  stepActive: {
    backgroundColor: Colors.primary,
    ...Theme.shadow.glow(Colors.primary),
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: Theme.spacing.sm,
  },
  stepLineDone: { backgroundColor: Colors.primary },
  title: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.sm,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Theme.spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xl,
  },
  card: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: Theme.spacing.md,
    gap: Theme.spacing.xs,
    position: 'relative',
    overflow: 'hidden',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: Theme.fontWeight.bold,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xs,
  },
  catEmoji: { fontSize: 22 },
  catName: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.textPrimary,
  },
  catDesc: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroAvatar: { fontSize: 32 },
  heroName: {
    fontSize: Theme.fontSize.lg,
    color: Colors.textSecondary,
    fontWeight: Theme.fontWeight.medium,
  },
  heroNameAccent: {
    color: Colors.primary,
    fontWeight: Theme.fontWeight.bold,
  },
  btn: {},
});
