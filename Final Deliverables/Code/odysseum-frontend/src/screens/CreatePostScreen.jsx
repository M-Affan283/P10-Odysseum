import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  TextInput,
  Dimensions,
  Modal,
  Alert,
  StatusBar,
  StyleSheet,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import Toast from "react-native-toast-message";
import axiosInstance from "../utils/axios";
import useUserStore from "../context/userStore";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import {
  FolderPlusIcon,
  MapIcon,
  TrashIcon,
  PlusCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
} from "react-native-heroicons/solid";
import { PencilIcon } from "react-native-heroicons/outline";
import { useSharedValue } from "react-native-reanimated";
import LocationsModal from "../components/LocationsModal";
import LottieView from "lottie-react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CreatePostScreen = () => {
  const FormData = global.FormData;
  const [uploading, setUploading] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);

  const [form, setForm] = useState({
    caption: "",
    media: [],
    location: null,
  });

  const carouselRef = useRef(null);
  const progress = useSharedValue(0);

  const onPressPagination = (index) => {
    carouselRef.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const user = useUserStore((state) => state.user); //for id

  const removeAllMedia = () => {
    setForm({ ...form, media: [] });
    console.log("Media Removed");
  };

  const removeSingleMedia = (index) => {
    let newMedia = form.media.filter((media, i) => i !== index);
    setForm({ ...form, media: newMedia });
  };

  const pickMedia = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Permission Required",
        text2: "Permission to access photo library is required!",
        visibilityTime: 2000,
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      try {
        //compress images
        const compressedImages = await Promise.all(
          result.assets.map(async (asset) => {
            //if size > 3mb, compress or maybe compress based on image dimensions.
            if (asset.fileSize > 3 * 1024 * 1024) {
              let compressedImage = await ImageManipulator.manipulateAsync(
                asset.uri,
                [],
                { compress: 0.5 }
              );

              return { ...asset, uri: compressedImage.uri };
            }
            return asset;
          })
        );

        // FIXED: Append new media instead of replacing existing media
        setForm({
          ...form,
          media: [...form.media, ...compressedImages],
        });
      } catch (error) {
        console.log(error);
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Error",
          text2: "Failed to process images: " + error.message,
          visibilityTime: 2000,
        });
      }
    }
  };

  const submitForm = async () => {
    if (
      form.caption === "" ||
      form.media.length === 0 ||
      form.location === null
    ) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Error",
        text2: "Please fill in all fields",
        visibilityTime: 2000,
      });
      return;
    }

    setUploading(true);

    let formData = new FormData();

    formData.append("creatorId", user._id);
    formData.append("caption", form.caption);
    formData.append("locationId", form.location._id);

    // handles single media
    // formData.append('media', {
    //   uri: Platform.OS === 'android' ? form.media[0].uri : form.media[0].uri.replace('file://', ''),
    //   type: form.media[0].mimeType,
    //   name: form.media[0].fileName
    // })

    //for multiple media
    form.media.forEach((media) => {
      formData.append("media", {
        uri:
          Platform.OS === "android"
            ? media.uri
            : media.uri.replace("file://", ""),
        type: media.mimeType,
        name: media.fileName,
      });
    });

    // console.log("Form Data: ", formData);
    // setUploading(false);

    try {
      axiosInstance
        .post("/post/create", formData, {
          headers: {
            accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res.data);

          setForm({ caption: "", media: [], location: null });

          Toast.show({
            type: "success",
            position: "bottom",
            text1: "Success",
            text2: "Post created successfully",
            visibilityTime: 2000,
          });

          setUploading(false);
        })
        .catch((err) => {
          console.log(err.response.data);

          Toast.show({
            type: "error",
            position: "bottom",
            text1: "Error",
            text2: err.response.data.message,
            visibilityTime: 2000,
          });

          setUploading(false);
        });
    } catch (error) {
      console.log(error);
      alert("An error occurred: " + error.message);
      setUploading(false);
    }
  };

  const handlePostSubmit = () => {
    if (
      form.caption === "" ||
      form.media.length === 0 ||
      form.location === null
    ) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Missing Information",
        text2: "Please add media, caption and location",
        visibilityTime: 2000,
      });
      return;
    }

    // Show confirmation dialog instead of directly submitting
    setConfirmDialogVisible(true);
  };

  return (
    <SafeAreaView className="bg-[#070f1b] flex-1">
      <StatusBar barStyle="light-content" backgroundColor="#070f1b" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800/40">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-800/60 p-2 rounded-full"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: 5,
          }}
        >
          <ArrowLeftIcon size={22} color="#fff" />
        </TouchableOpacity>
        <Text
          style={{ fontWeight: "700", letterSpacing: 0.5 }}
          className="text-xl text-white"
        >
          Create New Post
        </Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Media Section */}
        <View className="px-4 pt-6 pb-4">
          <View className="flex-row items-center mb-4">
            <View className="h-5 w-1.5 bg-[#8C00E3] rounded-full mr-2" />
            <Text
              style={{ fontWeight: "700", letterSpacing: 0.3 }}
              className="text-white text-lg"
            >
              Media
            </Text>
            <Text className="text-gray-400 text-xs ml-2">
              {form.media.length > 0
                ? `${form.media.length} selected`
                : "Required"}
            </Text>
          </View>

          {form.media.length === 0 ? (
            <TouchableOpacity
              onPress={pickMedia}
              className="bg-gray-800/30 rounded-xl h-[300px] flex items-center justify-center border-2 border-dashed border-gray-600/70"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
                elevation: 5,
              }}
            >
              <PlusCircleIcon size={60} color="#8C00E3" />
              <Text
                style={{ fontWeight: "700", letterSpacing: 0.5 }}
                className="text-white text-lg mt-4"
              >
                Add Photos or Videos
              </Text>
              <Text className="text-gray-400 text-sm mt-2">
                Share your memories
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Carousel
                data={form.media.map((media) => media.uri)}
                loop={false}
                ref={carouselRef}
                width={SCREEN_WIDTH - 32}
                height={400}
                scrollAnimationDuration={100}
                style={{ borderRadius: 16, overflow: "hidden" }}
                onProgressChange={progress}
                onConfigurePanGesture={(panGesture) => {
                  panGesture.activeOffsetX([-5, 5]);
                  panGesture.failOffsetY([-5, 5]);
                }}
                renderItem={({ item, index }) => (
                  <View className="relative">
                    <Image
                      source={{ uri: item }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => removeSingleMedia(index)}
                      className="absolute top-3 right-3 bg-black/50 rounded-full p-1"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.6,
                        shadowRadius: 3,
                      }}
                    >
                      <XCircleIcon size={28} color="#FF5A5A" />
                    </TouchableOpacity>
                    <View className="absolute bottom-3 right-3 bg-black/60 px-3 py-1.5 rounded-full">
                      <Text className="text-white text-xs font-medium">
                        {index + 1}/{form.media.length}
                      </Text>
                    </View>
                  </View>
                )}
              />

              {form.media.length > 1 && (
                <Pagination.Basic
                  progress={progress}
                  data={form.media.map((media) => media.uri)}
                  onPress={onPressPagination}
                  size={8}
                  dotStyle={{
                    backgroundColor: "rgba(255,255,255,0.4)",
                    borderRadius: 100,
                  }}
                  activeDotStyle={{
                    backgroundColor: "#8C00E3",
                    borderRadius: 100,
                    width: 10,
                    height: 10,
                  }}
                  containerStyle={{ gap: 8, marginTop: 12 }}
                  horizontal
                />
              )}

              <View className="flex-row justify-center items-center mt-5 w-full">
                <TouchableOpacity
                  onPress={pickMedia}
                  className="flex-row items-center justify-center bg-[#8C00E3]/20 px-5 py-3 rounded-full mr-4"
                  style={{
                    shadowColor: "#8C00E3",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    elevation: 3,
                  }}
                >
                  <PlusCircleIcon size={20} color="#8C00E3" />
                  <Text
                    style={{ fontWeight: "600", letterSpacing: 0.3 }}
                    className="text-[#8C00E3] ml-2"
                  >
                    Add More
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={removeAllMedia}
                  className="flex-row items-center justify-center bg-red-500/10 px-5 py-3 rounded-full"
                  style={{
                    shadowColor: "#FF5A5A",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 3,
                  }}
                >
                  <TrashIcon size={20} color="#FF5A5A" />
                  <Text
                    style={{ fontWeight: "600", letterSpacing: 0.3 }}
                    className="text-[#FF5A5A] ml-2"
                  >
                    Remove All
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-gray-800/40 mx-4 my-2" />

        {/* Caption Section */}
        <View className="px-4 pt-4 pb-4">
          <View className="flex-row items-center mb-3">
            <View className="h-5 w-1.5 bg-[#8C00E3] rounded-full mr-2" />
            <Text
              style={{ fontWeight: "700", letterSpacing: 0.3 }}
              className="text-white text-lg"
            >
              Caption
            </Text>
            <Text className="text-gray-400 text-xs ml-2">Required</Text>
          </View>

          <View className="mb-2">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <PencilIcon size={18} color="#8C00E3" />
                <Text className="text-gray-300 font-medium ml-2">
                  Write something...
                </Text>
              </View>
              <Text className="text-gray-400 text-xs">
                {form.caption.length}/100
              </Text>
            </View>
            <TextInput
              value={form.caption}
              onChangeText={(text) => setForm({ ...form, caption: text })}
              placeholder="What's on your mind?"
              placeholderTextColor={"#6b7280"}
              className="bg-gray-800/40 w-full p-4 text-white text-base rounded-xl"
              multiline={true}
              maxLength={100}
              style={{
                textAlignVertical: "top",
                minHeight: 100,
                borderWidth: 1,
                borderColor: form.caption ? "#8C00E3/30" : "transparent",
                fontSize: 16,
                lineHeight: 24,
              }}
            />
          </View>
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-gray-800/40 mx-4 my-2" />

        {/* Location Section */}
        <View className="px-4 pt-4 pb-4">
          <View className="flex-row items-center mb-3">
            <View className="h-5 w-1.5 bg-[#8C00E3] rounded-full mr-2" />
            <Text
              style={{ fontWeight: "700", letterSpacing: 0.3 }}
              className="text-white text-lg"
            >
              Location
            </Text>
            <Text className="text-gray-400 text-xs ml-2">Required</Text>
          </View>

          <View className="mb-2">
            <View className="flex-row items-center mb-2">
              <MapIcon size={18} color="#8C00E3" />
              <Text className="text-gray-300 font-medium ml-2">
                Where is this?
              </Text>
            </View>

            {form.location === null ? (
              <TouchableOpacity
                className="flex-row items-center justify-between bg-gray-800/40 p-4 rounded-xl"
                onPress={() => setLocationModalVisible(true)}
                style={{
                  borderWidth: 1,
                  borderColor: "#8C00E3/20",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Text className="text-gray-400">Add location</Text>
                <PlusCircleIcon size={20} color="#8C00E3" />
              </TouchableOpacity>
            ) : (
              <View
                className="bg-gray-800/40 p-4 rounded-xl"
                style={{
                  borderWidth: 1,
                  borderColor: "#8C00E3/30",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-[#8C00E3]/20 p-2.5 rounded-full mr-3">
                      <MapIcon size={20} color="#8C00E3" />
                    </View>
                    <View className="flex-1">
                      <Text
                        style={{ fontWeight: "600", letterSpacing: 0.3 }}
                        className="text-white text-base"
                      >
                        {form.location?.name}
                      </Text>
                      {form.location?.description && (
                        <Text
                          className="text-gray-400 text-xs mt-1"
                          numberOfLines={1}
                        >
                          {form.location.description}
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setForm({ ...form, location: null })}
                    className="bg-red-500/20 p-2 rounded-full ml-2"
                  >
                    <TrashIcon size={18} color="#FF5A5A" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Submit Button */}
        <View className="px-4 pt-6 pb-8">
          <TouchableOpacity
            onPress={handlePostSubmit}
            disabled={uploading}
            style={{
              shadowColor: "#8C00E3",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 6,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={["#8C00E3", "#5B0E91"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className={`rounded-xl py-4 flex-row justify-center items-center ${
                uploading ? "opacity-70" : ""
              }`}
            >
              {uploading ? (
                <LottieView
                  source={require("../../assets/animations/Loading2.json")}
                  autoPlay
                  loop
                  style={{ width: 30, height: 30 }}
                />
              ) : (
                <>
                  <FolderPlusIcon size={22} color="#fff" className="mr-2" />
                  <Text
                    style={{ fontWeight: "700", letterSpacing: 0.5 }}
                    className="text-white text-lg"
                  >
                    Share Post
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Confirmation Dialog */}
        <Modal
          transparent={true}
          visible={confirmDialogVisible}
          animationType="fade"
          onRequestClose={() => setConfirmDialogVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Ready to Post?</Text>
              <Text style={styles.modalMessage}>
                Your post will be shared with all users on Odysseum.
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setConfirmDialogVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => {
                    setConfirmDialogVisible(false);
                    submitForm();
                  }}
                >
                  <Text style={styles.confirmButtonText}>Post Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <LocationsModal
          visible={locationModalVisible}
          setVisible={setLocationModalVisible}
          setForm={setForm}
        />
      </ScrollView>

      {/* Confirmation Dialog with Tailwind */}
      <Modal
        transparent={true}
        visible={confirmDialogVisible}
        animationType="fade"
        onRequestClose={() => setConfirmDialogVisible(false)}
      >
        <View className="flex-1 bg-black/70 justify-center items-center px-5">
          <View className="bg-[#151f2e] rounded-2xl p-6 w-full border border-[#8C00E3]/20 shadow-lg">
            <Text className="text-white text-xl font-bold mb-2 text-center">
              Ready to Post?
            </Text>
            <Text className="text-gray-300 text-base mb-5 text-center">
              Your post will be shared with all users on Odysseum.
            </Text>

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 py-3 bg-gray-700 rounded-xl mr-2 items-center"
                onPress={() => setConfirmDialogVisible(false)}
              >
                <Text className="text-white font-semibold text-base">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-3 bg-[#8C00E3] rounded-xl ml-2 items-center"
                onPress={() => {
                  setConfirmDialogVisible(false);
                  submitForm();
                }}
              >
                <Text className="text-white font-bold text-base">Post Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Replace the StyleSheet with an empty object since we're using Tailwind
const styles = {};

export default CreatePostScreen;
