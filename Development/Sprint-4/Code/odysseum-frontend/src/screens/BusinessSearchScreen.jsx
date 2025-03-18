import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import axiosInstance from "../../src/utils/axios";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from "expo-router";
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { useInfiniteQuery } from "@tanstack/react-query";
import images from "../../assets/images/images";

const getQueryBusinesses = async ({ pageParam = 1, searchQuery }) =>
{
  console.log("Search query: ", searchQuery);

  try
  {
    const res = await axiosInstance.get(`/business/search?searchParam=${searchQuery}&page=${pageParam}`);
    // console.log(res.data);
    return res.data;
  }
  catch(error)
  {
    console.log(error);
    throw error;
  }
}

const BusinessSearchScreen = () => {

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, error, refetch } = useInfiniteQuery({
    queryKey: ["businessSearch", debouncedSearchQuery],
    queryFn: ({ pageParam = 1 }) => getQueryBusinesses({ pageParam, searchQuery: debouncedSearchQuery }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: (debouncedSearchQuery.length > 0), //only work if search query is present
  });

  let businesses = data?.pages.flatMap((page)=> page.businesses) || [];

  const loadMoreBusiness = () =>
  {
    if(hasNextPage) fetchNextPage();
  }

  useEffect(()=>
  {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timer);
    }
  }, [searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">

      <View className="m-4">
        <View className="flex-row items-center space-x-2">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="py-4"
          >
            <ChevronLeftIcon size={40} strokeWidth={4} color="white" />
          </TouchableOpacity>

          {/* Search Bar */}
          <View className="flex-1 flex-row items-center bg-gray-900 border-gray-400 border rounded-full pl-6">
            <MaterialIcons name="search" size={20} color="white" />
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
      </View>

      <FlatList
        data={businesses}
        keyExtractor={(item) => item._id}
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
          else if (debouncedSearchQuery.length > 0 && businesses.length === 0)
          {
            return (
              <View className="flex-1 mt-5 justify-center items-center">
                <Text className="text-lg text-gray-300">No businesses found for "{debouncedSearchQuery}"</Text>
              </View>
            );
          }
          else if (debouncedSearchQuery.length === 0)
          {
            return (
              <View className="flex-1 mt-5 justify-center items-center">
                <Text className="text-lg text-gray-300">Search for businesses</Text>
              </View>
            );
          }
          return null;
        }}
        renderItem={({item}) => (
          <View>
            <TouchableOpacity className="flex-row items-center ml-5 mt-5" onPress={() => router.push(`/business/profile/${item._id}`)}>
              <Image source={item.mediaUrls ? {uri: item.mediaUrls[0]} : images.BusinessSearchImg} style={{ width: 50, height: 50, borderRadius: 25 }} />

              <View className="px-3">
                <Text className="text-lg text-neutral-200 ">{item.name}</Text>
                <Text className="text-sm text-neutral-500 ">{item.category}</Text>
                <Text className="text-sm text-neutral-500 ">{item.locationId.name}</Text>
              </View>

            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => (<View className="bg-gray-600 h-0.5 w-[90%] mx-auto mt-4" />)}
      />

    </SafeAreaView>
  )
}

export default BusinessSearchScreen