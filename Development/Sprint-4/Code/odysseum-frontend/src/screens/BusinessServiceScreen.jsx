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
import axiosInstance from "../utils/axios";
import { router } from "expo-router";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useInfiniteQuery } from "@tanstack/react-query";
import images from "../../assets/images/images";
import icons from "../../assets/icons/icons";

//screen to display business services
const getQueryBusinessServices = async ({ businessId, pageParam = 1 }) => {
  try 
  {
    const res = await axiosInstance.get(`/service/getByBusiness?businessId=${businessId}&page=${pageParam}`);
    // console.log(res.data)
    return res.data;
  } 
  catch (error) 
  {
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
    queryFn: ({ pageParam = 1 }) => getQueryBusinessServices({ businessId, pageParam }),
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

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="bg-primary z-10 py-1 rounded-b-xl">
        <View className="px-4 flex-row ">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 py-4">
            <ChevronLeftIcon size={30} strokeWidth={4} color="white" />
          </TouchableOpacity>

          <View className="flex-col">
            <Text className="font-dsbold text-white text-2xl">
              {businessName} Services
            </Text>
            <Text className="font-dsbold text-white text-lg">
              Select a service to view details
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={services}
        stickyHeaderHiddenOnScroll
        stickyHeaderIndices={[0]}
        style={{ marginTop: 10 }}
        contentContainerStyle={{ paddingBottom: 100, gap: 20 }}
        refreshing={isFetching && !isFetchingNextPage}
        onRefresh={handleRefresh}
        onEndReached={loadMoreServices}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={() => <View className="h-0" />}
        ListEmptyComponent={() => {
          if (isFetching) 
          {
            return (
              <View className="flex-1 mt-5 justify-center items-center">
                <ActivityIndicator size="large" color="black" />
                <Text className="mt-3 text-gray-500">Loading services...</Text>
              </View>
            );
          } 
          else if (error) 
          {
            return (
              <View className="flex-1 mt-5 justify-center items-center">
                <Text className="text-lg text-red-500">
                  Failed to fetch services.
                </Text>
                <TouchableOpacity
                  className="mt-3 bg-blue-500 py-2 px-4 rounded-full"
                  onPress={refetch}
                >
                  <Text className="text-white">Retry</Text>
                </TouchableOpacity>
              </View>
            );
          } 
          else if (services?.length === 0) 
          {
            return (
              <View className="flex-1 mt-5 justify-center items-center">
                <Text className="text-lg text-gray-500">No services found</Text>
              </View>
            );
          }
          return null;
        }}
        renderItem={({ item }) => <ServiceCard service={item} />}
      />
    </SafeAreaView>
  );
};

const ServiceCard = ({ service }) => {
  return (
    <View className="justify-center items-center my-2">
      <TouchableOpacity
        className="flex-row p-3 bg-[#221242] rounded-xl w-[95%] shadow-md"
        activeOpacity={0.7}
        onPress={() => router.push(`/service/profile/${service?._id}`)}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }}
      >
        <Image
          source={
            service?.mediaUrls?.length > 0
              ? { uri: service?.mediaUrls[0] }
              : images.ActivityImg
          }
          style={{ width: 120, height: 120, borderRadius: 10 }}
          className="rounded-xl"
          resizeMode="cover"
        />

        <View className="ml-3 flex-1 justify-between">
          <View>
            <Text className="font-dsbold text-xl text-white" numberOfLines={1}>
              {service?.name}
            </Text>

            <View className="flex-row items-center gap-1 mt-1 mb-2">
              <Image
                source={icons.category}
                style={{ width: 14, height: 14, tintColor: "#a0a0a0" }}
              />
              <Text className="text-gray-400 font-medium text-xs">
                {service?.category}
              </Text>
            </View>

            <Text
              className="text-gray-300 font-medium text-sm"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {service?.description}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default BusinessServiceScreen;
