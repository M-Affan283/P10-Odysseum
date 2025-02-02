import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import axiosInstance from "../../src/utils/axios";
import useUserStore from "../../src/context/userStore";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from "expo-router";
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { useInfiniteQuery } from "@tanstack/react-query";

const getQueryUsers = async ({ pageParam = 1, searchQuery }) =>
{
  console.log("Search query: ", searchQuery);

  try
  {
    const res = await axiosInstance.get(`/user/search?searchParam=${searchQuery}&page=${pageParam}`);
    // console.log(res.data);
    return res.data;
  }
  catch(error)
  {
    console.log(error);
    throw error;
  }
}

const UserSearchScreen = () => {


  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const user = useUserStore((state) => state.user);

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, error, refetch } = useInfiniteQuery({
    queryKey: ["userSearch", debouncedSearchQuery],
    queryFn: ({ pageParam = 1 }) => getQueryUsers({ pageParam, searchQuery: debouncedSearchQuery }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: (debouncedSearchQuery.length > 0), //only work if search query is present
  });

  let users = data?.pages.flatMap((page)=> page.users) || [];

  const loadMoreUsers = () => {
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
          <View className="flex-1 flex-row items-center bg-gray-900 border-gray-400 border rounded-full pl-2">
            <MaterialIcons name="search" size={30} color="white" />
            <TextInput
              placeholder="Search locations"
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
        data={users}
        keyExtractor={(item) => item._id}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
        onEndReached={loadMoreUsers}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={() => {
          if (isFetching) 
          {
            return (
              <View className="flex-1 mt-5 justify-center items-center">
                <ActivityIndicator size="large" color="black" />
                <Text className="mt-3 text-gray-300">Loading users...</Text>
              </View>
            );
          } 
          else if (error) 
          {
            return (
              <View className="flex-1 mt-5 justify-center items-center">
                <Text className="text-lg text-red-500">Failed to fetch users.</Text>
                <TouchableOpacity
                  className="mt-3 bg-blue-500 py-2 px-4 rounded-full"
                  onPress={refetch}
                >
                  <Text className="text-white">Retry</Text>
                </TouchableOpacity>
              </View>
            );
          }
          else if (debouncedSearchQuery.length > 0 && users?.length === 0)
          {
            return (
              <View className="flex-1 mt-5 justify-center items-center">
                <Text className="text-lg text-gray-300">No users found for "{debouncedSearchQuery}"</Text>
              </View>
            );
          }
          else if (debouncedSearchQuery.length === 0)
          {
            return (
              <View className="flex-1 mt-5 justify-center items-center">
                <Text className="text-lg text-gray-300">Search for users</Text>
              </View>
            );
          }
          return null;
        }}
        renderItem={({item}) => (
          <View>
            <TouchableOpacity className="flex-row items-center ml-5 mt-5" onPress={() => item._id !== user._id ? router.push(`/user/${item._id}`) : router.push(`/profile`)}>
              <Image source={{uri: item.profilePicture}} style={{width: 50, height: 50, borderRadius: 25}} />

              <View>
                <Text className="text-lg text-neutral-200 px-3">{item.username}</Text>
                {/* <Text className="text-sm text-neutral-500 ml-2">{item.firstName} {item.lastName}</Text> */}
              </View>

            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => (<View className="bg-gray-600 h-0.5 w-[90%] mx-auto mt-4" />)}
      />

    </SafeAreaView>
  )
}

export default UserSearchScreen