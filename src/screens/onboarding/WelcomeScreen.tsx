import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientButton } from '../../components/common/GradientButton';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { OnboardingParamList } from '../../navigation/OnboardingNavigator';

type Nav = StackNavigationProp<OnboardingParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

const STARS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height * 0.6,
  size: Math.random() * 3 + 1,
  opacity: Math.random() * 0.6 + 0.2,
}));

export function WelcomeScreen() {
  const navigation = useNavigation<Nav>();

  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const mapAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(mapAnim, { toValue: 1, useNativeDriver: true, friction: 6 }),
      Animated.timing(titleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(subtitleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(btnAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient
      colors={['#0D1B2A', '#0A2540', '#0D1B2A']}
      style={styles.container}
    >
      {/* Stars */}
      {STARS.map((star) => (
        <View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              opacity: star.opacity,
            },
          ]}
        />
      ))}

      {/* Hero illustration */}
      <Animated.View
        style={[
          styles.heroWrap,
          {
            opacity: mapAnim,
            transform: [
              { scale: mapAnim },
              {
                translateY: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -12],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.mapCircle}>
          <Text style={styles.mapEmoji}>🗺️</Text>
          <View style={[styles.island, styles.island1]}>
            <Text style={styles.islandEmoji}>🏝️</Text>
          </View>
          <View style={[styles.island, styles.island2]}>
            <Text style={styles.islandEmoji}>⚔️</Text>
          </View>
          <View style={[styles.island, styles.island3]}>
            <Text style={styles.islandEmoji}>💎</Text>
          </View>
          <View style={[styles.island, styles.island4]}>
            <Text style={styles.islandEmoji}>🌟</Text>
          </View>
        </View>
      </Animated.View>

      {/* Text content */}
      <View style={styles.textBlock}>
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {'Life'}
          <Text style={styles.titleAccent}>{'Quest'}</Text>
        </Animated.Text>

        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: subtitleAnim,
              transform: [
                {
                  translateY: subtitleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          Map Your Life
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, { opacity: subtitleAnim }]}>
          {'Turn your goals into an epic adventure.\nConquer milestones. Level up your life.'}
        </Animated.Text>
      </View>

      {/* Features row */}
      <Animated.View style={[styles.features, { opacity: btnAnim }]}>
        {[
          { icon: '🗺️', label: 'Visual Map' },
          { icon: '✨', label: 'AI Companion' },
          { icon: '⚔️', label: 'Epic Quests' },
          { icon: '🏆', label: 'Earn Badges' },
        ].map((f) => (
          <View key={f.label} style={styles.featureItem}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureLabel}>{f.label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* CTA */}
      <Animated.View
        style={[
          styles.btnWrap,
          {
            opacity: btnAnim,
            transform: [
              {
                translateY: btnAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <GradientButton
          label="Begin Your Quest →"
          onPress={() => navigation.navigate('SetName')}
          size="lg"
        />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  heroWrap: {
    marginTop: 20,
    marginBottom: Theme.spacing.xl,
  },
  mapCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Theme.shadow.glow(Colors.primary),
  },
  mapEmoji: { fontSize: 80 },
  island: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardLight,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  island1: { top: -8, right: -8 },
  island2: { bottom: 10, right: -16 },
  island3: { bottom: -8, left: -8 },
  island4: { top: 10, left: -16 },
  islandEmoji: { fontSize: 20 },
  textBlock: {
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.fontSize.hero,
    fontWeight: Theme.fontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  titleAccent: { color: Colors.primary },
  tagline: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: Theme.spacing.xs,
  },
  features: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  featureItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  featureIcon: { fontSize: 24 },
  featureLabel: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: Theme.fontWeight.medium,
    textAlign: 'center',
  },
  btnWrap: {
    width: '100%',
    marginTop: 'auto',
  },
});
