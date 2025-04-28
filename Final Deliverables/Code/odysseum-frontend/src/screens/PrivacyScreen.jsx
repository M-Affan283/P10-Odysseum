/*
    Author: Haroon Khawaja
    Description: A simple privay policy screen outlying our policies regarding data protection and handling.
*/ 

import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeftIcon } from 'react-native-heroicons/solid';

const PrivacyScreen = () => {
    return (
        <SafeAreaView className="flex-1 bg-[#070f1b] p-5">
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header */}
                <View className="flex-row items-center gap-x-6">
                    <TouchableOpacity onPress={() => router.back()}>
                        <ArrowLeftIcon size={30} color='white' />
                    </TouchableOpacity>
                    <Text className="text-3xl font-dsbold text-purple-500">Privacy Policy</Text>
                </View>
                
                {/* Intro */}
                <View className="mb-6">
                    <Text className="text-white text-lg font-bold">Introduction</Text>
                    <Text className="text-white mt-2">
                        This privacy policy outlines how we collect, use, and protect your data while using our app.
                    </Text>
                </View>
                
                {/* Data collection */}
                <View className="mb-6">
                    <Text className="text-white text-lg font-bold">Data Collection</Text>
                    <Text className="text-white mt-2">
                        We collect data such as your name, email address, and usage data to improve your experience in the app.
                    </Text>
                </View>
                
                {/* Data usage */}
                <View className="mb-6">
                    <Text className="text-white text-lg font-bold">How We Use Your Data</Text>
                    <Text className="text-white mt-2">
                        We use your data to personalize your experience, provide app functionality (AI, recommendations, etc.), and improve our services.
                    </Text>
                </View>

                {/* Data security */}
                <View className="mb-6">
                    <Text className="text-white text-lg font-bold">Data Security</Text>
                    <Text className="text-white mt-2">
                        We take the security of your data seriously and implement appropriate security measures to protect your information.
                    </Text>
                </View>

                {/* User rights */}
                <View className="mb-6">
                    <Text className="text-white text-lg font-bold">Your Rights</Text>
                    <Text className="text-white mt-2">
                        You have the right to access, correct, and delete your personal data at any time. Please contact us if you wish to exercise any of these rights.
                    </Text>
                </View>

                {/* Contact email */}
                <View className="mb-6">
                    <Text className="text-white text-lg font-bold">Contact Us</Text>
                    <Text className="text-white mt-2">
                        If you have any questions or concerns about our privacy policy, please contact us at group10.sproj@gmail.com.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PrivacyScreen;
