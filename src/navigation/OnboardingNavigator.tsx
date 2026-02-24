import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { SetNameScreen } from '../screens/onboarding/SetNameScreen';
import { SetGoalsScreen } from '../screens/onboarding/SetGoalsScreen';
import { Colors } from '../constants/colors';

export type OnboardingParamList = {
  Welcome: undefined;
  SetName: undefined;
  SetGoals: undefined;
};

const Stack = createStackNavigator<OnboardingParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SetName" component={SetNameScreen} />
      <Stack.Screen name="SetGoals" component={SetGoalsScreen} />
    </Stack.Navigator>
  );
}
