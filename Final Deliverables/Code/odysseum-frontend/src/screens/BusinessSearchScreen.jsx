import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "../../src/utils/axios";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useInfiniteQuery } from "@tanstack/react-query";
import images from "../../assets/images/images";

const getQueryBusinesses = async ({ pageParam = 1, searchQuery }) => {
  console.log("Search query: ", searchQuery);

  try 
  {
    const res = await axiosInstance.get(`/business/search?searchParam=${searchQuery}&page=${pageParam}`);
    return res.data;
  } 
  catch (error) 
  {
    console.log(error);
    throw error;
  }
};

const BusinessSearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["businessSearch", debouncedSearchQuery],
    queryFn: ({ pageParam = 1 }) => getQueryBusinesses({ pageParam, searchQuery: debouncedSearchQuery }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: debouncedSearchQuery.length > 0, //only work if search query is present
  });

  let businesses = data?.pages.flatMap((page) => page.businesses) || [];

  const loadMoreBusiness = () => {
    if (hasNextPage) fetchNextPage();
  };

  useEffect(() => 
  {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Animation for search results
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Reset and trigger animation when businesses or search query changes
  useEffect(() => 
  {
    // Reset opacity to 0 when new search begins
    if (isFetching && !isFetchingNextPage) {
      fadeAnim.setValue(0);
    }

    // Animate when results arrive and aren't empty
    if (!isFetching && businesses.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isFetching, businesses]);

  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">
      {/* Header and Search Bar */}
      <View className="px-4 pt-2 pb-4 border-b border-gray-800">
        <View className="flex-row items-center space-x-3">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-full bg-gray-800/60"
          >
            <ChevronLeftIcon size={28} strokeWidth={2.5} color="white" />
          </TouchableOpacity>

          {/* Search Bar */}
          <View className="flex-1 flex-row items-center bg-gray-800/70 rounded-xl px-3 py-2.5">
            <Ionicons name="search-outline" size={22} color="#9ca3af" />
            <TextInput
              placeholder="Search businesses..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              className="flex-1 text-base ml-2 text-white"
              onChangeText={(text) => setSearchQuery(text)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Results List */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={businesses}
          keyExtractor={(item) => item._id}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={true}
          onEndReached={loadMoreBusiness}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingVertical: 12 }}
          ListFooterComponent={() =>
            isFetchingNextPage && (
              <View className="py-5 items-center">
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text className="text-gray-400 mt-2">Loading more...</Text>
              </View>
            )
          }
          ListEmptyComponent={() => {
            if (isFetching && !isFetchingNextPage) {
              return (
                <View className="flex-1 my-10 justify-center items-center">
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text className="mt-3 text-gray-400">
                    Searching businesses...
                  </Text>
                </View>
              );
            } 
            else if (error) 
            {
              return (
                <View className="flex-1 my-10 justify-center items-center">
                  <Ionicons name="alert-circle" size={48} color="#ef4444" />
                  <Text className="text-lg mt-2 text-gray-300">
                    Failed to fetch businesses.
                  </Text>
                  <TouchableOpacity
                    className="mt-4 bg-blue-600 py-2 px-5 rounded-lg flex-row items-center"
                    onPress={refetch}
                  >
                    <Ionicons name="refresh" size={18} color="white" />
                    <Text className="text-white ml-2 font-medium">Retry</Text>
                  </TouchableOpacity>
                </View>
              );
            } 
            else if (debouncedSearchQuery.length > 0 && businesses.length === 0) 
            {
              return (
                <View className="flex-1 my-10 justify-center items-center">
                  <Ionicons name="search" size={48} color="#9ca3af" />
                  <Text className="text-lg mt-2 text-gray-300">
                    No businesses found for "{debouncedSearchQuery}"
                  </Text>
                </View>
              );
            } 
            else if (debouncedSearchQuery.length === 0) 
            {
              return (
                <View className="flex-1 my-10 justify-center items-center">
                  <Ionicons name="business" size={48} color="#9ca3af" />
                  <Text className="text-lg mt-3 text-gray-300">
                    Search for businesses
                  </Text>
                  <Text className="text-sm mt-1 text-gray-500">
                    Type a name to find businesses
                  </Text>
                </View>
              );
            }
            return null;
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="mx-4 mb-3 bg-gray-800/50 rounded-xl overflow-hidden"
              onPress={() => router.push(`/business/profile/${item._id}`)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center p-3">
                <Image
                  source={
                    item.mediaUrls && item.mediaUrls.length > 0
                      ? { uri: item.mediaUrls[0] }
                      : images.BusinessSearchImg
                  }
                  style={{ width: 60, height: 60, borderRadius: 30 }}
                  className="border border-gray-700"
                />

                <View className="flex-1 ml-3">
                  <Text className="text-lg font-semibold text-white">
                    {item.name}
                  </Text>
                  <Text className="text-sm text-gray-400">{item.category}</Text>
                  <Text className="text-sm text-gray-400">
                    {item.locationId?.name || "Unknown location"}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          )}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default BusinessSearchScreen;
