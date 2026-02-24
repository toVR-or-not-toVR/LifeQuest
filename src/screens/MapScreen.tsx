import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { Quest } from '../types';
import { getQuestProgress, getCategoryEmoji, buildSvgPath } from '../utils/questUtils';

const MAP_WIDTH = Dimensions.get('window').width;
const MAP_HEIGHT = 1500;
const ISLAND_SIZE = 80;

function IslandNode({
  quest,
  index,
  onPress,
}: {
  quest: Quest;
  index: number;
  onPress: () => void;
}) {
  const progress = getQuestProgress(quest);
  const isActive = progress > 0 && progress < 1;
  const isDone = progress >= 1;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    }
    return () => pulseAnim.stopAnimation();
  }, [isActive]);

  const left = quest.mapPosition.x - ISLAND_SIZE / 2;
  const top = quest.mapPosition.y - ISLAND_SIZE / 2;
  const circumference = 2 * Math.PI * (ISLAND_SIZE / 2 - 4);

  return (
    <Animated.View
      style={[
        styles.islandWrap,
        { left, top, width: ISLAND_SIZE, height: ISLAND_SIZE, transform: [{ scale: pulseAnim }] },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[
          styles.island,
          { backgroundColor: quest.color + '33', borderColor: quest.color },
          isDone && { borderWidth: 4 },
        ]}
      >
        <View style={[styles.numBadge, { backgroundColor: quest.color }]}>
          <Text style={styles.numText}>{index}</Text>
        </View>
        <Text style={styles.islandEmoji}>{getCategoryEmoji(quest.category)}</Text>
        {isDone && <Text style={styles.doneIcon}>⭐</Text>}
        {progress > 0 && progress < 1 && (
          <Svg width={ISLAND_SIZE} height={ISLAND_SIZE} style={StyleSheet.absoluteFill}>
            <Circle
              cx={ISLAND_SIZE / 2}
              cy={ISLAND_SIZE / 2}
              r={ISLAND_SIZE / 2 - 4}
              stroke={quest.color}
              strokeWidth={3}
              strokeDasharray={`${circumference * progress} ${circumference}`}
              fill="none"
              rotation="-90"
              origin={`${ISLAND_SIZE / 2}, ${ISLAND_SIZE / 2}`}
            />
          </Svg>
        )}
      </TouchableOpacity>
      <Text style={styles.islandLabel} numberOfLines={2}>{quest.title}</Text>
    </Animated.View>
  );
}

function HomeBase() {
  return (
    <View
      style={[
        styles.islandWrap,
        { left: MAP_WIDTH / 2 - ISLAND_SIZE / 2, top: MAP_HEIGHT - 160, width: ISLAND_SIZE, height: ISLAND_SIZE },
      ]}
    >
      <View style={[styles.island, styles.homeIsland]}>
        <Text style={styles.islandEmoji}>🏰</Text>
      </View>
      <Text style={styles.islandLabel}>Home Base</Text>
    </View>
  );
}

export function MapScreen() {
  const navigation = useNavigation<any>();
  const { state } = useAppContext();
  const { quests } = state;

  const homePoint = { x: MAP_WIDTH / 2, y: MAP_HEIGHT - 120 };
  const questPoints = quests.map((q) => q.mapPosition);
  const allPoints = [...questPoints, homePoint];
  const svgPath = buildSvgPath(allPoints);

  const firstIncompleteIndex = quests.findIndex((q) => getQuestProgress(q) < 1);
  const completedCount = firstIncompleteIndex === -1 ? quests.length : firstIncompleteIndex;
  const completedPoints = [...questPoints.slice(0, completedCount), homePoint];
  const completedPath = completedCount > 0 ? buildSvgPath(completedPoints) : '';

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Your Journey Map</Text>
        <Text style={styles.headerSub}>
          {quests.length} quest{quests.length !== 1 ? 's' : ''} on your path
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ocean} />

        <Svg
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Defs>
            <SvgGradient id="pathGrad" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor={Colors.primary} stopOpacity="1" />
              <Stop offset="1" stopColor={Colors.secondary} stopOpacity="1" />
            </SvgGradient>
          </Defs>
          {quests.length > 0 && (
            <Path
              d={svgPath}
              stroke={Colors.border}
              strokeWidth={3}
              strokeDasharray="12,10"
              fill="none"
              opacity={0.5}
            />
          )}
          {completedPath.length > 0 && (
            <Path
              d={completedPath}
              stroke="url(#pathGrad)"
              strokeWidth={4}
              fill="none"
            />
          )}
        </Svg>

        <HomeBase />

        {quests.map((quest, i) => (
          <IslandNode
            key={quest.id}
            quest={quest}
            index={i + 1}
            onPress={() =>
              navigation.navigate('HomeTab', {
                screen: 'QuestDetail',
                params: { questId: quest.id },
              })
            }
          />
        ))}

        {quests.length === 0 && (
          <View style={styles.emptyOverlay}>
            <Text style={styles.emptyEmoji}>🌊</Text>
            <Text style={styles.emptyTitle}>Your map is empty</Text>
            <Text style={styles.emptySub}>
              Tap + to create your first quest and watch your islands appear!
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
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
  headerSub: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollView: { flex: 1 },
  ocean: { ...StyleSheet.absoluteFillObject, backgroundColor: '#08141F' },
  islandWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  island: {
    width: ISLAND_SIZE,
    height: ISLAND_SIZE,
    borderRadius: ISLAND_SIZE / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  homeIsland: {
    backgroundColor: Colors.cardLight,
    borderColor: Colors.primary,
    ...Theme.shadow.glow(Colors.primary),
  },
  numBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { color: Colors.textPrimary, fontSize: 10, fontWeight: Theme.fontWeight.bold },
  islandEmoji: { fontSize: 30 },
  doneIcon: { position: 'absolute', bottom: 4, right: 4, fontSize: 14 },
  islandLabel: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: Theme.fontWeight.semibold,
    textAlign: 'center',
    marginTop: 6,
    width: ISLAND_SIZE + 24,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  emptyOverlay: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: Theme.spacing.md,
  },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
