import React, { ReactNode } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

interface Props {
  children: ReactNode;
  style?: object;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
}

export function ScreenWrapper({ children, style, edges = ['top', 'left', 'right'] }: Props) {
  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.inner}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
