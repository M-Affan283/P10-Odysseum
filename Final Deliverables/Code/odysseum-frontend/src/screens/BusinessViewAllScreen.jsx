import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import axiosInstance from "../utils/axios";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  ChevronLeftIcon,
  RocketLaunchIcon,
} from "react-native-heroicons/outline";
import { useInfiniteQuery } from "@tanstack/react-query";
import icons from "../../assets/icons/icons";
import images from "../../assets/images/images";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { RefreshCwOffIcon } from "lucide-react-native";

const getQueryBusinesses = async ({
  pageParam = 1,
  locationId,
  searchParam,
}) => {
  try {
    const res = await axiosInstance.get(
      `/business/getByLocation?locationId=${locationId}&page=${pageParam}&searchParam=${searchParam}`
    );
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const BusinessViewAllScreen = ({ locationId, locationName }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState();
  const screenWidth = Dimensions.get("window").width;

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["viewAllBusinesses", locationId, debouncedSearchQuery],
    queryFn: ({ pageParam = 1 }) =>
      getQueryBusinesses({
        pageParam,
        locationId,
        searchParam: debouncedSearchQuery,
      }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: true,
  });

  let businesses = data?.pages.flatMap((page) => page.businesses) || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const loadMoreBusinesses = () => {
    if (hasNextPage) fetchNextPage();
  };

  const handleRefresh = async () => {
    await refetch();
  };

  // Footer component to show loading or end of list
  const ListFooterComponent = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="items-center justify-center py-3">
          <LottieView
            source={require("../../assets/animations/Loading2.json")}
            className="w-[60px] h-[60px]"
            autoPlay
            loop
          />
        </View>
      );
    }

    if (!hasNextPage && businesses.length > 0) {
      return (
        <View className="items-center justify-center py-3 flex-row">
          <RocketLaunchIcon size={20} color="#7b61ff" />
          <Text className="text-white/80 text-base font-medium ml-2">
            End of Results
          </Text>
        </View>
      );
    }

    return null;
  }, [isFetchingNextPage, hasNextPage, businesses.length]);

  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">
      <StatusBar barStyle="light-content" backgroundColor="#1e0a3c" />

      {/* Redesigned Header */}
      <LinearGradient colors={["#0d0521", "#1a0b38"]} className="shadow-xl">
        <View className="pt-4 pb-4 px-5">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 bg-[#3a1f67]/40 rounded-full"
            >
              <ChevronLeftIcon size={24} strokeWidth={2.5} color="white" />
            </TouchableOpacity>

            <View className="flex-1 ml-4">
              <Text className="text-gray-400 font-medium text-xs">
                BUSINESSES IN
              </Text>
              <Text className="font-dsbold text-white text-xl">
                {locationName}
              </Text>
            </View>
          </View>

          {/* Enhanced search bar with gradient - fully rounded */}
          <View className="mt-4">
            <LinearGradient
              colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-full overflow-hidden"
            >
              <View className="flex-row items-center py-3 px-4">
                <MaterialIcons name="search" size={22} color="white" />
                <TextInput
                  placeholder="Search businesses"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={searchQuery}
                  clearButtonMode="always"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 text-base pl-3 tracking-wider text-white"
                  onChangeText={(text) => setSearchQuery(text)}
                />
              </View>
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={businesses}
        style={{ marginTop: 6 }}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingBottom: 100,
          gap: 16,
        }}
        refreshing={isFetching && !isFetchingNextPage}
        onRefresh={handleRefresh}
        onEndReached={loadMoreBusinesses}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={() => <View className="h-2" />}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={() => {
          if (isFetching && !isFetchingNextPage) {
            return (
              <View className="flex-1 mt-12 justify-center items-center">
                <LottieView
                  source={require("../../assets/animations/Loading1.json")}
                  autoPlay
                  loop
                  style={{ width: 120, height: 120 }}
                />
                <Text className="mt-4 text-white/70 font-medium">
                  Discovering businesses...
                </Text>
              </View>
            );
          } else if (error) {
            return (
              <View className="flex-1 mt-12 justify-center items-center">
                <Text className="text-lg text-red-400 font-medium">
                  Failed to fetch businesses.
                </Text>
                <TouchableOpacity
                  className="mt-4 bg-indigo-600 py-3 px-5 rounded-xl"
                  onPress={refetch}
                >
                  <Text className="text-white font-bold">Retry</Text>
                </TouchableOpacity>
              </View>
            );
          } else if (
            debouncedSearchQuery?.length > 0 &&
            businesses?.length === 0
          ) {
            return (
              <View className="flex-1 mt-12 justify-center items-center">
                <Text className="text-lg text-white/70 font-medium">
                  No business found for "{debouncedSearchQuery}"
                </Text>
              </View>
            );
          } else if (businesses?.length === 0) {
            return (
              <View className="flex-1 mt-12 justify-center items-center">
                <RefreshCwOffIcon size={60} color="#7b61ff" />
                <Text className="text-lg text-white/70 font-medium mt-4">
                  No businesses found in this area
                </Text>
              </View>
            );
          }
          return null;
        }}
        renderItem={({ item }) => <BusinessCard business={item} />}
      />
    </SafeAreaView>
  );
};

// Completely redesigned Business Card
const BusinessCard = ({ business }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/business/profile/${business?._id}`)}
      className="rounded-2xl overflow-hidden shadow-xl mb-3"
      style={{ height: 260 }}
    >
      {/* Image with gradient overlay */}
      <View className="h-full w-full">
        <Image
          source={
            business?.mediaUrls?.length > 0
              ? { uri: business?.mediaUrls[0] }
              : images.BusinessSearchImg
          }
          style={{ width: "100%", height: "100%" }}
          className="absolute"
          resizeMode="cover"
        />

        {/* Category Badge */}
        <View className="absolute top-3 right-3 bg-indigo-700/80 px-3 py-1 rounded-full shadow-lg">
          <Text className="text-white font-medium text-xs">
            {business?.category}
          </Text>
        </View>

        {/* Rating Badge */}
        <View className="absolute top-3 left-3 flex-row items-center bg-black/50 px-3 py-1 rounded-full shadow-lg">
          <Image
            source={icons.star}
            style={{ width: 14, height: 14, tintColor: "#FFC107" }}
          />
          <Text className="text-white font-bold text-sm ml-1">
            {business?.averageRating || "New"}
          </Text>
        </View>

        {/* Content with gradient overlay - with black background */}
        <LinearGradient
          colors={["transparent", "rgba(0, 0, 0, 0.8)", "rgba(0, 0, 0, 0.95)"]}
          className="h-full w-full justify-end p-4"
        >
          {/* Business Details */}
          <Text
            className="font-dsbold text-white text-2xl"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {business?.name}
          </Text>

          {/* Address with icon */}
          <View className="flex-row items-center mb-3 mt-1">
            <MaterialIcons name="location-on" size={16} color="#9E9BB8" />
            <Text
              className="text-[#9E9BB8] font-medium text-base ml-1 flex-1"
              numberOfLines={2}
            >
              {business?.address}
            </Text>
          </View>

          {/* Visit Button */}
          <View className="flex-row justify-start items-center mt-1">
            <LinearGradient
              colors={["#6366F1", "#4F46E5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-full overflow-hidden"
            >
              <TouchableOpacity
                className="py-2 px-5"
                onPress={() =>
                  router.push(`/business/profile/${business?._id}`)
                }
              >
                <Text className="text-white font-bold">Visit</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

export default BusinessViewAllScreen;
