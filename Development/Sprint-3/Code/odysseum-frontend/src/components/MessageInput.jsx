import { View, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import React, { useState, useRef } from 'react';
import { PaperAirplaneIcon, PaperClipIcon, CameraIcon } from 'react-native-heroicons/outline';
import * as ImagePicker from 'expo-image-picker';

const MessageInput = ({ onSend, onTyping }) => {
  const [message, setMessage] = useState('');
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleTyping = (text) => {
    setMessage(text);
    
    if (onTyping) {
      onTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1000);
    }
  };

  const handleAttachment = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    if (!result.canceled) {
      // Handle the selected media
      console.log(result.assets[0]);
      // Call your media upload function here
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      className="border-t border-gray-700 bg-[#1a1a1a]"
    >
      <View className="flex-row items-center p-2">
        <View className="flex-row">
          <TouchableOpacity 
            onPress={handleAttachment}
            className="p-2"
          >
            <PaperClipIcon size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={async () => {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status === 'granted') {
                const result = await ImagePicker.launchCameraAsync({
                  quality: 1,
                });
                if (!result.canceled) {
                  // Handle the captured image
                  console.log(result.assets[0]);
                }
              }
            }}
            className="p-2"
          >
            <CameraIcon size={24} color="white" />
          </TouchableOpacity>
        </View>

        <TextInput
          value={message}
          onChangeText={handleTyping}
          placeholder="Type a message..."
          placeholderTextColor="gray"
          multiline
          maxLength={1000}
          className="flex-1 bg-gray-800 rounded-full px-4 py-2 text-white mx-2"
        />

        <TouchableOpacity 
          onPress={handleSend}
          disabled={!message.trim()}
          className={`p-2 rounded-full ${
            message.trim() ? 'bg-purple-600' : 'bg-gray-700'
          }`}
        >
          <PaperAirplaneIcon size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default MessageInput;