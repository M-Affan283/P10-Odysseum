import React from "react";
import { Stack } from "expo-router";

const ServiceLayout = () => {

  return (
    
    <>
      <Stack>
        <Stack.Screen name="business/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="[id]/booking" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default ServiceLayout;