import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const LocationLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="location/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="location/[id]/[category]" options={{ headerShown: false }} />
        <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
      </Stack>

      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default LocationLayout;