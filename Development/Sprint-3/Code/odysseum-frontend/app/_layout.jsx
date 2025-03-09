import { Stack, SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message"
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts, DancingScript_400Regular, DancingScript_500Medium, DancingScript_600SemiBold, DancingScript_700Bold } from '@expo-google-fonts/dev';
import { StatusBar } from "expo-status-bar";
import useUserStore from "../src/context/userStore";
import { router } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SocketProvider } from '../src/context/SocketContext';

SplashScreen.preventAutoHideAsync();

const client = new QueryClient();

const RootLayout = () => {
  const user = useUserStore((state) => state.user);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const [loading, setLoading] = useState(true);

  const [loadedFonts, error] = useFonts({
    DancingScript_400Regular,
    DancingScript_500Medium,
    DancingScript_600SemiBold,
    DancingScript_700Bold
  });

  useEffect(() => {
    if(loadedFonts) {
      SplashScreen.hideAsync();
      setLoading(false);
    } else if(error) {
      console.log(error);
    }
  }, [loadedFonts, error]);

  if(!loadedFonts || loading) return null;
  if (!loadedFonts && !error) return null;
  
  return (
    <>
      <QueryClientProvider client={client}>
        <SocketProvider>
          <GestureHandlerRootView style={{flex: 1}}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="post/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="user" options={{ headerShown: false }} />
              <Stack.Screen name="location" options={{ headerShown: false }} />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
              <Stack.Screen name="review" options={{ headerShown: false }} />
              <Stack.Screen name="business" options={{ headerShown: false }} />
              <Stack.Screen 
                name="chat" 
                options={{ 
                  headerShown: false,
                  presentation: 'modal',
                  animation: 'slide_from_bottom'
                }} 
              />
              <Stack.Screen 
                name="chat/[id]" 
                options={{ 
                  headerShown: false,
                  animation: 'slide_from_right'
                }} 
              />
            </Stack>
            <Toast />
          </GestureHandlerRootView>
          <StatusBar translucent backgroundColor="transparent" />
        </SocketProvider>
      </QueryClientProvider>
    </>
  );
};

export default RootLayout;