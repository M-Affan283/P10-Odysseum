import React from "react";
import { Stack } from "expo-router";

const UserLayout = () => {

  return (
    
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="[id]" options={{ headerShown: false }} />
        <Stack.Screen name="booking/bookings" options={{ headerShown: false }} />
        <Stack.Screen name="booking/[id]" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default UserLayout;