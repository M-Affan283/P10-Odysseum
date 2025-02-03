import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Switch, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import useUserStore from "../context/userStore";

const SecurityScreen = () => {
    const user = useUserStore(state => state.user);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [is2FATokenEnabled, setIs2FATokenEnabled] = useState(false);

    // For testing at the moment - backend needs to be implemented
    const handleChangePassword = () => {
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match.");
            return;
        }
        else if (newPassword.length < 8) {
            Alert.alert("Error", "Passwords should have more than 8 characters.");
            return;
        }
        Alert.alert("Success", "Your password has been updated.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    // For testing at the moment
    const toggle2FA = () => {
        setIs2FATokenEnabled(previousState => !previousState);
        Alert.alert(is2FATokenEnabled ? "2FA Disabled" : "2FA Enabled", `Your Two-Factor Authentication is now ${is2FATokenEnabled ? 'disabled' : 'enabled'}.`);
    }

    // For testing at the moment
    const connectedDevices = [
        { id: '1', device: 'iPhone 13' },
        { id: '2', device: 'MacBook Pro' },
        { id: '3', device: 'Windows PC' },
    ]

    // Sections
    const sections = [
        {
            title: "Change Password",
            content: (
                <>
                    {/* Old password input field */}
                    <View className="mb-4">
                        <Text className="text-white p-1">Old Password</Text>
                        <TextInput 
                            className="bg-gray-800 p-2 rounded-md text-white"
                            placeholder="Enter old password"
                            placeholderTextColor="#aaa"
                            secureTextEntry
                            value={oldPassword}
                            onChangeText={setOldPassword}
                        />
                    </View>
                    
                    {/* New password input field */}
                    <View className="mb-4">
                        <Text className="text-white p-1">New Password</Text>
                        <TextInput 
                            className="bg-gray-800 p-2 rounded-md text-white"
                            placeholder="Enter new password"
                            placeholderTextColor="#aaa"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                    </View>
                    
                    {/* Confirm password input field */}
                    <View className="mb-6">
                        <Text className="text-white p-1">Confirm New Password</Text>
                        <TextInput 
                            className="bg-gray-800 p-2 rounded-md text-white"
                            placeholder="Confirm new password"
                            placeholderTextColor="#aaa"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>
                    
                    {/* Update password button */}
                    <TouchableOpacity 
                        className="bg-blue-600 p-4 rounded-md items-center" 
                        onPress={handleChangePassword}
                    >
                        <Text className="text-white font-bold">Update Password</Text>
                    </TouchableOpacity>
                </>
            ),
        },
        {
            title: "Enable Two-Factor Authentication (2FA)",
            content: (
                <>
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white">Enable 2FA</Text>
                        <Switch
                            value={is2FATokenEnabled}
                            onValueChange={toggle2FA}
                            trackColor={{ false: "#ccc", true: "#4caf50" }}
                            thumbColor={is2FATokenEnabled ? "#fff" : "#f4f3f4"}
                        />
                    </View>
                </>
            ),
        },
        {
            title: "Connected Devices",
            content: (
                <>
                    <FlatList
                        data={connectedDevices}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View className="mb-3 p-3 bg-gray-800 rounded-md">
                                <Text className="text-white">{item.device}</Text>
                            </View>
                        )}
                    />
                </>
            ),
        }
    ];

    return (
        <SafeAreaView className="flex-1 bg-[#070f1b] p-5">
            {/* Header */}
            <View className="flex-row items-center gap-x-6">
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeftIcon size={30} color='white' />
                </TouchableOpacity>
                <Text className="text-3xl font-dsbold text-purple-500">Security</Text>
            </View>

            <FlatList
                data={sections}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View className="mb-5">
                        <Text className="text-white text-2xl font-bold mb-2">{item.title}</Text>
                        <View className="text-gray-400 mb-4">
                            {item.content}
                        </View>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </SafeAreaView>
    );
};

export default SecurityScreen;