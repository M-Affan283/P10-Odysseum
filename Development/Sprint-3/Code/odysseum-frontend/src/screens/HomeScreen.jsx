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

// import tempPosts from "./tempfiles/homescreenposts";


///////////////////////////////////////
// import tempPosts from "/tempfiles/homescreenposts";
//////////////////////////////////////

//change this to getFollowigPosts. requires user id
const getQueryPosts = async ({ pageParam = 1 }) => {
  console.log("Page param:", pageParam);
  
  try
  {
    const res = await axiosInstance.get(`/post/getAll?page=${pageParam}`);
    // console.log("Res:", res.data);
    return res.data;
  }
  catch(error)
  {
    console.log(error);
    throw error;
  }

}

const HomeScreen = () => {

    // UI RENDERING TEST
    // let isFetching = true;
    // const error = null;
    // const [posts, setPosts] = React.useState([]);
    // setTimeout(() => {
    //   setPosts(tempPosts);
    //   isFetching = false;
    // }, 3000);
    
    const user = useUserStore((state) => state.user);
  
    const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, error, refetch } = useInfiniteQuery({
      queryKey: ['posts'],
      queryFn: ({ pageParam =1 }) => getQueryPosts({pageParam}),
      getNextPageParam: (lastPage) => {
        const { currentPage, totalPages } = lastPage;
        return currentPage < totalPages ? currentPage + 1 : undefined;
      },
      // enabled: !!user,
    })

    // const posts = tempPosts; // use for ui testing
    const posts = data?.pages.flatMap((page) => page.posts) || []; //main posts array

    const renderItem = useCallback(({item}) => <PostCard post={item} />, []);

    const ListHeaderComponent = useMemo(() => {
    
        return (
            <View className="flex-row items-center justify-center" style={{marginBottom: 5, marginHorizontal:20}}>

              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "white", fontSize: 30}} className="font-dsbold">Odysseum</Text>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>Hello @{user.username}</Text>
              </View>

              <View className="absolute left-0 flex-row">
                <TouchableOpacity className="bg-[#11092f] mr-4 rounded-full">
                    <BellIcon size={30} color="white" />
                </TouchableOpacity>
              </View>

              <View className="absolute right-0 flex-row">
                <TouchableOpacity className="bg-[#11092f] mr-4 rounded-full">
                  <ChatBubbleLeftRightIcon size={30} color="white" />
                </TouchableOpacity>
              </View>
          </View>
        )
    }, []);

    const ListEmptyComponent = useMemo(() => {
      return (
        <SafeAreaView className="flex-1 items-center justify-center">
          { isFetching ? (
              <LottieView
                source={require('../../assets/animations/Loading2.json')}
                style={{
                  width: 100,
                  height: 100,
                }}
                autoPlay
                loop
              />
            )
            :
            error ? (
                <>
                  <ExclamationCircleIcon size={40} color="white" />
                  <Text className="text-white text-lg">Failed to fetch posts</Text>
                  <TouchableOpacity onPress={handleRefresh} activeOpacity={0.6}>
                    <Text className="text-blue-600 text-xl">Retry</Text>
                  </TouchableOpacity>
                </>
            )
            :
            (
              <>
                <LightBulbIcon size={30} color="white" />
                <Text className="text-white text-lg">No posts found</Text>
              </>
            )
          }
        </SafeAreaView>
      )
    }, [isFetching, error, posts]);

    const loadMorePosts = () => {
      if(hasNextPage) fetchNextPage();
    }

    const handleRefresh = async () => {
      await refetch();
    }


    useEffect(() => {
      if(error)
      {
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
        
        //consider bg-[#121212]
        <SafeAreaView className="flex-1 bg-[#070f1b]">   

          {/* consider checking out flashlist for better performance */}

          <FlatList 
            removeClippedSubviews={true}
            data={posts}
            contentContainerStyle={{ paddingBottom: 70, gap: 20 }}
            keyExtractor={(item) => item._id}
            stickyHeaderHiddenOnScroll={true}
            // stickyHeaderIndices={[0]}
            onEndReached={loadMorePosts}
            onEndReachedThreshold={0.5}
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={handleRefresh} 
            ListHeaderComponent={ListHeaderComponent}
            renderItem={renderItem}
            ListEmptyComponent={ListEmptyComponent}
            getItemLayout={(data, index) => ({
              length: 500,  // Estimated height of each item
              offset: 500 * index,  // Position of the item in the list
              index
            })}
          />

        </SafeAreaView>
    )
}
export default HomeScreen;