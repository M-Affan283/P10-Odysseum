import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Animated,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../utils/axios";
import llmaxiosInstance from "../utils/llm_axios";
import useUserStore from "../context/userStore";
import { router } from "expo-router";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import {
  ChevronLeftIcon,
  BookmarkIcon,
  MapPinIcon,
  PhoneIcon,
  InboxIcon,
  GlobeAltIcon,
  ShareIcon,
  PencilSquareIcon,
  BuildingStorefrontIcon,
} from "react-native-heroicons/solid";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSharedValue } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import images from "../../assets/images/images";
import themes from "../../assets/themes/themes";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Linking from "expo-linking";
import LottieView from "lottie-react-native";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import { ImageBackground } from "react-native";

const width = Dimensions.get("window").width;
const SCREEN_WIDTH = Dimensions.get("window").width;

const tempBusiness = {
  owner: "672f358fb3e56fac046d76a5",
  name: "Peak Fitness Center",
  address: "4000 Mountain Rd, Hilltop",
  category: "Fitness",
  description:
    "A top-notch fitness center offering personalized training and wellness classes.",
  website: "http://www.peakfitness.com",
  mediaUrls: [],
  contactInfo: {
    phone: "444-555-6666",
    email: "contact@peakfitness.com",
    website: "http://www.peakfitness.com",
  },
  operatingHours: {
    monday: "5:30 - 22:00",
    tuesday: "5:30 - 22:00",
    wednesday: "5:30 - 22:00",
    thursday: "5:30 - 22:00",
    friday: "5:30 - 20:00",
    saturday: "7:00 - 18:00",
    sunday: "8:00 - 18:00",
  },
  locationId: "6781353badab4c338ff55148",
  coordinates: {
    type: "Point",
    coordinates: [-120.5, 38.5], //mongoDB coordinates are [longitude, latitude]
  },
  activityCount: 170,
  averageRating: 4.5,
  lastInteraction: "2025-01-19T14:20:00Z",
};

const getQueryBusiness = async ({ businessId, requestorId }) => {
  try {
    const res = await axiosInstance.get(
      `/business/getById?businessId=${businessId}&requestorId=${requestorId}`
    );
    // console.log(res.data)
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const BusinessProfileScreen = ({ businessId }) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [selectedButton, setSelectedButton] = useState("about");
  const [llmSummary, setLlmSummary] = useState("");
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ["business", { businessId }],
    queryFn: () => getQueryBusiness({ businessId, requestorId: user._id }),
  });

  const business = data?.business || tempBusiness;

  useEffect(() => {
    if (business.bookmarked) setBookmarked(true);
  }, [business]);

  const carouselRef = useRef(null);
  const progress = useSharedValue(0);

  const onPressPagination = (index) => {
    carouselRef.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const getSummariserReviews = async () => {
    console.log("Retrieving LLM based review summary...");

    llmaxiosInstance
      .get(`/summary/businessSummary?businessId=${businessId}`)
      .then((res) => {
        console.log("LLM based summary: ", res.data.summary);

        setLlmSummary(res.data.summary);
      })
      .catch((error) => {
        console.log(error);
        setLlmSummary("Could not retrieve summary. Please try again later.");
      });
  };

  useEffect(() => {
    getSummariserReviews();
  }, [businessId]);

  const actionButtons = [
    {
      id: 1,
      name: "Services",
      icon: <BuildingStorefrontIcon size={24} color="#7b61ff" />,
      url: `/service/business/${businessId}`,
    },
    {
      id: 2,
      name: "Reviews",
      icon: <PencilSquareIcon size={24} color="#7b61ff" />,
      url: `/review/business/${businessId}`,
    },
    {
      id: 3,
      name: "Call",
      icon: <PhoneIcon size={24} color="#7b61ff" />,
      url: `tel:${business?.contactInfo?.phone}`,
    },
    {
      id: 4,
      name: "Email",
      icon: <InboxIcon size={24} color="#7b61ff" />,
      url: `mailto:${business?.contactInfo?.email}`,
    },
    {
      id: 5,
      name: "Website",
      icon: <GlobeAltIcon size={24} color="#7b61ff" />,
      url: business?.contactInfo?.website,
    },
    {
      id: 6,
      name: "Share",
      icon: <ShareIcon size={24} color="#7b61ff" />,
      url: business?.contactInfo?.website,
    },
  ];

  const handleActionPress = (item) => {
    if (item.name === "Share") {
      // Handle share functionality separately
      return;
    } 
    else if (item.name === "Reviews" || item.name === "Services") 
    {
      // For internal navigation, use router.push
      router.push({ pathname: item.url, params: { name: business?.name } });
    } 
    else 
    {
      // For external links, use Linking.openURL
      try 
      {
        Linking.openURL(item.url);
      } 
      catch (error) 
      {
        console.log("Error opening URL:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not open the link. Please try again later.",
          position: "bottom",
          visibilityTime: 3000,
        });
      }
    }
  };

  const bookmarkBusiness = async () => {
    console.log("Bookmarking business...");
    setBookmarked(!bookmarked); //optimistic update

    axiosInstance
      .post("/user/bookmarkBusiness", {
        userId: user._id,
        businessId: businessId,
      })
      .then(async (res) => {
        // console.log("Bookmarked location: ", res.data.bookmarks);
        await setUser({
          ...user,
          bookmarks: res.data.bookmarks,
        });

        // console.log("User bookmarks: ", user.bookmarks);
      })
      .catch((error) => {
        console.log(error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not bookmark business. Please try again later.",
          position: "bottom",
          visibilityTime: 3000,
        });
        setBookmarked(!bookmarked); //revert back to original state
      });
  };

  const mapRef = useRef(null);

  // move the map back to the business location
  const focusOnBusiness = () => {
    mapRef.current?.animateToRegion({
      latitude: business?.coordinates?.coordinates[1],
      longitude: business?.coordinates?.coordinates[0],
      latitudeDelta: 0.0922,
      longitudeDelta: 0.042,
    });
  };

  const displayAbout = () => {
    return (
      <View className="bg-[#191a2b] rounded-xl p-5 mb-4 w-full shadow-lg">
        <Text className="text-white text-xl font-dsbold mb-3">About</Text>
        <View className="space-y-3">
          <Text className="text-white/90 text-base leading-6">
            {business?.description || "No description available"}
          </Text>
        </View>
      </View>
    );
  };

  const displayLLMSummary = () => {
    return (
      <View className="bg-[#191a2b] rounded-xl p-5 mb-4 w-full shadow-lg">
        <Text className="text-white text-xl font-dsbold mb-3">
          Review Summary
        </Text>
        <View className="space-y-3">
          {llmSummary ? (
            <Text className="text-white/90 text-base leading-6">
              {llmSummary}
            </Text>
          ) : (
            <View className="items-center py-2">
              <LottieView
                source={require("../../assets/animations/Loading2.json")}
                style={{ width: 60, height: 60 }}
                autoPlay
                loop
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  const displayOperatingHours = () => {
    return (
      <View className="bg-[#191a2b] rounded-xl p-5 mb-4 w-full shadow-lg">
        <Text className="text-white text-xl font-dsbold mb-3">
          Operating Hours
        </Text>
        <View className="space-y-3">
          {Object.entries(business?.operatingHours).map(([day, hours]) => (
            <View
              key={day}
              className="flex-row justify-between py-1 border-b border-gray-700"
            >
              <Text className="text-white/90 capitalize text-base">{day}</Text>
              <Text className="text-white font-medium text-base">{hours}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const displayContactInfo = () => {
    return (
      <View className="bg-[#191a2b] rounded-xl p-5 mb-4 w-full shadow-lg">
        <Text className="text-white text-xl font-dsbold mb-3">
          Contact Information
        </Text>
        <View className="space-y-3">
          <TouchableOpacity
            className="flex-row items-center p-3 rounded-lg bg-[#232438]"
            onPress={() =>
              Linking.openURL(`tel:${business?.contactInfo?.phone}`)
            }
          >
            <PhoneIcon size={20} color="#7b61ff" />
            <Text className="text-white ml-3 text-base">
              {business?.contactInfo?.phone || "N/A"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-3 rounded-lg bg-[#232438]"
            onPress={() =>
              Linking.openURL(`mailto:${business?.contactInfo?.email}`)
            }
          >
            <InboxIcon size={20} color="#7b61ff" />
            <Text className="text-white ml-3 text-base">
              {business?.contactInfo?.email || "N/A"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-3 rounded-lg bg-[#232438]"
            onPress={() =>
              business?.contactInfo?.website &&
              Linking.openURL(business.contactInfo.website)
            }
          >
            <GlobeAltIcon size={20} color="#7b61ff" />
            <Text className="text-white ml-3 text-base">
              {business?.contactInfo?.website || "N/A"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const displayLocation = () => {
    return (
      <View className="bg-[#191a2b] rounded-xl p-5 mb-4 w-full shadow-lg">
        <Text className="text-white text-xl font-dsbold mb-3">Location</Text>
        <View className="space-y-4">
          <Text className="text-white/90 text-base">
            {business?.address || "No address available"}
          </Text>

          {/* Map container with fixed dimensions */}
          <View
            className="w-full bg-[#232438] rounded-xl p-2 overflow-hidden"
            style={{ height: 350 }}
          >
            <TouchableOpacity
              className="bg-[#7b61ff] rounded-full py-2 px-4 mb-3 mt-1 flex-row items-center self-center z-10"
              onPress={focusOnBusiness}
            >
              <MapPinIcon size={20} color="white" />
              <Text className="text-white text-base ml-2 font-medium">
                Refocus Map
              </Text>
            </TouchableOpacity>

            {/* Fixed size map with scrollEnabled={false} to prevent map gestures from affecting parent scroll */}
            <View className="flex-1 overflow-hidden rounded-xl">
              <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                scrollEnabled={true}
                zoomEnabled={true}
                rotateEnabled={false}
                pitchEnabled={false}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                customMapStyle={themes.aubergine}
                initialRegion={{
                  latitude: business?.coordinates?.coordinates[1] || 0,
                  longitude: business?.coordinates?.coordinates[0] || 0,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.042,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: business?.coordinates?.coordinates[1] || 0,
                    longitude: business?.coordinates?.coordinates[0] || 0,
                  }}
                  title={business?.name}
                  description={business?.address}
                />
              </MapView>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const TabButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: isActive ? 2 : 0,
        borderBottomColor: "#7b61ff",
      }}
    >
      <Text
        style={{
          color: isActive ? "white" : "rgba(255,255,255,0.6)",
          fontWeight: isActive ? "600" : "400",
          fontSize: 16,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (selectedButton) {
      case "about":
        return displayAbout();
      case "llm":
        return displayLLMSummary();
      case "hours":
        return displayOperatingHours();
      case "contact":
        return displayContactInfo();
      case "location":
        return displayLocation();
      default:
        return displayAbout();
    }
  };

  const ProfileStat = ({ text, subText, icon }) => {
    return (
      <View
        style={{
          alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.08)",
          borderRadius: 15,
          padding: 12,
          minWidth: 90,
        }}
      >
        {icon}
        <Text
          style={{
            fontWeight: "600",
            fontSize: 22,
            color: "white",
            marginTop: 5,
          }}
        >
          {text}
        </Text>
        <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
          {subText}
        </Text>
      </View>
    );
  };

  if (isFetching) {
    return (
      <View className="bg-[#070f1b] flex-1 justify-center items-center">
        <LottieView
          source={require("../../assets/animations/Loading1.json")}
          style={{
            width: 150,
            height: 150,
          }}
          autoPlay
          loop
        />
      </View>
    );
  }

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [280, 180],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Header Section with Background Image */}
        <Animated.View
          style={{
            height: headerHeight,
          }}
        >
          <ImageBackground
            source={
              business?.mediaUrls.length > 0
                ? { uri: business.mediaUrls[0] }
                : images.BusinessSearchImg
            }
            style={{
              width: "100%",
              height: "100%",
              justifyContent: "space-between",
            }}
          >
            <LinearGradient
              colors={[
                "rgba(7, 15, 27, 0.5)",
                "transparent",
                "rgba(7, 15, 27, 0.7)",
              ]}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
              }}
            />

            <View className="flex-row justify-between p-4">
              <TouchableOpacity
                className="bg-black/30 p-2 rounded-full"
                onPress={() => router.back()}
              >
                <ChevronLeftIcon size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-black/30 p-2 rounded-full"
                onPress={bookmarkBusiness}
              >
                <BookmarkIcon
                  size={24}
                  color={bookmarked ? "#ff6b6b" : "white"}
                />
              </TouchableOpacity>
            </View>

            <View className="px-5 pb-10">
              <Text className="text-white/80 text-base font-medium">
                {business?.category || "Business"}
              </Text>
              <Text className="font-bold text-2xl text-white drop-shadow-lg">
                {business?.name || "Business Name"}
              </Text>
            </View>
          </ImageBackground>
        </Animated.View>

        {/* Profile Card */}
        <View className="px-5 -mt-10 z-10">
          <View className="bg-[#191a2b] rounded-3xl p-5 shadow-lg">
            <View className="flex-row items-center mb-4">
              <Image
                source={
                  business?.mediaUrls.length > 0
                    ? { uri: business.mediaUrls[0] }
                    : images.BusinessSearchImg
                }
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 15,
                  borderWidth: 3,
                  borderColor: "#7b61ff",
                }}
              />
              <View className="ml-3">
                <Text className="font-bold text-lg text-white">
                  {business?.name || "Business Name"}
                </Text>
                <View className="flex-row items-center mt-1">
                  <MapPinIcon size={16} color="gray" />
                  <Text className="text-white/60 ml-1">
                    {business?.address || "No address"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats */}
            <View className="flex-row justify-around py-3">
              <ProfileStat
                text={business?.averageRating || "0.0"}
                subText="Rating"
                icon={<BuildingStorefrontIcon size={20} color="#7b61ff" />}
              />
              {/* <ProfileStat
                text={business?.activityCount || 0}
                subText="Activity"
                icon={<PencilSquareIcon size={20} color="#7b61ff" />}
              /> */}
              <TouchableOpacity onPress={bookmarkBusiness}>
                <ProfileStat
                  text={bookmarked ? "Saved" : "Save"}
                  subText="Business"
                  icon={
                    <BookmarkIcon
                      size={20}
                      color={bookmarked ? "#ff6b6b" : "#7b61ff"}
                    />
                  }
                />
              </TouchableOpacity>
            </View>

            {/* Action Buttons Grid Layout instead of ScrollView */}
            <View className="mt-4 flex-row flex-wrap justify-between">
              {actionButtons.slice(0, 6).map((action) => (
                <TouchableOpacity
                  key={action.id}
                  className="items-center bg-[#232438] rounded-xl py-3 px-2 mb-3 w-[48%]"
                  onPress={() => handleActionPress(action)}
                >
                  <View className="flex-row items-center justify-center">
                    {action.icon}
                    <Text className="font-medium text-white text-base ml-2">
                      {action.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Fixed Position Tab Selector */}
        <View className="mt-5 mb-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          >
            <View className="flex-row">
              <TabButton
                title="About"
                isActive={selectedButton === "about"}
                onPress={() => setSelectedButton("about")}
              />
              <TabButton
                title="Reviews"
                isActive={selectedButton === "llm"}
                onPress={() => setSelectedButton("llm")}
              />
              <TabButton
                title="Hours"
                isActive={selectedButton === "hours"}
                onPress={() => setSelectedButton("hours")}
              />
              <TabButton
                title="Contact"
                isActive={selectedButton === "contact"}
                onPress={() => setSelectedButton("contact")}
              />
              <TabButton
                title="Location"
                isActive={selectedButton === "location"}
                onPress={() => setSelectedButton("location")}
              />
            </View>
          </ScrollView>
        </View>

        {/* Content based on selected tab */}
        <View className="px-5 mt-2 pb-10">{renderContent()}</View>
      </Animated.ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

export default BusinessProfileScreen;
