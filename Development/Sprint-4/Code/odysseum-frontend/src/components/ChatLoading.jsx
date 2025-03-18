import { View, Text } from 'react-native';
import React from 'react';
import LottieView from 'lottie-react-native';

const ChatLoading = () => {
  return (
    <View className="flex-1 justify-center items-center bg-primary">
      <LottieView
        source={require('../../assets/animations/Loading2.json')}
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />
      <Text className="text-gray-400 mt-4">Loading messages...</Text>
    </View>
  );
};

export default ChatLoading;