import { StyleSheet, Text, View } from "react-native";
import { Slot, Stack, SplashScreen } from "expo-router"; // Slot component is used to render the children of the layout. It is a placeholder for the children of the layout.
import { useEffect, useState } from "react";

const RootLayout = () => {
  return (
    <Stack>
      {/* this is the main screen. the name 'index' means refer to the index.jsx file in the app folder */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

    </Stack>
  );
};

export default RootLayout;
