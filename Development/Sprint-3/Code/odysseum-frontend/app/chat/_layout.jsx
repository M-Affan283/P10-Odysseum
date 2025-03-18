import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SocketProvider } from "../../src/context/SocketContext";

const ChatLayout = () => {
  return (
    <>
      {/* <SocketProvider> */}
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom'}}/>
          <Stack.Screen name="[id]" options={{ headerShown: false, animation: 'slide_from_right'}}/>
        </Stack>
      {/* </SocketProvider> */}
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default ChatLayout;