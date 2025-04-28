import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Animated,
} from "react-native";
import { useState, useEffect, useCallback, useRef } from "react";
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
  RocketLaunchIcon,
  BookmarkIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
} from "react-native-heroicons/solid";
import LottieView from "lottie-react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import useUserStore from "../context/userStore";
import { LinearGradient } from "expo-linear-gradient";

const imageWidth = (Dimensions.get("window").width - 30) / 2;
const SCREEN_WIDTH = Dimensions.get("window").width;

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
  const [activeTab, setActiveTab] = useState("posts");
  const scrollY = useRef(new Animated.Value(0)).current;

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

  const ProfileStat = ({ text, subText, icon }) => {
    return (
      <View
        style={{
          alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.08)",
          borderRadius: 15,
          padding: 12,
          minWidth: 90,
        }}
      >
        {icon}
        <Text
          style={{
            fontWeight: "600",
            fontSize: 22,
            color: "white",
            marginTop: 5,
          }}
        >
          {text}
        </Text>
        <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
          {subText}
        </Text>
      </View>
    );
  };

  const TabButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: isActive ? 2 : 0,
        borderBottomColor: "#7b61ff",
      }}
    >
      <Text
        style={{
          color: isActive ? "white" : "rgba(255,255,255,0.6)",
          fontWeight: isActive ? "600" : "400",
          fontSize: 16,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const ListHeaderComponent = () => {
    const headerHeight = scrollY.interpolate({
      inputRange: [0, 200],
      outputRange: [300, 200],
      extrapolate: "clamp",
    });

    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 200],
      outputRange: [1, 0.3],
      extrapolate: "clamp",
    });

    return (
      <View>
        <Animated.View
          style={{
            height: headerHeight,
            opacity: headerOpacity,
          }}
        >
          <ImageBackground
            source={{ uri: user.profilePicture }}
            style={{
              width: "100%",
              height: 250,
              justifyContent: "space-between",
            }}
          >
            <LinearGradient
              colors={[
                "rgba(7, 15, 27, 0.7)",
                "transparent",
                "rgba(7, 15, 27, 0.9)",
              ]}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
              }}
            />

            <View className="flex-row justify-between p-4">
              <TouchableOpacity
                className="bg-black/30 p-2 rounded-full"
                onPress={() => router.push("/user/booking/bookings")}
              >
                <TicketIcon size={24} color="white" />
              </TouchableOpacity>

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => router.push("/settings")}
                  className="bg-black/30 p-2 rounded-full"
                >
                  <Cog6ToothIcon size={24} strokeWidth={1.5} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-black/30 p-2 rounded-full"
                  onPress={userLogout}
                >
                  <MaterialIcons name="logout" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="px-5 pb-16">
              <Text className="font-bold text-2xl text-white drop-shadow-lg">
                {user?.firstName + " " + user?.lastName}
              </Text>
              <Text className="text-white/80 text-base">@{user?.username}</Text>
            </View>
          </ImageBackground>
        </Animated.View>

        <View className="px-5 -mt-20 z-10">
          <View className="bg-[#191a2b] rounded-3xl p-5 shadow-lg">
            <View className="flex-row items-center mb-4">
              <Image
                source={{ uri: user.profilePicture }}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  borderWidth: 3,
                  borderColor: "#7b61ff",
                }}
              />
              <View className="ml-3 flex-1">
                <Text 
                  className="font-bold text-lg text-white"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {user?.firstName + " " + user?.lastName}
                </Text>
                <Text 
                  className="text-white/60"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  @{user?.username}
                </Text>
              </View>
            </View>

            {user?.bio && (
              <Text className="text-white/80 mb-5">{user.bio}</Text>
            )}

            <View className="flex-row justify-around py-3">
              <ProfileStat
                text={user?.followers?.length || 0}
                subText="Followers"
                icon={<HeartIcon size={20} color="#7b61ff" />}
              />
              <ProfileStat
                text={user?.following?.length || 0}
                subText="Following"
                icon={<BookmarkIcon size={20} color="#7b61ff" />}
              />
              <ProfileStat
                text={posts?.length || 0}
                subText="Posts"
                icon={<ChatBubbleLeftIcon size={20} color="#7b61ff" />}
              />
            </View>
          </View>
        </View>

        <View className="mt-5 mb-2 flex-row justify-center">
          <TabButton
            title="Posts"
            isActive={activeTab === "posts"}
            onPress={() => setActiveTab("posts")}
          />
          <TabButton
            title="Saved"
            isActive={activeTab === "saved"}
            onPress={() => setActiveTab("saved")}
          />
          <TabButton
            title="Liked"
            isActive={activeTab === "liked"}
            onPress={() => setActiveTab("liked")}
          />
        </View>
      </View>
    );
  };

  const ListEmptyComponent = () => {
    return (
      <SafeAreaView className="flex justify-center items-center px-4 py-10">
        {isFetching ? (
          <LottieView
            source={require("../../assets/animations/Loading1.json")}
            style={{
              width: 120,
              height: 120,
            }}
            autoPlay
            loop
          />
        ) : error ? (
          <View className="flex justify-center items-center bg-[#1E293B]/60 p-6 rounded-xl">
            <ExclamationCircleIcon size={40} color="#EF4444" />
            <Text className="text-xl text-center font-semibold text-white mt-3">
              Something went wrong
            </Text>
            <Text className="text-white/70 text-center mt-1">
              Please try again later
            </Text>
            <TouchableOpacity
              className="mt-4 bg-[#3B82F6] py-2 px-4 rounded-lg"
              onPress={() => refetch()}
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex justify-center items-center bg-[#1E293B]/60 p-6 rounded-xl">
            <LottieView
              source={require("../../assets/animations/Empty.json")}
              style={{
                width: 150,
                height: 150,
              }}
              autoPlay
              loop
            />
            <Text className="text-xl text-center font-semibold text-white mt-2">
              Such empty
            </Text>
            <Text className="text-white/70 text-center mt-1">Much wow</Text>
          </View>
        )}
      </SafeAreaView>
    );
  };

  const renderItem = ({ item, index }) => {
    const isEven = index % 2 === 0;
    return (
      <TouchableOpacity
        className="relative"
        style={{
          padding: 5,
          width: "50%",
          height: isEven ? 220 : 250,
        }}
        onPress={() => router.push(`/post/${item._id}`)}
      >
        <View className="relative flex-1 overflow-hidden rounded-xl">
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: 60,
              zIndex: 1,
            }}
          />

          {item.mediaUrls.length > 1 && (
            <View
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                borderRadius: 12,
                padding: 4,
              }}
            >
              <Foundation name="page-multiple" size={16} color="white" />
            </View>
          )}

          <Image
            source={{ uri: item.mediaUrls[0] }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 12,
            }}
            resizeMode="cover"
          />
        </View>
      </TouchableOpacity>
    );
  };

  // Footer component for the FlatList to show loading or end of list
  const ListFooterComponent = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="items-center justify-center py-3">
          <LottieView
            source={require("../../assets/animations/Loading2.json")}
            className="w-[60px] h-[60px]"
            autoPlay
            loop
          />
        </View>
      );
    }

    if (!hasNextPage && posts.length > 0) {
      return (
        <View className="items-center justify-center py-3 flex-row">
          <RocketLaunchIcon size={20} color="#7b61ff" />
          <Text className="text-white/80 text-base font-medium ml-2">Fin</Text>
        </View>
      );
    }

    return null;
  }, [isFetchingNextPage, hasNextPage, posts.length]);

  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">
      <Animated.FlatList
        data={activeTab === "posts" ? posts : []}
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
        ListFooterComponent={ListFooterComponent}
        renderItem={renderItem}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
    </SafeAreaView>
  );
};

export default UserProfileScreen;
