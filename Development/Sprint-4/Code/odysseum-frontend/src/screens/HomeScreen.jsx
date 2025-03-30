import React, { useCallback, useEffect, useMemo } from "react";
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import axiosInstance from "../utils/axios";
import { router } from "expo-router";
import PostCard from "../components/PostCard";
import Toast from "react-native-toast-message";
import LottieView from "lottie-react-native";
import { BellIcon, ChatBubbleLeftRightIcon, ExclamationCircleIcon } from "react-native-heroicons/solid";
import { LightBulbIcon } from "react-native-heroicons/outline";
import useUserStore from "../context/userStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";

const getQueryPosts = async ({ userId, pageParam = 1 }) => {
  console.log("Page param:", pageParam);
  
  try {
    const res = await axiosInstance.get(`/post/getFollowing?requestorId=${userId}&page=${pageParam}`);
    return res.data;
  } catch(error) {
    console.log(error);
    throw error;
  }
}

const HomeScreen = () => {
    const user = useUserStore((state) => state.user);
  
    const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, error, refetch } = useInfiniteQuery({
      queryKey: ['posts'],
      queryFn: ({ pageParam = 1 }) => getQueryPosts({userId: user._id, pageParam}),
      getNextPageParam: (lastPage) => {
        const { currentPage, totalPages } = lastPage;
        return currentPage < totalPages ? currentPage + 1 : undefined;
      },
    });

    const posts = data?.pages.flatMap((page) => page.posts) || [];

    const renderItem = useCallback(({item}) => <PostCard post={item} />, []);

    const ListHeaderComponent = useMemo(() => {
        return (
          <LinearGradient 
            colors={['rgba(17, 9, 47, 0.9)', 'rgba(7, 15, 27, 0.5)']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }}
            className="p-4 rounded-3xl mb-2 mx-4"
          >
            <View className="flex-row items-center justify-center" style={{paddingVertical: 10}}>
              <View style={{ alignItems: "center" }}>
                <Text style={{ 
                  color: "#ffffff",
                  fontSize: 34,
                  textShadowColor: 'rgba(123, 97, 255, 0.6)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4
                }} className="font-dsbold">Odysseum</Text>
                <Text style={{ 
                  color: "rgba(255,255,255,0.7)", 
                  fontSize: 16,
                  fontWeight: '500',
                  letterSpacing: 0.5
                }}>Hello @{user.username}</Text>
              </View>

              <View className="absolute left-0 flex-row">
                <TouchableOpacity 
                  className="bg-[#211655] mr-4 rounded-full p-2"
                  style={{
                    shadowColor: "#7b61ff",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4
                  }}
                >
                  <BellIcon size={30} color="#f8f8ff" />
                </TouchableOpacity>
              </View>

              <View className="absolute right-0 flex-row">
                <TouchableOpacity 
                  className="bg-[#211655] mr-4 rounded-full p-2" 
                  onPress={() => router.push("/chat")}
                  style={{
                    shadowColor: "#7b61ff",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4
                  }}
                >
                  <ChatBubbleLeftRightIcon size={30} color="#f8f8ff" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        )
    }, [user]);

    const ListEmptyComponent = useMemo(() => {
      return (
        <SafeAreaView className="flex-1 items-center justify-center" style={{paddingTop: 80}}>
          { isFetching ? (
              <LottieView
                source={require('../../assets/animations/Loading2.json')}
                style={{
                  width: 120,
                  height: 120,
                }}
                autoPlay
                loop
              />
            )
            : error ? (
              <View className="items-center p-6 bg-[#191b2a] rounded-3xl">
                <ExclamationCircleIcon size={40} color="#ff5c75" />
                <Text className="text-white text-lg font-semibold mt-3">Failed to fetch posts</Text>
                <TouchableOpacity 
                  onPress={handleRefresh} 
                  activeOpacity={0.6} 
                  className="mt-4 bg-[#3d2a84] px-5 py-3 rounded-full"
                >
                  <Text className="text-white font-bold text-base">Retry</Text>
                </TouchableOpacity>
              </View>
            )
            : (
              <View className="items-center p-6 bg-[#191b2a] rounded-3xl">
                <LightBulbIcon size={40} color="#ffd454" />
                <Text className="text-white text-lg font-semibold mt-3">No posts found</Text>
                <Text className="text-gray-400 text-base mt-1 text-center">Start following users to see their posts</Text>
              </View>
            )
          }
        </SafeAreaView>
      )
    }, [isFetching, error]);

    const loadMorePosts = () => {
      if(hasNextPage) fetchNextPage();
    }

    const handleRefresh = async () => {
      await refetch();
    }

    useEffect(() => {
      if(error) {
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Failed to fetch posts",
          text2: error.message,
          visibilityTime: 3000,
        })
      }
    }, [error]);

    return (
        <SafeAreaView className="flex-1" style={{backgroundColor: '#070f1b'}}>   
          <LinearGradient
            colors={['rgba(17, 9, 47, 0.5)', 'rgba(7, 15, 27, 0.9)']}
            style={{ flex: 1 }}
          >
            <FlatList 
              removeClippedSubviews={true}
              data={posts}
              contentContainerStyle={{ paddingBottom: 90, gap: 20 }}
              keyExtractor={(item) => item._id}
              stickyHeaderHiddenOnScroll={true}
              onEndReached={loadMorePosts}
              onEndReachedThreshold={0.5}
              refreshing={isFetching && !isFetchingNextPage}
              onRefresh={handleRefresh} 
              ListHeaderComponent={ListHeaderComponent}
              renderItem={renderItem}
              ListEmptyComponent={ListEmptyComponent}
              getItemLayout={(data, index) => ({
                length: 500,  // Estimated height of each item
                offset: 500 * index,
                index
              })}
            />
          </LinearGradient>
        </SafeAreaView>
    )
}

export default HomeScreen;