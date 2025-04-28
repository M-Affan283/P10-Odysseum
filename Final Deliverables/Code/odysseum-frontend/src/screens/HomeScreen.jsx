import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "../utils/axios";
import { router } from "expo-router";
import PostCard from "../components/PostCard";
import Toast from "react-native-toast-message";
import LottieView from "lottie-react-native";
import {
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  RocketLaunchIcon
} from "react-native-heroicons/solid";
import { LightBulbIcon } from "react-native-heroicons/outline";
import useUserStore from "../context/userStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Keyboard } from "react-native";

const HomeScreen = () => {
  // State for sorting and searching
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterLocationId, setFilterLocationId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const user = useUserStore((state) => state.user);

  // Function to fetch posts from followed users (default)
  const getQueryPosts = async ({
    userId,
    pageParam = 1,
    sortField,
    sortOrder,
  }) => {
    try {
      const res = await axiosInstance.get(
        `/post/getFollowing?requestorId=${userId}&page=${pageParam}&sortField=${sortField}&sortOrder=${sortOrder}`
      );
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Function to fetch posts by a location (filtered by followed users)
  const getFilteredPosts = async ({
    userId,
    pageParam = 1,
    filterLocationId,
  }) => {
    try {
      let endpoint = "";
      if (Array.isArray(filterLocationId)) {
        // Join array of IDs into a comma-separated string.
        const locationIdsStr = filterLocationId.join(",");
        endpoint = `/post/getByLocation?locationIds=${locationIdsStr}&requestorId=${userId}&page=${pageParam}`;
      } else {
        endpoint = `/post/getByLocation?locationId=${filterLocationId}&requestorId=${userId}&page=${pageParam}`;
      }
      const res = await axiosInstance.get(endpoint);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // UseInfiniteQuery: if filterLocationId is set, fetch filtered posts, otherwise default posts.
  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: filterLocationId
      ? ["filteredPosts", filterLocationId]
      : ["posts", sortField, sortOrder],
    queryFn: ({ pageParam = 1 }) => {
      if (filterLocationId) {
        return getFilteredPosts({
          userId: user._id,
          pageParam,
          filterLocationId,
        });
      } else {
        return getQueryPosts({
          userId: user._id,
          pageParam,
          sortField,
          sortOrder,
        });
      }
    },
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  // Memoized item renderer
  const renderItem = useCallback(({ item }) => <PostCard post={item} />, []);

  // Sorting options
  const sortOptions = [
    { label: "Time New-Old", field: "createdAt", order: "desc" },
    { label: "Time Old-New", field: "createdAt", order: "asc" },
    { label: "Popular High-Low", field: "likesCount", order: "desc" },
    { label: "Popular Low-High", field: "likesCount", order: "asc" },
  ];

  // Header: sort & search buttons on left; title at center; chat on right.
  const ListHeaderComponent = useMemo(() => {
    return (
      <LinearGradient
        colors={["rgba(17, 9, 47, 0.9)", "rgba(7, 15, 27, 0.5)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-4 rounded-3xl mb-2 mx-4"
      >
        <View className="flex-row items-center justify-between py-2.5">
          {/* Left side: Column for Sort and Search buttons */}
          <View className="flex-col">
            <TouchableOpacity
              className="bg-[#211655] py-2 px-2 rounded-full shadow-md mb-2 justify-center items-center min-w-[70px] flex-row"
              onPress={() => setSortModalVisible(true)}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <AdjustmentsHorizontalIcon size={18} color="#f8f8ff" />
              <Text className="text-[#f8f8ff] font-bold ml-1">Sort</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-[#211655] py-2 px-2 rounded-full shadow-md justify-center items-center min-w-[70px] flex-row"
              onPress={() => {
                setSearchText("");
                setSuggestions([]);
                setSearchModalVisible(true);
              }}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <MagnifyingGlassIcon size={18} color="#f8f8ff" />
              <Text className="text-[#f8f8ff] font-bold ml-1">Search</Text>
            </TouchableOpacity>
          </View>

          {/* Center: Title - now wrapped in TouchableOpacity to reset all filters */}
          <TouchableOpacity
            className="items-center"
            onPress={() => {
              // Reset filters on pressing the logo
              setFilterLocationId(null);
              setSearchText("");
              setSuggestions([]);
              refetch();
            }}
          >
            <Text
              className="text-white text-[34px] font-dsbold"
              style={{
                textShadowColor: "rgba(123, 97, 255, 0.6)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            >
              Odysseum
            </Text>
            <Text className="text-white/70 text-base font-medium tracking-wider">
              Hello @{user.username}
            </Text>
          </TouchableOpacity>

          {/* Right: Chat button */}
          <TouchableOpacity
            className="bg-[#211655] mr-4 rounded-full p-2"
            onPress={() => router.push("/chat")}
            style={{
              shadowColor: "#7b61ff",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <ChatBubbleLeftRightIcon size={30} color="#f8f8ff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }, [user]);

  // List empty state
  const ListEmptyComponent = useMemo(() => {
    return (
      <SafeAreaView className="flex-1 items-center justify-center pt-20">
        {isFetching ? (
          <LottieView
            source={require("../../assets/animations/Loading2.json")}
            className="w-[120px] h-[120px]"
            autoPlay
            loop
          />
        ) : error ? (
          <View className="items-center p-4 bg-[#191b2a] rounded-2xl">
            <ExclamationCircleIcon size={40} color="#ff5c75" />
            <Text className="text-white text-lg my-2 font-semibold">
              Failed to fetch posts
            </Text>
            <TouchableOpacity
              onPress={handleRefresh}
              className="mt-2.5 bg-[#3d2a84] py-2.5 px-5 rounded-3xl"
            >
              <Text className="text-white font-bold text-base">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="items-center p-4 bg-[#191b2a] rounded-2xl">
            <LightBulbIcon size={40} color="#ffd454" />
            <Text className="text-white text-xl my-2 font-semibold">
              No posts found
            </Text>
            <Text className="text-[#ccc] text-sm text-center">
              Start following users to see their posts
            </Text>
          </View>
        )}
      </SafeAreaView>
    );
  }, [isFetching, error]);

  const loadMorePosts = () => {
    if (hasNextPage) fetchNextPage();
  };

  const handleRefresh = async () => {
    await refetch();
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
          <Text className="text-white/80 text-base font-medium ml-2">
            End of Feed
          </Text>
        </View>
      );
    }

    return null;
  }, [isFetchingNextPage, hasNextPage, posts.length]);

  // Handle search submission (if user taps "Submit")
  const handleSearchSubmit = async () => {
    if (!searchText.trim()) return;
    if (suggestions.length === 1) {
      setFilterLocationId(suggestions[0]._id);
    } else if (suggestions.length > 1) {
      // Use all suggestion IDs.
      setFilterLocationId(suggestions.map((item) => item._id));
    } else {
      setFilterLocationId(null);
      Toast.show({
        type: "info",
        position: "bottom",
        text1: "No location found",
        text2: `No matching location for "${searchText}"`,
        visibilityTime: 3000,
      });
    }
    setSearchModalVisible(false);
    setSearchText("");
    setSuggestions([]);
    refetch();
  };

  // Auto-suggestions for location names: debounce searchText and query backend.
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchText.trim().length > 0) {
        setIsFetchingSuggestions(true);
        axiosInstance
          .get(`/location/search?searchParam=${searchText}&page=1`)
          .then((res) => {
            if (res.data.locations) {
              setSuggestions(res.data.locations);
            }
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => setIsFetchingSuggestions(false));
      } else {
        setSuggestions([]);
      }
    }, 300); // 300ms debounce delay
    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

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

  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">
      {/* SORT MODAL */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={sortModalVisible}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center">
          <View
            className="bg-[#1d1f27] p-5 rounded-2xl w-[90%] shadow-lg"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 8,
            }}
          >
            <Text className="text-xl font-semibold text-white mb-4 text-center">
              Sort Posts
            </Text>
            {sortOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSortField(option.field);
                  setSortOrder(option.order);
                  setSortModalVisible(false);
                  setFilterLocationId(null); // Reset filter when sorting changes.
                }}
                className="py-3.5 border-b border-[#333] items-center"
              >
                <Text className="text-white text-base">{option.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setSortModalVisible(false)}
              className="mt-3 items-center"
            >
              <Text className="text-[#ff5c75] text-base font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SEARCH MODAL */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={searchModalVisible}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center">
          <View
            className="bg-[#1d1f27] p-5 rounded-2xl w-[90%] shadow-lg"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 8,
            }}
          >
            <Text className="text-xl font-semibold text-white mb-4 text-center">
              Search by Location
            </Text>
            <TextInput
              className="bg-[#2a2d36] rounded-lg px-4 py-3 text-white text-base mb-3"
              placeholder="e.g., Chitral"
              placeholderTextColor="#aaa"
              value={searchText}
              onChangeText={setSearchText}
            />
            {suggestions.length > 0 || isFetchingSuggestions ? (
              <ScrollView className="max-h-[150px] mb-3 rounded-lg bg-[#64559D] px-2.5">
                {isFetchingSuggestions ? (
                  <View className="py-2.5 items-center">
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                ) : (
                  suggestions.map((item) => (
                    <TouchableOpacity
                      key={item._id}
                      className="py-2.5 border-b border-[#444]"
                      onPressIn={() => {
                        Keyboard.dismiss(); // Dismiss keyboard immediately
                        setSearchText(item.name);
                        setFilterLocationId(item._id);
                        setSearchModalVisible(false);
                        setSuggestions([]);
                        refetch();
                      }}
                    >
                      <Text className="text-white text-base">{item.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            ) : null}
            <TouchableOpacity
              onPress={handleSearchSubmit}
              className="bg-[#3d2a84] py-3.5 rounded-lg mt-4 items-center"
            >
              <Text className="text-white text-base font-semibold">Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSearchModalVisible(false);
                setSuggestions([]);
              }}
              className="mt-3 items-center"
            >
              <Text className="text-[#ff5c75] text-base font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MAIN FLATLIST */}
      <LinearGradient
        colors={["rgba(17, 9, 47, 0.5)", "rgba(7, 15, 27, 0.9)"]}
        className="flex-1"
      >
        <FlatList
          removeClippedSubviews={true}
          data={posts}
          contentContainerStyle={{ paddingBottom: 90, gap: 20 }}
          keyExtractor={(item) => item._id}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          refreshing={isFetching && !isFetchingNextPage}
          onRefresh={handleRefresh}
          ListHeaderComponent={ListHeaderComponent}
          renderItem={renderItem}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          getItemLayout={(_, index) => ({
            length: 500,
            offset: 500 * index,
            index,
          })}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default HomeScreen;
