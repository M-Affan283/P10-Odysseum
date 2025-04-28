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
import useUserStore from "../../src/context/userStore";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useInfiniteQuery } from "@tanstack/react-query";

const getQueryUsers = async ({ pageParam = 1, searchQuery }) => {
  console.log("Search query: ", searchQuery);

  try 
  {
    const res = await axiosInstance.get(`/user/search?searchParam=${searchQuery}&page=${pageParam}`);
    return res.data;
  } 
  catch (error) 
  {
    console.log(error);
    throw error;
  }
};

const UserSearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const user = useUserStore((state) => state.user);

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["userSearch", debouncedSearchQuery],
    queryFn: ({ pageParam = 1 }) => getQueryUsers({ pageParam, searchQuery: debouncedSearchQuery }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: debouncedSearchQuery.length > 0,
  });

  let users = data?.pages.flatMap((page) => page.users) || [];

  const loadMoreUsers = () => {
    if (hasNextPage) fetchNextPage();
  };

  useEffect(() => {
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

  // Reset and trigger animation when users or search query changes
  useEffect(() => {
    // Reset opacity to 0 when new search begins
    if (isFetching && !isFetchingNextPage) {
      fadeAnim.setValue(0);
    }

    // Animate when results arrive and aren't empty
    if (!isFetching && users.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isFetching, users]);

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
              placeholder="Search users..."
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
          data={users}
          keyExtractor={(item) => item._id}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={true}
          onEndReached={loadMoreUsers}
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
                  <Text className="mt-3 text-gray-400">Searching users...</Text>
                </View>
              );
            } 
            else if (error) 
            {
              return (
                <View className="flex-1 my-10 justify-center items-center">
                  <Ionicons name="alert-circle" size={48} color="#ef4444" />
                  <Text className="text-lg mt-2 text-gray-300">
                    Failed to fetch users.
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
            else if (debouncedSearchQuery.length > 0 && users?.length === 0) 
            {
              return (
                <View className="flex-1 my-10 justify-center items-center">
                  <Ionicons name="search" size={48} color="#9ca3af" />
                  <Text className="text-lg mt-2 text-gray-300">
                    No users found for "{debouncedSearchQuery}"
                  </Text>
                </View>
              );
            } 
            else if (debouncedSearchQuery.length === 0) 
            {
              return (
                <View className="flex-1 my-10 justify-center items-center">
                  <Ionicons name="people" size={48} color="#9ca3af" />
                  <Text className="text-lg mt-3 text-gray-300">
                    Search for users
                  </Text>
                  <Text className="text-sm mt-1 text-gray-500">
                    Type a name to find people
                  </Text>
                </View>
              );
            }
            return null;
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="mx-4 mb-3 bg-gray-800/50 rounded-xl overflow-hidden"
              onPress={() =>
                item._id !== user._id
                  ? router.push(`/user/${item._id}`)
                  : router.push(`/profile`)
              }
              activeOpacity={0.7}
            >
              <View className="flex-row items-center p-3">
                <Image
                  source={{ uri: item.profilePicture }}
                  style={{ width: 60, height: 60, borderRadius: 30 }}
                  className="border border-gray-700"
                />

                <View className="flex-1 ml-3">
                  <Text className="text-lg font-semibold text-white">
                    {item.username}
                  </Text>
                  <Text className="text-sm text-gray-400">
                    {item.firstName && item.lastName
                      ? `${item.firstName} ${item.lastName}`
                      : "Odysseum User"}
                  </Text>
                </View>

                <Ionicons
                  name={item._id === user._id ? "person-circle" : "chevron-forward"}
                  size={22}
                  color="#9ca3af"
                />
              </View>
            </TouchableOpacity>
          )}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default UserSearchScreen;
