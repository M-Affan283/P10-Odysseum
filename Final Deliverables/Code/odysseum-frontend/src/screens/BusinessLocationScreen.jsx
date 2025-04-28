import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  ChevronLeftIcon,
  BriefcaseIcon,
  MapPinIcon,
} from "react-native-heroicons/solid";
import { LinearGradient } from "expo-linear-gradient";
import axiosInstance from "../utils/axios";
import { FlatList } from "react-native-gesture-handler";
import icons from "../../assets/icons/icons";
import Toast from "react-native-toast-message";
import images from "../../assets/images/images";
import LottieView from "lottie-react-native";

const categories = [
  {
    name: "Restaurant",
    icon: icons.dining,
  },
  {
    name: "Hotel",
    icon: icons.hotel,
  },
  {
    name: "Shopping",
    icon: icons.shopping,
  },
  {
    name: "Fitness",
    icon: icons.fitness,
  },
  {
    name: "Health",
    icon: icons.health,
  },
  {
    name: "Beauty",
    icon: icons.beauty,
  },
  {
    name: "Education",
    icon: icons.history,
  },
  {
    name: "Entertainment",
    icon: icons.celebration,
  },
  {
    name: "Services",
    icon: icons.accessibility,
  },
  {
    name: "Other",
    icon: icons.star,
  },
];

const BusinessLocationScreen = ({ locationId, locationName }) => {
  const [popularBusinesses, setPopularBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const screenWidth = Dimensions.get("window").width;

  const getPopularBusinesses = async () => {
    console.log("Retrieving popular businesses...");
    setLoading(true);

    axiosInstance
      .get(`/business/getByHeatmapScoreAndLocation?locationId=${locationId}`)
      .then((res) => {
        setPopularBusinesses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Failed to fetch popular businesses",
          text2: "Error occurred server side",
          visibilityTime: 2000,
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    getPopularBusinesses();
  }, []);

  return (
    <View className="flex-1 bg-[#070f1b]">
      <StatusBar barStyle="light-content" backgroundColor="#1e0a3c" />

      {/* Modern minimalist header with blurred background */}
      <LinearGradient colors={["#0d0521", "#1a0b38"]} className="shadow-xl">
        <View className="pt-14 pb-4 px-5">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 bg-[#3a1f67]/40 rounded-full"
            >
              <ChevronLeftIcon size={22} strokeWidth={2.5} color="white" />
            </TouchableOpacity>

            <View className="flex-1 ml-4">
              <Text className="text-gray-400 font-medium text-xs">
                EXPLORING
              </Text>
              <Text className="font-dsbold text-white text-xl">
                {locationName}
              </Text>
            </View>

            {/* Floating action buttons - minimalist with increased size */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="p-3 bg-[#4a269d]/40 rounded-full"
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: `/business/location/${locationId}/all`,
                    params: { name: locationName },
                  })
                }
              >
                <BriefcaseIcon size={22} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                className="p-3 bg-[#4a269d]/40 rounded-full"
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: `/business/location/${locationId}/heatmap`,
                    params: { name: locationName },
                  })
                }
              >
                <MapPinIcon size={22} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content with modern UI */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Category Section */}
        <View className="mt-6">
          <View className="mx-5 flex-row justify-between items-center mb-3">
            <Text className="font-dsbold text-white text-2xl">
              Browse by Category
            </Text>
          </View>

          {/* Modern Category Grid */}
          <View className="px-4">
            <View className="flex-row flex-wrap justify-between">
              {categories.slice(0, 8).map((category, index) => (
                <CategoryTile
                  key={index}
                  category={category}
                  locationId={locationId}
                  locationName={locationName}
                  width={(screenWidth - 40) / 4}
                />
              ))}
            </View>

            {/* Show More Categories Row */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-2"
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {categories.slice(8).map((category, index) => (
                <CategoryTile
                  key={index}
                  category={category}
                  locationId={locationId}
                  locationName={locationName}
                  horizontal={true}
                />
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Popular Businesses Section */}
        <View className="mt-6">
          <View className="mx-5 flex-row justify-between items-center mb-3">
            <Text className="font-dsbold text-white text-2xl">
              Popular Spots
            </Text>
            <TouchableOpacity
              className="bg-[#3a1f67]/40 px-3 py-1 rounded-full"
              onPress={() =>
                router.push({
                  pathname: `/business/location/${locationId}/all`,
                  params: { name: locationName },
                })
              }
            >
              <Text className="text-purple-300 font-dsbold text-lg">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <BusinessSlider businesses={popularBusinesses} loading={loading} />
        </View>
      </ScrollView>
    </View>
  );
};

// Modernized Category Tile Component
const CategoryTile = ({
  category,
  locationId,
  locationName,
  width = 75,
  horizontal = false,
}) => {
  return (
    <TouchableOpacity
      className={`${horizontal ? "mb-0 mr-4" : "mb-4"}`}
      style={{ width: horizontal ? 100 : width }}
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: `/business/location/${locationId}/${category?.name}`,
          params: { name: locationName },
        })
      }
    >
      <LinearGradient
        colors={["#2d1654", "#221242"]}
        className="rounded-2xl p-3 shadow-md items-center justify-center"
        style={{
          height: horizontal ? 40 : width,
          width: horizontal ? 100 : width,
        }}
      >
        {!horizontal && (
          <Image
            source={category?.icon}
            style={{
              width: width * 0.5,
              height: width * 0.5,
              tintColor: "#a0aec0",
            }}
            resizeMode="contain"
          />
        )}

        <Text
          className={`text-[#a0aec0] font-medium text-center ${
            horizontal ? "" : "mt-2"
          } text-xs`}
          numberOfLines={1}
        >
          {category?.name}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Redesigned Business Slider Component
const BusinessSlider = ({ businesses, loading }) => {
  const BusinessCard = ({ business }) => {
    return (
      <TouchableOpacity
        className="mx-3 rounded-2xl overflow-hidden shadow-xl"
        activeOpacity={0.7}
        onPress={() => router.push(`/business/profile/${business?._id}`)}
        style={{ width: 240, height: 280 }}
      >
        {/* Image with gradient overlay */}
        <View className="h-full w-full">
          <Image
            source={
              business?.imageUrls?.length > 0
                ? { uri: business?.mediaUrls[0] }
                : images.BusinessSearchImg
            }
            style={{ width: "100%", height: "100%" }}
            className="absolute"
            resizeMode="cover"
          />

          {/* Content with gradient overlay */}
          <LinearGradient
            colors={[
              "rgba(0, 0, 0, 0)",
              "rgba(0, 0, 0, 0.7)",
              "rgba(0, 0, 0, 0.9)",
            ]}
            className="h-full w-full justify-end p-3"
          >
            {/* Category and Rating */}
            <View className="flex-row items-center justify-between mb-1">
              <View className="bg-black/70 px-2 py-1 rounded-full">
                <Text className="text-[#a0aec0] font-medium text-xs">
                  {business?.category}
                </Text>
              </View>

              <View className="flex-row items-center bg-black/70 px-2 py-1 rounded-full">
                <Image
                  source={icons.star}
                  style={{ width: 14, height: 14, tintColor: "#ed8936" }}
                />
                <Text className="text-[#a0aec0] font-medium text-xs ml-1">
                  {business?.averageRating || "New"}
                </Text>
              </View>
            </View>

            {/* Business Details */}
            <Text
              className="font-dsbold text-white text-xl"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {business?.name}
            </Text>

            <Text
              className="text-[#a0aec0] font-medium text-sm mt-1"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {business?.address}
            </Text>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="items-center justify-center py-10">
        <LottieView
          source={require("../../assets/animations/Loading1.json")}
          autoPlay
          loop
          style={{ width: 120, height: 120 }}
        />
      </View>
    );
  }

  if (businesses.length === 0) {
    return (
      <View className="items-center justify-center py-10 mx-10">
        <Image
          source={icons.store}
          style={{ width: 50, height: 50, tintColor: "#a0aec0", opacity: 0.5 }}
        />
        <Text className="text-[#a0aec0] font-medium text-base mt-3 text-center">
          No popular businesses found in this area
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={businesses}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingLeft: 2, paddingRight: 20 }}
      renderItem={({ item }) => <BusinessCard business={item} />}
      keyExtractor={(item) => item._id}
    />
  );
};

export default BusinessLocationScreen;
