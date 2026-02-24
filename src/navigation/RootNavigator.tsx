import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { MainTabNavigator } from './MainTabNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { Colors } from '../constants/colors';

const navigationTheme = {
  dark: true,
  colors: {
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.card,
    text: Colors.textPrimary,
    border: Colors.border,
    notification: Colors.danger,
  },
};

export function RootNavigator() {
  const { state } = useAppContext();

  return (
    <NavigationContainer theme={navigationTheme}>
      {state.hasOnboarded ? <MainTabNavigator /> : <OnboardingNavigator />}
    </NavigationContainer>
  );
}
