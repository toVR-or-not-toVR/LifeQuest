import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { Message, ChatPlan, QuestCategory } from '../types';
import { chatWithCompanion, generateIslandImage, generateMascotImage } from '../services/aiService';
import { uuid } from '../utils/uuid';
import { formatRelativeTime } from '../utils/dateUtils';
import { getCategoryEmoji, generateMapPosition, getQuestColor } from '../utils/questUtils';

// ─── Plan card embedded in assistant message ──────────────────────────────────

function PlanCard({ plan, onStartJourney }: { plan: ChatPlan; onStartJourney: (plan: ChatPlan) => void }) {
  return (
    <View style={planStyles.card}>
      <View style={planStyles.header}>
        <Text style={planStyles.headerIcon}>📋</Text>
        <Text style={planStyles.headerText}>Here's your plan:</Text>
      </View>
      {plan.steps.map((step, i) => {
        const isNew = plan.newStepIndex === i;
        return (
          <View key={i} style={planStyles.step}>
            <View style={[planStyles.checkbox, isNew && planStyles.checkboxNew]} />
            <Text style={[planStyles.stepText, isNew && planStyles.stepTextNew]}>
              {i + 1}. {step}
            </Text>
            {isNew && (
              <View style={planStyles.newBadge}>
                <Text style={planStyles.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>
        );
      })}
      <TouchableOpacity
        style={planStyles.startBtn}
        onPress={() => onStartJourney(plan)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={Colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={planStyles.startBtnGradient}
        >
          <Text style={planStyles.startBtnText}>🚀  Start Journey</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  message,
  onStartJourney,
}: {
  message: Message;
  onStartJourney: (plan: ChatPlan) => void;
}) {
  const isUser = message.role === 'user';
  const slideAnim = useRef(new Animated.Value(isUser ? 20 : -20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 8 }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubbleWrap,
        isUser ? styles.bubbleRight : styles.bubbleLeft,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      {!isUser && (
        <View style={styles.companionAvatar}>
          <Text style={styles.companionEmoji}>✨</Text>
        </View>
      )}
      <View style={styles.bubbleColumn}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          {isUser ? (
            <Text style={styles.bubbleTextUser}>{message.content}</Text>
          ) : (
            <Text style={styles.bubbleTextAssistant}>{message.content}</Text>
          )}
          <Text style={[styles.bubbleTime, isUser ? styles.bubbleTimeUser : styles.bubbleTimeAssistant]}>
            {formatRelativeTime(message.timestamp)}
          </Text>
        </View>
        {!isUser && message.plan && (
          <PlanCard plan={message.plan} onStartJourney={onStartJourney} />
        )}
      </View>
    </Animated.View>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );
    Animated.parallel([
      animate(dot1, 0),
      animate(dot2, 150),
      animate(dot3, 300),
    ]).start();
  }, []);

  return (
    <View style={styles.typingWrap}>
      <View style={styles.companionAvatar}>
        <Text style={styles.companionEmoji}>✨</Text>
      </View>
      <View style={styles.typingBubble}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.typingDot, { transform: [{ translateY: dot }] }]}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function ChatScreen() {
  const { state, dispatch } = useAppContext();
  const navigation = useNavigation<any>();
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const QUICK_PROMPTS = [
    "I want to travel to France 🗼",
    "Help me get fit 💪",
    "I want to save money 💰",
    "Help me learn a new skill 📚",
  ];

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    setInput('');
    const userMsg: Message = {
      id: uuid(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMsg });

    setTyping(true);
    try {
      const allMessages = [...state.messages, userMsg];
      const result = await chatWithCompanion(allMessages, state.quests);
      const assistantMsg: Message = {
        id: uuid(),
        role: 'assistant',
        content: result.message,
        timestamp: new Date().toISOString(),
        plan: result.plan ?? undefined,
      };
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMsg });
    } finally {
      setTyping(false);
    }
  }

  async function handleStartJourney(plan: ChatPlan) {
    const questId = uuid();
    const category = (plan.category as QuestCategory) ?? 'personal';

    // Generate milestones from plan steps
    const milestones = plan.steps.map((step, i) => ({
      id: uuid(),
      title: step.slice(0, 60),
      description: '',
      completed: false,
      xpReward: [50, 75, 100, 100, 150, 200, 300, 500][Math.min(i, 7)],
    }));

    dispatch({
      type: 'ADD_QUEST',
      payload: {
        id: questId,
        title: plan.questTitle,
        description: '',
        category,
        milestones,
        createdAt: new Date().toISOString(),
        mapPosition: generateMapPosition(state.quests),
        color: getQuestColor(category),
        mapIcon: getCategoryEmoji(category),
        suggestedAssets: [],
        assetChanges: 0,
        assetLocked: false,
      },
    });

    // Generate images in background
    generateIslandImage(plan.questTitle, category)
      .then((url) => dispatch({ type: 'UPDATE_QUEST_IMAGE', payload: { questId, islandImageUrl: url } }))
      .catch((e) => console.warn('Island image failed:', e));

    generateMascotImage(category)
      .then((url) => dispatch({ type: 'UPDATE_QUEST_MASCOT', payload: { questId, questMascotUrl: url } }))
      .catch((e) => console.warn('Mascot image failed:', e));

    // Confirm in chat
    const confirmMsg: Message = {
      id: uuid(),
      role: 'assistant',
      content: `Quest "${plan.questTitle}" created! 🎉 Head to the Map to see your island and start your adventure!`,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: confirmMsg });

    // Navigate to map
    navigation.navigate('Map' as never);
  }

  useEffect(() => {
    if (state.messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [state.messages.length, typing]);

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <LinearGradient
          colors={[Colors.card, Colors.background]}
          style={styles.header}
        >
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarEmoji}>✨</Text>
          </View>
          <View>
            <Text style={styles.headerName}>Lumi</Text>
            <Text style={styles.headerStatus}>
              {typing ? 'typing...' : 'Your AI life coach'}
            </Text>
          </View>
        </LinearGradient>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={state.messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: Message }) => (
            <MessageBubble message={item} onStartJourney={handleStartJourney} />
          )}
          contentContainerStyle={styles.messagesList}
          ListFooterComponent={typing ? <TypingIndicator /> : null}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Quick prompts */}
        {state.messages.length <= 2 && (
          <View style={styles.quickPrompts}>
            {QUICK_PROMPTS.map((p) => (
              <TouchableOpacity
                key={p}
                style={styles.quickChip}
                onPress={() => sendMessage(p)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickChipText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Tell me your goal..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || typing) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || typing}
            activeOpacity={0.8}
          >
            {typing ? (
              <ActivityIndicator color={Colors.textPrimary} size="small" />
            ) : (
              <LinearGradient
                colors={Colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendBtnGradient}
              >
                <Ionicons name="send" size={18} color={Colors.textPrimary} />
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

// ─── Plan card styles ─────────────────────────────────────────────────────────

const planStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  headerIcon: { fontSize: 16 },
  headerText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.textPrimary,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    flexShrink: 0,
  },
  checkboxNew: { borderColor: Colors.primary },
  stepText: {
    flex: 1,
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  stepTextNew: { color: Colors.primary, fontWeight: Theme.fontWeight.semibold },
  newBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  newBadgeText: { fontSize: 9, color: Colors.textPrimary, fontWeight: '800' },
  startBtn: {
    marginTop: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
    overflow: 'hidden',
  },
  startBtnGradient: {
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
  },
  startBtnText: {
    color: Colors.textPrimary,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
  },
});

// ─── Main styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '22',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.glow(Colors.primary),
  },
  headerAvatarEmoji: { fontSize: 22 },
  headerName: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.textPrimary,
  },
  headerStatus: {
    fontSize: Theme.fontSize.xs,
    color: Colors.primary,
  },
  messagesList: {
    padding: Theme.spacing.md,
    gap: Theme.spacing.sm,
    paddingBottom: Theme.spacing.md,
  },
  bubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.sm,
    marginVertical: 2,
  },
  bubbleLeft: { justifyContent: 'flex-start' },
  bubbleRight: { justifyContent: 'flex-end', flexDirection: 'row-reverse' },
  bubbleColumn: { flex: 1, maxWidth: '85%' },
  companionAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '22',
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  companionEmoji: { fontSize: 16 },
  bubble: {
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    gap: 4,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  bubbleAssistant: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleTextUser: {
    color: Colors.textPrimary,
    fontSize: Theme.fontSize.md,
    lineHeight: 20,
  },
  bubbleTextAssistant: {
    color: Colors.textPrimary,
    fontSize: Theme.fontSize.md,
    lineHeight: 20,
  },
  bubbleTime: { fontSize: 10 },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  bubbleTimeAssistant: { color: Colors.textMuted },
  typingWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Theme.spacing.sm,
    marginTop: 4,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.lg,
    borderBottomLeftRadius: 4,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  quickPrompts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
  },
  quickChip: {
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.pill,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '66',
  },
  quickChipText: {
    color: Colors.primary,
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    color: Colors.textPrimary,
    fontSize: Theme.fontSize.md,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
