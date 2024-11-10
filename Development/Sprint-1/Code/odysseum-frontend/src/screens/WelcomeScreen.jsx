/*

This is main onboarding screen that will be shown to the user when they first open the app. It will have a welcome message and a button to sign in or sign up.

Subsequent app openings will not show this screen if user is already logged in.


*/

import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native"; //TouchableOpacity is a component that wraps its children in a touchable element. It is used to make the children of the component touchable.
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context"; // SafeAreaView is a component that renders its children in a safe area. It is used to avoid the content from being hidden by the status bar, notches, rounded corners, etc.
import TravelImage from "../../assets/TravelDesign.png";
import { Redirect, router } from "expo-router";
import useUserStore from "../context/userStore";
// import AsyncStorage from "@react-native-async-storage/async-storage";

const WelcomeScreen = () => {

  // const user = useUserStore((state) => state.user);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const logout = useUserStore((state) => state.logout);

  // This is a temporary code block remove it once tested

  useEffect(()=>{
    logout();
  },[])

  /////////////////////////

  // if (user) return <Redirect to="/home" />;
  if(isLoggedIn)
  {
    return ( <Redirect href="/home" /> );
  }

  return (
    <SafeAreaView style={{ backgroundColor: "#161622" }}>
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View className="flex-1 flex justify-around my-4">
          <Text className="text-4xl font-bold text-center text-white">
            Welcome to Odysseum!
          </Text>

          <View className="flex-row justify-center">
            <Image source={TravelImage} className="rounded-full w-[350px] h-[350px]" resizeMode="contain" />
          </View>

          <View className="space-y-4">
            <TouchableOpacity className="py-3 bg-[#8C00E3] mx-7 rounded-xl" onPress={()=> router.push("/sign-up")}>
              <Text className="text-xl font-bold text-center text-gray-300">
                Sign Up
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center">
              <Text className="font-semibold text-white">
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push("/sign-in")}>
                <Text className="font-semibold text-[#8C00E3]"> Log In </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
