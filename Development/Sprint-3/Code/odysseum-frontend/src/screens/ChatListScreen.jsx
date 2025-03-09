import { View, Text, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import axiosInstance from '../utils/axios';
import useUserStore from '../context/userStore';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { calculateDuration } from '../utils/dateTimCalc';
import images from '../../assets/images/images';

const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const user = useUserStore(state => state.user);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/chat/getUserChats');
      setChats(response.data.chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderChatItem = ({ item }) => {
    const lastMessage = item.lastMessage || {};
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
            {item.unreadCount > 0 && (
              <View className="bg-purple-600 rounded-full w-6 h-6 items-center justify-center ml-2">
                <Text className="text-white text-xs">{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={item => item._id}
        refreshing={loading}
        onRefresh={fetchChats}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-gray-400 text-center">
              No messages yet. Start a conversation!
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default ChatListScreen;