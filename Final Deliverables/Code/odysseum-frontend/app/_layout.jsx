import {
  Stack,
  SplashScreen,
  useRouter,
  useSegments,
  usePathname,
} from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useFonts,
  DancingScript_400Regular,
  DancingScript_500Medium,
  DancingScript_600SemiBold,
  DancingScript_700Bold,
} from "@expo-google-fonts/dev";
import { StatusBar } from "expo-status-bar";
import useUserStore from "../src/context/userStore";
import { router } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BackHandler } from "react-native";

SplashScreen.preventAutoHideAsync();

const client = new QueryClient();

// Authentication middleware to protect routes
function AuthGuard({ children }) {
  const segments = useSegments();
  const pathname = usePathname();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  // const isLoggedIn = true
  const [isReady, setIsReady] = useState(false);

  // console.log(isLoggedIn)

  // Define protected routes outside of any effect so it's accessible everywhere in the component
  const protectedRoutes = [
    "(tabs)",
    "post",
    "itinerary",
    "user",
    "location",
    "settings",
    "review",
    "business",
    "service",
    "chat",
  ];

  useEffect(() => {
    // Only run authentication logic when the segments are loaded
    if (!segments) return;

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some((route) =>
      segments.includes(route)
    );

    // If the user is not logged in and trying to access a protected route, redirect to welcome screen
    if (!isLoggedIn && isProtectedRoute) {
      console.log("Unauthorized access attempt to:", pathname);
      router.replace("/");
    }

    // If the user is logged in and on the welcome/auth screens, redirect to home
    if (isLoggedIn && (segments[0] === "(auth)" || segments[0] === "index")) {
      console.log("User logged in, redirecting to home from:", pathname);
      router.replace("/home");
    }

    setIsReady(true);
  }, [segments, isLoggedIn, pathname]);

  // Handle back button presses
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // If user is on auth screens and not logged in, exit app instead of navigating back
        if (
          !isLoggedIn &&
          (segments[0] === "(auth)" || segments[0] === "index")
        ) {
          return false; // Default behavior (exit app)
        }

        // If user is not logged in and tries to navigate back to a protected route, prevent it
        if (
          !isLoggedIn &&
          protectedRoutes.some((route) => segments.includes(route))
        ) {
          router.replace("/");
          return true; // Prevent default behavior
        }

        return false; // Allow default back behavior
      }
    );

    return () => backHandler.remove();
  }, [segments, isLoggedIn]);

  if (!isReady) {
    return null;
  }

  return children;
}

const RootLayout = () => {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const [loading, setLoading] = useState(true);

  const [loadedFonts, error] = useFonts({
    DancingScript_400Regular,
    DancingScript_500Medium,
    DancingScript_600SemiBold,
    DancingScript_700Bold,
  });

  useEffect(() => {
    if (loadedFonts) {
      SplashScreen.hideAsync();
      setLoading(false);
    } else if (error) {
      console.log(error);
    }
  }, [loadedFonts, error]);

  if (!loadedFonts || loading) return null;
  if (!loadedFonts && !error) return null;

  return (
    <>
      <QueryClientProvider client={client}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthGuard>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="post" options={{ headerShown: false }} />
              <Stack.Screen name="itinerary" options={{ headerShown: false }} />
              <Stack.Screen name="user" options={{ headerShown: false }} />
              <Stack.Screen name="location" options={{ headerShown: false }} />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
              <Stack.Screen name="review" options={{ headerShown: false }} />
              <Stack.Screen name="business" options={{ headerShown: false }} />
              <Stack.Screen name="service" options={{ headerShown: false }} />
              <Stack.Screen name="chat" options={{ headerShown: false }} />
            </Stack>
          </AuthGuard>
          <Toast />
        </GestureHandlerRootView>
        <StatusBar translucent backgroundColor="transparent" />
      </QueryClientProvider>
    </>
  );
};

export default RootLayout;
