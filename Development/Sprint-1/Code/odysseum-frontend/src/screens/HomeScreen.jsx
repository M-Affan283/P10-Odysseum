import React, { useCallback, useMemo } from "react";
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import axiosInstance from "../utils/axios";
import { router } from "expo-router";
import PostCard from "../components/PostCard";
import Toast from "react-native-toast-message";
import LottieView from "lottie-react-native";
import { BellIcon, ChatBubbleLeftRightIcon } from "react-native-heroicons/solid";
import useUserStore from "../context/userStore";

///////////////////////////////////////
import tempPosts from "./tempfiles/homescreenposts";
//////////////////////////////////////

//testing tanstack query
import { useInfiniteQuery } from "@tanstack/react-query";
//queryFn:
//change this to getFollowigPosts. requires user id
const getQueryPosts = async ({ pageParam = 1 }) => {
  console.log("Page param:", pageParam);
  
  try
  {
    const res = await axiosInstance.get(`/post/getAllPosts?page=${pageParam}`);
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

    const user = useUserStore((state) => state.user);

    const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, error, refetch } = useInfiniteQuery({
      queryKey: ['posts'],
      queryFn: ({ pageParam =1 }) => getQueryPosts({pageParam}),
      // initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        // console.log("Last page:" , JSON.stringify(lastPage,null,2));
        const { currentPage, totalPages } = lastPage;
        return currentPage < totalPages ? currentPage + 1 : undefined;
      },
      // enabled: !!user,
    })

    // console.log(data)

    // const posts = tempPosts; // use for ui testing
    const posts = data?.pages.flatMap((page) => page.posts) || []; //main posts array

    const renderItem = useCallback(({item}) => <PostCard post={item} />, []);

    const ListHeaderComponent = useMemo(() => {
    
        return (
          <View className="flex-row items-center justify-center" style={{marginBottom: 5, marginHorizontal:20}}>

            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "white", fontSize: 30}} className="font-dsbold">
                Odysseum
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>
                Hello @{user.username}
              </Text>
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
            
            {/* <Text className="font-dsbold text-white" style={{fontSize: 35}}>Home</Text>
      
            { isFetching ? (
                <LottieView
                source={require('../../assets/LoadingAnimation.json')}
                style={{
                  width: 100,
                  height: 100,
                }}
                autoPlay
                loop
              />
            )
            :
            <TouchableOpacity className="bg-[#11092f] mr-4 rounded-full">
              <ChatBubbleLeftRightIcon size={30} color="white" />
            </TouchableOpacity>
          } */}
        </View>
        )
    // }, []);
    }, [isFetching]);

    const loadMorePosts = () => {
      if(hasNextPage) fetchNextPage();
    }

    const handleRefresh = async () => {
      await refetch();
    }

    if(error)
    {
      console.error(error);
      posts = tempPosts; // temp posts for testing
      
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Failed to fetch posts",
        text2: error.message,
        visibilityTime: 3000,
      })
    }

    return (
        
        //consider bg-[#121212]
        <SafeAreaView className="flex-1 bg-[#070f1b] ">   


            {/* consider checking out flashlist for better performance */}
            
            {posts.length > 0 ? (
                <FlatList 
                removeClippedSubviews={true}
                data={posts}
                contentContainerStyle={{ paddingBottom: 70, gap: 20 }}
                keyExtractor={(item) => item._id}
                stickyHeaderHiddenOnScroll={true}
                stickyHeaderIndices={[0]}
                initialNumToRender={posts.length}
                onEndReached={loadMorePosts}
                onEndReachedThreshold={0.5}
                refreshing={isFetching && !isFetchingNextPage}
                onRefresh={handleRefresh} 
                ListHeaderComponent={ListHeaderComponent}
                renderItem={renderItem}
                // ListEmptyComponent={}
                // getItemLayout={(data, index) => ({
                //   length: 700,
                //   offset: 705 * index,
                //   index
                // })}
              />
              )
              : null
            }
            
        </SafeAreaView>
    )
}



export default HomeScreen;