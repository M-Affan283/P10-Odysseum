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
} from "react-native-heroicons/outline";
import images from "../../assets/images/images";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import BusinessManageModal from "../components/BusinessManageModal";

const getQueryUserBusinesses = async ({
  pageParam = 1,
  userId,
  searchQuery,
}) => {
  console.log("Search query: ", searchQuery);

  try 
  {
    const res = await axiosInstance.get(`/business/getByUser?userId=${userId}&page=${pageParam}&searchParam=${searchQuery}`);
    // console.log(res.data);
    return res.data;
  } 
  catch (error) 
  {
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
  useEffect(() => 
  {
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
      getQueryUserBusinesses({pageParam,userId: user?._id,searchQuery: debouncedSearchQuery}),
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
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="m-4">
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity onPress={() => router.back()} className="py-4">
            <ArrowLeftIcon size={30} color="white" />
          </TouchableOpacity>
          <Text className="text-3xl font-dsbold text-purple-500">
            Manage Businesses
          </Text>
        </View>
        <View className="flex-row items-center bg-gray-900 border-purple-400 border rounded-full px-4 py-2 mt-3 shadow-md">
          <MagnifyingGlassIcon size={20} color="purple" />
          <TextInput
            placeholder="Search businesses"
            placeholderTextColor="gray"
            value={searchQuery}
            clearButtonMode="always"
            autoCapitalize="none"
            autoCorrect={false}
            className="flex-1 text-base ml-2 tracking-wider text-white"
            onChangeText={(text) => setSearchQuery(text)}
          />
        </View>
      </View>

      <FlatList
        data={businesses}
        keyExtractor={(item) => item?._id}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
        onEndReached={loadMoreBusiness}
        onEndReachedThreshold={0.5}
        refreshing={isFetchingNextPage}
        onRefresh={handleRefresh}
        contentContainerStyle={{ paddingVertical: 12 }}
        ListEmptyComponent={() => {
          if (isFetching) 
          {
            return (
              <View className="flex-1 mt-8 justify-center items-center">
                <ActivityIndicator size="large" color="#9333ea" />
                <Text className="mt-3 text-gray-300 font-medium">
                  Loading businesses...
                </Text>
              </View>
            );
          } 
          else if (error) 
          {
            return (
              <View className="flex-1 mt-8 justify-center items-center">
                <Text className="text-lg text-red-400 font-medium">
                  Failed to fetch businesses.
                </Text>
                <TouchableOpacity
                  className="mt-4 bg-purple-500 py-2.5 px-6 rounded-lg shadow"
                  onPress={refetch}
                >
                  <Text className="text-white font-medium">Retry</Text>
                </TouchableOpacity>
              </View>
            );
          }
          return null;
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mx-4 mb-4 rounded-xl overflow-hidden shadow-lg"
            onPress={() => selectBusiness(item)}
          >
            <LinearGradient
              colors={["#1e0938", "#2d0a56"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4"
            >
              <View className="flex-row">
                <Image
                  source={
                    item.mediaUrls.length > 0
                      ? { uri: item.mediaUrls[0] }
                      : images.BusinessSearchImg
                  }
                  style={{ width: 70, height: 70, borderRadius: 8 }}
                  className="shadow-md"
                />

                <View className="flex-1 px-4 justify-center">
                  <Text className="text-lg text-white font-bold">
                    {item.name}
                  </Text>
                  <Text className="text-sm text-gray-300 mt-1">
                    {item.category}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    {item.address}
                  </Text>
                </View>

                <View className="justify-center items-center">
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
