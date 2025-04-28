import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Dimensions } from "react-native";
import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import useUserStore from "../context/userStore";
import { setAccessToken } from '../utils/tokenUtils';
import axiosInstance from "../utils/axios";
import Toast from "react-native-toast-message";


const LoginScreen = () => {
    const [form, setForm] = useState({ //set to empty object later
        identifier: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);

    const setUser = useUserStore((state) => state.setUser);
    // const user = useUserStore((state)=> state.user);
    // const logout = useUserStore((state)=> state.logout);

    const [submitting, setSubmitting] = useState(false); //to show loading spinner and disable button
    const [error, setError] = useState("");

    const submitForm = () => {
        console.log(form);
        setSubmitting(true);

        axiosInstance.post("/user/login", form)
            .then(async (res) => {
                if (res.data.success) {
                    // Store the access token
                    await setAccessToken(res.data.accessToken);

                    // Set user in store
                    await setUser(res.data.user);

                    if (router.canDismiss()) router.dismissAll()
                    router.replace("/home"); 
                    console.log("LOGGED IN USER")
                }
                setSubmitting(false);
            })
            .catch((err) => {
                console.log(err);
                setError(err.response.data.message);
                setSubmitting(false);
                Toast.show({
                    type: "error",
                    position: "top",
                    text1: "Error",
                    text2: err.response.data.message,
                    visibilityTime: 300
                });
            });
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: "#0F0F1A" }}>
            <StatusBar style="dark" />
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
                
                <View className="w-full px-6 py-12 flex-1 justify-center">
                    {/* Logo or App Name */}
                    <View className="items-center mb-12">
                        <Text className="text-white text-4xl font-dsbold">
                            Odysseum
                        </Text>
                        <Text className="text-gray-400 text-lg mt-2">
                            Begin your journey
                        </Text>
                    </View>

                    {/* Form Container */}
                    <View className="bg-[#1A1A2E] rounded-3xl p-6 shadow-lg">
                        <Text className="text-2xl font-semibold text-white mb-6">
                            Welcome Back
                        </Text>

                        {/* Email/Username Input */}
                        <View className="mb-5">
                            <Text className="text-gray-300 mb-2">Email/Username</Text>
                            <View className="flex-row items-center bg-[#252538] rounded-xl px-4 h-14">
                                <Ionicons name="person-outline" size={20} color="#8C00E3" />
                                <TextInput
                                    placeholder="Enter your email or username"
                                    placeholderTextColor="#6c6c7e"
                                    value={form.identifier}
                                    onChangeText={(text) => setForm({ ...form, identifier: text })}
                                    className="flex-1 text-white ml-3 h-full"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View className="mb-3">
                            <Text className="text-gray-300 mb-2">Password</Text>
                            <View className="flex-row items-center bg-[#252538] rounded-xl px-4 h-14">
                                <Ionicons name="lock-closed-outline" size={20} color="#8C00E3" />
                                <TextInput
                                    placeholder="Password"
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
                        </View>

                        {/* Forgot Password Link */}
                        <TouchableOpacity className="self-end mb-6">
                            <Text className="text-[#8C00E3] font-medium">Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* Error Message */}
                        {error ? (
                            <Text className="text-red-500 text-center mb-4">{error}</Text>
                        ) : null}

                        {/* Login Button */}
                        <TouchableOpacity
                            onPress={submitForm}
                            disabled={submitting}
                            className="mb-5"
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
                                    <Text className="text-white font-bold text-lg">Log In</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Alternative Login Methods */}
                    <View className="mt-8 items-center">
                        <Text className="text-gray-400 mb-4">Or continue with</Text>
                        <View className="flex-row justify-center space-x-4">
                            <TouchableOpacity className="bg-[#1A1A2E] w-14 h-14 rounded-full items-center justify-center">
                                <Ionicons name="logo-google" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity className="bg-[#1A1A2E] w-14 h-14 rounded-full items-center justify-center">
                                <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Sign Up Link */}
                    <View className="flex-row justify-center mt-8">
                        <Text className="text-gray-300">Don't have an account? </Text>
                        <Link href="sign-up" asChild>
                            <TouchableOpacity>
                                <Text className="font-bold text-[#8C00E3]">Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default LoginScreen;
