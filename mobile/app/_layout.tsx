import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { idManager } from '../services/idManager';
import { mediaManager } from '../services/mediaManager';

// Backend URL from environment variables
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

// GestureHandlerRootView removed - using plain View

export default function RootLayout() {
  useEffect(() => {
    const initApp = async () => {
      try {
        // Sync installation first
        await idManager.syncWithBackend(BACKEND_URL);
      } catch (error) {
        console.error('[RootLayout] Initialization error:', error);
      }
    };

    initApp();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#000000' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </View>
  );
}
