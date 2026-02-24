import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { FABCreateButton } from './FABCreateButton';
import { useAppContext } from '../../context/AppContext';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  HomeTab:          { active: 'home',           inactive: 'home-outline' },
  MapTab:           { active: 'map',            inactive: 'map-outline' },
  CreateTab:        { active: 'add-circle',     inactive: 'add-circle-outline' },
  ChatTab:          { active: 'chatbubbles',    inactive: 'chatbubbles-outline' },
  ProfileTab:       { active: 'person',         inactive: 'person-outline' },
  NotificationsTab: { active: 'notifications',  inactive: 'notifications-outline' },
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { state: appState } = useAppContext();
  const unreadCount = appState.notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : route.name.replace('Tab', '');

          const isCreate = route.name === 'CreateTab';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isCreate) {
            return (
              <FABCreateButton key={route.key} onPress={onPress} />
            );
          }

          const icons = TAB_ICONS[route.name] ?? {
            active: 'ellipse',
            inactive: 'ellipse-outline',
          };

          const showBadge = route.name === 'NotificationsTab' && unreadCount > 0;

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={focused ? icons.active : icons.inactive}
                  size={24}
                  color={focused ? Colors.primary : Colors.textMuted}
                />
                {showBadge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: focused ? Colors.primary : Colors.textMuted },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Theme.shadow.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrap: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: Theme.fontWeight.medium,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.textPrimary,
    fontSize: 9,
    fontWeight: Theme.fontWeight.bold,
  },
});
