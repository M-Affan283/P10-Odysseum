import { Stack, SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message"
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts, DancingScript_400Regular, DancingScript_500Medium, DancingScript_600SemiBold, DancingScript_700Bold } from '@expo-google-fonts/dev';
import { StatusBar } from "expo-status-bar";
import useUserStore from "../src/context/userStore";
import { router } from "expo-router";

SplashScreen.preventAutoHideAsync(); //prevent the splash screen from hiding automatically

//TODO: IMPROVE TAB BAR, HOMESCREEN AND USER PROFILE SCREEN UI

const RootLayout = () => {

  const user = useUserStore((state) => state.user); //check if user is logged in. if not, show welcome screen, else show home screen
  const isLoggedIn = useUserStore((state) => state.isLoggedIn); //for now only basic login check. will be updated later to include token check and refreshing if needed
  const [loading, setLoading] = useState(true);

  const [loadedFonts, error] = useFonts({
    DancingScript_400Regular,
    DancingScript_500Medium,
    DancingScript_600SemiBold,
    DancingScript_700Bold
  });

  // comment this out if you want to test the index screen
  // this will route to home screen if user is logged in
  useEffect(()=>
  {
    if(!loadedFonts || loading) return;
    if(!user) return;

    isLoggedIn ? router.replace("/home") : router.replace("/"); //index.jsx will contain welcome screen

  }, [loadedFonts, error, loading]);


  useEffect(() => {
    if(loadedFonts)
    {
      SplashScreen.hideAsync();
      setLoading(false);
    }
    else if(error)
    {
      console.log(error);
    }
  }, [loadedFonts, error]);

  if(!loadedFonts || loading) return null;
  if (!loadedFonts && !error) return null;
  
  return (
    <>
      <GestureHandlerRootView style={{flex: 1}}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="search/[query]" options={{ headerShown: false }} />
          <Stack.Screen name="post/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="user" options={{ headerShown: false }} />
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
