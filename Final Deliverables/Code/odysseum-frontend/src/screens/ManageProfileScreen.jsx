import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Camera,
  CircleCheck as CheckCircle,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import useUserStore from "../context/userStore";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import axiosInstance from "../utils/axios";

const ProfileInput = React.memo(
  ({
    label,
    value,
    onChangeText,
    placeholder,
    isMultiline = false,
    required = false,
    editable = true,
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          isMultiline && styles.multilineInput,
          !editable && styles.disabledInput,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        editable={editable}
        multiline={isMultiline}
        numberOfLines={isMultiline ? 4 : 1}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  )
);

const ManageProfileScreen = () => {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    bio: "",
    profilePicture:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  });
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [newProfileImage, setNewProfileImage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        profilePicture:
          user.profilePicture ||
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
      });
    }
  }, [user]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleUpdateImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission needed",
          text2: "Please allow access to your photo library",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]) {
        let imageToUse = result.assets[0];

        if (imageToUse.fileSize > 1024 * 1024) {
          const compressed = await ImageManipulator.manipulateAsync(
            imageToUse.uri,
            [],
            { compress: 0.5 }
          );
          imageToUse = { ...imageToUse, uri: compressed.uri };
        }

        setFormData((prev) => ({
          ...prev,
          profilePicture: imageToUse.uri,
        }));
        setNewProfileImage(imageToUse);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update image",
      });
    }
  };

  const handleSave = async () => {
    const { firstName, lastName, email, username, bio } = formData;

    console.log("Form data:", formData);
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
      const formDataObj = new FormData();

      formDataObj.append("userId", user._id);
      formDataObj.append("firstName", firstName);
      formDataObj.append("lastName", lastName);
      formDataObj.append("username", username);
      formDataObj.append("email", email);
      formDataObj.append("bio", bio);

      if (newProfileImage) {
        formDataObj.append("profilePicture", {
          uri:
            Platform.OS === "android"
              ? newProfileImage.uri
              : newProfileImage.uri.replace("file://", ""),
          type: newProfileImage.mimeType || "image/jpeg",
          name: newProfileImage.fileName || "profile_image.jpg",
        });
      }

      const response = await axiosInstance.post(
        "/user/updateProfile",
        formDataObj,
        {
          headers: {
            accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setUser({
          ...user,
          firstName,
          lastName,
          username,
          email,
          bio: formData.bio,
          profilePicture:
            response.data.profilePicture || formData.profilePicture,
        });

        setNewProfileImage(null);
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={editMode ? handleSave : () => setEditMode(true)}
            disabled={loading}
            style={[
              styles.editButton,
              editMode && styles.saveButton,
              isSaved && styles.savedButton,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : isSaved ? (
              <View style={styles.savedContent}>
                <CheckCircle size={16} color="#fff" />
                <Text style={styles.buttonText}>Saved</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>
                {editMode ? "Save" : "Edit"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.profileImageContainer}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: formData.profilePicture }}
                style={styles.profileImage}
              />
              {editMode && (
                <TouchableOpacity
                  onPress={handleUpdateImage}
                  style={styles.cameraButton}
                >
                  <Camera size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.profileName}>
              {formData.firstName} {formData.lastName}
            </Text>
            <Text style={styles.username}>@{formData.username}</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <ProfileInput
                  label="First Name"
                  value={formData.firstName}
                  onChangeText={(value) =>
                    handleInputChange("firstName", value)
                  }
                  placeholder="First Name"
                  required
                  editable={editMode}
                />
              </View>
              <View style={styles.nameField}>
                <ProfileInput
                  label="Last Name"
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange("lastName", value)}
                  placeholder="Last Name"
                  required
                  editable={editMode}
                />
              </View>
            </View>

            <ProfileInput
              label="Username"
              value={formData.username}
              onChangeText={(value) => handleInputChange("username", value)}
              placeholder="Username"
              required
              editable={editMode}
            />

            <ProfileInput
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder="Email address"
              required
              editable={editMode}
            />

            <ProfileInput
              label="Bio"
              value={formData.bio}
              onChangeText={(value) => handleInputChange("bio", value)}
              placeholder="Tell us about yourself"
              isMultiline
              editable={editMode}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(126, 34, 206, 0.3)",
  },
  saveButton: {
    backgroundColor: "#7e22ce",
  },
  savedButton: {
    backgroundColor: "#22c55e",
  },
  savedContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  imageWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#7e22ce",
    padding: 8,
    borderRadius: 20,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginTop: 12,
  },
  username: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
  },
  formSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#e2e8f0",
    marginBottom: 8,
  },
  required: {
    color: "#ef4444",
  },
  input: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    padding: 12,
    color: "#fff",
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  disabledInput: {
    opacity: 0.7,
  },
});

export default ManageProfileScreen;
