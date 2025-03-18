import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeftIcon, CameraIcon, CheckCircleIcon } from "react-native-heroicons/solid";
import { PencilIcon } from "react-native-heroicons/outline";
import { useRouter } from "expo-router";
import useUserStore from "../context/userStore";
import Toast from "react-native-toast-message";
import axiosInstance from "../utils/axios";

const ManageProfileScreen = () => {
  const router = useRouter();
  const user = useUserStore(state => state.user);
  const setUser = useUserStore(state => state.setUser);
  
  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState("https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png");
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Remove activeField state completely since it may be causing re-renders

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
      setProfilePicture(user.profilePicture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png");
    }
  }, [user]);

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleSaveProfile = async () => {
    Keyboard.dismiss();
    
    if (!firstName || !lastName || !email || !username) {
      Toast.show({
        type: "error",
        text1: "Required fields missing",
        text2: "Please fill all required fields",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(`/user/${user._id}`, {
        firstName,
        lastName,
        username,
        email,
        bio,
        profilePicture,
      });

      if (response.status === 200) {
        // Update user in store
        setUser({
          ...user,
          firstName,
          lastName,
          username,
          email,
          bio,
          profilePicture,
        });

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
        
        Toast.show({
          type: "success",
          text1: "Profile updated successfully",
        });
        
        setEditMode(false);
      }
    } catch (error) {
      console.error("Update profile error:", error);
      Toast.show({
        type: "error",
        text1: "Failed to update profile",
        text2: error.response?.data?.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateImage = () => {
    Toast.show({
      type: "info",
      text1: "Image picker would open here",
    });
  };

  // Completely simplified field component with no focus handling
  const ProfileField = ({ label, value, onChangeText, placeholder, isMultiline = false, required = false }) => (
    <View className="mb-5">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm font-semibold text-slate-200">
          {label} {required && <Text className="text-red-500">*</Text>}
        </Text>
      </View>
      
      <TextInput
        className={`bg-slate-800 rounded-xl px-4 ${isMultiline ? 'py-3 min-h-20 text-base' : 'py-3.5'} text-white border border-slate-700`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        editable={editMode}
        multiline={isMultiline}
        numberOfLines={isMultiline ? 4 : 1}
        // Remove all focus and blur handlers
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-800">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <ArrowLeftIcon size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white ml-3">Edit Profile</Text>
          </View>
          <TouchableOpacity 
            onPress={editMode ? handleSaveProfile : toggleEditMode}
            disabled={loading}
            className={`px-4 py-2 rounded-lg ${
              isSaved ? "bg-green-600" : editMode ? "bg-purple-600" : "bg-purple-500 bg-opacity-30"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : isSaved ? (
              <View className="flex-row items-center">
                <CheckCircleIcon size={16} color="#fff" />
                <Text className="text-white ml-1 font-medium">Saved</Text>
              </View>
            ) : (
              <Text className="text-white font-medium">
                {editMode ? "Save" : "Edit"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          className="flex-1 p-4" 
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Profile Picture */}
          <View className="items-center mb-8">
            <View className="relative">
              <Image
                source={{ uri: profilePicture }}
                className="w-24 h-24 rounded-full"
              />
              {editMode && (
                <TouchableOpacity 
                  onPress={handleUpdateImage} 
                  className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full"
                >
                  <CameraIcon size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            
            <Text className="text-white text-lg font-bold mt-4">
              {firstName} {lastName}
            </Text>
            <Text className="text-slate-400 text-sm">@{username}</Text>
          </View>
          
          {/* Form Fields */}
          <View className="mb-4">
            <Text className="text-slate-300 text-lg font-semibold mb-4">
              Personal Information
            </Text>
            
            <View className="flex-row space-x-3 mb-5">
              <View className="flex-1">
                <ProfileField
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First Name"
                  required={true}
                />
              </View>
              <View className="flex-1">
                <ProfileField
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last Name"
                  required={true}
                />
              </View>
            </View>
            
            <ProfileField
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              required={true}
            />
            
            <ProfileField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              required={true}
            />
            
            <ProfileField
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              isMultiline={true}
            />
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ManageProfileScreen;