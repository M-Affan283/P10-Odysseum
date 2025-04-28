/*

This is main onboarding screen that will be shown to the user when they first open the app. It will have a welcome message and a button to sign in or sign up.

Subsequent app openings will not show this screen if user is already logged in.


*/

import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TravelImage from "../../assets/TravelDesign.png";
import { Redirect, router } from "expo-router";
import useUserStore from "../context/userStore";
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Plane, Compass } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const logout = useUserStore((state) => state.logout);

  // This is a temporary code block remove it once tested
  useEffect(() => 
  {
    logout();
  }, []);
  /////////////////////////

  if (isLoggedIn) {
    return (<Redirect href="/home" />);
  }

  return (
    <LinearGradient
      colors={['#070f1b', '#0f172a', '#1e293b']}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>

          {/* Logo at the top */}
          <View className="items-center pt-8 pb-2">
            <Text className="text-5xl font-dsbold text-white mb-2">
              Odysseum
            </Text>
            <Text className="text-lg text-gray-300 text-center">
              Begin your journey of a thousand memories
            </Text>
          </View>

          {/* Main content */}
          <View className="flex-1 justify-between px-6 py-4">
            {/* Image section with animated-like glow */}
            <View className="items-center my-4">
              <View className="relative">
                <View className="absolute bg-[#8C00E3]/20 w-[280px] h-[280px] rounded-full top-8" />
                <View className="absolute bg-[#8C00E3]/10 w-[320px] h-[320px] rounded-full top-[-4]" />
                <Image
                  source={TravelImage}
                  className="w-[300px] h-[300px]"
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Feature highlights */}
            <View className="space-y-3 my-4">
              <View className="flex-row items-center space-x-3 px-2">
                <MapPin size={20} color="#8C00E3" />
                <Text className="text-white text-base">Discover amazing destinations</Text>
              </View>
              <View className="flex-row items-center space-x-3 px-2">
                <Plane size={20} color="#8C00E3" />
                <Text className="text-white text-base">Plan your perfect journey</Text>
              </View>
              <View className="flex-row items-center space-x-3 px-2">
                <Compass size={20} color="#8C00E3" />
                <Text className="text-white text-base">Navigate with confidence</Text>
              </View>
            </View>

            {/* Button section */}
            <View className="space-y-4 mt-4 mb-8">
              <TouchableOpacity
                onPress={() => router.push("/sign-up")}
                className="overflow-hidden rounded-xl"
              >
                <LinearGradient
                  colors={['#9900FF', '#8C00E3', '#7B00C6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="py-4 rounded-xl"
                >
                  <Text className="text-xl font-bold text-center text-white">
                    Get Started
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View className="flex-row justify-center items-center py-2">
                <Text className="font-medium text-white text-base">
                  Already have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push("/sign-in")}>
                  <Text className="font-bold text-[#8C00E3] text-base ml-2">
                    Log In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default WelcomeScreen;
