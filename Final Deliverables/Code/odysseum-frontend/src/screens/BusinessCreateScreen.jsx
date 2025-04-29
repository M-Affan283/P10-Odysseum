//On boarding styled business create screen
// by this we mean there will be a different screeens.
// like one will be for name and category, then user presses next button and then it goes to the next screen where user enters the location and then the next screen where user enters the contact info

import {
  View,
  Text,
  FlatList,
  Platform,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../utils/axios";
import useUserStore from "../context/userStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { Dropdown } from "react-native-element-dropdown";
import LocationsModal from "../components/LocationsModal";
import LottieView from "lottie-react-native";
import {
  MapIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
  TrashIcon,
  ClockIcon,
  PlusIcon,
  MapPinIcon,
  PlusCircleIcon,
  PhotoIcon,
} from "react-native-heroicons/solid";
import {} from "lucide-react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import images from "../../assets/images/images";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";

const { width } = Dimensions.get("window");

/*
  5 example longitudes and latitudes:
    122.4194, 37.7749 - San Francisco
    118.2437, 34.0522 - Los Angeles
    77.1025, 28.7041 - New Delhi
    151.2093, -33.8688 - Sydney
    0.1276, 51.5074 - London
 */

const testForm = {
  // ownerId: "672f358fb3e56fac046d76a5",
  name: "Test Business",
  category: "Restaurant",
  address: "123 Test Street",
  description: "This is a test business",
  media: [],
  phone: "1234567890",
  email: "testemail@gmail.com",
  website: "testbusiness.com",
  location: {
    _id: "6781353badab4c338ff55148",
    name: "Fairdy Meadows, Gilgit Baltistan",
  },
  longitude: "122.4194",
  latitude: "37.7749",
  operatingHours: {},
};

const BusinessCreateScreen = () => {
  const FormData = global.FormData;
  const user = useUserStore((state) => state.user);
  const [focusedInput, setFocusedInput] = useState(null);
  const [visible, setVisible] = useState(false);
  const [region, setRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  const [tempTimeRange, setTempTimeRange] = useState({
    start: null,
    end: null,
  });
  const mapRef = React.useRef(null);
  const [form, setForm] = useState({
    // ownerId: user._id,
    name: "",
    category: "",
    address: "",
    description: "",
    media: [],
    phone: "",
    email: "",
    website: "",
    operatingHours: {
      monday: "",
      tuesday: "",
      wednesday: "",
      thursday: "",
      friday: "",
      saturday: "",
      sunday: "",
    },
    location: null,
    longitude: "",
    latitude: "",
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Image picker and carousel related states and refs
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const carouselRef = useRef(null);
  const progress = useSharedValue(0);

  const pickMedia = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

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
        const compressedImages = await Promise.all(
          result.assets.map(async (asset) => {
            // Compress if size > 3mb
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

        setForm({ ...form, media: [...form.media, ...compressedImages] });
      } catch (error) {
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
  };

  const removeAllMedia = () => {
    setForm({ ...form, media: [] });
    console.log("Media Removed");
  };

  const removeSingleMedia = (index) => {
    let newMedia = form.media.filter((media, i) => i !== index);
    setForm({ ...form, media: newMedia });
  };

  const onPressPagination = (index) => {
    carouselRef.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  // debug function to print entire form object entirely along with all objects
  const printForm = () => {
    console.log(JSON.stringify(form, null, 2));
  };

  const createBusiness = async () => {
    console.log("Creating business...");

    //test frontend
    // setUploading(true);
    // setTimeout(() => {
    //     setUploading(false);
    //     setError(true);
    // }, 2000);
    // return;

    // if any of the required fields are empty, return
    if (
      form.name === "" ||
      form.category === "" ||
      form.address === "" ||
      form.location === null ||
      form.longitude === "" ||
      form.latitude === "" ||
      form.phone === ""
    ) {
      console.log("Please fill in all required fields");
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Error",
        text2: "Please fill in all required fields",
        visibilityTime: 2000,
      });
      return;
    }

    setUploading(true);

    let formData = new FormData();

    formData.append("ownerId", user._id);
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("address", form.address);
    formData.append("description", form.description);
    formData.append(
      "contactInfo",
      JSON.stringify({
        phone: form.phone,
        email: form.email,
        website: form.website,
      })
    );
    formData.append("operatingHours", JSON.stringify(form.operatingHours));
    formData.append("locationId", form.location?._id);
    formData.append("longitude", form.longitude);
    formData.append("latitude", form.latitude);

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

    axiosInstance
      .post("/business/create", formData, {
        headers: {
          accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        console.log(res.data);
        setUploading(false);
      })
      .catch((err) => {
        console.log(err.response.data.message);
        setUploading(false);
        setError(err.response.data.message);
      });
  };

  // Screen to add business name, location, category, description

  useEffect(() => {
    const setupMap = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Permission to access location was denied");
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(newRegion);
        setUserLocation(newRegion);

        // If form doesn't have coordinates yet, set initial coordinates
        if (!form.latitude && !form.longitude) {
          setForm({
            ...form,
            latitude: location.coords.latitude.toString(),
            longitude: location.coords.longitude.toString(),
          });
        }

        setLocationLoading(false);
      } catch (error) {
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Error",
          text2: "Failed to get location",
          visibilityTime: 2000,
        });
      }
    };

    setupMap();
  }, []);

  const flatListRef = React.useRef();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle Next button click
  const onNextPress = () => {
    if (currentIndex < screens.length - 1) {
      setCurrentIndex(currentIndex + 1);
      // Move to next screen in FlatList
      flatListRef.current.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  // Handle Back button click
  const onBackPress = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Move to previous screen in FlatList
      flatListRef.current.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  const screens = [
    { screen: startScreen, params: { onNextPress } },
    {
      screen: businessInfoScreen,
      params: {
        focusedInput,
        setFocusedInput,
        form,
        setForm,
        userLocation,
        setUserLocation,
        locationLoading,
        setLocationLoading,
        setRegion,
        region,
        mapRef,
        visible,
        setVisible,
        onNextPress,
        onBackPress,
      },
    },
    {
      screen: contactScreen,
      params: {
        focusedInput,
        setFocusedInput,
        form,
        setForm,
        onNextPress,
        onBackPress,
      },
    },
    {
      screen: imageScreen,
      params: {
        form,
        setForm,
        onNextPress,
        onBackPress,
        pickMedia,
        removeAllMedia,
        removeSingleMedia,
        carouselRef,
        progress,
        onPressPagination,
        setSelectedImageIndex,
        setImageViewerVisible,
        imageViewerVisible,
        selectedImageIndex,
      },
    },
    {
      screen: operatingHoursScreen,
      params: {
        focusedInput,
        setFocusedInput,
        form,
        setForm,
        onNextPress,
        onBackPress,
        selectedDay,
        setSelectedDay,
        isStartTimePickerVisible,
        setStartTimePickerVisible,
        isEndTimePickerVisible,
        setEndTimePickerVisible,
        tempTimeRange,
        setTempTimeRange,
      },
    },
    {
      screen: reviewScreen,
      params: {
        form,
        createBusiness,
        onNextPress,
        onBackPress,
        printForm,
        carouselRef,
        progress,
        onPressPagination,
        setSelectedImageIndex,
        setImageViewerVisible,
      },
    },
    { screen: successScreen, params: { uploading, error } },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">
      <FlatList
        ref={flatListRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={screens}
        initialScrollIndex={currentIndex}
        scrollEnabled={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ width: width }}>{item.screen(item.params)}</View>
        )}
      />
    </SafeAreaView>
  );
};

// Screen to begin business creation
const startScreen = ({ onNextPress }) => {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Image
        source={images.CreateBusinessImg}
        style={{ width: "100%", height: 280 }}
        className="rounded-3xl mb-8"
        resizeMode="cover"
      />

      <Text className="text-gray-100 text-4xl font-dsbold text-center mb-4">
        Create Your Business
      </Text>

      <Text className="text-gray-400 text-lg text-center mb-10">
        Welcome to the business creation hub. Let's get your business noticed on
        Odysseum!
      </Text>

      <View className="flex-row gap-x-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-800 w-16 h-16 rounded-full items-center justify-center shadow-md"
          style={{
            shadowColor: "#374151",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 6,
          }}
        >
          <ArrowLeftIcon size={30} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNextPress}
          className="bg-[#4c1d95] w-16 h-16 rounded-full items-center justify-center shadow-md"
          style={{
            shadowColor: "#4c1d95",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 6,
          }}
        >
          <ArrowRightIcon size={30} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const businessInfoScreen = ({
  focusedInput,
  setFocusedInput,
  form,
  setForm,
  userLocation,
  setUserLocation,
  locationLoading,
  setLocationLoading,
  setRegion,
  region,
  mapRef,
  visible,
  setVisible,
  onNextPress,
  onBackPress,
}) => {
  const categories = [
    "",
    "Restaurant",
    "Hotel",
    "Shopping",
    "Fitness",
    "Health",
    "Beauty",
    "Education",
    "Entertainment",
    "Services",
    "Other",
  ];

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;

    // Update form with new coordinates
    setForm({
      ...form,
      latitude: coordinate.latitude.toString(),
      longitude: coordinate.longitude.toString(),
    });
  };

  // Center map on current location
  const centerOnUserLocation = async () => {
    try {
      setRegion(userLocation);

      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Error",
        text2: "Failed to get location",
        visibilityTime: 2000,
      });
    }
  };

  const validateScreen = () => {
    if (
      form.name === "" ||
      form.category === "" ||
      form.address === "" ||
      form.description === "" ||
      form.location === null ||
      form.longitude === "" ||
      form.latitude === ""
    ) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Error",
        text2: "Please fill in all required fields",
        visibilityTime: 2000,
      });
      return;
    }

    onNextPress();
  };

  return (
    <View className="flex-1">
      <TouchableOpacity
        onPress={() => router.replace("/settings")}
        className="p-5"
      >
        <XMarkIcon size={28} color="#e5e7eb" />
      </TouchableOpacity>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <Image
          source={images.Business2Img}
          style={{ width: "100%", height: 220 }}
          className="rounded-2xl mb-6"
          resizeMode="cover"
        />

        <Text className="text-gray-100 text-3xl font-dsbold mb-6">
          Business Information
        </Text>

        <View className="space-y-5 mb-6">
          <View>
            <Text className="text-gray-400 text-sm mb-2 ml-1">
              Business Name
            </Text>
            <TextInput
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
              placeholder="Enter business name"
              placeholderTextColor="gray"
              maxLength={30}
              onFocus={() => setFocusedInput("name")}
              onBlur={() => setFocusedInput(null)}
              className={`text-white text-lg bg-gray-900 px-4 py-3 rounded-xl ${
                focusedInput === "name"
                  ? "border-2 border-purple-600"
                  : "border border-gray-700"
              }`}
            />
          </View>

          <View>
            <Text className="text-gray-400 text-sm mb-2 ml-1">Category</Text>
            <Dropdown
              data={categories}
              value={form.category}
              selectedTextStyle={{ color: "white", fontSize: 18 }}
              placeholder={
                form.category === "" ? "Select a category" : form.category
              }
              placeholderStyle={{ color: "gray", fontSize: 18 }}
              onChange={(item) => setForm({ ...form, category: item })}
              maxHeight={250}
              onFocus={() => setFocusedInput("category")}
              onBlur={() => setFocusedInput(null)}
              style={{
                backgroundColor: "#111827",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: focusedInput === "category" ? 2 : 1,
                borderColor:
                  focusedInput === "category" ? "#9333ea" : "#374151",
              }}
              containerStyle={{ backgroundColor: "#111827", borderRadius: 8 }}
              renderItem={(item) => (
                <View className="py-3 px-4">
                  <Text className="text-lg text-white">{item}</Text>
                </View>
              )}
            />
          </View>

          <View>
            <Text className="text-gray-400 text-sm mb-2 ml-1">Address</Text>
            <TextInput
              value={form.address}
              onChangeText={(text) => setForm({ ...form, address: text })}
              placeholder="Enter business address"
              placeholderTextColor="gray"
              onFocus={() => setFocusedInput("address")}
              onBlur={() => setFocusedInput(null)}
              className={`text-white text-lg bg-gray-900 px-4 py-3 rounded-xl ${
                focusedInput === "address"
                  ? "border-2 border-purple-600"
                  : "border border-gray-700"
              }`}
            />
          </View>

          <View>
            <Text className="text-gray-400 text-sm mb-2 ml-1">Description</Text>
            <TextInput
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              placeholder="Describe your business"
              placeholderTextColor="gray"
              maxLength={250}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              onFocus={() => setFocusedInput("description")}
              onBlur={() => setFocusedInput(null)}
              className={`text-white text-lg bg-gray-900 px-4 py-3 min-h-[120px] rounded-xl ${
                focusedInput === "description"
                  ? "border-2 border-purple-600"
                  : "border border-gray-700"
              }`}
            />
          </View>

          {form.location === null ? (
            <TouchableOpacity
              className="flex-row items-center p-4 bg-gray-800 rounded-xl border border-gray-700"
              onPress={() => setVisible(true)}
            >
              <View className="bg-purple-600 bg-opacity-30 p-3 rounded-full">
                <MapPinIcon size={24} color="#c4b5fd" />
              </View>
              <Text className="text-gray-300 ml-3 text-lg font-medium">
                Add location
              </Text>
              <View className="ml-auto">
                <PlusCircleIcon size={24} color="#c4b5fd" />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700"
              onPress={() => setVisible(true)}
            >
              <View className="flex-row items-center flex-1">
                <View className="bg-purple-600 p-3 rounded-full">
                  <MapPinIcon size={24} color="white" />
                </View>
                <View className="ml-3 flex-1 pr-2">
                  <Text className="text-gray-400 text-sm">Location</Text>
                  <Text className="text-white text-lg font-medium">
                    {form.location?.name}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setForm({ ...form, location: null })}
                className="p-2 bg-red-900 bg-opacity-30 rounded-full"
              >
                <TrashIcon size={20} color="#f87171" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}

          <View className="mt-2">
            <Text className="text-gray-200 text-xl font-semibold mb-3">
              Pin Your Location
            </Text>

            <TouchableOpacity
              className="flex-row bg-indigo-800 h-11 items-center justify-center rounded-lg px-4 mb-4"
              onPress={centerOnUserLocation}
            >
              <MapIcon size={20} color="white" className="mr-2" />
              <Text className="text-white font-semibold ml-2">
                Center on My Location
              </Text>
            </TouchableOpacity>

            {locationLoading ? (
              <View className="items-center justify-center bg-gray-800 h-[250px] rounded-xl border border-gray-700">
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text className="text-gray-300 text-base mt-3">
                  Loading map...
                </Text>
              </View>
            ) : (
              <View className="border-2 border-gray-800 rounded-xl overflow-hidden">
                <MapView
                  ref={mapRef}
                  provider={PROVIDER_GOOGLE}
                  initialRegion={region}
                  region={region}
                  style={{ width: "100%", height: 250 }}
                  className="rounded-xl"
                  onPress={handleMapPress}
                >
                  {form.latitude && form.longitude && (
                    <Marker
                      coordinate={{
                        latitude: parseFloat(form.latitude),
                        longitude: parseFloat(form.longitude),
                      }}
                      draggable
                      onDragEnd={(e) => handleMapPress(e)}
                    />
                  )}
                </MapView>
              </View>
            )}

            <View className="flex-row justify-between px-2 mt-3 bg-gray-800 p-3 rounded-lg border border-gray-700">
              <Text className="text-gray-300 text-base">
                Lat:{" "}
                {form.latitude ? parseFloat(form.latitude).toFixed(6) : "N/A"}
              </Text>
              <Text className="text-gray-300 text-base">
                Long:{" "}
                {form.longitude ? parseFloat(form.longitude).toFixed(6) : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-center space-x-8 my-8">
          <TouchableOpacity
            onPress={onBackPress}
            className="bg-gray-800 w-14 h-14 rounded-full items-center justify-center shadow-md"
            style={{
              shadowColor: "#374151",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 6,
            }}
          >
            <ArrowLeftIcon size={28} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={validateScreen}
            className="bg-[#4c1d95] w-14 h-14 rounded-full items-center justify-center shadow-md"
            style={{
              shadowColor: "#4c1d95",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 6,
            }}
          >
            <ArrowRightIcon size={28} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LocationsModal
        visible={visible}
        setVisible={setVisible}
        setForm={setForm}
      />
    </View>
  );
};

// Screen to add images
const imageScreen = ({
  form,
  setForm,
  onNextPress,
  onBackPress,
  pickMedia,
  removeAllMedia,
  removeSingleMedia,
  carouselRef,
  progress,
  onPressPagination,
  setSelectedImageIndex,
  setImageViewerVisible,
}) => {
  return (
    <View className="flex-1 px-5">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 30 }}
      >
        <View className="items-center mb-4">
          <View className="bg-purple-900 bg-opacity-30 p-5 rounded-full mb-4">
            <PhotoIcon size={40} color="#c4b5fd" />
          </View>

          <Text className="text-gray-100 text-3xl font-dsbold mb-3 text-center">
            Showcase Your Business
          </Text>

          <Text className="text-gray-400 text-base text-center mb-8 px-3">
            Add high-quality images to attract more customers. You can add up to
            5 images.
          </Text>
        </View>

        {/* Image picker functionality */}
        {form.media.length === 0 ? (
          <View className="my-6">
            <View className="rounded-xl p-8 border-2 border-dashed border-gray-700 bg-gray-900 bg-opacity-60">
              <TouchableOpacity
                onPress={pickMedia}
                className="justify-center items-center"
              >
                <View className="p-4 rounded-full mb-4 bg-[#4c1d95]">
                  <PhotoIcon size={35} color="white" />
                </View>
                <Text className="font-medium text-gray-200 text-lg text-center">
                  Add your photos
                </Text>
                <Text className="text-gray-400 text-sm text-center mt-2">
                  Tap to browse your gallery
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="items-center my-6">
            <View className="bg-gray-900 p-4 rounded-xl border border-gray-700 w-full">
              <Text className="text-gray-200 text-lg font-medium mb-4 text-center">
                Preview ({form.media.length}{" "}
                {form.media.length === 1 ? "image" : "images"})
              </Text>

              <Carousel
                data={form.media.map((media) => media.uri)}
                loop={true}
                ref={carouselRef}
                width={width - 80}
                height={300}
                scrollAnimationDuration={300}
                onProgressChange={progress}
                onConfigurePanGesture={(panGesture) => {
                  panGesture.activeOffsetX([-5, 5]);
                  panGesture.failOffsetY([-5, 5]);
                }}
                renderItem={({ item, index }) => (
                  <View className="items-center">
                    <View className="bg-gray-700 p-1 rounded-xl overflow-hidden shadow-lg">
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedImageIndex(index);
                          setImageViewerVisible(true);
                        }}
                      >
                        <Image
                          source={{ uri: item }}
                          style={{
                            width: width - 100,
                            height: 280,
                            borderRadius: 10,
                          }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeSingleMedia(index)}
                        className="absolute top-2 right-2 bg-red-900 bg-opacity-80 p-2 rounded-full"
                      >
                        <TrashIcon size={22} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />

              <Pagination.Basic
                progress={progress}
                data={form.media.map((media) => media.uri)}
                onPress={onPressPagination}
                size={8}
                dotStyle={{
                  backgroundColor: "#4b5563",
                  borderRadius: 100,
                  width: 8,
                  height: 8,
                }}
                activeDotStyle={{
                  backgroundColor: "#a78bfa",
                  borderRadius: 100,
                  width: 10,
                  height: 10,
                }}
                containerStyle={{ gap: 8, marginTop: 20 }}
                horizontal
              />

              <View className="flex-row justify-center gap-x-6 mt-6">
                <TouchableOpacity
                  onPress={pickMedia}
                  className="flex-row items-center bg-[#4c1d95] py-2 px-4 rounded-lg"
                >
                  <PlusIcon size={18} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Add More
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={removeAllMedia}
                  className="flex-row items-center bg-red-900 py-2 px-4 rounded-lg"
                >
                  <TrashIcon size={18} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Remove All
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View className="flex-row justify-center space-x-8 mt-6">
          <TouchableOpacity
            onPress={onBackPress}
            className="bg-gray-800 w-14 h-14 rounded-full items-center justify-center shadow-md"
            style={{
              shadowColor: "#374151",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 6,
            }}
          >
            <ArrowLeftIcon size={28} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNextPress}
            className="bg-[#4c1d95] w-14 h-14 rounded-full items-center justify-center shadow-md"
            style={{
              shadowColor: "#4c1d95",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 6,
            }}
          >
            <ArrowRightIcon size={28} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// Screen to add contact info
const contactScreen = ({
  focusedInput,
  setFocusedInput,
  form,
  setForm,
  onNextPress,
  onBackPress,
}) => {
  return (
    <View className="flex-1 pt-4">
      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <Image
            source={images.ContactImg}
            style={{ width: 200, height: 200 }}
            className="rounded-3xl mb-4"
            resizeMode="cover"
          />

          <Text className="text-gray-100 text-3xl font-dsbold mb-3 text-center">
            Contact Information
          </Text>

          <Text className="text-gray-400 text-base text-center mb-8">
            Make it easy for customers to reach you by providing your contact
            details.
          </Text>
        </View>

        <View className="space-y-5 mb-8">
          <View>
            <Text className="text-gray-400 text-sm mb-2 ml-1">
              Phone Number
            </Text>
            <TextInput
              value={form.phone}
              onChangeText={(text) => setForm({ ...form, phone: text })}
              placeholder="Enter phone number"
              placeholderTextColor="gray"
              keyboardType="phone-pad"
              onFocus={() => setFocusedInput("phone")}
              onBlur={() => setFocusedInput(null)}
              className={`text-white text-lg bg-gray-900 px-4 py-3 rounded-xl ${
                focusedInput === "phone"
                  ? "border-2 border-purple-600"
                  : "border border-gray-700"
              }`}
            />
          </View>

          <View>
            <Text className="text-gray-400 text-sm mb-2 ml-1">
              Email Address
            </Text>
            <TextInput
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
              placeholder="Enter email address"
              placeholderTextColor="gray"
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
              className={`text-white text-lg bg-gray-900 px-4 py-3 rounded-xl ${
                focusedInput === "email"
                  ? "border-2 border-purple-600"
                  : "border border-gray-700"
              }`}
            />
          </View>

          <View>
            <Text className="text-gray-400 text-sm mb-2 ml-1">
              Website (Optional)
            </Text>
            <TextInput
              value={form.website}
              onChangeText={(text) => setForm({ ...form, website: text })}
              placeholder="Enter website URL"
              placeholderTextColor="gray"
              autoCapitalize="none"
              onFocus={() => setFocusedInput("website")}
              onBlur={() => setFocusedInput(null)}
              className={`text-white text-lg bg-gray-900 px-4 py-3 rounded-xl ${
                focusedInput === "website"
                  ? "border-2 border-purple-600"
                  : "border border-gray-700"
              }`}
            />
          </View>
        </View>

        <View className="flex-row justify-center space-x-8 my-8">
          <TouchableOpacity
            onPress={onBackPress}
            className="bg-gray-800 w-14 h-14 rounded-full items-center justify-center shadow-md"
            style={{
              shadowColor: "#374151",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 6,
            }}
          >
            <ArrowLeftIcon size={28} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNextPress}
            className="bg-[#4c1d95] w-14 h-14 rounded-full items-center justify-center shadow-md"
            style={{
              shadowColor: "#4c1d95",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 6,
            }}
          >
            <ArrowRightIcon size={28} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// Screen to add operating hours
const operatingHoursScreen = ({
  focusedInput,
  setFocusedInput,
  form,
  setForm,
  onNextPress,
  onBackPress,
  selectedDay,
  setSelectedDay,
  isStartTimePickerVisible,
  setStartTimePickerVisible,
  isEndTimePickerVisible,
  setEndTimePickerVisible,
  tempTimeRange,
  setTempTimeRange,
}) => {
  const days = [
    { label: "Monday", value: "monday" },
    { label: "Tuesday", value: "tuesday" },
    { label: "Wednesday", value: "wednesday" },
    { label: "Thursday", value: "thursday" },
    { label: "Friday", value: "friday" },
    { label: "Saturday", value: "saturday" },
    { label: "Sunday", value: "sunday" },
  ];

  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleStartTimeConfirm = (time) => {
    setTempTimeRange({ ...tempTimeRange, start: time });
    setStartTimePickerVisible(false);
  };

  const handleEndTimeConfirm = (time) => {
    setTempTimeRange({ ...tempTimeRange, end: time });
    setEndTimePickerVisible(false);
  };

  const addTimeRange = () => {
    if (!selectedDay) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Error",
        text2: "Please select a day",
        visibilityTime: 2000,
      });
      return;
    }

    if (!tempTimeRange.start || !tempTimeRange.end) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Error",
        text2: "Please select both start and end times",
        visibilityTime: 2000,
      });
      return;
    }

    if (tempTimeRange.start >= tempTimeRange.end) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Error",
        text2: "Start time must be before end time",
        visibilityTime: 2000,
      });
      return;
    }

    const startTime = formatTime(tempTimeRange.start);
    const endTime = formatTime(tempTimeRange.end);
    const timeRangeText = `${startTime} - ${endTime}`;

    setForm({
      ...form,
      operatingHours: {
        ...form.operatingHours,
        [selectedDay]: timeRangeText,
      },
    });

    // Reset temporary values
    setTempTimeRange({ start: null, end: null });
    // Alert.alert("Success", `Hours for ${selectedDay} set to ${timeRangeText}`);
  };

  const clearHours = (day) => {
    setForm({
      ...form,
      operatingHours: {
        ...form.operatingHours,
        [day]: "",
      },
    });
  };

  return (
    <View className="flex-1 pt-4 px-5">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <View className="bg-purple-900 bg-opacity-30 p-5 rounded-full mb-4">
            <ClockIcon size={36} color="#c4b5fd" />
          </View>

          <Text className="text-gray-100 text-3xl font-dsbold mb-3 text-center">
            Operating Hours
          </Text>

          <Text className="text-gray-400 text-base text-center mb-8">
            Let customers know when you're open. Leave days empty if you're
            closed.
          </Text>
        </View>

        {/* Time Range Selector */}
        <View className="bg-gray-900 p-5 rounded-xl mb-6 border border-gray-700">
          <Text className="text-gray-200 text-xl font-semibold mb-4">
            Set Hours
          </Text>

          <View className="mb-4">
            <Text className="text-gray-400 text-sm mb-2 ml-1">Day of Week</Text>
            <Dropdown
              data={days}
              labelField="label"
              valueField="value"
              placeholder="Select a day"
              value={selectedDay}
              onChange={(item) => setSelectedDay(item.value)}
              style={{
                backgroundColor: "#111827",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#374151",
              }}
              placeholderStyle={{ color: "gray" }}
              selectedTextStyle={{ color: "white", fontSize: 16 }}
              containerStyle={{
                borderRadius: 8,
                backgroundColor: "#111827",
                borderWidth: 1,
                borderColor: "#374151",
              }}
              itemTextStyle={{ color: "white" }}
              activeColor="#7c3aed"
              renderItem={(item) => (
                <View className="py-3 px-4">
                  <Text className="text-lg text-white">{item.label}</Text>
                </View>
              )}
            />
          </View>

          <View className="flex-row justify-between mb-5">
            <TouchableOpacity
              onPress={() => setStartTimePickerVisible(true)}
              className="bg-gray-800 py-3 px-4 rounded-xl flex-row items-center w-[48%] border border-gray-600"
            >
              <ClockIcon size={18} color="#9ca3af" />
              <Text className="text-gray-300 ml-2 font-medium">
                {tempTimeRange.start
                  ? formatTime(tempTimeRange.start)
                  : "Start Time"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setEndTimePickerVisible(true)}
              className="bg-gray-800 py-3 px-4 rounded-xl flex-row items-center w-[48%] border border-gray-600"
            >
              <ClockIcon size={18} color="#9ca3af" />
              <Text className="text-gray-300 ml-2 font-medium">
                {tempTimeRange.end ? formatTime(tempTimeRange.end) : "End Time"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={addTimeRange}
            className="bg-[#4c1d95] py-3 rounded-xl flex-row justify-center items-center shadow-md"
            style={{
              shadowColor: "#4c1d95",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text className="text-white font-semibold text-lg">Set Hours</Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isStartTimePickerVisible}
            mode="time"
            onConfirm={handleStartTimeConfirm}
            onCancel={() => setStartTimePickerVisible(false)}
            themeVariant="dark"
          />

          <DateTimePickerModal
            isVisible={isEndTimePickerVisible}
            mode="time"
            onConfirm={handleEndTimeConfirm}
            onCancel={() => setEndTimePickerVisible(false)}
            themeVariant="dark"
          />
        </View>

        {/* Schedule display */}
        <View className="bg-gray-900 p-5 rounded-xl mb-6 border border-gray-700">
          <Text className="text-gray-200 text-xl font-semibold mb-4">
            Weekly Schedule
          </Text>

          {days.map((day) => (
            <View
              key={day.value}
              className="mb-4 border-b border-gray-700 pb-4"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-200 text-lg font-medium">
                  {day.label}
                </Text>
                <View className="flex-row items-center">
                  <Text
                    className={`${
                      form.operatingHours[day.value]
                        ? "text-indigo-300"
                        : "text-gray-500"
                    } mr-3 font-medium`}
                  >
                    {form.operatingHours[day.value]
                      ? form.operatingHours[day.value]
                      : "Closed"}
                  </Text>
                  {form.operatingHours[day.value] && (
                    <TouchableOpacity
                      onPress={() => clearHours(day.value)}
                      className="bg-red-900 bg-opacity-30 p-1.5 rounded-full"
                    >
                      <XMarkIcon size={14} color="#f87171" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className="flex-row justify-center space-x-8 my-8">
          <TouchableOpacity
            onPress={onBackPress}
            className="bg-gray-800 w-14 h-14 rounded-full items-center justify-center shadow-md"
            style={{
              shadowColor: "#374151",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 6,
            }}
          >
            <ArrowLeftIcon size={28} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNextPress}
            className="bg-[#4c1d95] w-14 h-14 rounded-full items-center justify-center shadow-md"
            style={{
              shadowColor: "#4c1d95",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 6,
            }}
          >
            <ArrowRightIcon size={28} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// Screen to review and submit
const reviewScreen = ({
  form,
  createBusiness,
  onNextPress,
  onBackPress,
  printForm,
  carouselRef,
  progress,
  onPressPagination,
  setSelectedImageIndex,
  setImageViewerVisible,
}) => {
  return (
    <View className="flex-1 pt-4">
      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <Image
            source={images.ReviewImg}
            style={{ width: 200, height: 200 }}
            className="rounded-3xl mb-4"
            resizeMode="cover"
          />

          <Text className="text-gray-100 text-3xl font-dsbold mb-3 text-center">
            Review and Submit
          </Text>

          <Text className="text-gray-400 text-base text-center mb-6">
            Please review all information before final submission.
          </Text>
        </View>

        {/* Media preview */}
        {form.media.length > 0 && (
          <View className="bg-gray-900 rounded-xl p-5 mb-5 border border-gray-700">
            <Text className="text-gray-200 text-xl font-semibold mb-4">
              Business Media
            </Text>
            <View className="items-center">
              <Carousel
                data={form.media.map((media) => media.uri)}
                loop={true}
                ref={carouselRef}
                width={200}
                height={200}
                scrollAnimationDuration={100}
                style={{ alignItems: "center", justifyContent: "center" }}
                onProgressChange={progress}
                onConfigurePanGesture={(panGesture) => {
                  panGesture.activeOffsetX([-5, 5]);
                  panGesture.failOffsetY([-5, 5]);
                }}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedImageIndex(index);
                      setImageViewerVisible(true);
                    }}
                  >
                    <Image
                      source={{ uri: item }}
                      style={{
                        width: 200,
                        height: 200,
                        borderRadius: 10,
                      }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
              />

              {form.media.length > 1 && (
                <Pagination.Basic
                  progress={progress}
                  data={form.media.map((media) => media.uri)}
                  onPress={onPressPagination}
                  size={5}
                  dotStyle={{ backgroundColor: "gray", borderRadius: 100 }}
                  activeDotStyle={{
                    backgroundColor: "white",
                    overflow: "hidden",
                    aspectRatio: 1,
                    borderRadius: 15,
                  }}
                  containerStyle={{ gap: 5, marginTop: 10 }}
                  horizontal
                />
              )}
            </View>
          </View>
        )}

        {/* General info */}
        <View className="bg-gray-900 rounded-xl p-5 mb-5 border border-gray-700">
          <Text className="text-gray-200 text-xl font-semibold mb-4">
            General Information
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Name</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.name}
              </Text>
            </View>
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Category</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.category}
              </Text>
            </View>
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Address</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.address}
              </Text>
            </View>
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Description</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.description}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View className="bg-gray-900 rounded-xl p-5 mb-5 border border-gray-700">
          <Text className="text-gray-200 text-xl font-semibold mb-4">
            Contact Information
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Phone</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.phone}
              </Text>
            </View>
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Email</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.email}
              </Text>
            </View>
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Website</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.website}
              </Text>
            </View>
          </View>
        </View>

        {/* Operating hours */}
        <View className="bg-gray-900 rounded-xl p-5 mb-5 border border-gray-700">
          <Text className="text-gray-200 text-xl font-semibold mb-4">
            Operating Hours
          </Text>
          <View className="space-y-2">
            {Object.keys(form.operatingHours).map((key) => (
              <View
                key={key}
                className="flex-row justify-between items-center py-1.5"
              >
                <Text className="text-gray-400">{`${
                  key.charAt(0).toUpperCase() + key.slice(1)
                }`}</Text>
                <Text
                  className={`${
                    form.operatingHours[key]
                      ? "text-indigo-300"
                      : "text-gray-500"
                  } font-medium`}
                >
                  {form.operatingHours[key] || "Closed"}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Location Info */}
        <View className="bg-gray-900 rounded-xl p-5 mb-8 border border-gray-700">
          <Text className="text-gray-200 text-xl font-semibold mb-4">
            Location Information
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Location</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.location ? form.location.name : "N/A"}
              </Text>
            </View>
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Coordinates</Text>
              <Text className="text-white font-medium text-right flex-1">
                Lat:{" "}
                {form.latitude ? parseFloat(form.latitude).toFixed(6) : "N/A"}
                {"\n"}
                Long:{" "}
                {form.longitude ? parseFloat(form.longitude).toFixed(6) : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-center mb-10">
          <TouchableOpacity
            onPress={onBackPress}
            className="bg-gray-800 w-14 h-14 rounded-full items-center justify-center shadow-md mx-3"
            style={{
              shadowColor: "#374151",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 6,
            }}
          >
            <ArrowLeftIcon size={28} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              onNextPress();
              createBusiness();
            }}
            className="bg-[#4c1d95] w-14 h-14 rounded-full items-center justify-center shadow-md mx-3"
            style={{
              shadowColor: "#4c1d95",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 6,
            }}
          >
            <ArrowRightIcon size={28} color="white" />
          </TouchableOpacity>

          {/* <TouchableOpacity
            onPress={printForm}
            className="bg-blue-900 h-14 px-4 rounded-full items-center justify-center mx-3"
          >
            <Text className="text-white font-semibold">Debug</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </View>
  );
};

// Screen to show success message
const successScreen = ({ uploading, error }) => {
  return uploading ? (
    <View className="flex-1 items-center justify-center px-6">
      <LottieView
        source={require("../../assets/animations/Creating.json")}
        autoPlay
        loop={true}
        style={{ width: 300, height: 300 }}
      />

      <Text className="text-gray-100 text-3xl font-dsbold text-center mb-4">
        Creating Your Business
      </Text>

      <Text className="text-gray-400 text-base text-center">
        Please wait while we process your information. This may take a moment.
      </Text>
    </View>
  ) : error ? (
    <View className="flex-1 items-center justify-center px-6">
      <LottieView
        source={require("../../assets/animations/Error.json")}
        autoPlay
        loop={false}
        style={{ width: 200, height: 200 }}
      />

      <Text className="text-gray-100 text-3xl font-dsbold text-center mb-4">
        Something Went Wrong
      </Text>

      <Text className="text-gray-400 text-base text-center mb-6">
        We encountered an error while creating your business. Please try again.
      </Text>

      <View className="bg-red-900 bg-opacity-30 p-4 rounded-xl mb-8 w-full">
        <Text className="text-red-400 text-center">{error}</Text>
      </View>

      <TouchableOpacity
        onPress={() => router.replace("/settings")}
        className="bg-[#4c1d95] py-3 px-6 rounded-xl shadow-md"
        style={{
          shadowColor: "#4c1d95",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 6,
        }}
      >
        <Text className="text-white font-semibold text-lg">
          Back to Settings
        </Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View className="flex-1 items-center justify-center px-6">
      <LottieView
        source={require("../../assets/animations/Success.json")}
        autoPlay
        loop={false}
        style={{ width: 250, height: 250 }}
      />

      <Text className="text-gray-100 text-3xl font-dsbold text-center mb-4">
        Business Submitted!
      </Text>

      <Text className="text-gray-400 text-base text-center mb-8">
        Your business has been successfully submitted for review. We'll notify
        you once it's approved and live on Odysseum.
      </Text>

      <TouchableOpacity
        onPress={() => router.replace("/settings")}
        className="bg-green-900 py-3 px-6 rounded-xl shadow-md"
        style={{
          shadowColor: "#065f46",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 6,
        }}
      >
        <Text className="text-white font-semibold text-lg">Complete</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BusinessCreateScreen;
