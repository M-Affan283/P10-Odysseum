import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "../utils/axios";
import { router } from "expo-router";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { RocketLaunchIcon } from "react-native-heroicons/solid";
import { useInfiniteQuery } from "@tanstack/react-query";
import images from "../../assets/images/images";
import icons from "../../assets/icons/icons";
import LottieView from "lottie-react-native";
import { RefreshCwOffIcon } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

// screen to display business services
const getQueryBusinessServices = async ({ businessId, pageParam = 1 }) => {
  try {
    const res = await axiosInstance.get(
      `/service/getByBusiness?businessId=${businessId}&page=${pageParam}`
    );
    // console.log(res.data)
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const BusinessServiceScreen = ({ businessId, businessName }) => {
  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["businessServices", businessId],
    queryFn: ({ pageParam = 1 }) =>
      getQueryBusinessServices({ businessId, pageParam }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: true,
  });

  let services = data?.pages.flatMap((page) => page.services) || [];

  const loadMoreServices = () => {
    if (hasNextPage) fetchNextPage();
  };

  const handleRefresh = async () => {
    await refetch();
  };

  // Memoized item renderer
  const renderItem = useCallback(
    ({ item }) => <ServiceCard service={item} />,
    []
  );

  // Footer component for the FlatList to show loading or end of list
  const ListFooterComponent = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="items-center justify-center py-3">
          <LottieView
            source={require("../../assets/animations/Loading1.json")}
            className="w-[60px] h-[60px]"
            autoPlay
            loop
          />
        </View>
      );
    }

    if (!hasNextPage && services.length > 0) {
      return (
        <View className="items-center justify-center py-3 flex-row">
          <RocketLaunchIcon size={20} color="#7b61ff" />
          <Text className="text-white/80 text-base font-medium ml-2">
            No More Services
          </Text>
        </View>
      );
    }

    return null;
  }, [isFetchingNextPage, hasNextPage, services.length]);

  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">
      <LinearGradient
        colors={["rgba(17, 9, 47, 0.9)", "rgba(7, 15, 27, 0.5)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="py-3 rounded-b-3xl shadow-lg mb-2"
      >
        <View className="px-4 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 p-2 bg-[#211655] rounded-full"
            style={{
              shadowColor: "#7b61ff",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <ChevronLeftIcon size={24} strokeWidth={2.5} color="white" />
          </TouchableOpacity>

          <View className="flex-col">
            <Text
              className="font-dsbold text-white text-2xl"
              style={{
                textShadowColor: "rgba(123, 97, 255, 0.6)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            >
              {businessName}
            </Text>
            <Text className="font-medium text-white/70 text-base">
              Select a service to view details
            </Text>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={services}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        style={{ marginTop: 5 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 100,
          gap: 16,
        }}
        refreshing={isFetching && !isFetchingNextPage}
        onRefresh={handleRefresh}
        onEndReached={loadMoreServices}
        onEndReachedThreshold={0.5}
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
                  Retrieving services...
                </Text>
              </View>
            );
          } else if (error) {
            return (
              <View className="flex-1 mt-12 justify-center items-center">
                <Text className="text-lg text-red-400 font-medium">
                  Failed to fetch services.
                </Text>
                <TouchableOpacity
                  className="mt-4 bg-indigo-600 py-3 px-5 rounded-xl"
                  onPress={refetch}
                >
                  <Text className="text-white font-bold">Retry</Text>
                </TouchableOpacity>
              </View>
            );
          } else if (services?.length === 0) {
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
      />
    </SafeAreaView>
  );
};

const ServiceCard = ({ service }) => {
  return (
    <TouchableOpacity
      className="mb-2 overflow-hidden rounded-xl"
      activeOpacity={0.8}
      onPress={() => router.push(`/service/profile/${service?._id}`)}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
      }}
    >
      <LinearGradient
        colors={["rgba(33, 18, 66, 0.95)", "rgba(24, 17, 50, 0.98)"]}
        className="rounded-xl overflow-hidden border border-[#372d5b]"
      >
        <View className="relative">
          <Image
            source={
              service?.mediaUrls?.length > 0
                ? { uri: service?.mediaUrls[0] }
                : images.ActivityImg
            }
            style={{ width: "100%", height: 160 }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 80,
            }}
          />
        </View>

        <View className="p-4">
          <View className="flex-row justify-between items-start">
            <Text
              className="font-dsbold text-2xl text-white flex-1 mr-2"
              numberOfLines={1}
              style={{
                textShadowColor: "rgba(123, 97, 255, 0.4)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              {service?.name}
            </Text>

            <View className="bg-[#372d5b] px-3 py-1 rounded-full">
              <Text className="text-[#b8a9ff] font-medium text-xs">
                {service?.category}
              </Text>
            </View>
          </View>

          <Text
            className="text-gray-300 font-medium text-sm mt-2"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {service?.description}
          </Text>

          <View className="mt-3 flex-row justify-between items-center">
            {service?.price ? (
              <Text className="text-[#7b61ff] font-dsbold text-base">
                Rs. {service?.price.toLocaleString()}
              </Text>
            ) : (
              <Text className="text-[#7b61ff] font-dsbold text-base">
                Price on request
              </Text>
            )}

            <TouchableOpacity
              className="bg-[#3d2a84] px-4 py-2 rounded-full"
              onPress={() => router.push(`/service/profile/${service?._id}`)}
            >
              <Text className="text-white font-bold text-xs">View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default BusinessServiceScreen;
