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
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../utils/axios";
import useUserStore from "../context/userStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { Dropdown } from "react-native-element-dropdown";
import LottieView from "lottie-react-native";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
  CalendarIcon,
  PhotoIcon,
  TrashIcon,
  PlusIcon,
} from "react-native-heroicons/solid";
import images from "../../assets/images/images";
import CalendarModal from "../components/CalendarModal";
import Checkbox from "expo-checkbox";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";

const { width } = Dimensions.get("window");

const ServiceCreateScreen = ({ businessId }) => {
  const FormData = global.FormData;
  const user = useUserStore((state) => state.user);
  const flatListRef = React.useRef();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [specialPrices, setSpecialPrices] = useState([]);
  const [customDetails, setCustomDetails] = useState({});
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [pricingCalendarVisible, setPricingCalendarVisible] = useState(false);
  const [availabilityCalendarVisible, setAvailabilityCalendarVisible] =
    useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState(null);
  const [editMode, setEditMode] = useState("date"); // 'date' or 'day
  const [currentIndex, setCurrentIndex] = useState(0);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    media: [],
    pricing: {
      pricingModel: "",
      basePrice: "",
      specialPrices: [],
    },
    paymentSettings: {
      acceptOnlinePayment: false,
      deposit: {
        enabled: false,
        percentage: 0,
      },
      chargeOnNoShow: {
        enabled: false,
        amount: 0,
      },
      taxRate: 0,
    },
    bookingSettings: {
      requiresApproval: false,
      minAdvanceBooking: 0,
      maxAdvanceBooking: 0,
      bookingTimeout: 15,
    },
    cancellationPolicy: {
      allowCancellation: true,
      freeCancellationHours: "",
      cancellationFee: "",
    },
    availability: {
      dates: [],

      recurring: false,
      recurringStartDate: "",
      daysOfWeek: [],
    },
    customDetails: {},
  });

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

  const createService = async () => {
    console.log("Creating service...");

    if (
      !form.name ||
      !form.description ||
      !form.category ||
      !form.pricing.pricingModel ||
      !form.pricing.basePrice ||
      !form.paymentSettings.taxRate ||
      !form.bookingSettings.minAdvanceBooking ||
      !form.bookingSettings.maxAdvanceBooking
    ) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill out all required fields",
        position: "bottom",
      });
      return;
    }

    setUploading(true);

    let formData = new FormData();

    formData.append("ownerId", user._id);
    formData.append("businessId", businessId);
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("pricing", JSON.stringify(form.pricing));
    formData.append("paymentSettings", JSON.stringify(form.paymentSettings));
    formData.append("bookingSettings", JSON.stringify(form.bookingSettings));
    formData.append(
      "cancellationPolicy",
      JSON.stringify(form.cancellationPolicy)
    );
    formData.append("availability", JSON.stringify(form.availability));
    formData.append("customDetails", JSON.stringify(form.customDetails));

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
      .post("/service/create", formData, {
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
        console.log(err);
        setUploading(false);
        setError(err.response.data.message);
      });
  };

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
  // Update form when specialPrices change
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        specialPrices: specialPrices,
      },
    }));
  }, [specialPrices]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      customDetails: customDetails,
    }));
  }, [customDetails]);

  const screens = [
    { screen: startScreen, params: { onNextPress } },
    {
      screen: serviceInfoScreen,
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
      screen: pricingScreen,
      params: {
        focusedInput,
        setFocusedInput,
        form,
        setForm,
        onNextPress,
        onBackPress,
        specialPrices,
        setSpecialPrices,
        pricingCalendarVisible,
        setPricingCalendarVisible,
        currentEditingIndex,
        setCurrentEditingIndex,
      },
    },
    {
      screen: paymentScreen,
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
      screen: bookingScreen,
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
      screen: cancellationScreen,
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
      screen: availabilityScreen,
      params: {
        focusedInput,
        setFocusedInput,
        form,
        setForm,
        onNextPress,
        onBackPress,
        availabilityCalendarVisible,
        setAvailabilityCalendarVisible,
        currentEditingIndex,
        setCurrentEditingIndex,
        editMode,
        setEditMode,
      },
    },
    {
      screen: customDetailsScreen,
      params: {
        focusedInput,
        setFocusedInput,
        form,
        setForm,
        onNextPress,
        onBackPress,
        customDetails,
        setCustomDetails,
      },
    },
    {
      screen: reviewScreen,
      params: {
        form,
        createService,
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
    { screen: successScreen, params: { uploading, error, businessId } },
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

const startScreen = ({ onNextPress }) => {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Image
        source={images.CreateServiceImg}
        style={{ width: "100%", height: 280 }}
        className="rounded-3xl mb-8"
        resizeMode="cover"
      />

      <Text className="text-gray-100 text-4xl font-dsbold text-center mb-4">
        Create Service
      </Text>

      <Text className="text-gray-400 text-lg text-center mb-10">
        Welcome to the service creation hub. This hub will guide you through the
        process of creating a new service offering for your business.
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

const serviceInfoScreen = ({
  form,
  setForm,
  onNextPress,
  onBackPress,
  focusedInput,
  setFocusedInput,
}) => {
  const categories = [
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

  const validateScreen = () => {
    if (!form.name || !form.category || !form.description) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill out all required fields",
        position: "bottom",
      });
      return;
    }

    onNextPress();
  };

  return (
    <View className="flex-1">
      <TouchableOpacity
        onPress={() => router.back()}
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
          Service Information
        </Text>

        <View className="space-y-5 mb-6">
          <View>
            <Text className="text-gray-400 text-sm mb-2 ml-1">
              Service Name
            </Text>
            <TextInput
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
              placeholder="Enter service name"
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
            <Text className="text-gray-400 text-sm mb-2 ml-1">Description</Text>
            <TextInput
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              placeholder="Describe your service"
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
            <ArrowRightIcon size={28} color="#d1d5db" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
            Showcase Your Service
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

const pricingScreen = ({
  focusedInput,
  setFocusedInput,
  form,
  setForm,
  onNextPress,
  onBackPress,
  specialPrices,
  setSpecialPrices,
  pricingCalendarVisible,
  setPricingCalendarVisible,
  currentEditingIndex,
  setCurrentEditingIndex,
}) => {
  const pricingModels = ["fixed", "perHour", "perDay", "perPerson"];
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const addSpecialPrice = () =>
    setSpecialPrices([
      ...specialPrices,
      {
        name: "",
        price: 0,
        conditions: {
          daysOfWeek: [],
          specificDates: [],
          minPeople: 0,
        },
      },
    ]);

  const removeSpecialPrice = (index) =>
    setSpecialPrices(specialPrices.filter((_, i) => i !== index));

  const updateSpecialPrice = (index, field, value) => {
    const updatedPrices = [...specialPrices];

    if (field.includes(".")) {
      // Handle nested fields like 'conditions.minPeople'
      const [parent, child] = field.split(".");
      updatedPrices[index][parent][child] = value;
    } else updatedPrices[index][field] = value;

    setSpecialPrices(updatedPrices);
  };

  const toggleDayOfWeek = (index, day) => {
    const updatedPrices = [...specialPrices];
    const currentDays = updatedPrices[index].conditions.daysOfWeek;

    if (currentDays.includes(day))
      updatedPrices[index].conditions.daysOfWeek = currentDays.filter(
        (d) => d !== day
      );
    else updatedPrices[index].conditions.daysOfWeek = [...currentDays, day];

    setSpecialPrices(updatedPrices);
  };

  const addSpecificDate = (index, date) => {
    // Format date to YYYY-MM-DD
    const formattedDate =
      date instanceof Date ? date.toISOString().split("T")[0] : date;

    const updatedPrices = [...specialPrices];
    if (
      !updatedPrices[index].conditions.specificDates.includes(formattedDate)
    ) {
      updatedPrices[index].conditions.specificDates = [
        ...updatedPrices[index].conditions.specificDates,
        formattedDate,
      ];
      setSpecialPrices(updatedPrices);
    }
  };

  const removeSpecificDate = (priceIndex, dateIndex) => {
    const updatedPrices = [...specialPrices];
    updatedPrices[priceIndex].conditions.specificDates = updatedPrices[
      priceIndex
    ].conditions.specificDates.filter((_, i) => i !== dateIndex);
    setSpecialPrices(updatedPrices);
  };

  // Calendar handlers specifically for pricing
  const openPricingCalendar = (index) => {
    setCurrentEditingIndex(index);
    setPricingCalendarVisible(true);
  };

  const handlePricingDateSelect = (date) => {
    // Format date to YYYY-MM-DD
    const formattedDate =
      date instanceof Date ? date.toISOString().split("T")[0] : date;

    if (currentEditingIndex !== null) {
      const updatedPrices = [...specialPrices];
      if (
        !updatedPrices[currentEditingIndex].conditions.specificDates.includes(
          formattedDate
        )
      ) {
        updatedPrices[currentEditingIndex].conditions.specificDates = [
          ...updatedPrices[currentEditingIndex].conditions.specificDates,
          formattedDate,
        ];
        setSpecialPrices(updatedPrices);
      }
    }
  };

  const validateScreen = () => {
    //validate and check every field
    // special prices array should not have default values
    // special prices array should not have empty values
    // special prices array should not have negative values
    // empty special prices is allowed

    if (!form.pricing.pricingModel || !form.pricing.basePrice) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill out all required fields",
        position: "bottom",
      });
      return;
    }

    if (form.pricing.basePrice < 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Base price cannot be negative",
        position: "bottom",
      });
      return;
    }

    if (form.pricing.specialPrices.length > 0) {
      for (let i = 0; i < form.pricing.specialPrices.length; i++) {
        if (form.pricing.specialPrices[i].price < 0) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Special price cannot be negative",
            position: "bottom",
          });
          return;
        }

        if (form.pricing.specialPrices[i].conditions.minPeople < 0) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Minimum people cannot be negative",
            position: "bottom",
          });
          return;
        }

        if (
          form.pricing.specialPrices[i].name === "" ||
          form.pricing.specialPrices[i].price === 0
        ) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2:
              "Special price cannot have default values. Change or remove them",
            position: "bottom",
          });
          return;
        }

        //either speicfic dates or days of week should be selected
        if (
          form.pricing.specialPrices[i].conditions.specificDates.length === 0 &&
          form.pricing.specialPrices[i].conditions.daysOfWeek.length === 0
        ) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2:
              "Special price should have either specific dates or days of week selected",
            position: "bottom",
          });
          return;
        }
      }
    }

    onNextPress();
  };

  return (
    <View className="flex-1">
      <TouchableOpacity
        onPress={() => router.back()}
        className="p-5"
      >
        <XMarkIcon size={28} color="#e5e7eb" />
      </TouchableOpacity>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <Image
            source={images.ServicePricingImg}
            style={{ width: 180, height: 180 }}
            className="rounded-3xl mb-4"
            resizeMode="cover"
          />

          <Text className="text-gray-100 text-3xl font-dsbold mb-3 text-center">
            Set Your Pricing
          </Text>

          <Text className="text-gray-400 text-base text-center mb-6">
            Configure how your service will be priced for customers.
          </Text>
        </View>

        <View className="space-y-5 mb-6">
          <View>
            <Text className="text-gray-400 text-sm mb-2 ml-1">
              Pricing Model
            </Text>
            <Dropdown
              data={pricingModels}
              value={form.pricing.pricingModel}
              selectedTextStyle={{ color: "white", fontSize: 18 }}
              placeholder={
                form.pricing.pricingModel === ""
                  ? "Select a pricing model"
                  : form.pricing.pricingModel
              }
              placeholderStyle={{ color: "gray", fontSize: 18 }}
              onChange={(item) =>
                setForm({
                  ...form,
                  pricing: { ...form.pricing, pricingModel: item },
                })
              }
              maxHeight={250}
              onFocus={() => setFocusedInput("pricingModel")}
              onBlur={() => setFocusedInput(null)}
              style={{
                backgroundColor: "#111827",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: focusedInput === "pricingModel" ? 2 : 1,
                borderColor:
                  focusedInput === "pricingModel" ? "#9333ea" : "#374151",
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
            <Text className="text-gray-400 text-sm mb-2 ml-1">
              Base Price ($)
            </Text>
            <TextInput
              value={form.pricing.basePrice}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  pricing: { ...form.pricing, basePrice: text },
                })
              }
              placeholder="Enter base price"
              placeholderTextColor="gray"
              keyboardType="numeric"
              onFocus={() => setFocusedInput("basePrice")}
              onBlur={() => setFocusedInput(null)}
              className={`text-white text-lg bg-gray-900 px-4 py-3 rounded-xl ${
                focusedInput === "basePrice"
                  ? "border-2 border-purple-600"
                  : "border border-gray-700"
              }`}
            />
          </View>

          {/* Special prices section */}
          <View className="mt-4">
            <Text className="text-gray-100 text-xl font-dsbold mb-4">
              Special Pricing
            </Text>

            {specialPrices.map((specialPrice, index) => (
              <View
                key={index}
                className="bg-gray-900 rounded-xl p-4 mb-5 border border-gray-700"
                style={{
                  shadowColor: "#111",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  elevation: 3,
                }}
              >
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-white text-lg font-semibold">
                    Special Price {index + 1}
                  </Text>

                  <TouchableOpacity
                    onPress={() => removeSpecialPrice(index)}
                    className="bg-red-900 bg-opacity-80 px-3 py-1.5 rounded-lg"
                  >
                    <Text className="text-white font-medium">Remove</Text>
                  </TouchableOpacity>
                </View>

                <View className="mb-4">
                  <Text className="text-gray-400 text-sm mb-2 ml-1">Name</Text>
                  <TextInput
                    value={specialPrice.name}
                    onChangeText={(text) =>
                      updateSpecialPrice(index, "name", text)
                    }
                    placeholder="Name (e.g. Weekend Rate)"
                    placeholderTextColor="gray"
                    onFocus={() => setFocusedInput(`specialName_${index}`)}
                    onBlur={() => setFocusedInput(null)}
                    className={`text-white text-lg bg-gray-800 px-4 py-3 rounded-xl ${
                      focusedInput === `specialName_${index}`
                        ? "border-2 border-purple-600"
                        : "border border-gray-700"
                    }`}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-gray-400 text-sm mb-2 ml-1">
                    Price ($)
                  </Text>
                  <TextInput
                    value={specialPrice.price}
                    onChangeText={(text) =>
                      updateSpecialPrice(index, "price", text)
                    }
                    placeholder="Special price amount"
                    placeholderTextColor="gray"
                    keyboardType="numeric"
                    onFocus={() => setFocusedInput(`specialPrice_${index}`)}
                    onBlur={() => setFocusedInput(null)}
                    className={`text-white text-lg bg-gray-800 px-4 py-3 rounded-xl ${
                      focusedInput === `specialPrice_${index}`
                        ? "border-2 border-purple-600"
                        : "border border-gray-700"
                    }`}
                  />
                </View>

                <Text className="text-gray-200 text-lg font-semibold mb-3">
                  Conditions
                </Text>

                {/* Days of Week */}
                <Text className="text-gray-400 text-sm mb-2 ml-1">
                  Days of Week
                </Text>
                <View className="flex-row flex-wrap mb-4">
                  {daysOfWeek.map((day) => (
                    <TouchableOpacity
                      key={day}
                      onPress={() => toggleDayOfWeek(index, day)}
                      className={`m-1 px-3 py-2 rounded-lg ${
                        specialPrice.conditions.daysOfWeek.includes(day)
                          ? "bg-purple-700"
                          : "bg-gray-700"
                      }`}
                    >
                      <Text
                        className={`${
                          specialPrice.conditions.daysOfWeek.includes(day)
                            ? "text-white font-medium"
                            : "text-gray-300"
                        }`}
                      >
                        {day.substring(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Minimum People */}
                <View className="mb-4">
                  <Text className="text-gray-400 text-sm mb-2 ml-1">
                    Minimum People
                  </Text>
                  <TextInput
                    value={specialPrice.conditions.minPeople}
                    onChangeText={(text) =>
                      updateSpecialPrice(index, "conditions.minPeople", text)
                    }
                    placeholder="Minimum number of people"
                    placeholderTextColor="gray"
                    keyboardType="numeric"
                    onFocus={() => setFocusedInput(`minPeople_${index}`)}
                    onBlur={() => setFocusedInput(null)}
                    className={`text-white text-lg bg-gray-800 px-4 py-3 rounded-xl ${
                      focusedInput === `minPeople_${index}`
                        ? "border-2 border-purple-600"
                        : "border border-gray-700"
                    }`}
                  />
                </View>

                <Text className="text-gray-400 text-sm mb-2 ml-1">
                  Specific Dates
                </Text>
                <View className="bg-gray-800 p-3 rounded-xl mb-3 border border-gray-700">
                  {specialPrice.conditions.specificDates.length > 0 ? (
                    specialPrice.conditions.specificDates.map(
                      (date, dateIndex) => (
                        <View
                          key={dateIndex}
                          className="flex-row items-center justify-between mb-2 pb-2 border-b border-gray-700"
                        >
                          <Text className="text-gray-200">{date}</Text>
                          <TouchableOpacity
                            onPress={() => removeSpecificDate(index, dateIndex)}
                            className="bg-red-800 px-2 py-1 rounded-lg"
                          >
                            <Text className="text-white text-xs">Remove</Text>
                          </TouchableOpacity>
                        </View>
                      )
                    )
                  ) : (
                    <Text className="text-gray-500 text-center py-2">
                      No specific dates added
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => openPricingCalendar(index)}
                  className="bg-indigo-800 p-3 rounded-xl flex-row justify-center items-center"
                  style={{
                    shadowColor: "#312e81",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 3,
                  }}
                >
                  <CalendarIcon size={20} color="white" className="mr-2" />
                  <Text className="text-white font-medium ml-2">Add Date</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              onPress={addSpecialPrice}
              className="bg-[#4c1d95] py-3 px-4 rounded-xl flex-row justify-center items-center mt-2"
              style={{
                shadowColor: "#4c1d95",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <PlusIcon size={20} color="white" />
              <Text className="text-white text-lg font-semibold ml-2">
                Add Special Price
              </Text>
            </TouchableOpacity>
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

      <CalendarModal
        visible={pricingCalendarVisible}
        setVisible={setPricingCalendarVisible}
        setDate={handlePricingDateSelect}
      />
    </View>
  );
};

const paymentScreen = ({
  focusedInput,
  setFocusedInput,
  form,
  setForm,
  onNextPress,
  onBackPress,
}) => {
  const validateScreen = () => {
    if (!form.paymentSettings.taxRate) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Tax rate must be between 0 and 100",
        position: "bottom",
      });
      return;
    }

    if (
      form.paymentSettings.deposit.enabled &&
      !form.paymentSettings.deposit.percentage
    ) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Deposit percentage must be between 0 and 100",
        position: "bottom",
      });
      return;
    }

    if (
      form.paymentSettings.chargeOnNoShow.enabled &&
      !form.paymentSettings.chargeOnNoShow.amount
    ) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Charge amount must be greater than 0",
        position: "bottom",
      });
      return;
    }

    onNextPress();
  };

  return (
    <View className="flex-1">
      <TouchableOpacity
        onPress={() => router.back()}
        className="p-5"
      >
        <XMarkIcon size={28} color="#e5e7eb" />
      </TouchableOpacity>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <Image
            source={images.PaymentImg}
            style={{ width: 180, height: 180 }}
            className="rounded-3xl mb-4"
            resizeMode="cover"
          />

          <Text className="text-gray-100 text-3xl font-dsbold mb-3 text-center">
            Payment Settings
          </Text>

          <Text className="text-gray-400 text-base text-center mb-6">
            Configure payment options for your customers.
          </Text>
        </View>

        <View
          className="bg-gray-900 rounded-xl p-5 mb-6 border border-gray-800"
          style={{
            shadowColor: "#111",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <View className="mb-5">
            <Text className="text-gray-400 text-sm mb-2 ml-1">
              Tax Rate (%)
            </Text>
            <TextInput
              value={form.paymentSettings.taxRate}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  paymentSettings: { ...form.paymentSettings, taxRate: text },
                })
              }
              placeholder="Enter tax rate percentage"
              placeholderTextColor="gray"
              keyboardType="numeric"
              onFocus={() => setFocusedInput("taxRate")}
              onBlur={() => setFocusedInput(null)}
              className={`text-white text-lg bg-gray-800 px-4 py-3 rounded-xl ${
                focusedInput === "taxRate"
                  ? "border-2 border-purple-600"
                  : "border border-gray-700"
              }`}
            />
          </View>

          <View className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-4">
            <View className="flex-row items-center mb-1">
              <Checkbox
                value={form.paymentSettings.acceptOnlinePayment}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    paymentSettings: {
                      ...form.paymentSettings,
                      acceptOnlinePayment: value,
                    },
                  })
                }
                color="#9333ea"
                style={{ width: 24, height: 24, borderRadius: 4 }}
              />
              <Text className="text-white text-lg font-medium ml-3">
                Accept Online Payment
              </Text>
            </View>
            <Text className="text-gray-400 text-sm ml-9">
              Allow customers to pay for services online
            </Text>
          </View>

          <View className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-4">
            <View className="flex-row items-center mb-1">
              <Checkbox
                value={form.paymentSettings.deposit.enabled}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    paymentSettings: {
                      ...form.paymentSettings,
                      deposit: {
                        ...form.paymentSettings.deposit,
                        enabled: value,
                      },
                    },
                  })
                }
                color="#9333ea"
                style={{ width: 24, height: 24, borderRadius: 4 }}
              />
              <Text className="text-white text-lg font-medium ml-3">
                Require Deposit
              </Text>
            </View>
            <Text className="text-gray-400 text-sm ml-9 mb-2">
              Require an upfront deposit payment
            </Text>

            {form.paymentSettings.deposit.enabled && (
              <View className="mt-3 ml-9 mr-4">
                <Text className="text-gray-300 text-sm mb-2">
                  Deposit Percentage (%)
                </Text>
                <TextInput
                  value={form.paymentSettings.deposit.percentage}
                  onChangeText={(text) =>
                    setForm({
                      ...form,
                      paymentSettings: {
                        ...form.paymentSettings,
                        deposit: {
                          ...form.paymentSettings.deposit,
                          percentage: text,
                        },
                      },
                    })
                  }
                  placeholder="Enter percentage"
                  placeholderTextColor="gray"
                  keyboardType="numeric"
                  onFocus={() => setFocusedInput("depositPercentage")}
                  onBlur={() => setFocusedInput(null)}
                  className={`text-white text-lg bg-gray-900 px-4 py-3 rounded-xl ${
                    focusedInput === "depositPercentage"
                      ? "border-2 border-purple-600"
                      : "border border-gray-700"
                  }`}
                />
              </View>
            )}
          </View>

          <View className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <View className="flex-row items-center mb-1">
              <Checkbox
                value={form.paymentSettings.chargeOnNoShow.enabled}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    paymentSettings: {
                      ...form.paymentSettings,
                      chargeOnNoShow: {
                        ...form.paymentSettings.chargeOnNoShow,
                        enabled: value,
                      },
                    },
                  })
                }
                color="#9333ea"
                style={{ width: 24, height: 24, borderRadius: 4 }}
              />
              <Text className="text-white text-lg font-medium ml-3">
                Charge on No Show
              </Text>
            </View>
            <Text className="text-gray-400 text-sm ml-9 mb-2">
              Charge customers who don't show up
            </Text>

            {form.paymentSettings.chargeOnNoShow.enabled && (
              <View className="mt-3 ml-9 mr-4">
                <Text className="text-gray-300 text-sm mb-2">
                  No-Show Charge Amount ($)
                </Text>
                <TextInput
                  value={form.paymentSettings.chargeOnNoShow.amount}
                  onChangeText={(text) =>
                    setForm({
                      ...form,
                      paymentSettings: {
                        ...form.paymentSettings,
                        chargeOnNoShow: {
                          ...form.paymentSettings.chargeOnNoShow,
                          amount: text,
                        },
                      },
                    })
                  }
                  placeholder="Enter amount"
                  placeholderTextColor="gray"
                  keyboardType="numeric"
                  onFocus={() => setFocusedInput("chargeAmount")}
                  onBlur={() => setFocusedInput(null)}
                  className={`text-white text-lg bg-gray-900 px-4 py-3 rounded-xl ${
                    focusedInput === "chargeAmount"
                      ? "border-2 border-purple-600"
                      : "border border-gray-700"
                  }`}
                />
              </View>
            )}
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
    </View>
  );
};

const bookingScreen = ({
  focusedInput,
  setFocusedInput,
  form,
  setForm,
  onNextPress,
  onBackPress,
}) => {
  const validateScreen = () => {
    if (
      !form.bookingSettings.minAdvanceBooking ||
      !form.bookingSettings.maxAdvanceBooking ||
      !form.bookingSettings.bookingTimeout
    ) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill out all required fields",
        position: "bottom",
      });
      return;
    }

    onNextPress();
  };

  return (
    <View className="flex-1">
      <TouchableOpacity
        onPress={() => router.back()}
        className="p-5"
      >
        <XMarkIcon size={28} color="#e5e7eb" />
      </TouchableOpacity>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <Image
            source={images.PaymentImg}
            style={{ width: 180, height: 180 }}
            className="rounded-3xl mb-4"
            resizeMode="cover"
          />

          <Text className="text-gray-100 text-3xl font-dsbold mb-3 text-center">
            Booking Settings
          </Text>

          <Text className="text-gray-400 text-base text-center mb-6">
            Configure how customers can book your service.
          </Text>
        </View>

        <View
          className="bg-gray-900 rounded-xl p-5 mb-6 border border-gray-800"
          style={{
            shadowColor: "#111",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <View className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-5">
            <View className="flex-row items-center">
              <Checkbox
                value={form.bookingSettings.requiresApproval}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    bookingSettings: {
                      ...form.bookingSettings,
                      requiresApproval: value,
                    },
                  })
                }
                color="#9333ea"
                style={{ width: 24, height: 24, borderRadius: 4 }}
              />
              <Text className="text-white text-lg font-medium ml-3">
                Booking Requires Approval
              </Text>
            </View>
            <Text className="text-gray-400 text-sm ml-9">
              Manually approve each booking request
            </Text>
          </View>

          <Text className="text-gray-200 text-xl font-semibold mb-4">
            Booking Time Settings
          </Text>

          <View className="mb-4">
            <Text className="text-gray-400 text-sm mb-2 ml-1">
              Minimum Advance Booking (hours)
            </Text>
            <TextInput
              value={form.bookingSettings.minAdvanceBooking}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  bookingSettings: {
                    ...form.bookingSettings,
                    minAdvanceBooking: text,
                  },
                })
              }
              placeholder="Enter minimum hours in advance"
              placeholderTextColor="gray"
              keyboardType="numeric"
              onFocus={() => setFocusedInput("minAdvanceBooking")}
              onBlur={() => setFocusedInput(null)}
              className={`text-white text-lg bg-gray-800 px-4 py-3 rounded-xl ${
                focusedInput === "minAdvanceBooking"
                  ? "border-2 border-purple-600"
                  : "border border-gray-700"
              }`}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-400 text-sm mb-2 ml-1">
              Maximum Advance Booking (days)
            </Text>
            <TextInput
              value={form.bookingSettings.maxAdvanceBooking}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  bookingSettings: {
                    ...form.bookingSettings,
                    maxAdvanceBooking: text,
                  },
                })
              }
              placeholder="Enter maximum days in advance"
              placeholderTextColor="gray"
              keyboardType="numeric"
              onFocus={() => setFocusedInput("maxAdvanceBooking")}
              onBlur={() => setFocusedInput(null)}
              className={`text-white text-lg bg-gray-800 px-4 py-3 rounded-xl ${
                focusedInput === "maxAdvanceBooking"
                  ? "border-2 border-purple-600"
                  : "border border-gray-700"
              }`}
            />
          </View>

          <View className="mb-2">
            <Text className="text-gray-400 text-sm mb-2 ml-1">
              Booking Timeout (minutes)
            </Text>
            <TextInput
              value={form.bookingSettings.bookingTimeout}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  bookingSettings: {
                    ...form.bookingSettings,
                    bookingTimeout: text,
                  },
                })
              }
              placeholder="Enter booking timeout in minutes"
              placeholderTextColor="gray"
              keyboardType="numeric"
              onFocus={() => setFocusedInput("bookingTimeout")}
              onBlur={() => setFocusedInput(null)}
              className={`text-white text-lg bg-gray-800 px-4 py-3 rounded-xl ${
                focusedInput === "bookingTimeout"
                  ? "border-2 border-purple-600"
                  : "border border-gray-700"
              }`}
            />
            <Text className="text-gray-500 text-xs ml-1 mt-1">
              Time that customers have to complete payment after booking
            </Text>
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
    </View>
  );
};

const cancellationScreen = ({
  focusedInput,
  setFocusedInput,
  form,
  setForm,
  onNextPress,
  onBackPress,
}) => {
  const validateScreen = () => {
    if (
      form.cancellationPolicy.allowCancellation &&
      (!form.cancellationPolicy.freeCancellationHours ||
        !form.cancellationPolicy.cancellationFee)
    ) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill out all required fields",
        position: "bottom",
      });
      return;
    }

    onNextPress();
  };

  return (
    <View className="flex-1">
      <TouchableOpacity
        onPress={() => router.back()}
        className="p-5"
      >
        <XMarkIcon size={28} color="#e5e7eb" />
      </TouchableOpacity>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <Image
            source={images.CancelImg}
            style={{ width: 180, height: 180 }}
            className="rounded-3xl mb-4"
            resizeMode="cover"
          />

          <Text className="text-gray-100 text-3xl font-dsbold mb-3 text-center">
            Cancellation Policy
          </Text>

          <Text className="text-gray-400 text-base text-center mb-6">
            Set your cancellation policy to control how customers can cancel
            their booking.
          </Text>
        </View>

        <View
          className="bg-gray-900 rounded-xl p-5 mb-6 border border-gray-800"
          style={{
            shadowColor: "#111",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <View className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6">
            <View className="flex-row items-center mb-1">
              <Checkbox
                value={form.cancellationPolicy.allowCancellation}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    cancellationPolicy: {
                      ...form.cancellationPolicy,
                      allowCancellation: value,
                    },
                  })
                }
                color="#9333ea"
                style={{ width: 24, height: 24, borderRadius: 4 }}
              />
              <Text className="text-white text-lg font-medium ml-3">
                Allow Cancellation
              </Text>
            </View>
            <Text className="text-gray-400 text-sm ml-9">
              Allow customers to cancel their bookings
            </Text>
          </View>

          {form.cancellationPolicy.allowCancellation && (
            <View className="space-y-5">
              <View>
                <Text className="text-gray-400 text-sm mb-2 ml-1">
                  Free Cancellation Period (hours)
                </Text>
                <TextInput
                  value={form.cancellationPolicy.freeCancellationHours}
                  onChangeText={(text) =>
                    setForm({
                      ...form,
                      cancellationPolicy: {
                        ...form.cancellationPolicy,
                        freeCancellationHours: text,
                      },
                    })
                  }
                  placeholder="How many hours before the booking can be canceled for free"
                  placeholderTextColor="gray"
                  keyboardType="numeric"
                  onFocus={() => setFocusedInput("freeCancellationHours")}
                  onBlur={() => setFocusedInput(null)}
                  className={`text-white text-lg bg-gray-800 px-4 py-3 rounded-xl ${
                    focusedInput === "freeCancellationHours"
                      ? "border-2 border-purple-600"
                      : "border border-gray-700"
                  }`}
                />
                <Text className="text-gray-500 text-xs ml-1 mt-1">
                  Customers can cancel for free this many hours before the
                  booking
                </Text>
              </View>

              <View>
                <Text className="text-gray-400 text-sm mb-2 ml-1">
                  Cancellation Fee ($)
                </Text>
                <TextInput
                  value={form.cancellationPolicy.cancellationFee}
                  onChangeText={(text) =>
                    setForm({
                      ...form,
                      cancellationPolicy: {
                        ...form.cancellationPolicy,
                        cancellationFee: text,
                      },
                    })
                  }
                  placeholder="Enter fee amount for late cancellations"
                  placeholderTextColor="gray"
                  keyboardType="numeric"
                  onFocus={() => setFocusedInput("cancellationFee")}
                  onBlur={() => setFocusedInput(null)}
                  className={`text-white text-lg bg-gray-800 px-4 py-3 rounded-xl ${
                    focusedInput === "cancellationFee"
                      ? "border-2 border-purple-600"
                      : "border border-gray-700"
                  }`}
                />
                <Text className="text-gray-500 text-xs ml-1 mt-1">
                  Fee charged for cancellations after the free period has passed
                </Text>
              </View>
            </View>
          )}
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
    </View>
  );
};

const availabilityScreen = ({
  focusedInput,
  setFocusedInput,
  form,
  setForm,
  onNextPress,
  onBackPress,
  currentEditingIndex,
  setCurrentEditingIndex,
  availabilityCalendarVisible,
  setAvailabilityCalendarVisible,
  editMode,
  setEditMode,
}) => {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  //Simialr to pricing mechanism
  //Show checkbox for recurring
  //if recurring remove button to add date. replace with button to add days of week (both in similar format to special prices)
  //if not recurring show button to add dates

  // Add a new date to the availability
  const addDate = () => {
    const newDates = [
      ...form.availability.dates,
      {
        date: "",
        totalCapacity: 0,
        bookingsMade: 0,
      },
    ];
    setForm({
      ...form,
      availability: { ...form.availability, dates: newDates },
    });
  };

  // Remove a date from availability
  const removeDate = (index) => {
    const updatedDates = form.availability.dates.filter((_, i) => i !== index);
    setForm({
      ...form,
      availability: { ...form.availability, dates: updatedDates },
    });
  };

  // Update date properties
  const updateDate = (index, field, value) => {
    const updatedDates = [...form.availability.dates];
    updatedDates[index][field] = value;
    setForm({
      ...form,
      availability: { ...form.availability, dates: updatedDates },
    });
  };

  // Add a new day of week for recurring availability
  const addDayOfWeek = () => {
    const newDays = [
      ...form.availability.daysOfWeek,
      {
        day: "",
        totalCapacity: 0,
        bookingsMade: 0,
      },
    ];
    setForm({
      ...form,
      availability: { ...form.availability, daysOfWeek: newDays },
    });
  };

  // Remove a day of week
  const removeDayOfWeek = (index) => {
    const updatedDays = form.availability.daysOfWeek.filter(
      (_, i) => i !== index
    );
    setForm({
      ...form,
      availability: { ...form.availability, daysOfWeek: updatedDays },
    });
  };

  // Update day of week properties
  const updateDayOfWeek = (index, field, value) => {
    const updatedDays = [...form.availability.daysOfWeek];
    updatedDays[index][field] = value;
    setForm({
      ...form,
      availability: { ...form.availability, daysOfWeek: updatedDays },
    });
  };

  // Toggle recurring option
  const toggleRecurring = () => {
    setForm({
      ...form,
      availability: {
        ...form.availability,
        recurring: !form.availability.recurring,
      },
    });
  };

  // Calendar handlers specifically for availability
  const openAvailabilityCalendar = (index) => {
    setCurrentEditingIndex(index);
    setEditMode("date");
    setAvailabilityCalendarVisible(true);
  };

  const openRecurringCalendar = () => {
    setAvailabilityCalendarVisible(true);
    setEditMode("recurring");
  };

  const handleAvailabilityDateSelect = (date) => {
    // Format date to YYYY-MM-DD
    const formattedDate =
      date instanceof Date ? date.toISOString().split("T")[0] : date;

    if (editMode === "date" && currentEditingIndex !== null) {
      const updatedDates = [...form.availability.dates];
      updatedDates[currentEditingIndex].date = formattedDate;
      setForm({
        ...form,
        availability: { ...form.availability, dates: updatedDates },
      });
    } else if (editMode === "recurring") {
      setForm({
        ...form,
        availability: {
          ...form.availability,
          recurringStartDate: formattedDate,
        },
      });
    }

    setAvailabilityCalendarVisible(false);
  };

  const validateScreen = () => {
    if (form.availability.recurring && !form.availability.recurringStartDate) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please select a start date for recurring availability",
        position: "bottom",
      });
      return;
    }

    if (form.availability.recurring) {
      if (form.availability.daysOfWeek.length === 0) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            "Please add at least one day of week for recurring availability",
          position: "bottom",
        });
        return;
      }

      const validDays = form.availability.daysOfWeek.every(
        (day) => day.day !== "" && day.totalCapacity > 0
      );
      if (!validDays) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please fill out all fields for recurring availability",
          position: "bottom",
        });
        return;
      }
    } else {
      if (form.availability.dates.length === 0) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please add at least one date for single date availability",
          position: "bottom",
        });
        return;
      }

      const validDates = form.availability.dates.every(
        (date) => date.date !== "" && date.totalCapacity > 0
      );
      if (!validDates) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please fill out all fields for single date availability",
          position: "bottom",
        });
        return;
      }
    }

    onNextPress();
  };

  return (
    <View className="flex-1">
      <TouchableOpacity
        onPress={() => router.back()}
        className="p-5"
      >
        <XMarkIcon size={28} color="#e5e7eb" />
      </TouchableOpacity>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <Image
            source={images.AvailablityImg}
            style={{ width: 180, height: 180 }}
            className="rounded-3xl mb-4"
            resizeMode="cover"
          />

          <Text className="text-gray-100 text-3xl font-dsbold mb-3 text-center">
            Set Your Availability
          </Text>

          <Text className="text-gray-400 text-base text-center mb-6">
            Define when your service is available for booking.
          </Text>
        </View>

        <View
          className="bg-gray-900 rounded-xl p-5 mb-6 border border-gray-800"
          style={{
            shadowColor: "#111",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          {/* Recurring toggle */}
          <View className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-5">
            <View className="flex-row items-center">
              <Checkbox
                value={form.availability.recurring}
                onValueChange={toggleRecurring}
                color="#9333ea"
                style={{ width: 24, height: 24, borderRadius: 4 }}
              />
              <Text className="text-white text-lg font-medium ml-3">
                Recurring Availability
              </Text>
            </View>
            <Text className="text-gray-400 text-sm ml-9">
              Enable to set regular weekly availability
            </Text>
          </View>

          {form.availability.recurring ? (
            // Recurring availability section
            <View>
              <Text className="text-gray-200 text-xl font-semibold mb-4">
                Recurring Schedule
              </Text>

              {/* Recurring start date picker */}
              <View className="mb-6">
                <Text className="text-gray-400 text-sm mb-2 ml-1">
                  Start Date
                </Text>
                <TouchableOpacity
                  onPress={openRecurringCalendar}
                  className="flex-row justify-between items-center bg-gray-800 px-4 py-3 rounded-xl border border-gray-700"
                >
                  <Text className="text-white text-lg">
                    {form.availability.recurringStartDate ||
                      "Select start date"}
                  </Text>
                  <CalendarIcon size={22} color="#9ca3af" />
                </TouchableOpacity>
                <Text className="text-gray-500 text-xs ml-1 mt-1">
                  The date when this recurring schedule begins
                </Text>
              </View>

              {/* Days of Week */}
              <Text className="text-gray-200 text-lg font-semibold mb-3">
                Available Days
              </Text>

              {form.availability.daysOfWeek.map((dayItem, index) => (
                <View
                  key={index}
                  className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700"
                  style={{
                    shadowColor: "#111",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-white text-lg font-medium">
                      Day {index + 1}
                    </Text>

                    <TouchableOpacity
                      onPress={() => removeDayOfWeek(index)}
                      className="bg-red-900 bg-opacity-80 px-3 py-1.5 rounded-lg"
                    >
                      <Text className="text-white font-medium">Remove</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Day selection dropdown */}
                  <View className="mb-4">
                    <Text className="text-gray-400 text-sm mb-2 ml-1">
                      Day of Week
                    </Text>
                    <Dropdown
                      data={daysOfWeek}
                      value={dayItem.day}
                      selectedTextStyle={{ color: "white", fontSize: 16 }}
                      placeholder={
                        dayItem.day === "" ? "Select day of week" : dayItem.day
                      }
                      placeholderStyle={{ color: "gray", fontSize: 16 }}
                      onChange={(item) => updateDayOfWeek(index, "day", item)}
                      maxHeight={250}
                      onFocus={() => setFocusedInput(`day_${index}`)}
                      onBlur={() => setFocusedInput(null)}
                      style={{
                        backgroundColor: "#1f2937",
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderRadius: 12,
                        borderWidth: focusedInput === `day_${index}` ? 2 : 1,
                        borderColor:
                          focusedInput === `day_${index}`
                            ? "#9333ea"
                            : "#374151",
                      }}
                      containerStyle={{
                        backgroundColor: "#1f2937",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#374151",
                      }}
                      renderItem={(item) => (
                        <View className="py-3 px-4">
                          <Text className="text-lg text-white">{item}</Text>
                        </View>
                      )}
                    />
                  </View>

                  {/* Capacity input */}
                  <View>
                    <Text className="text-gray-400 text-sm mb-2 ml-1">
                      Maximum Capacity
                    </Text>
                    <TextInput
                      value={dayItem.totalCapacity}
                      onChangeText={(text) =>
                        updateDayOfWeek(index, "totalCapacity", text)
                      }
                      placeholder="Number of bookings available"
                      placeholderTextColor="gray"
                      keyboardType="numeric"
                      onFocus={() => setFocusedInput(`dayCapacity_${index}`)}
                      onBlur={() => setFocusedInput(null)}
                      className={`text-white text-lg bg-gray-900 px-4 py-3 rounded-xl ${
                        focusedInput === `dayCapacity_${index}`
                          ? "border-2 border-purple-600"
                          : "border border-gray-700"
                      }`}
                    />
                  </View>
                </View>
              ))}

              <TouchableOpacity
                onPress={addDayOfWeek}
                className="bg-[#4c1d95] py-3 px-4 rounded-xl flex-row justify-center items-center mt-2"
                style={{
                  shadowColor: "#4c1d95",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              >
                <PlusIcon size={20} color="white" />
                <Text className="text-white text-lg font-semibold ml-2">
                  Add Available Day
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Single date availability section
            <View>
              <Text className="text-gray-200 text-xl font-semibold mb-4">
                Specific Available Dates
              </Text>

              {form.availability.dates.map((dateItem, index) => (
                <View
                  key={index}
                  className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700"
                  style={{
                    shadowColor: "#111",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-white text-lg font-medium">
                      Date {index + 1}
                    </Text>

                    <TouchableOpacity
                      onPress={() => removeDate(index)}
                      className="bg-red-900 bg-opacity-80 px-3 py-1.5 rounded-lg"
                    >
                      <Text className="text-white font-medium">Remove</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Date picker */}
                  <View className="mb-4">
                    <Text className="text-gray-400 text-sm mb-2 ml-1">
                      Select Date
                    </Text>
                    <TouchableOpacity
                      onPress={() => openAvailabilityCalendar(index)}
                      className="flex-row justify-between items-center bg-gray-900 px-4 py-3 rounded-xl border border-gray-700"
                    >
                      <Text className="text-white text-lg">
                        {dateItem.date || "Select date"}
                      </Text>
                      <CalendarIcon size={22} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>

                  {/* Capacity input */}
                  <View>
                    <Text className="text-gray-400 text-sm mb-2 ml-1">
                      Maximum Capacity
                    </Text>
                    <TextInput
                      value={dateItem.totalCapacity}
                      onChangeText={(text) =>
                        updateDate(index, "totalCapacity", text)
                      }
                      placeholder="Number of bookings available"
                      placeholderTextColor="gray"
                      keyboardType="numeric"
                      onFocus={() => setFocusedInput(`capacity_${index}`)}
                      onBlur={() => setFocusedInput(null)}
                      className={`text-white text-lg bg-gray-900 px-4 py-3 rounded-xl ${
                        focusedInput === `capacity_${index}`
                          ? "border-2 border-purple-600"
                          : "border border-gray-700"
                      }`}
                    />
                  </View>
                </View>
              ))}

              <TouchableOpacity
                onPress={addDate}
                className="bg-[#4c1d95] py-3 px-4 rounded-xl flex-row justify-center items-center mt-2"
                style={{
                  shadowColor: "#4c1d95",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              >
                <PlusIcon size={20} color="white" />
                <Text className="text-white text-lg font-semibold ml-2">
                  Add Available Date
                </Text>
              </TouchableOpacity>
            </View>
          )}
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

      <CalendarModal
        visible={availabilityCalendarVisible}
        setVisible={setAvailabilityCalendarVisible}
        setDate={handleAvailabilityDateSelect}
      />
    </View>
  );
};

const customDetailsScreen = ({
  focusedInput,
  setFocusedInput,
  form,
  setForm,
  onNextPress,
  onBackPress,
  customDetails,
  setCustomDetails,
}) => {
  // key value paurs the user can add

  const addCustomDetail = () => {
    const updatedDetails = { ...customDetails };
    const newKey = `temp_${Object.keys(updatedDetails).length}`;
    updatedDetails[newKey] = "";

    setCustomDetails(updatedDetails);
  };

  // Remove a custom detail by key
  const removeCustomDetail = (keyToRemove) => {
    const updatedDetails = { ...customDetails };
    delete updatedDetails[keyToRemove];

    setCustomDetails(updatedDetails);
  };

  // Update a custom detail key or value
  const updateCustomDetail = (oldKey, field, value) => {
    // Use a local copy first to avoid state updates on every keystroke
    let updatedDetails = { ...customDetails };

    if (field === "key") {
      // Store the new key temporarily without modifying the object structure
      // This prevents keyboard closing on each keystroke
      const currentValue = updatedDetails[oldKey];
      updatedDetails[`temp_new_${oldKey}`] = value; // Store the new key name temporarily
      updatedDetails[oldKey] = currentValue; // Keep the old key-value pair intact during typing
    } else if (field === "value") {
      // Just update the value directly
      updatedDetails[oldKey] = value;
    }

    setCustomDetails(updatedDetails);
  };

  // Handle key change completion (when user finishes typing)
  const handleKeyChangeComplete = (oldKey) => {
    const updatedDetails = { ...customDetails };
    const newKeyName = updatedDetails[`temp_new_${oldKey}`];

    // Only process if we have a temporary key value stored
    if (newKeyName && newKeyName.trim() !== "") {
      const currentValue = updatedDetails[oldKey];
      delete updatedDetails[oldKey];
      delete updatedDetails[`temp_new_${oldKey}`];
      updatedDetails[newKeyName] = currentValue;
      setCustomDetails(updatedDetails);
    }
  };

  // Display the right key in the input (the temporary one if available)
  const getDisplayKeyValue = (key) => {
    if (customDetails[`temp_new_${key}`]) {
      return customDetails[`temp_new_${key}`];
    }
    return key.startsWith("temp_") ? "" : key;
  };

  return (
    <View className="flex-1">
      <TouchableOpacity
        onPress={() => router.back()}
        className="p-5"
      >
        <XMarkIcon size={28} color="#e5e7eb" />
      </TouchableOpacity>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <Image
            source={images.CustomDetailsImg}
            style={{ width: 180, height: 180 }}
            className="rounded-3xl mb-4"
            resizeMode="cover"
          />

          <Text className="text-gray-100 text-3xl font-dsbold mb-3 text-center">
            Custom Details
          </Text>

          <Text className="text-gray-400 text-base text-center mb-6">
            Add any additional information about your service that customers
            should know.
          </Text>
        </View>

        <View
          className="bg-gray-900 rounded-xl p-5 mb-6 border border-gray-800"
          style={{
            shadowColor: "#111",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <Text className="text-gray-200 text-xl font-semibold mb-4">
            Additional Service Information
          </Text>

          {Object.entries(customDetails)
            .filter(([key]) => !key.startsWith("temp_new_")) // Filter out temporary keys
            .map(([key, value], index) => (
              <View
                key={key}
                className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700"
                style={{
                  shadowColor: "#111",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-white text-lg font-medium">
                    Detail {index + 1}
                  </Text>

                  <TouchableOpacity
                    onPress={() => removeCustomDetail(key)}
                    className="bg-red-900 bg-opacity-80 px-3 py-1.5 rounded-lg"
                  >
                    <Text className="text-white font-medium">Remove</Text>
                  </TouchableOpacity>
                </View>

                <View className="mb-4">
                  <Text className="text-gray-400 text-sm mb-2 ml-1">Key</Text>
                  <TextInput
                    value={getDisplayKeyValue(key)}
                    onChangeText={(text) =>
                      updateCustomDetail(key, "key", text)
                    }
                    placeholder="e.g. Amenities, Requirements"
                    placeholderTextColor="gray"
                    onFocus={() => setFocusedInput(`key_${index}`)}
                    onBlur={() => {
                      setFocusedInput(null);
                      handleKeyChangeComplete(key);
                    }}
                    className={`text-white text-lg bg-gray-900 px-4 py-3 rounded-xl ${
                      focusedInput === `key_${index}`
                        ? "border-2 border-purple-600"
                        : "border border-gray-700"
                    }`}
                  />
                </View>

                <View>
                  <Text className="text-gray-400 text-sm mb-2 ml-1">Value</Text>
                  <TextInput
                    value={value}
                    onChangeText={(text) =>
                      updateCustomDetail(key, "value", text)
                    }
                    placeholder="Enter information to display"
                    placeholderTextColor="gray"
                    multiline={true}
                    numberOfLines={2}
                    textAlignVertical="top"
                    onFocus={() => setFocusedInput(`value_${index}`)}
                    onBlur={() => setFocusedInput(null)}
                    className={`text-white text-lg bg-gray-900 px-4 py-3 min-h-[80px] rounded-xl ${
                      focusedInput === `value_${index}`
                        ? "border-2 border-purple-600"
                        : "border border-gray-700"
                    }`}
                  />
                </View>
              </View>
            ))}

          <TouchableOpacity
            onPress={addCustomDetail}
            className="bg-[#4c1d95] py-3 px-4 rounded-xl flex-row justify-center items-center mt-2"
            style={{
              shadowColor: "#4c1d95",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <PlusIcon size={20} color="white" />
            <Text className="text-white text-lg font-semibold ml-2">
              Add Custom Detail
            </Text>
          </TouchableOpacity>
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

const reviewScreen = ({
  form,
  createService,
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
              Service Media
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

        {/* Basic Information */}
        <View className="bg-gray-900 rounded-xl p-5 mb-5 border border-gray-700">
          <Text className="text-gray-200 text-xl font-semibold mb-4">
            Basic Information
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Name</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.name || "Not specified"}
              </Text>
            </View>
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Category</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.category || "Not specified"}
              </Text>
            </View>
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Description</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.description || "Not specified"}
              </Text>
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View className="bg-gray-900 rounded-xl p-5 mb-5 border border-gray-700">
          <Text className="text-gray-200 text-xl font-semibold mb-4">
            Pricing Information
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Pricing Model</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.pricing.pricingModel || "Not specified"}
              </Text>
            </View>
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Base Price</Text>
              <Text className="text-white font-medium text-right flex-1">
                ${form.pricing.basePrice || "0"}
              </Text>
            </View>
            {form.pricing.specialPrices &&
              form.pricing.specialPrices.length > 0 && (
                <View>
                  <Text className="text-gray-200 text-lg font-medium mt-2 mb-2">
                    Special Prices:
                  </Text>
                  {form.pricing.specialPrices.map((price, index) => (
                    <View
                      key={index}
                      className="bg-gray-800 p-3 rounded-lg mb-2"
                    >
                      <View className="flex-row justify-between">
                        <Text className="text-gray-400">{price.name}</Text>
                        <Text className="text-white">${price.price}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
          </View>
        </View>

        {/* Payment Settings */}
        <View className="bg-gray-900 rounded-xl p-5 mb-5 border border-gray-700">
          <Text className="text-gray-200 text-xl font-semibold mb-4">
            Payment Settings
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Online Payment</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.paymentSettings.acceptOnlinePayment ? "Yes" : "No"}
              </Text>
            </View>
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Tax Rate</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.paymentSettings.taxRate}%
              </Text>
            </View>
            {form.paymentSettings.deposit.enabled && (
              <View className="flex-row justify-between items-start">
                <Text className="text-gray-400 w-1/3">Deposit</Text>
                <Text className="text-white font-medium text-right flex-1">
                  {form.paymentSettings.deposit.percentage}%
                </Text>
              </View>
            )}
            {form.paymentSettings.chargeOnNoShow.enabled && (
              <View className="flex-row justify-between items-start">
                <Text className="text-gray-400 w-1/3">No-Show Fee</Text>
                <Text className="text-white font-medium text-right flex-1">
                  ${form.paymentSettings.chargeOnNoShow.amount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Booking Settings */}
        <View className="bg-gray-900 rounded-xl p-5 mb-5 border border-gray-700">
          <Text className="text-gray-200 text-xl font-semibold mb-4">
            Booking Settings
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Requires Approval</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.bookingSettings.requiresApproval ? "Yes" : "No"}
              </Text>
            </View>
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Min Advance</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.bookingSettings.minAdvanceBooking} hours
              </Text>
            </View>
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Max Advance</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.bookingSettings.maxAdvanceBooking} days
              </Text>
            </View>
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Booking Timeout</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.bookingSettings.bookingTimeout} minutes
              </Text>
            </View>
          </View>
        </View>

        {/* Cancellation Policy */}
        <View className="bg-gray-900 rounded-xl p-5 mb-5 border border-gray-700">
          <Text className="text-gray-200 text-xl font-semibold mb-4">
            Cancellation Policy
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Allow Cancellation</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.cancellationPolicy.allowCancellation ? "Yes" : "No"}
              </Text>
            </View>
            {form.cancellationPolicy.allowCancellation && (
              <>
                <View className="flex-row justify-between items-start">
                  <Text className="text-gray-400 w-1/3">Free Period</Text>
                  <Text className="text-white font-medium text-right flex-1">
                    {form.cancellationPolicy.freeCancellationHours} hours
                  </Text>
                </View>
                <View className="flex-row justify-between items-start">
                  <Text className="text-gray-400 w-1/3">Fee</Text>
                  <Text className="text-white font-medium text-right flex-1">
                    ${form.cancellationPolicy.cancellationFee}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Availability */}
        <View className="bg-gray-900 rounded-xl p-5 mb-5 border border-gray-700">
          <Text className="text-gray-200 text-xl font-semibold mb-4">
            Availability
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between items-start">
              <Text className="text-gray-400 w-1/3">Type</Text>
              <Text className="text-white font-medium text-right flex-1">
                {form.availability.recurring ? "Recurring" : "Specific Dates"}
              </Text>
            </View>
            {form.availability.recurring ? (
              <>
                <View className="flex-row justify-between items-start">
                  <Text className="text-gray-400 w-1/3">Start Date</Text>
                  <Text className="text-white font-medium text-right flex-1">
                    {form.availability.recurringStartDate}
                  </Text>
                </View>
                <Text className="text-gray-200 text-lg font-medium mt-2">
                  Available Days
                </Text>
                {form.availability.daysOfWeek.map((day, index) => (
                  <View
                    key={index}
                    className="flex-row justify-between items-start"
                  >
                    <Text className="text-gray-400">{day.day}</Text>
                    <Text className="text-white">
                      Capacity: {day.totalCapacity}
                    </Text>
                  </View>
                ))}
              </>
            ) : (
              <>
                <Text className="text-gray-200 text-lg font-medium mt-2">
                  Available Dates
                </Text>
                {form.availability.dates.map((date, index) => (
                  <View
                    key={index}
                    className="flex-row justify-between items-start"
                  >
                    <Text className="text-gray-400">{date.date}</Text>
                    <Text className="text-white">
                      Capacity: {date.totalCapacity}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>

        {/* Custom Details */}
        <View className="bg-gray-900 rounded-xl p-5 mb-8 border border-gray-700">
          <Text className="text-gray-200 text-xl font-semibold mb-4">
            Custom Details
          </Text>
          {Object.keys(form.customDetails).length > 0 ? (
            <View className="space-y-3">
              {Object.entries(form.customDetails).map(([key, value], index) => (
                <View
                  key={index}
                  className="flex-row justify-between items-start"
                >
                  <Text className="text-gray-400 w-1/3">{key}</Text>
                  <Text className="text-white font-medium text-right flex-1">
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-gray-400 text-center">
              No custom details added
            </Text>
          )}
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
              createService();
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

const successScreen = ({ uploading, error, businessId }) => {
  return uploading ? (
    <View className="flex-1 items-center justify-center px-6">
      <LottieView
        source={require("../../assets/animations/Creating.json")}
        autoPlay
        loop={true}
        style={{ width: 300, height: 300 }}
      />

      <Text className="text-gray-100 text-3xl font-dsbold text-center mb-4">
        Creating Your Service
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
        We encountered an error while creating your service. Please try again.
      </Text>

      <View className="bg-red-900 bg-opacity-30 p-4 rounded-xl mb-8 w-full">
        <Text className="text-red-400 text-center">{error}</Text>
      </View>

      <TouchableOpacity
        onPress={() => router.back()}
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
        Service Created!
      </Text>

      <Text className="text-gray-400 text-base text-center mb-8">
        Your service has been successfully created. It's now available for
        customers to book on Odysseum.
      </Text>

      <TouchableOpacity
        onPress={() => router.replace(`/settings/service/manage/${businessId}`)}
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

export default ServiceCreateScreen;
