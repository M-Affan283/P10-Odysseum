import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { ChevronLeftIcon, EllipsisHorizontalIcon } from 'react-native-heroicons/outline';
import { router } from 'expo-router';
import images from '../../assets/images/images';

const ChatHeader = ({ user, isOnline, isTyping, onOptionsPress }) => {
  return (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-700 bg-[#1a1a1a]">
      <View className="flex-row items-center flex-1">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-3"
        >
          <ChevronLeftIcon size={24} color="white" />
        </TouchableOpacity>
        
        <View className="relative">
          <Image 
            source={{ uri: user?.profilePicture || images.DefaultProfileImg }}
            className="w-10 h-10 rounded-full"
          />
          {isOnline && (
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1a1a]" />
          )}
        </View>
        
        <View className="ml-3 flex-1">
          <Text className="text-white font-semibold text-lg">
            {user?.username}
          </Text>
          {isTyping ? (
            <Text className="text-green-500 text-sm">typing...</Text>
          ) : (
            <Text className="text-gray-400 text-sm">
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity 
        onPress={onOptionsPress}
        className="p-2"
      >
        <EllipsisHorizontalIcon size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default ChatHeader;