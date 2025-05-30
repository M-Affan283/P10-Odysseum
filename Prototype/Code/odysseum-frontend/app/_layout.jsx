import { Text, View } from "react-native";
import { Stack, SplashScreen } from "expo-router"; // Slot component is used to render the children of the layout. It is a placeholder for the children of the layout.
import { useEffect, useState } from "react";
//Splash Screen is a component that is displayed when user opens the app. It is used to display the logo of the app or any other information that you want to show to the user when the app is opened. It is a good practice to show a splash screen when the app is opened so that the user knows that the app is loading.
import Toast from "react-native-toast-message"

// SplashScreen.preventAutoHideAsync(); //prevent the splash screen from hiding automatically

const RootLayout = () => {
   // this will refer to the index.jsx file in the app folder since it is the main file

  // const [initializing, setInitializing] = useState(true); //when user opens app check for any initializations. Refresh and access tokens, already logged in, fetch preliminary data, etc.

  // useEffect(()=>{

  //   //placeholder for any initializations
  //   setTimeout(() => {
  //     setInitializing(false);
  //   }, 2500);

  // },[]);

  // useEffect(() => {
  //     if(!initializing)
  //     {
  //       SplashScreen.hideAsync(); //hide the splash screen when the app is initialized
  //     }

  // }, [initializing])

  // if(initializing) return null;
  
  return (
    <>
      <Stack>
        {/* this is the main screen. the name 'index' means refer to the index.jsx file in the app folder */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        {/* this is the auth layout in the auth folder we add a stack screen for it here because it is part of the root layout */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        {/* this is the tabs layout in the tabs folder we add a stack screen for it here because it is part of the root layout */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* this is the search layout in the search folder we add a stack screen for it here because it is part of the root layout */}
        <Stack.Screen name="search/[query]" options={{ headerShown: false }} />
      </Stack>

      {/* for further configuration check docs */}
      <Toast/> 
    </>
  );
};

export default RootLayout;
