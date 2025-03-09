import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircleIcon } from 'react-native-heroicons/solid';

const MessageBubble = ({ message, isOwnMessage }) => {
  return (
    <View className={"flex-1 max-w-[80%] mb-2 ${isOwnMessage ? 'self-end' : 'self-start'}"}>
      <View 
        className={`
          px-3 py-2 rounded-2xl
          ${isOwnMessage ? 'bg-purple-600 rounded-tr-none' : 'bg-gray-700 rounded-tl-none'}
        `}
      >
        <Text className="text-white text-base">{message.content}</Text>
      </View>
      
      <View className="flex-row items-center mt-1">
        {isOwnMessage && (
          <View className="flex-row items-center ml-auto">
            <CheckCircleIcon 
              size={14} 
              color={message.read ? '#3b82f6' : '#9ca3af'}
            />
          </View>
        )}
        <Text className={"text-xs text-gray-400 ${isOwnMessage ? 'mr-1' : 'ml-1'}"}>
          {new Date(message.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );
};

export default MessageBubble;