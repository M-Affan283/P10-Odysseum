import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeftIcon, LockClosedIcon, CheckCircleIcon } from 'react-native-heroicons/solid';
import { useRouter } from "expo-router";
import useUserStore from "../context/userStore";
import Toast from 'react-native-toast-message';
import axiosInstance from "../utils/axios";
import LottieView from "lottie-react-native";

const SecurityScreen = () => {
    const router = useRouter();
    const user = useUserStore(state => state.user);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    // Password validation
    const [passwordStrength, setPasswordStrength] = useState(0);
    
    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        return strength;
    };
    
    const handlePasswordChange = (text) => {
        setNewPassword(text);
        setPasswordStrength(checkPasswordStrength(text));
    };
    
    const getStrengthLabel = () => {
        const labels = ["Weak", "Fair", "Good", "Strong"];
        return labels[passwordStrength - 1] || "";
    };
    
    const getStrengthColor = () => {
        const colors = ["text-red-500", "text-yellow-500", "text-blue-500", "text-green-500"];
        return colors[passwordStrength - 1] || "";
    };
    
    const handleUpdatePassword = async () => {
        // Basic validation
        if (newPassword !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Passwords do not match',
            });
            return;
        }
        
        if (newPassword.length < 8) {
            Toast.show({
                type: 'error',
                text1: 'Password must be at least 8 characters',
            });
            return;
        }
        
        setLoading(true);
        try 
        {
            const response = await axiosInstance.post('/user/updateUserPassword', {
                userId: user._id,
                oldPassword: oldPassword,
                newPassword: newPassword,
            });
            
            if (response.status === 200) 
            {
                setIsSuccess(true);
                Toast.show({
                    type: 'success',
                    position: 'bottom',
                    text1: 'Password updated successfully!',
                    visibilityTime: 2000,
                });
                
                // Reset fields after success
                setTimeout(() => {
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordStrength(0);
                    setIsSuccess(false);
                }, 1000);
            }
        } 
        catch (error)
        {
            console.error(error);
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'Error updating password',
                text2: error.response?.data?.message || 'Please try again',
                visibilityTime: 2000,
            });
        } 
        finally 
        {
            setLoading(false);
        }
    };
    
    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            {/* Header */}
            <View className="flex-row items-center px-5 py-4 border-b border-slate-800">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ArrowLeftIcon size={24} color="#fff" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-white ml-3">Update Password</Text>
            </View>
            
            <ScrollView>

                <View className="flex-1 p-6">
                    <View className="items-center mb-5 mt-4">
                        <LockClosedIcon size={50} color="#8b5cf6" />
                    </View>
                    
                    <Text className="text-base text-slate-400 text-center mb-8">
                        Create a strong password to protect your account
                    </Text>
                    
                    {/* Password Form */}
                    <View className="mb-6">
                        {/* Current Password */}
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-slate-200 mb-2">Current Password</Text>
                            <TextInput
                                className="bg-slate-800 rounded-xl px-4 py-3.5 text-white border border-slate-700"
                                secureTextEntry
                                value={oldPassword}
                                onChangeText={setOldPassword}
                                placeholder="Enter your current password"
                                placeholderTextColor="#6b7280"
                            />
                        </View>
                        
                        {/* New Password */}
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-slate-200 mb-2">New Password</Text>
                            <TextInput
                                className="bg-slate-800 rounded-xl px-4 py-3.5 text-white border border-slate-700"
                                secureTextEntry
                                value={newPassword}
                                onChangeText={handlePasswordChange}
                                placeholder="Enter new password"
                                placeholderTextColor="#6b7280"
                            />
                            
                            {newPassword.length > 0 && (
                                <View className="mt-2">
                                    <View className="flex-row mt-2 space-x-1">
                                        <View className={`flex-1 h-1 rounded ${passwordStrength >= 1 ? 'bg-red-500' : 'bg-slate-700'}`} />
                                        <View className={`flex-1 h-1 rounded ${passwordStrength >= 2 ? 'bg-yellow-500' : 'bg-slate-700'}`} />
                                        <View className={`flex-1 h-1 rounded ${passwordStrength >= 3 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                                        <View className={`flex-1 h-1 rounded ${passwordStrength >= 4 ? 'bg-green-500' : 'bg-slate-700'}`} />
                                    </View>
                                    {passwordStrength > 0 && (
                                        <Text className={`text-xs mt-1 font-medium ${getStrengthColor()}`}>
                                            {getStrengthLabel()}
                                        </Text>
                                    )}
                                </View>
                            )}
                        </View>
                        
                        {/* Confirm Password */}
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-slate-200 mb-2">Confirm Password</Text>
                            <TextInput
                                className="bg-slate-800 rounded-xl px-4 py-3.5 text-white border border-slate-700"
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm your new password"
                                placeholderTextColor="#6b7280"
                            />
                            
                            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                                <Text className="text-red-500 text-xs mt-1">
                                    Passwords don't match
                                </Text>
                            )}
                        </View>
                    </View>
                    
                    {/* Update Button */}
                    <TouchableOpacity
                        className={`rounded-xl py-4 items-center mb-6 ${
                            isSuccess ? 'bg-emerald-600' : 
                            loading ? 'bg-purple-700' :
                            (!oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || passwordStrength < 2) ? 
                            'bg-gray-600 opacity-60' : 'bg-purple-600'
                        }`}
                        onPress={handleUpdatePassword}
                        disabled={!oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || passwordStrength < 2 || loading || isSuccess}
                    >
                        {isSuccess ? (
                            <View className="flex-row items-center justify-center">
                                <CheckCircleIcon size={20} color="#fff" />
                                <Text className="text-white text-base font-semibold ml-2">Password Updated</Text>
                            </View>
                        ) : (
                                loading ?
                                (
                                    <LottieView
                                        source={require('../../assets/animations/Loading2.json')}
                                        autoPlay
                                        loop
                                        style={{width: 50, height: 50}}
                                    />
                                )
                                :
                                (
                                    <Text className={`text-white font-semibold text-lg`}>Update Password</Text>
                                )
                        )}
                    </TouchableOpacity>
                    
                    {/* Password Requirements */}
                    <View className="bg-slate-800 rounded-xl p-4">
                        <Text className="text-sm font-semibold text-slate-200 mb-3">Password Requirements:</Text>
                        <View className="flex-row items-center mb-2">
                            <View className={`w-2 h-2 rounded-full mr-2 ${newPassword.length >= 8 ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                            <Text className="text-sm text-slate-400">Minimum 8 characters</Text>
                        </View>
                        <View className="flex-row items-center mb-2">
                            <View className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(newPassword) ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                            <Text className="text-sm text-slate-400">At least one uppercase letter</Text>
                        </View>
                        <View className="flex-row items-center mb-2">
                            <View className={`w-2 h-2 rounded-full mr-2 ${/[0-9]/.test(newPassword) ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                            <Text className="text-sm text-slate-400">At least one number</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className={`w-2 h-2 rounded-full mr-2 ${/[^A-Za-z0-9]/.test(newPassword) ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                            <Text className="text-sm text-slate-400">At least one special character</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default SecurityScreen;