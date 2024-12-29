/*

Filename: updateUser.js

This file handles the frontend logic for updating the user's username and password. It sends a request to the backend to update the user's information in the database.

Author: Shahrez

*/
import { View, Text, ScrollView, Modal, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import useUserStore from '../context/userStore';
import axiosInstance from '../utils/axios';
import Toast from 'react-native-toast-message';

const SettingsScreen = () => {
    const user = useUserStore(state => state.user);
    const setUser = useUserStore(state => state.setUser);

    const [username, setUsername] = useState(user?.username || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');

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
                oldPassword: newPassword,
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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Settings</Text>
                <TouchableOpacity onPress={() => { setModalType('username'); setModalVisible(true); }}>
                    <Text style={{ fontSize: 18, color: '#007bff', marginBottom: 20 }}>Update Username</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setModalType('password'); setModalVisible(true); }}>
                    <Text style={{ fontSize: 18, color: '#007bff', marginBottom: 20 }}>Change Password</Text>
                </TouchableOpacity>
            </ScrollView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
                            {modalType === 'username' ? 'Update Username' : 'Change Password'}
                        </Text>
                        {modalType === 'username' && (
                            <TextInput
                                style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 20 }}
                                placeholder="Enter your new username"
                                value={username}
                                onChangeText={setUsername}
                            />
                        )}
                        {modalType === 'password' && (
                            <>
                                <TextInput
                                    style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 20 }}
                                    placeholder="Enter your old password"
                                    value={oldPassword}
                                    onChangeText={setOldPassword}
                                    secureTextEntry
                                />
                                <TextInput
                                    style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 20 }}
                                    placeholder="Enter your new password"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry
                                />
                            </>
                        )}
                        {loading ? (
                            <ActivityIndicator size="large" color="#000" />
                        ) : (
                            <TouchableOpacity
                                style={{ backgroundColor: '#000', padding: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}
                                onPress={modalType === 'username' ? handleUpdateUsername : handleUpdatePassword}
                            >
                                <Text style={{ color: '#fff', fontSize: 16 }}>Update</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={closeModal} style={{ marginTop: 10 }}>
                            <Text style={{ color: '#f00', textAlign: 'center' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Toast />
        </SafeAreaView>
    );
};

export default SettingsScreen;
