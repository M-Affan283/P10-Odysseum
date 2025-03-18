import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions } from "react-native";
import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Toast from "react-native-toast-message";
import axiosInstance from "../utils/axios";

const SignUpScreen = () => {
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false); //to show loading spinner and disable button
  const [error, setError] = useState("");

  const submitForm = () => {
    console.log(form);

    // if (!form.firstName || !form.lastName || !form.email || !form.username || !form.password) {
    //   setError("All fields are required");
    //   return;
    // }

    setSubmitting(true);

    axiosInstance.post("/user/register", form)

    .then((res) =>
    {
        if (res.data.success) 
        {
            //navigate to login screen
            console.log(res.data);

            Toast.show({
              type: "success",
              position: "top",
              text1: "Sign Up Successful",
              text2: "You can now login to your account. Redirecting...",
              visibilityTime: 3000,
            })

            setTimeout(() => {
              router.replace("/sign-in");
            }, 3000);
        }
        setSubmitting(false);
    })
    .catch((err) => 
    {
        //display error message in screen
        console.log(err);
        // setError(err.response.message);
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Sign Up Failed",
          text2: "Please try again later",
          visibilityTime: 3000,
        })
        setSubmitting(false);
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#0F0F1A" }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Background Elements */}
        <LinearGradient
          colors={['rgba(140, 0, 227, 0.4)', 'rgba(0, 0, 0, 0)']}
          style={{ 
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: 150
          }}
        />
        <LinearGradient
          colors={['rgba(76, 0, 255, 0.3)', 'rgba(0, 0, 0, 0)']}
          style={{ 
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: 100
          }}
        />
        
        <View className="w-full px-6 py-6 flex-1">
          {/* Logo or App Name */}
          <View className="items-center mb-6">
            <Text className="text-white text-4xl font-dsbold">
              Odysseum
            </Text>
            <Text className="text-gray-400 text-lg mt-2">
              Create your account
            </Text>
          </View>

          {/* Form Container */}
          <View className="bg-[#1A1A2E] rounded-3xl p-6 shadow-lg mb-6">
            <Text className="text-2xl font-dssemibold text-white mb-6">
              Join the Adventure
            </Text>

            {/* First Name Input */}
            <View className="mb-4">
              <Text className="text-gray-300 mb-2">First Name</Text>
              <View className="flex-row items-center bg-[#252538] rounded-xl px-4 h-14">
                <Ionicons name="person-outline" size={20} color="#8C00E3" />
                <TextInput
                  placeholder="Enter your first name"
                  placeholderTextColor="#6c6c7e"
                  value={form.firstName}
                  onChangeText={(text) => setForm({ ...form, firstName: text })}
                  className="flex-1 text-white ml-3 h-full"
                />
              </View>
            </View>

            {/* Last Name Input */}
            <View className="mb-4">
              <Text className="text-gray-300 mb-2">Last Name</Text>
              <View className="flex-row items-center bg-[#252538] rounded-xl px-4 h-14">
                <Ionicons name="person-outline" size={20} color="#8C00E3" />
                <TextInput
                  placeholder="Enter your last name"
                  placeholderTextColor="#6c6c7e"
                  value={form.lastName}
                  onChangeText={(text) => setForm({ ...form, lastName: text })}
                  className="flex-1 text-white ml-3 h-full"
                />
              </View>
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-gray-300 mb-2">Email</Text>
              <View className="flex-row items-center bg-[#252538] rounded-xl px-4 h-14">
                <Ionicons name="mail-outline" size={20} color="#8C00E3" />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#6c6c7e"
                  value={form.email}
                  onChangeText={(text) => setForm({ ...form, email: text })}
                  className="flex-1 text-white ml-3 h-full"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Username Input */}
            <View className="mb-4">
              <Text className="text-gray-300 mb-2">Username</Text>
              <View className="flex-row items-center bg-[#252538] rounded-xl px-4 h-14">
                <Ionicons name="at-outline" size={20} color="#8C00E3" />
                <TextInput
                  placeholder="Choose a username"
                  placeholderTextColor="#6c6c7e"
                  value={form.username}
                  onChangeText={(text) => setForm({ ...form, username: text })}
                  className="flex-1 text-white ml-3 h-full"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-6">
              <Text className="text-gray-300 mb-2">Password</Text>
              <View className="flex-row items-center bg-[#252538] rounded-xl px-4 h-14">
                <Ionicons name="lock-closed-outline" size={20} color="#8C00E3" />
                <TextInput
                  placeholder="Create a password"
                  placeholderTextColor="#6c6c7e"
                  value={form.password}
                  onChangeText={(text) => setForm({ ...form, password: text })}
                  secureTextEntry={!showPassword}
                  className="flex-1 text-white ml-3 h-full"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#6c6c7e" 
                  />
                </TouchableOpacity>
              </View>
              <Text className="text-gray-500 text-xs mt-2 ml-1">
                Password must be at least 6 characters
              </Text>
            </View>

            {/* Error Message */}
            {error ? (
              <Text className="text-red-500 text-center mb-4">{error}</Text>
            ) : null}

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={submitForm}
              disabled={submitting}
            >
              <LinearGradient
                colors={['#8C00E3', '#5F00D8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl h-14 justify-center items-center"
              >
                {submitting ? (
                  <Text className="text-white font-bold text-lg">Please wait...</Text>
                ) : (
                  <Text className="text-white font-bold text-lg">Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Alternative Sign Up Methods */}
          <View className="items-center mb-4">
            <Text className="text-gray-400 mb-4">Or sign up with</Text>
            <View className="flex-row justify-center space-x-4">
              <TouchableOpacity className="bg-[#1A1A2E] w-14 h-14 rounded-full items-center justify-center">
                <Ionicons name="logo-google" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity className="bg-[#1A1A2E] w-14 h-14 rounded-full items-center justify-center">
                <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Link */}
          <View className="flex-row justify-center mt-2 mb-6">
            <Text className="text-gray-300">Already have an account? </Text>
            <Link href="sign-in" asChild>
              <TouchableOpacity>
                <Text className="font-bold text-[#8C00E3]">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUpScreen;