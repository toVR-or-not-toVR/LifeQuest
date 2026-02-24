import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { GradientButton } from '../../components/common/GradientButton';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { useAppContext } from '../../context/AppContext';
import { OnboardingParamList } from '../../navigation/OnboardingNavigator';

type Nav = StackNavigationProp<OnboardingParamList, 'SetName'>;

const AVATARS = ['🧙', '🦸', '🧝', '🧚', '🏹', '⚔️', '🔮', '🦊', '🐉', '🌟', '🦅', '🐺'];

export function SetNameScreen() {
  const navigation = useNavigation<Nav>();
  const { dispatch } = useAppContext();
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🧙');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 7 }),
    ]).start();
  }, []);

  function handleContinue() {
    const trimmed = name.trim() || 'Adventurer';
    dispatch({ type: 'UPDATE_USER', payload: { name: trimmed, avatar: selectedAvatar } });
    navigation.navigate('SetGoals');
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.stepRow}>
            <View style={[styles.stepDot, styles.stepActive]} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
          </View>

          <Text style={styles.title}>{'Who are you,\nadventurer?'}</Text>
          <Text style={styles.subtitle}>Choose your identity for this journey</Text>

          <Text style={styles.sectionLabel}>Choose your avatar</Text>
          <View style={styles.avatarGrid}>
            {AVATARS.map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.avatarBtn, selectedAvatar === a && styles.avatarSelected]}
                onPress={() => setSelectedAvatar(a)}
                activeOpacity={0.7}
              >
                <Text style={styles.avatarEmoji}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Your hero name</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputAvatar}>{selectedAvatar}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name..."
              placeholderTextColor={Colors.textMuted}
              maxLength={24}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>

          <GradientButton
            label="Continue →"
            onPress={handleContinue}
            style={styles.btn}
            size="lg"
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  back: { marginBottom: Theme.spacing.md },
  backText: { color: Colors.textSecondary, fontSize: Theme.fontSize.md },
  content: { flex: 1 },
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
    marginBottom: Theme.spacing.xl,
  },
  sectionLabel: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Theme.fontWeight.semibold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Theme.spacing.sm,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xl,
  },
  avatarBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  avatarSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.cardLight,
    ...Theme.shadow.glow(Colors.primary),
  },
  avatarEmoji: { fontSize: 26 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
    height: 56,
  },
  inputAvatar: { fontSize: 24, marginRight: Theme.spacing.sm },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
  },
  btn: { marginTop: 'auto' },
});
