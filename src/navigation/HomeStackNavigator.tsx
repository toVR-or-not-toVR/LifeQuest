import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { QuestDetailScreen } from '../screens/QuestDetailScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { Colors } from '../constants/colors';

export type HomeStackParamList = {
  Home: undefined;
  QuestDetail: { questId: string };
  Notifications: undefined;
};

const Stack = createStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="QuestDetail" component={QuestDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
