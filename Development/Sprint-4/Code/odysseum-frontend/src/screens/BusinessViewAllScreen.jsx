import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import axiosInstance from "../utils/axios";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useInfiniteQuery } from "@tanstack/react-query";
// import tempBusinesses from "./tempfiles/tempbusinesses";
import icons from "../../assets/icons/icons";
import images from "../../assets/images/images";
import { LinearGradient } from "expo-linear-gradient";

const getQueryBusinesses = async ({pageParam = 1,locationId,searchParam}) => {
  try 
  {
    const res = await axiosInstance.get(`/business/getByLocation?locationId=${locationId}&page=${pageParam}&searchParam=${searchParam}`);
    return res.data;
  } 
  catch (error) 
  {
    console.log(error);
    throw error;
  }
};

const BusinessViewAllScreen = ({ locationId, locationName }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState();

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
    queryFn: ({ pageParam = 1 }) => getQueryBusinesses({pageParam,locationId,searchParam: debouncedSearchQuery}),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: true,
  });

  let businesses = data?.pages.flatMap((page) => page.businesses) || [];

  useEffect(() =>
  {
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

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Header with title and back button */}
      <View className="bg-primary z-10 py-2 rounded-b-2xl shadow-lg">
        <View className="px-4 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 p-2 bg-opacity-20 rounded-full"
          >
            <ChevronLeftIcon size={26} strokeWidth={3} color="white" />
          </TouchableOpacity>

          <View className="flex-col">
            <Text className="font-dsbold text-white text-2xl">
              All Businesses
            </Text>
            <Text className="font-dsbold text-white/80 text-lg">
              {locationName}
            </Text>
          </View>
        </View>

        {/* Enhanced search bar with gradient */}
        <View className="mx-4 mt-4 mb-2">
          <LinearGradient
            colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-xl overflow-hidden"
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

      <FlatList
        data={businesses}
        stickyHeaderHiddenOnScroll
        stickyHeaderIndices={[0]}
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
        ListEmptyComponent={() => {
          if (isFetching) 
          {
            return (
              <View className="flex-1 mt-12 justify-center items-center">
                <ActivityIndicator size="large" color="white" />
                <Text className="mt-4 text-white/70 font-medium">
                  Loading businesses...
                </Text>
              </View>
            );
          }
          else if (error) 
          {
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
          } 
          else if (debouncedSearchQuery?.length > 0 && businesses?.length === 0) 
          {
            return (
              <View className="flex-1 mt-12 justify-center items-center">
                <Text className="text-lg text-white/70 font-medium">
                  No business found for "{debouncedSearchQuery}"
                </Text>
              </View>
            );
          } 
          else if (debouncedSearchQuery?.length === 0 && businesses?.length === 0) 
          {
            return (
              <View className="flex-1 mt-12 justify-center items-center">
                <Text className="text-lg text-white/70 font-medium">
                  No businesses found
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

const BusinessCard = ({ business }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/business/profile/${business?._id}`)}
      className="overflow-hidden rounded-2xl mb-3 shadow-lg"
    >
      {/* Card Container */}
      <View className="bg-[#2A2456] rounded-2xl">
        {/* Top Image Section with Full Width */}
        <View className="relative w-full h-48">
          <Image
            source={
              business?.mediaUrls?.length > 0
                ? { uri: business?.mediaUrls[0] }
                : images.BusinessSearchImg
            }
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Category Badge */}
          <View className="absolute top-3 right-3 bg-indigo-700/80 px-3 py-1 rounded-full">
            <Text className="text-white font-medium text-xs">
              {business?.category}
            </Text>
          </View>

          {/* Rating Badge */}
          <View className="absolute top-3 left-3 flex-row items-center bg-black/50 px-3 py-1 rounded-full">
            <Image
              source={icons.star}
              style={{ width: 14, height: 14, tintColor: "#FFC107" }}
            />
            <Text className="text-white font-bold text-sm ml-1">
              {business?.averageRating || "0.0"}
            </Text>
          </View>

          {/* Gradient Overlay */}
          <LinearGradient
            colors={["transparent", "#221242"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
            }}
          />
        </View>

        {/* Business Info Section */}
        <View className="p-4">
          {/* Business Name */}
          <Text className="font-dsbold text-white text-3xl mb-2">
            {business?.name}
          </Text>

          {/* Address with icon */}
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="location-on" size={16} color="#9E9BB8" />
            <Text
              className="text-[#9E9BB8] font-medium text-base ml-1 flex-1"
              numberOfLines={2}
            >
              {business?.address}
            </Text>
          </View>

          {/* Bottom Action Bar */}
          <View className="flex-row justify-between items-center mt-1">
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
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BusinessViewAllScreen;
