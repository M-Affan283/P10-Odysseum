import { Stack, SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message"
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts, DancingScript_400Regular, DancingScript_500Medium, DancingScript_600SemiBold, DancingScript_700Bold } from '@expo-google-fonts/dev';
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync(); //prevent the splash screen from hiding automatically

const RootLayout = () => {

  // const [initializing, setInitializing] = useState(true); //when user opens app check for any initializations. Refresh and access tokens, already logged in, fetch preliminary data, etc.

  const [loaded, error] = useFonts({
    DancingScript_400Regular,
    DancingScript_500Medium,
    DancingScript_600SemiBold,
    DancingScript_700Bold
  });

  useEffect(()=>
  {
    if(loaded) SplashScreen.hideAsync();
    else if(error) console.log(error);
  }, [loaded, error]);

  if(!loaded) return null;
  if (!loaded && !error) return null;

  // useEffect(() => {
  //     if(!initializing)
  //     {
  //       SplashScreen.hideAsync(); //hide the splash screen when the app is initialized
  //     }

  // }, [initializing])

  // if(initializing) return null;
  
  return (
    <>
      <GestureHandlerRootView style={{flex: 1}}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="search/[query]" options={{ headerShown: false }} />
          <Stack.Screen name="post/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="user/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="location" options={{ headerShown: false }} />
        </Stack>
        {/* for further configuration check docs */}
        <Toast/> 
        </GestureHandlerRootView>
        <StatusBar translucent backgroundColor="transparent" />
    </>
  );
};

export default RootLayout;
