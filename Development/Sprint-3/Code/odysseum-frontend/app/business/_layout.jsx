import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const BusinessLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="location/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="location/[id]/[category]" options={{ headerShown: false }} />
        <Stack.Screen name="location/[id]/all" options={{ headerShown: false }} />
        <Stack.Screen name="location/[id]/heatmap" options={{ headerShown: false }} />
        <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
      </Stack>

      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default BusinessLayout;