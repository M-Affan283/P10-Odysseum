import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Modal,
  TextInput,
  Animated,
} from "react-native";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import useUserStore from "../context/userStore";
import { router } from "expo-router";
import axiosInstance from "../utils/axios";
import ReportModal from "../components/ReportModal";
import Foundation from "@expo/vector-icons/Foundation";
import LottieView from "lottie-react-native";
import {
  ChevronLeftIcon,
  ExclamationCircleIcon,
  UserPlusIcon,
  RocketLaunchIcon,
  BookmarkIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
} from "react-native-heroicons/solid";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

const imageWidth = (Dimensions.get("window").width - 30) / 2;
const SCREEN_WIDTH = Dimensions.get("window").width;

const getQueryUserPosts = async ({ pageParam = 1, userId, requestorId }) => {
  console.log("Fetching user posts...");

  try {
    const res = await axiosInstance.get(
      `/post/getUserPosts?page=${pageParam}&userId=${userId}&requestorId=${requestorId}`
    );

    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getQueryUserData = async ({ userId, requestorId }) => {
  console.log("Fetching user data...");

  try {
    const res = await axiosInstance.get(
      `/user/getById?userToViewId=${userId}&requestorId=${requestorId}`
    );

    return res.data;
  } catch (error) {
    console.log("Error fetching user data:", error);
    throw error;
  }
};

const SingleUserProfileScreen = ({ userId }) => {
  // console.log("User ID: ", userId);

  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [following, setFollowing] = useState(false); //to update follow button

  const [showReportModal, setShowReportModal] = useState(false);

  const {
    data: userData,
    isFetching: isFetchingUser,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getQueryUserData({ userId, requestorId: user._id }),
    // enabled: !!user,
  });

  const userToView = userData?.user || {};

  const {
    data: postData,
    isFetching: isFetchingPosts,
    isFetchingNextPage: isFetchingNextPagePost,
    fetchNextPage: fetchNextPagePost,
    hasNextPage: hasNextPagePosts,
    error: postError,
    refetch: refetchPosts,
    isRefetching: isRefetchingPosts,
  } = useInfiniteQuery({
    queryKey: ["posts", userId], // read as posts of user with id userId (usertoViewId)
    queryFn: ({ pageParam = 1 }) =>
      getQueryUserPosts({ pageParam, userId: userId, requestorId: user._id }),
    // initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    // enabled: !!user,
  });

  // const posts = user?.posts || []; // use for ui testing
  const posts = postData?.pages.map((page) => page.posts).flat() || [];
  // console.log(posts)

  useEffect(() => {
    if (userToView.followed) setFollowing(true);
  }, [userToView]);

  useEffect(() => {
    if (postError) {
      console.log("Post error:", postError);
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "An error occurred while fetching posts",
        text2: postError.message,
        visibilityTime: 3000,
      });
    }
  }, [postError]);

  useEffect(() => {
    if (userError) {
      console.log("User error:", userError);
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "An error occurred while fetching user data",
        text2: userError.message,
        visibilityTime: 3000,
      });
    }
  }, [userError]);

  //will follow or unfollow the user
  const followUser = async () => {
    console.log("Following user...");

    setFollowing(!following);

    try {
      const response = await axiosInstance.post("/user/follow", {
        userId: user._id,
        userToFollowId: userId,
      });

      //update user context user.following and push to userId in it or remove it
      if (response.data.status === "unfollowed") {
        setUser({
          ...user,
          following: user.following.filter((following) => following !== userId),
        });
      } else if (response.data.status === "followed") {
        setUser({ ...user, following: [...user.following, userId] });
      }

      // console.log(user)
      // console.log(response.data.message);
    } catch (err) {
      console.log("Error following user:", err.response.data.message);
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "An error occurred while following user",
        text2: err.response.data.message,
        visibilityTime: 3000,
      });
      setFollowing(!following);
    }
  };

  const loadMorePosts = () => {
    if (hasNextPagePosts) fetchNextPagePost();
  };

  const handleRefresh = async () => {
    await refetchUser();
    await refetchPosts();
  };

  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState("posts");

  const ProfileStat = React.memo(({ text, subText, icon }) => {
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
  });

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

    return isFetchingUser ? (
      <View className="flex justify-center items-center mt-6 mb-12 px-4">
        <LottieView
          source={require("../../assets/animations/Loading1.json")}
          style={{
            width: 100,
            height: 100,
          }}
          autoPlay
          loop
        />
      </View>
    ) : (
      <View>
        <Animated.View
          style={{
            height: headerHeight,
            opacity: headerOpacity,
          }}
        >
          <ImageBackground
            source={{ uri: userToView?.profilePicture }}
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
                onPress={() => router.back()}
                className="bg-black/30 p-2 rounded-full"
              >
                <ChevronLeftIcon size={24} strokeWidth={2.5} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowReportModal(true)}
                className="bg-black/30 p-2 rounded-full"
              >
                <MaterialIcons name="report" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <View className="px-5 pb-16">
              <Text className="font-bold text-2xl text-white drop-shadow-lg">
                {userToView?.firstName + " " + userToView?.lastName}
              </Text>
              <Text className="text-white/80 text-base">
                @{userToView?.username}
              </Text>
            </View>
          </ImageBackground>
        </Animated.View>

        <View className="px-5 -mt-20 z-10">
          <View className="bg-[#191a2b] rounded-3xl p-5 shadow-lg">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center flex-1 mr-3">
                <Image
                  source={{ uri: userToView?.profilePicture }}
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
                    {userToView?.firstName + " " + userToView?.lastName}
                  </Text>
                  <Text
                    className="text-white/60"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    @{userToView?.username}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={followUser}
                className={`p-3 rounded-full ${
                  following ? "bg-[#7b61ff]/20" : "bg-[#7b61ff]"
                }`}
              >
                {following ? (
                  <FontAwesome5 name="user-check" size={20} color="#7b61ff" />
                ) : (
                  <UserPlusIcon size={20} strokeWidth={1.5} color="white" />
                )}
              </TouchableOpacity>
            </View>

            {userToView?.bio && (
              <Text className="text-white/80 mb-5">
                {userToView.bio || "Such empty. Much wow."}
              </Text>
            )}

            <View className="flex-row justify-around py-3">
              <ProfileStat
                text={userToView?.followers?.length || 0}
                subText="Followers"
                icon={<HeartIcon size={20} color="#7b61ff" />}
              />
              <ProfileStat
                text={userToView?.following?.length || 0}
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

        {/* Remove the tabs section entirely since we only have posts to show */}
        {/* No need for the empty space that was used by the tabs */}
        <View className="mb-2">
          {/* This is just a spacer to maintain layout consistency */}
        </View>
      </View>
    );
  };

  const ListEmptyComponent = () => {
    return (
      <SafeAreaView className="flex justify-center items-center px-4 py-10">
        {isFetchingPosts ? (
          <LottieView
            source={require("../../assets/animations/Loading1.json")}
            style={{
              width: 120,
              height: 120,
            }}
            autoPlay
            loop
          />
        ) : postError ? (
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
              onPress={() => refetchPosts()}
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex justify-center items-center bg-[#1E293B]/60 p-6 rounded-xl">
            <Text className="text-xl text-center font-semibold text-white mt-2">
              No posts yet
            </Text>
            <Text className="text-white/70 text-center mt-1">
              This user hasn't shared any adventures yet
            </Text>
          </View>
        )}
      </SafeAreaView>
    );
  };

  // Footer component for the FlatList to show loading or end of list
  const ListFooterComponent = useCallback(() => {
    if (isFetchingNextPagePost) {
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

    if (!hasNextPagePosts && posts.length > 0) {
      return (
        <View className="items-center justify-center py-3 flex-row">
          <RocketLaunchIcon size={20} color="#7b61ff" />
          <Text className="text-white/80 text-base font-medium ml-2">Fin</Text>
        </View>
      );
    }

    return null;
  }, [isFetchingNextPagePost, hasNextPagePosts, posts.length]);

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

  return (
    <SafeAreaView className="bg-[#070f1b] flex-1">
      <Animated.FlatList
        data={posts} // Just use posts directly, no need for tab condition
        keyExtractor={(item) => item._id}
        key={"_"}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 70 }}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        refreshing={
          isRefetchingPosts && isFetchingUser && !isFetchingNextPagePost
        }
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

      {/* Add Report Modal */}
      <ReportModal
        entityId={userId}
        reportType="User"
        visible={showReportModal}
        setVisible={setShowReportModal}
      />
    </SafeAreaView>
  );
};

export default SingleUserProfileScreen;
