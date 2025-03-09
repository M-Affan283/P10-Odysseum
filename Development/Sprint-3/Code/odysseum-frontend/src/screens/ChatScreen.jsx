import { View, FlatList } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import useUserStore from '../context/userStore';
import ChatHeader from '../components/ChatHeader';
import MessageInput from '../components/MessageInput';
import ChatLoading from '../components/ChatLoading';
import MessageBubble from '../components/MessageBubble';
import useChat from '../../hooks/useChat';
import Toast from 'react-native-toast-message';

const ChatScreen = ({ chatId }) => {
  const flatListRef = useRef(null);
  const user = useUserStore(state => state.user);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    messages,
    loading,
    error,
    chatDetails,
    isTyping,
    sendMessage,
    handleTyping,
    refresh
  } = useChat(chatId);

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
        position: 'bottom'
      });
    }
  }, [error]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const renderMessage = ({ item }) => (
    <MessageBubble
      message={item}
      isOwnMessage={item.sender._id === user._id}
    />
  );

  if (loading && !messages.length) {
    return <ChatLoading />;
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ChatHeader 
        user={chatDetails?.otherUser}
        isTyping={isTyping}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        inverted
        keyExtractor={item => item._id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      <MessageInput 
        onSend={sendMessage}
        onTyping={handleTyping}
      />
    </SafeAreaView>
  );
};

export default ChatScreen;