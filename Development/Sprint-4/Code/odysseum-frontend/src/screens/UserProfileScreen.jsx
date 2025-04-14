import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import axiosInstance from "../utils/axios";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Foundation from "@expo/vector-icons/Foundation";
import {
  Cog6ToothIcon,
  ExclamationCircleIcon,
  TicketIcon,
} from "react-native-heroicons/solid";
import LottieView from "lottie-react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import useUserStore from "../context/userStore";

//////////////////////////////////////////
// import tempPosts from './tempfiles/homescreenposts'
/////////////////////////////////////////

const imageWidth = (Dimensions.get("window").width - 20) / 2;

const getQueryUserPosts = async ({ pageParam = 1, userId, requestorId }) => {
  console.log("Page param:", pageParam);

  try {
    const res = await axiosInstance.get(
      `/post/getUserPosts?page=${pageParam}&userId=${userId}&requestorId=${requestorId}`
    );
    // console.log("Res:", res.data);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const UserProfileScreen = () => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const logout = useUserStore((state) => state.logout);

  // const [posts, setPosts] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["posts", user._id], // read as posts of user with id user._id
    queryFn: ({ pageParam = 1 }) =>
      getQueryUserPosts({ pageParam, userId: user._id, requestorId: user._id }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    // enabled: !!user,
  });

  // const posts = tempPosts; // use for ui testing
  const posts = data?.pages.flatMap((page) => page.posts) || []; //main posts array

  const userLogout = async () => {
    console.log("Logging out user: ", user.username);
    await logout();
    // Replace the entire navigation stack to prevent back navigation to authenticated screens
    router.replace("/");
  };

  const loadMorePosts = () => {
    if (hasNextPage) fetchNextPage();
  };

  const handleRefresh = () => {
    refetch();
  };

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Failed to fetch posts",
        text2: error.message,
        visibilityTime: 3000,
      });
    }
  }, [error]);

  const ProfileStat = ({ text, subText }) => {
    return (
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontWeight: "400", fontSize: 25, color: "white" }}>
          {text}
        </Text>
        <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
          {subText}
        </Text>
      </View>
    );
  };

  const ListHeaderComponent = () => {
    return (
      <View>
        <TouchableOpacity onPress={userLogout} className="flex items-end p-4">
          <MaterialIcons name="logout" size={30} color="white" />
        </TouchableOpacity>

        <View className="items-center mt-5">
          <ImageBackground
            source={{ uri: user.profilePicture }}
            style={{ width: 150, height: 150, marginHorizontal: 10 }}
            imageStyle={{ borderRadius: 100 }}
          >
            <View className="absolute bottom-0 right-0">
              <TouchableOpacity
                onPress={() => router.push("/settings")}
                className="bg-slate-700 p-1 rounded-full"
              >
                <Cog6ToothIcon size={35} strokeWidth={1.5} color="white" />
              </TouchableOpacity>
            </View>

            <View className="absolute top-0 left-0">
              <TouchableOpacity
                onPress={() => router.push("/user/booking/bookings")}
                className="bg-slate-700 p-1 rounded-full"
              >
                <TicketIcon size={35} strokeWidth={1.5} color="white" />
              </TouchableOpacity>
            </View>
          </ImageBackground>

          <View className="items-center mt-5 gap-2">
            <Text className="font-bold text-xl text-white top-1">
              {user?.firstName + " " + user?.lastName}
            </Text>
            <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }}>
              @{user?.username}
            </Text>
            <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }}>
              {user?.bio || "Add a bio"}
            </Text>
          </View>
        </View>

        <View
          className="flex-row mt-5 justify-around items-center bg-[#191a2b]"
          style={{
            paddingVertical: 10,
            marginBottom: 20,
            marginHorizontal: 10,
            borderRadius: 20,
          }}
        >
          <ProfileStat
            text={user?.followers?.length || 0}
            subText="Followers"
          />
          <ProfileStat
            text={user?.following?.length || 0}
            subText="Following"
          />
          <ProfileStat text={posts?.length || 0} subText="Posts" />
        </View>
      </View>
    );
  };

  const ListEmptyComponent = () => {
    return (
      <SafeAreaView className="flex justify-center items-center px-4">
        {isFetching ? (
          <LottieView
            source={require("../../assets/animations/Loading1.json")}
            style={{
              width: 100,
              height: 100,
            }}
            autoPlay
            loop
          />
        ) : error ? (
          <View className="flex justify-center items-center">
            <ExclamationCircleIcon size={24} color="white" />
            <Text className="text-xl text-center font-semibold text-white mt-2">
              "Something went wrong. Please try again later."
            </Text>
          </View>
        ) : (
          <Text className="text-xl text-center font-semibold text-white mt-2">
            "No posts yet."
          </Text>
        )}
      </SafeAreaView>
    );
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        className="p-1"
        onPress={() => router.push(`/post/${item._id}`)}
        onLayout={(event) => {
          const { x, y, width, height } = event.nativeEvent.layout;
          console.log("x:", x, "y:", y, "width:", width, "height:", height);
        }}
      >
        <View className="relative">
          {item.mediaUrls.length > 1 && (
            <Foundation
              name="page-multiple"
              size={24}
              color="white"
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 1,
                opacity: 0.7,
              }}
            />
          )}
          <Image
            source={{ uri: item.mediaUrls[0] }}
            style={{ width: imageWidth, height: 300, borderRadius: 10 }}
            resizeMode="cover"
          />
        </View>
      </TouchableOpacity>
    );
  };

  //show username, profile picture, bio, number of followers, number of following, number of posts, then in a scrollview and gridview (like instagram) show the posts. also show logout button
  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        key={"_"}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 70 }}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        refreshing={isFetching && !isFetchingNextPage}
        onRefresh={handleRefresh}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        renderItem={renderItem}
        getItemLayout={(data, index) => ({
          length: 310, // Estimated height of each item
          offset: 310 * index,
          index,
        })}
      />
    </SafeAreaView>
  );
};

export default UserProfileScreen;
