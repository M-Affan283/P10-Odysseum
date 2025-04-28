import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import useUserStore from "../context/userStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import axiosInstance from "../utils/axios";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
} from "react-native-heroicons/outline";
import { RocketLaunchIcon } from "react-native-heroicons/solid";
import images from "../../assets/images/images";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import BusinessManageModal from "../components/BusinessManageModal";
import LottieView from "lottie-react-native";
import { RefreshCwOffIcon } from "lucide-react-native";

const getQueryUserBusinesses = async ({
  pageParam = 1,
  userId,
  searchQuery,
}) => {
  console.log("Search query: ", searchQuery);

  try {
    const res = await axiosInstance.get(
      `/business/getByUser?userId=${userId}&page=${pageParam}&searchParam=${searchQuery}`
    );
    // console.log(res.data);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const BusinessManageScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const selectBusiness = (business) => {
    //set business id to state and open modal
    setSelectedBusiness(business);
    setModalVisible(true);
  };

  const user = useUserStore((state) => state.user);
  // console.log("User: ", user);
  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["businessManage", user?._id, debouncedSearchQuery], // Use debounced query in the key
    queryFn: ({ pageParam = 1 }) =>
      getQueryUserBusinesses({
        pageParam,
        userId: user?._id,
        searchQuery: debouncedSearchQuery,
      }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!user?._id, //only work if user id is present
  });

  let businesses = data?.pages.flatMap((page) => page.businesses) || [];

  const loadMoreBusiness = () => {
    if (hasNextPage) fetchNextPage();
  };

  const handleRefresh = async () => {
    await refetch();
  };

  // Footer component for the FlatList to show loading or end of list
  const ListFooterComponent = () => {
    if (isFetchingNextPage) {
      return (
        <View className="items-center justify-center py-3">
          <LottieView
            source={require("../../assets/animations/Loading1.json")}
            className="w-[60px] h-[60px]"
            autoPlay
            loop
          />
        </View>
      );
    }

    if (!hasNextPage && businesses.length > 0) {
      return (
        <View className="items-center justify-center py-3 flex-row">
          <RocketLaunchIcon size={20} color="#7b61ff" />
          <Text className="text-white/80 text-base font-medium ml-2">
            No More Businesses
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">
      <LinearGradient
        colors={["rgba(17, 9, 47, 0.9)", "rgba(7, 15, 27, 0.5)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="py-3 rounded-b-3xl shadow-lg mb-2"
      >
        <View className="px-4 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 p-2 bg-[#211655] rounded-full"
            style={{
              shadowColor: "#7b61ff",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <ChevronLeftIcon size={24} strokeWidth={2.5} color="white" />
          </TouchableOpacity>

          <View className="flex-col">
            <Text
              className="font-dsbold text-white text-2xl"
              style={{
                textShadowColor: "rgba(123, 97, 255, 0.6)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            >
              Manage Businesses
            </Text>
            <Text className="font-medium text-white/70 text-base">
              Select a business to manage
            </Text>
          </View>
        </View>

        <View className="mx-4 mt-4 flex-row items-center bg-[#1a1332] border-[#3d2a84] border rounded-xl px-4 py-2.5 shadow-md">
          <MagnifyingGlassIcon size={20} color="#7b61ff" />
          <TextInput
            placeholder="Search businesses"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={searchQuery}
            clearButtonMode="always"
            autoCapitalize="none"
            autoCorrect={false}
            className="flex-1 text-base ml-2 tracking-wider text-white"
            onChangeText={(text) => setSearchQuery(text)}
          />
        </View>
      </LinearGradient>

      <FlatList
        data={businesses}
        keyExtractor={(item) => item?._id}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
        onEndReached={loadMoreBusiness}
        onEndReachedThreshold={0.5}
        refreshing={isFetching && !isFetchingNextPage}
        onRefresh={handleRefresh}
        style={{ marginTop: 5 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 100,
          gap: 16,
        }}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={() => {
          if (isFetching && !isFetchingNextPage) {
            return (
              <View className="flex-1 mt-12 justify-center items-center">
                <LottieView
                  source={require("../../assets/animations/Loading1.json")}
                  autoPlay
                  loop
                  style={{ width: 120, height: 120 }}
                />
                <Text className="mt-4 text-white/70 font-medium">
                  Retrieving businesses...
                </Text>
              </View>
            );
          } else if (error) {
            return (
              <View className="flex-1 mt-12 justify-center items-center">
                <Text className="text-lg text-red-400 font-medium">
                  Failed to fetch businesses.
                </Text>
                <TouchableOpacity
                  className="mt-4 bg-indigo-600 py-3 px-5 rounded-xl"
                  onPress={refetch}
                >
                  <Text className="text-white font-bold">Retry</Text>
                </TouchableOpacity>
              </View>
            );
          } else if (businesses?.length === 0) {
            return (
              <View className="flex-1 mt-12 justify-center items-center">
                <RefreshCwOffIcon size={60} color="#7b61ff" />
                <Text className="text-lg text-white/70 font-medium mt-4">
                  No businesses found
                </Text>
              </View>
            );
          }
          return null;
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mb-2 overflow-hidden rounded-xl"
            activeOpacity={0.8}
            onPress={() => selectBusiness(item)}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 6,
            }}
          >
            <LinearGradient
              colors={["rgba(33, 18, 66, 0.95)", "rgba(24, 17, 50, 0.98)"]}
              className="rounded-xl overflow-hidden border border-[#372d5b]"
            >
              <View className="relative">
                <Image
                  source={
                    item.mediaUrls?.length > 0
                      ? { uri: item.mediaUrls[0] }
                      : images.BusinessSearchImg
                  }
                  style={{ width: "100%", height: 140 }}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.7)"]}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 70,
                  }}
                />
              </View>

              <View className="p-4">
                <View className="flex-row justify-between items-start">
                  <Text
                    className="font-dsbold text-2xl text-white flex-1 mr-2"
                    numberOfLines={1}
                    style={{
                      textShadowColor: "rgba(123, 97, 255, 0.4)",
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    }}
                  >
                    {item.name}
                  </Text>

                  <View className="bg-[#372d5b] px-3 py-1 rounded-full">
                    <Text className="text-[#b8a9ff] font-medium text-xs">
                      {item.category}
                    </Text>
                  </View>
                </View>

                <Text
                  className="text-gray-300 font-medium text-sm mt-2"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.address}
                </Text>

                <View className="mt-3 flex-row justify-between items-center">
                  <LinearGradient
                    colors={
                      item.status === "Approved"
                        ? ["#0d331d", "#10512e"]
                        : item.status === "Pending"
                        ? ["#3a3000", "#554700"]
                        : ["#330d0d", "#501010"]
                    }
                    className="px-3 py-1 rounded-full border"
                    style={{
                      borderColor:
                        item.status === "Approved"
                          ? "#22c55e"
                          : item.status === "Pending"
                          ? "#eab308"
                          : "#ef4444",
                    }}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        item.status === "Approved"
                          ? "text-green-400"
                          : item.status === "Pending"
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {item.status}
                    </Text>
                  </LinearGradient>

                  <TouchableOpacity
                    className="bg-[#3d2a84] px-4 py-2 rounded-full"
                    onPress={() => selectBusiness(item)}
                  >
                    <Text className="text-white font-bold text-xs">Manage</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />

      <BusinessManageModal
        business={selectedBusiness}
        visible={modalVisible}
        setVisible={setModalVisible}
      />
    </SafeAreaView>
  );
};

export default BusinessManageScreen;
