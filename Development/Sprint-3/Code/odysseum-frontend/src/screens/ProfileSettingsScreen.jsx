import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from "react-native-heroicons/solid";
import { router } from "expo-router";

const ProfileSettingsScreen = () => {

    // manage profile (update bio, username, pfp), manage passwords, 2fa
    const settingsList = [
        {
            title: 'Manage Profile',
            routeUrl: '/settings/profile/manage'
        },
        {
            title: 'Change Password',
            routeUrl: '/settings/profile/password'
        },
        {
            title: 'Two-Factor Authentication',
            routeUrl: '/settings/profile/2fa'
        }
    ]


  return (
    <SafeAreaView className="flex-1 bg-primary">
            
        <View className="flex-row items-center mt-4 px-3 gap-x-6">
            <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeftIcon size={30} color='white' />
            </TouchableOpacity>
            <Text className="text-3xl font-dsbold text-purple-500">Profile Settings</Text>
        </View>

        <ScrollView className="p-4 mt-5" contentContainerStyle={{ paddingBottom: 30 }}>
            <View className="flex-1 flex-row h-[40] items-center rounded-full pl-2 border-gray-500 border">
                <MagnifyingGlassIcon size={20} color="white" />
                <TextInput
                placeholder="Search"
                placeholderTextColor="gray"
                // value={search}
                clearButtonMode="always"
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 text-base pl-2 tracking-wider text-white"
                // onChangeText={(text) => setSearch(text)}
                />
            </View>


            <View className="flex-1 mt-8">

                {settingsList.map((setting, index) => (
                    <TouchableOpacity key={index} className="flex-row items-center p-4 my-1" onPress={() => router.push(setting.routeUrl)}>
                        <Text className="ml-3 text-white text-lg">{setting.title}</Text>
                        <View className="flex-1 items-end">
                            <ChevronRightIcon size={20} color="white" />
                        </View>
                    </TouchableOpacity>
                ))}

            </View>
        </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileSettingsScreen