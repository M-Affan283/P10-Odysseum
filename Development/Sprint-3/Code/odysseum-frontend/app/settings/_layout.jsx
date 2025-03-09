import React from "react";
import { Stack } from "expo-router";

const SettingsLayout = () => {

  return (
    
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="business/index" options={{ headerShown: false }} />
        <Stack.Screen name="business/create" options={{ headerShown: false }} />
        <Stack.Screen name="business/manage" options={{ headerShown: false }} />
        <Stack.Screen name="service/create/[createId]" options={{ headerShown: false }} />
        <Stack.Screen name="service/manage/[manageId]" options={{ headerShown: false }} />
        <Stack.Screen name="profile/index" options={{ headerShown: false }} />
        <Stack.Screen name="profile/manage" options={{ headerShown: false }} />
        <Stack.Screen name="profile/password" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default SettingsLayout;