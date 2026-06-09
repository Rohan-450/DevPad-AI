import ThemedStatusBar from "@/components/ThemedStatusBar";
import { ThemeProvider } from "@/context/ThemeProvider";
import { useTheme } from "@/context/theme";
import { migrate } from "@/db/schema";
import { queryClient } from "@/lib/queryClient";
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from "@expo-google-fonts/hanken-grotesk";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useEffect, useState } from "react";
import { View } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
  });

  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    migrate().then(() => setDbReady(true));
  }, []);

  useEffect(() => {
    if (fontsLoaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded || !dbReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemedNavigation />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function ThemedNavigation() {
  const { colors } = useTheme();

  // Paint the actual system window background. On Android, react-native-screens
  // renders each route in a Fragment whose underlying window background defaults
  // to white — `contentStyle` alone doesn't reach it, so the slide animation
  // flashes white. expo-system-ui sets the real window background.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedStatusBar />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="snippets" />
        <Stack.Screen
          name="search"
          options={{ animation: "slide_from_right" }}
        />
      </Stack>
    </View>
  );
}
