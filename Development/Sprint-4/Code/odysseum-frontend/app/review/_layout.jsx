import React from "react";
import { Stack } from "expo-router";

const ReviewLayout = () => {

  return (
    
    <>
      <Stack>
        <Stack.Screen name="business/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="location/[id]" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default ReviewLayout;