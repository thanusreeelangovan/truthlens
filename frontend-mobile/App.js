import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen    from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import LoginScreen   from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

import { colors } from './src/theme/colors';
import { loadStoredToken } from './src/auth/authService';

const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // 🔹 Check onboarding
        const onboardValue = await AsyncStorage.getItem('tl_onboarded');
        if (onboardValue) setOnboarded(true);

        // 🔹 Check auth
        const token = await loadStoredToken();
        if (token) setUser({ token });

      } catch (e) {
        console.log('Init error:', e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('tl_onboarded', 'true');
    setOnboarded(true);
  };

  if (loading) return (
    <View style={{
      flex:1,
      justifyContent:'center',
      alignItems:'center',
      backgroundColor: colors.background
    }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  // 🚪 First-time users
  if (!onboarded) {
    return <OnboardingScreen onDone={completeOnboarding} />;
  }

  // 🔐 Not logged in
  if (!user) return (
    <>
      <StatusBar style="light" />
      <LoginScreen onLogin={(data) => setUser(data)} />
    </>
  );

  // 🚀 Main App
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.surfaceLight
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
        }}
      >
        <Tab.Screen name="Detect" component={HomeScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}