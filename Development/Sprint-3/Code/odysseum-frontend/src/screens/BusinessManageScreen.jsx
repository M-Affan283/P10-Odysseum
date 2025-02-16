import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Image } from "react-native";
import React, { useState } from "react";
import useUserStore from "../context/userStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import axiosInstance from "../utils/axios";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "react-native-heroicons/outline";
import images from "../../assets/images/images";
import { SafeAreaView } from "react-native-safe-area-context";

const getQueryUserBusinesses = async ({ pageParam = 1, userId, searchQuery }) =>
{
  console.log("Search query: ", searchQuery);

  try
  {
    const res = await axiosInstance.get(`/business/getByUser?userId=${userId}&page=${pageParam}&searchParam=${searchQuery}`);
    // console.log(res.data);
    return res.data;
  }
  catch(error)
  {
    console.log(error);
    throw error;
  }
}

const BusinessManageScreen = () => {

  const [searchQuery, setSearchQuery] = useState("");

  const user = useUserStore((state) => state.user);
  // console.log("User: ", user);
  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, error, refetch } = useInfiniteQuery({
    queryKey: ["businessManage", user._id],
    queryFn: ({ pageParam = 1 }) => getQueryUserBusinesses({ pageParam, userId: user._id,searchQuery: searchQuery }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!user._id, //only work if user id is present
  });

  let businesses = data?.pages.flatMap((page)=> page.businesses) || [];
  
  const loadMoreBusiness = () =>
  {
    if(hasNextPage) fetchNextPage();
  }


  return (
    <SafeAreaView className="flex-1 bg-primary">
          
          <View className="m-4">
            <View className="flex-row items-center space-x-2">
              <TouchableOpacity onPress={() => router.back()} className="py-4">
                  <ArrowLeftIcon size={30} color='white' />
              </TouchableOpacity>
              <Text className="text-3xl font-dsbold text-purple-500">Manage Businesses</Text>
            </View>
            <View className="flex-row items-center bg-gray-900 border-gray-400 border rounded-full pl-6">
              <MagnifyingGlassIcon size={20} color="white" />
              <TextInput
                placeholder="Search businesses"
                placeholderTextColor="gray"
                value={searchQuery}
                clearButtonMode="always"
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 text-base mb-1 pl-1 tracking-wider text-white"
                onChangeText={(text) => setSearchQuery(text)}
              />
            </View>

          </View>
          

          <FlatList
            data={businesses}
            keyExtractor={(item) => item?._id}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={true}
            onEndReached={loadMoreBusiness}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={() => {
              if (isFetching) 
              {
                return (
                  <View className="flex-1 mt-5 justify-center items-center">
                    <ActivityIndicator size="large" color="black" />
                    <Text className="mt-3 text-gray-300">Loading businesses...</Text>
                  </View>
                );
              } 
              else if (error) 
              {
                return (
                  <View className="flex-1 mt-5 justify-center items-center">
                    <Text className="text-lg text-red-500">Failed to fetch businesses.</Text>
                    <TouchableOpacity
                      className="mt-3 bg-blue-500 py-2 px-4 rounded-full"
                      onPress={refetch}
                    >
                      <Text className="text-white">Retry</Text>
                    </TouchableOpacity>
                  </View>
                );
              }
              return null;
            }}
            renderItem={({item}) => (
              <View>
                <TouchableOpacity className="flex-row items-center ml-5 mt-5" onPress={() => router.push(`/business/profile/${item._id}`)}>
                  <Image source={item.mediaUrls.length > 0 ? {uri: item.mediaUrls[0]} : images.BusinessSearchImg} style={{ width: 60, height: 60, borderRadius: 5 }} />
    
                  <View className="px-3">
                    <Text className="text-lg text-neutral-200 ">{item.name}</Text>
                    <Text className="text-sm text-neutral-500 ">{item.category}</Text>
                    <Text className="text-sm text-neutral-500 ">{item.address}</Text>
                  </View>

                  {/* Status on right end */}
                  <View className="flex-1 items-end mx-4">
                    <Text className={`text-sm italic ${item.status === "Approved" ? "text-green-500" : item.status === "Pending" ? "text-yellow-500" : "text-red-500"}`}>{item.status}</Text>
                  </View>
    
                </TouchableOpacity>
              </View>
            )}
            ItemSeparatorComponent={() => (<View className="bg-gray-600 h-0.5 w-[90%] mx-auto mt-4" />)}
          />
        </SafeAreaView>
  );
};

export default BusinessManageScreen;
