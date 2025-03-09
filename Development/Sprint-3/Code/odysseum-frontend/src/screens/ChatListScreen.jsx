import { View, Text, FlatList, TouchableOpacity, Image, TextInput, Modal, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import axiosInstance from '../utils/axios';
import useUserStore from '../context/userStore';
import { MagnifyingGlassIcon, PlusIcon } from 'react-native-heroicons/outline';
import { XMarkIcon } from 'react-native-heroicons/solid';
import { calculateDuration } from '../utils/dateTimCalc';
import images from '../../assets/images/images';
import Toast from 'react-native-toast-message';

const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [followedUsersLoading, setFollowedUsersLoading] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  
  const user = useUserStore(state => state.user);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/chat/getUserChats');
      setChats(response.data.chats || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Error fetching chats',
        text2: error.response?.data?.message || 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowedUsers = async () => {
    try {
      setFollowedUsersLoading(true);
      
      // Get users that the current user follows
      const followingIds = user.following || [];
      
      if (followingIds.length === 0) {
        setFollowedUsers([]);
        setFollowedUsersLoading(false);
        return;
      }
      
      // Get details for each followed user
      const usersPromises = followingIds.map(userId => 
        axiosInstance.get(`/user/getById?userToViewId=${userId}&requestorId=${user._id}`)
      );
      
      const usersResponses = await Promise.all(usersPromises);
      const followingUsers = usersResponses
        .filter(res => res.data && res.data.user)
        .map(res => res.data.user);
      
      // Filter out users that already have a chat
      const existingChatUserIds = chats.map(chat => chat.otherUser._id);
      const filteredUsers = followingUsers.filter(followedUser => 
        !existingChatUserIds.includes(followedUser._id)
      );
      
      setFollowedUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching followed users:', error);
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Error fetching followed users',
        text2: error.response?.data?.message || 'Please try again later',
      });
    } finally {
      setFollowedUsersLoading(false);
    }
  };

  const handleCreateNewChat = async (otherUserId) => {
    try {
      setCreatingChat(true);
      const response = await axiosInstance.post('/chat/createChat', {
        otherUserId
      });
      
      if (response.data.success) {
        setShowNewChatModal(false);
        // Refresh chat list
        await fetchChats();
        // Navigate to the new chat
        router.push(`/chat/${response.data.chat._id}`);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Error creating chat',
        text2: error.response?.data?.message || 'Please try again later',
      });
    } finally {
      setCreatingChat(false);
    }
  };

  const handleOpenNewChatModal = () => {
    fetchFollowedUsers();
    setShowNewChatModal(true);
  };

  // Filter chats based on search query
  const filteredChats = search.trim() 
    ? chats.filter(chat => 
        chat.otherUser.username.toLowerCase().includes(search.toLowerCase())
      )
    : chats;

  const renderChatItem = ({ item }) => {
    const lastMessage = item.lastMessage || {};
    const unreadCount = item.unreadCount || 0;
    
    return (
      <TouchableOpacity 
        className="flex-row items-center p-4 border-b border-gray-700"
        onPress={() => router.push(`/chat/${item._id}`)}
      >
        <Image 
          source={{ uri: item.otherUser?.profilePicture || images.DefaultProfileImg }}
          className="w-12 h-12 rounded-full"
        />
        <View className="flex-1 ml-4">
          <View className="flex-row justify-between">
            <Text className="text-white font-semibold text-lg">
              {item.otherUser?.username}
            </Text>
            {lastMessage.timestamp && (
              <Text className="text-gray-400 text-sm">
                {calculateDuration(lastMessage.timestamp)}
              </Text>
            )}
          </View>
          <View className="flex-row justify-between items-center mt-1">
            <Text 
              className="text-gray-400 text-sm flex-1"
              numberOfLines={1}
            >
              {lastMessage.content || 'No messages yet'}
            </Text>
            {unreadCount > 0 && (
              <View className="bg-purple-600 rounded-full w-6 h-6 items-center justify-center ml-2">
                <Text className="text-white text-xs">{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFollowedUserItem = ({ item }) => (
    <TouchableOpacity 
      className="flex-row items-center p-4 border-b border-gray-700"
      onPress={() => handleCreateNewChat(item._id)}
      disabled={creatingChat}
    >
      <Image 
        source={{ uri: item.profilePicture || images.DefaultProfileImg }}
        className="w-12 h-12 rounded-full"
      />
      <View className="flex-1 ml-4">
        <Text className="text-white font-semibold text-lg">
          {item.username}
        </Text>
        <Text className="text-gray-400 text-sm">
          {item.firstName} {item.lastName}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="p-4">
        <Text className="text-white text-2xl font-bold mb-4">Messages</Text>
        
        <View className="flex-row items-center bg-gray-800 rounded-full px-4 py-2 mb-4">
          <MagnifyingGlassIcon size={20} color="gray" />
          <TextInput
            placeholder="Search messages"
            placeholderTextColor="gray"
            className="flex-1 ml-2 text-white"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={item => item._id}
        refreshing={loading}
        onRefresh={fetchChats}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-gray-400 text-center">
              {search.trim() 
                ? "No matching conversations found" 
                : "No messages yet. Start a conversation!"}
            </Text>
          </View>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-purple-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={handleOpenNewChatModal}
      >
        <PlusIcon size={24} color="white" />
      </TouchableOpacity>

      {/* New Chat Modal */}
      <Modal
        visible={showNewChatModal}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 bg-black bg-opacity-50">
          <View className="flex-1 mt-20 bg-[#070f1b] rounded-t-3xl">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-700">
              <Text className="text-white text-xl font-bold">New Conversation</Text>
              <TouchableOpacity onPress={() => setShowNewChatModal(false)}>
                <XMarkIcon size={24} color="white" />
              </TouchableOpacity>
            </View>

            {followedUsersLoading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#8C00E3" />
                <Text className="text-gray-400 mt-4">Loading users...</Text>
              </View>
            ) : (
              <FlatList
                data={followedUsers}
                renderItem={renderFollowedUserItem}
                keyExtractor={item => item._id}
                ListEmptyComponent={() => (
                  <View className="flex-1 justify-center items-center p-4 mt-10">
                    <Text className="text-gray-400 text-center">
                      You're not following anyone that you haven't chatted with yet.
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Loading overlay for chat creation */}
      {creatingChat && (
        <View className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <ActivityIndicator size="large" color="#8C00E3" />
          <Text className="text-white mt-4">Creating chat...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ChatListScreen;