import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ExclamationCircleIcon } from 'react-native-heroicons/outline';

class ChatErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chat Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 justify-center items-center bg-primary p-4">
          <ExclamationCircleIcon size={48} color="red" />
          <Text className="text-white text-lg font-semibold mt-4 text-center">
            Something went wrong in the chat
          </Text>
          <Text className="text-gray-400 mt-2 text-center">
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            onPress={() => {
              this.setState({ hasError: false });
              this.props.onRetry?.();
            }}
            className="mt-6 bg-purple-600 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ChatErrorBoundary;