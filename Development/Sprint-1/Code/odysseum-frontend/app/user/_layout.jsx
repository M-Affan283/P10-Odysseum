import React, { useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import axiosInstance from "../../src/utils/axios";
import useUserStore from "../../src/context/userStore";

const UserLayout = () => {

  return (
    
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="[id]" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        
      </Stack>

      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default UserLayout;