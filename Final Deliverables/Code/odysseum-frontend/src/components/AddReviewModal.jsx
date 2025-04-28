import { View, Text, Image, TextInput, TouchableOpacity, Platform } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../utils/axios';
import ActionSheet, { ScrollView } from 'react-native-actions-sheet';
import useUserStore from '../context/userStore';
import Toast from 'react-native-toast-message';
import StarRating from 'react-native-star-rating-widget';
import { PhotoIcon, TrashIcon, CheckIcon } from 'react-native-heroicons/solid';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from 'react-native-reanimated';

const AddReviewModal = ({entityId, entityType, entityName, visible, setVisible}) => {

  const FormData = global.FormData
  const user = useUserStore((state) => state.user);
  const actionSheetRef = React.useRef();
  const carouselRef = useRef(null);
  const progress = useSharedValue(0);

  const [form, setForm] = useState({
    title: "",
    reviewContent: "",
    rating: 0,
    media: []
  })
  const [uploading, setUploading] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const onPressPagination = (index) => {
    carouselRef.current?.scrollTo({
      count: index - progress.value,
      animated: true
    })
  }

  const closeForm = () => {
    setForm({ title: "", reviewContent: "", rating: 0, media: [] });
    setVisible(false);
  }

  const removeAllMedia = () => {
    setForm({ ...form, media: [] });
    console.log("Media Removed");
  }

  const removeSingleMedia = (index) => {
    let newMedia = form.media.filter((media, i) => i !== index);
    setForm({ ...form, media: newMedia });
  }

  const pickMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error",
        text2: "Permission to access media library is required!",
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
        // Compress images
        const compressedImages = await Promise.all(result.assets.map(async (asset) => {
          // Compress if size > 3mb
          if (asset.fileSize > 3 * 1024 * 1024) {
            let compressedImage = await ImageManipulator.manipulateAsync(
              asset.uri,
              [],
              { compress: 0.5 }
            );
            return {...asset, uri: compressedImage.uri};
          };
          return asset;
        }));
          
        setForm({ ...form, media: [...form.media, ...compressedImages] });
      }
      catch(error) {
        console.log(error);
        Toast.show({
          type: "error",
          position: "top",
          text1: "Error",
          text2: "An error occurred while processing images",
          visibilityTime: 2000,
        });
      }
    }
  }

  const submitReview = async () => {
    if(form.title === "" || form.reviewContent === "" || form.rating === 0) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error",
        text2: "Please fill in all fields",
        visibilityTime: 2000,
      });
      return;
    }  

    setUploading(true);

    let formData = new FormData();

    formData.append("creatorId", user._id);
    formData.append("entityType", entityType);
    formData.append("entityId", entityId);
    formData.append("title", form.title);
    formData.append("reviewContent", form.reviewContent);
    formData.append("rating", form.rating);

    form.media.forEach((media) => {
      formData.append('media', {
        uri: Platform.OS === 'android' ? media.uri : media.uri.replace('file://', ''),
        type: media.mimeType,
        name: media.fileName
      })
    });

    axiosInstance.post("/review/add", formData, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      }
    })
    .then((res) => {
      // console.log(res.data);
      setUploading(false);
      setForm({ title: "", reviewContent: "", rating: 0, media: [] });

      Toast.show({
        type: "success",
        position: "top",
        text1: "Success",
        text2: "Review Posted successfully",
        visibilityTime: 2000,
      });
      
      setVisible(false);
    })
    .catch((err) => {
      console.log(err.response?.data?.message || err.message);
      setUploading(false);
      
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error",
        text2: "An error occurred. Please try again.",
        visibilityTime: 2000,
      });
    })
  }

  useEffect(() => {
    if(visible) actionSheetRef.current?.setModalVisible(true);
    else actionSheetRef.current?.setModalVisible(false);
  }, [visible]);

  return (
    <View className="flex-1">
      <ActionSheet
        ref={actionSheetRef}
        containerStyle={{backgroundColor: '#070f1b', borderTopLeftRadius: 30, borderTopRightRadius: 30}}
        indicatorStyle={{width: 50, marginVertical: 10, backgroundColor: 'white'}}
        gestureEnabled={true}
        onClose={closeForm}
        statusBarTranslucent={true}
        keyboardHandlerEnabled={true}
      >
        <ScrollView className="p-6" contentContainerStyle={{paddingBottom: 60}} showsVerticalScrollIndicator={false}>
          <Text className="text-3xl font-bold text-white text-center">Add Review</Text>
          <Text className="text-center text-blue-400 mt-1">Reviewing {entityName}</Text>

          <View className="flex flex-row justify-between items-center mt-8 px-2">
            <Text className="text-lg text-gray-200">Rating</Text>
            <StarRating 
              rating={form.rating} 
              onChange={(rating) => setForm({...form, rating})}
              color="#f59e0b"
              starSize={30}
            />
          </View>

          <View className="mt-6">
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              className="rounded-xl overflow-hidden"
            >
              <TextInput
                value={form.title}
                onChangeText={(text) => setForm({ ...form, title: text })} 
                placeholder="Add a title..."
                placeholderTextColor="#6b7280"
                className="w-full p-4 text-lg font-semibold text-white"
                maxLength={25}
                style={{
                  textAlignVertical: 'top',
                  borderWidth: 1,
                  borderColor: '#334155',
                  borderRadius: 12
                }}
              />
            </LinearGradient>
          </View>

          <View className="mt-5">
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              className="rounded-xl overflow-hidden"
            >
              <TextInput
                value={form.reviewContent}
                onChangeText={(text) => setForm({ ...form, reviewContent: text })} 
                placeholder="Add your thoughts..."
                placeholderTextColor="#6b7280"
                className="w-full p-4 text-base text-white"
                multiline={true}
                numberOfLines={5}
                maxLength={150}
                style={{
                  textAlignVertical: 'top',
                  minHeight: 120,
                  borderWidth: 1,
                  borderColor: '#334155',
                  borderRadius: 12
                }}
              />
            </LinearGradient>
          </View>

          {form.media.length === 0 ? (
            <View className="mt-6">
              <LinearGradient
                colors={['#1e293b', '#0f172a']}
                className="rounded-xl p-6 border border-dashed border-gray-700"
              >
                <TouchableOpacity onPress={pickMedia} className="justify-center items-center">
                  <LinearGradient
                    colors={['#3b82f6', '#1e40af']}
                    className="p-3 rounded-full mb-3"
                  >
                    <PhotoIcon size={30} color="white" />
                  </LinearGradient>
                  <Text className="font-medium text-gray-300 text-center">Add your photos</Text>
                  <Text className="text-gray-500 text-xs text-center mt-1">Tap to upload</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ) : (
            <>
              <View className="flex-1 items-center my-5">
                <Carousel
                  data={form.media.map((media) => media.uri)}
                  loop={true}
                  ref={carouselRef}
                  width={250}
                  height={250}
                  scrollAnimationDuration={100}
                  style={{alignItems: 'center', justifyContent: 'center'}}
                  onProgressChange={progress}
                  onConfigurePanGesture={(panGesture) => {
                    panGesture.activeOffsetX([-5, 5]);
                    panGesture.failOffsetY([-5, 5]);
                  }}
                  renderItem={({item, index}) => (
                    <View className="items-center">
                      <TouchableOpacity onPress={() => {
                        setSelectedImageIndex(index);
                        setImageViewerVisible(true);
                      }}>
                        <Image
                          source={{uri: item}}
                          style={{width: 250, height: 250, borderRadius: 15}}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeSingleMedia(index)} className="absolute top-2 right-2">
                        <TrashIcon size={30} color="red" />
                      </TouchableOpacity>
                    </View>
                  )}
                />

                <Pagination.Basic 
                  progress={progress}
                  data={form.media.map((media) => media.uri)}
                  onPress={onPressPagination}
                  size={5}
                  dotStyle={{backgroundColor: 'gray', borderRadius: 100}}
                  activeDotStyle={{backgroundColor: 'white', overflow: 'hidden', aspectRatio: 1, borderRadius: 15}}
                  containerStyle={{gap: 5, marginTop: 20}}
                  horizontal
                />

                <View className="flex-row gap-2 mt-5">
                  <Text onPress={pickMedia} className="text-blue-500 font-semibold m-5">Add More</Text>
                  <Text className="text-red-600 font-medium" onPress={removeAllMedia}>Remove all</Text>
                </View>
              </View>
              
              {/* Full screen image viewer could be added here with modal */}
              {imageViewerVisible && (
                <TouchableOpacity 
                  className="absolute top-0 left-0 right-0 bottom-0 bg-black/90 z-50 justify-center items-center"
                  activeOpacity={1}
                  onPress={() => setImageViewerVisible(false)}
                >
                  <Image
                    source={{uri: form.media[selectedImageIndex].uri}}
                    style={{width: '90%', height: '70%', borderRadius: 10}}
                    resizeMode="contain"
                  />
                  <TouchableOpacity 
                    className="absolute top-10 right-5"
                    onPress={() => setImageViewerVisible(false)}
                  >
                    <Text className="text-white text-xl font-bold">Close</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            </>
          )}

          <LinearGradient
            colors={['#8C00E3', '#1e40af']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-full overflow-hidden mt-2"
          >
            <TouchableOpacity
              className="w-full min-h-[56px] flex-row justify-center items-center"
              onPress={submitReview}
              disabled={uploading}
            >
              {uploading ? (
                <LottieView
                  source={require('../../assets/animations/Loading2.json')}
                  autoPlay
                  loop
                  style={{width: 50, height: 50}}
                />
              ) : (
                <Text className="text-white font-bold text-lg">Share Review</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      </ActionSheet>
    </View>
  )
}

export default AddReviewModal