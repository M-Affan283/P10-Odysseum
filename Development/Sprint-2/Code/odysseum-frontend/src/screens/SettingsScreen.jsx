/*

Filename: updateUser.js

This file handles the frontend logic for updating the user's username and password. It sends a request to the backend to update the user's information in the database.

Author: Shahrez

*/
import { View, Text, ScrollView, Modal, TextInput, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import useUserStore from '../context/userStore';
import axiosInstance from '../utils/axios';
import Toast from 'react-native-toast-message';
import { useColorScheme } from 'nativewind';
import { router } from 'expo-router';
import { ArrowLeftIcon, MagnifyingGlassIcon } from 'react-native-heroicons/solid';
import { BellIcon, ChevronRightIcon, DevicePhoneMobileIcon, InformationCircleIcon, LockClosedIcon, ShieldCheckIcon, UserIcon } from 'react-native-heroicons/outline';



const SettingsScreen = () => {
    const user = useUserStore(state => state.user);
    const setUser = useUserStore(state => state.setUser);

    const [username, setUsername] = useState(user?.username || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');

    const settingsList = [
        {
            title: 'Profile',
            icon: <UserIcon size={20} color="white" />,
        },
        {
            title: 'Notifications',
            icon: <BellIcon size={20} color="white" />,
        },
        {
            title: 'Display',
            icon: <DevicePhoneMobileIcon size={20} color="white" />,
        },
        {
            title: 'Privacy',
            icon: <LockClosedIcon size={20} color="white" />,
        },
        {
            title: 'Security',
            icon: <ShieldCheckIcon size={20} color="white" />,
        },
        {
            title: 'About',
            icon: <InformationCircleIcon size={20} color="white" />,
        }
    ];

    const handleUpdateUsername = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/user/updateUserUsername', {
                userId: user._id,
                username: username,
            });
            if (response.status === 200) {
                setUser({ ...user, username });
                Toast.show({
                    type: 'success',
                    text1: 'Username updated successfully!',
                });
            }
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Error updating username',
            });
        } finally {
            setLoading(false);
            setModalVisible(false);
        }
    };

    const handleUpdatePassword = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/user/updateUserPassword', {
                userId: user._id,
                oldPassword: oldPassword,
                newPassword: newPassword,
            });
            if (response.status === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Password updated successfully!',
                });
            }
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Error updating password',
            });
        } finally {
            setLoading(false);
            setModalVisible(false);
        }
    };

    const closeModal = () => setModalVisible(false);

    // const { colorScheme, toggleColorScheme } = useColorScheme();

    return (
        <SafeAreaView className="flex-1 bg-primary">
            
            <View className="flex-row items-center mt-4 px-3 gap-x-6">
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeftIcon size={30} color='white' />
                </TouchableOpacity>
                <Text className="text-3xl font-dsbold text-purple-500">Settings</Text>
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
                    className="flex-1 text-base pl-2 tracking-wider"
                    // onChangeText={(text) => setSearch(text)}
                    />
                </View>


                <View className="flex-1 mt-8">

                    {settingsList.map((setting, index) => (
                        <TouchableOpacity key={index} className="flex-row items-center p-4 my-1">
                            {setting.icon}
                            <Text className="ml-3 text-white text-lg">{setting.title}</Text>
                            <View className="flex-1 items-end">
                                <ChevronRightIcon size={20} color="white" />
                            </View>
                        </TouchableOpacity>
                    ))}

                </View>


                <View className="flex-1 mt-5 border border-gray-400 rounded-lg p-4">

                    <Text className="text-lg text-white">Account</Text>

                    <TouchableOpacity>
                        <Text className= "text-blue-500 font-medium text-base p-2 rounded-lg mt-1">Log out</Text>
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <Text className= "text-orange-500 font-medium text-base p-2 rounded-lg ">Deactivate Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <Text className= "text-red-500 font-medium text-base p-2 rounded-lg ">Delete Account</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SettingsScreen;
