import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

//We are creating another layout for auth so that the menu and other components are not displayed when the user is not logged in.

const LocationLayout = () => {
  return (
    //The stack component will hold the screens that are part of the auth layout which are the login and register screens.
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="[id]" options={{ headerShown: false }} />
        
      </Stack>

      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default LocationLayout;