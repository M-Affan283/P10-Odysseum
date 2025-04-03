import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  ChevronLeftIcon,
  BriefcaseIcon,
  MapIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/solid";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import axiosInstance from "../utils/axios";
// import tempBusinesses from "./tempfiles/tempbusinesses";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [popularBusinesses, setPopularBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <View className="flex-1 bg-primary">
      <StatusBar barStyle="light-content" backgroundColor="#28154e" />
      <View>
        <View className="pt-12 pb-6 bg-[#28154e] w-full rounded-b-3xl shadow-lg">
          <View className="px-6 flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 p-2 bg-[#3a1f67] rounded-full"
            >
              <ChevronLeftIcon size={24} strokeWidth={4} color="white" />
            </TouchableOpacity>

            <View className="flex-col flex-1">
              <Text className="font-dsbold text-white text-2xl">
                Discover Businesses
              </Text>
              <Text className="font-dsbold text-white text-lg opacity-90">
                {locationName}
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View className="mx-6 mt-4 flex-row items-center bg-[#3a1f67] rounded-xl px-3 py-2">
            <MagnifyingGlassIcon size={20} color="#a0a0a0" />
            <TextInput
              placeholder="Search businesses..."
              placeholderTextColor="#a0a0a0"
              className="flex-1 pl-2 text-white font-medium"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View className="flex-row mt-6 justify-center items-center gap-x-4 px-6">
            {/* Button to view all businesses */}
            <TouchableOpacity
              className="flex-1"
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: `/business/location/${locationId}/all`,
                  params: { name: locationName },
                })
              }
            >
              <LinearGradient
                colors={["#d53f8c", "#97266d"]}
                className="py-3 px-4 rounded-xl"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View className="flex-row items-center justify-center">
                  <BriefcaseIcon size={22} color="white" />
                  <Text className="text-white font-dsbold text-base ml-2">
                    View All
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Button for heatmap */}
            <TouchableOpacity
              className="flex-1"
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: `/business/location/${locationId}/heatmap`,
                  params: { name: locationName },
                })
              }
            >
              <LinearGradient
                colors={["#3182ce", "#2c5282"]}
                className="py-3 px-4 rounded-xl"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View className="flex-row items-center justify-center">
                  <MapIcon size={22} color="white" />
                  <Text className="text-white font-dsbold text-base ml-2">
                    Heatmap
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-col gap-y-2">
          <CategorySlider locationId={locationId} locationName={locationName} />
          <PopularBusinessesSlider
            businesses={popularBusinesses}
            loading={loading}
          />
        </View>
      </View>
    </View>
  );
};

const CategorySlider = ({ locationId, locationName }) => {
  return (
    <View className="space-y-3 py-5">
      <View className="mx-6 flex-row justify-between items-center">
        <Text className="font-dsbold text-white text-xl">Categories</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-2"
        nestedScrollEnabled={true}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            className="items-center mx-2"
            style={{ width: 90 }}
            activeOpacity={0.7}
            onPress={() =>
              router.push({
                pathname: `/business/location/${locationId}/${category?.name}`,
                params: { name: locationName },
              })
            }
          >
            <View
              className="rounded-2xl overflow-hidden bg-[#221242] p-3 shadow-md"
              style={{ width: 70, height: 70 }}
            >
              <Image
                source={category?.icon}
                className="w-full h-full"
                style={{ tintColor: "#a0aec0" }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-[#a0aec0] font-medium text-center mt-2">
              {category?.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const PopularBusinessesSlider = ({ businesses, loading }) => {
  const BusinessCard = ({ business }) => {
    return (
      <TouchableOpacity
        className="mx-3 rounded-xl overflow-hidden shadow-lg"
        activeOpacity={0.7}
        onPress={() => router.push(`/business/profile/${business?._id}`)}
      >
        <LinearGradient
          colors={["rgba(34, 18, 66, 0.95)", "rgba(34, 18, 66, 0.85)"]}
          className="p-2 rounded-xl"
        >
          <Image
            source={
              business?.imageUrls?.length > 0
                ? { uri: business?.mediaUrls[0] }
                : images.BusinessSearchImg
            }
            style={{ width: 250, height: 170 }}
            className="rounded-xl"
            resizeMode="cover"
          />

          <View className="mt-3 px-2 pb-3">
            <View className="flex-row items-center gap-1 py-1">
              <Image
                source={icons.category}
                style={{ width: 15, height: 15, tintColor: "#a0aec0" }}
              />
              <Text className="text-[#a0aec0] font-medium text-xs">
                {business?.category}
              </Text>

              <View className="flex-row justify-end flex-1 gap-x-1">
                <Image
                  source={icons.star}
                  style={{ width: 18, height: 18, tintColor: "#ed8936" }}
                />
                <Text className="text-[#a0aec0] font-medium text-sm">
                  {business?.averageRating}
                </Text>
              </View>
            </View>

            <View className="space-y-1">
              <Text className="font-dsbold text-2xl text-white">
                {business?.name}
              </Text>
              <Text className="text-[#a0aec0] font-medium text-sm">
                {business?.address}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View className="space-y-3 py-4">
      <View className="mx-6 flex-row justify-between items-center">
        <Text className="font-dsbold text-white text-xl">
          Popular Businesses
        </Text>
      </View>

      <FlatList
        data={businesses}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={() => {
          if (loading) {
            return (
              <View className="items-center justify-center ml-28">
                <LottieView
                  source={require("../../assets/animations/Loading1.json")}
                  autoPlay
                  loop
                  style={{ width: 150, height: 150 }}
                />
              </View>
            );
          }
          return null;
        }}
        renderItem={({ item, index }) => <BusinessCard business={item} />}
      />
    </View>
  );
};

export default BusinessLocationScreen;
