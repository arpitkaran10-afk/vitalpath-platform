import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import TodayScreen from './src/screens/TodayScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import ProgrammeScreen from './src/screens/ProgrammeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { colors, typography, radius, spacing } from './src/theme';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Today: '🏠',
  Progress: '📈',
  Programme: '📋',
  Community: '👥',
  Profile: '👤',
};

function TabIcon({ route, focused }: { route: { name: string }; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={styles.tabIconEmoji}>{TAB_ICONS[route.name]}</Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabIcon route={route} focused={focused} />,
            tabBarLabel: ({ focused, color }) => (
              <Text style={[styles.tabLabel, { color: focused ? colors.primary : colors.onSurfaceVariant }]}>
                {route.name}
              </Text>
            ),
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.onSurfaceVariant,
          })}
        >
          <Tab.Screen name="Today" component={TodayScreen} />
          <Tab.Screen name="Progress" component={ProgressScreen} />
          <Tab.Screen name="Programme" component={ProgrammeScreen} />
          <Tab.Screen name="Community" component={CommunityScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: colors.primaryContainer,
  },
  tabIconEmoji: {
    fontSize: 18,
  },
  tabLabel: {
    ...typography.labelSmall,
  },
});
