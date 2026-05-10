import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, DarkColors } from '@/constants/theme';

import { initDb } from '@/db/client';
import { seedDb } from '@/db/seed';

// Prevent splash screen from hiding before assets load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize Database
        await initDb();
        // Seed Database with initial mock data
        await seedDb();
        
        // Asset loading could go here
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn('Database initialization error:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colorScheme === 'dark' ? DarkColors.background : Colors.white } }}>
        {/* Auth Group */}
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />

        {/* Main Tabs */}
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />

        {/* Practice Group */}
        <Stack.Screen name="practice" options={{ animation: 'slide_from_bottom' }} />

        {/* Universal Modals */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
