import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import useUserStore from "../context/userStore";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "../../assets/images/images";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";

// Function to fetch location bookmarks
const getLocationBookmarks = async ({ userId, pageParam = 1, searchParam = "" }) => 
{
    try
    {
        const response = await axiosInstance.get(`/user/getLocationBookmarks?userId=${userId}&page=${pageParam}&searchParam=${searchParam}`);
        return response.data;
    }
    catch(error)
    {
        console.error("Error fetching location bookmarks:", error);
        throw error;
    }
};

// Function to fetch business bookmarks
const getBusinessBookmarks = async ({ userId, pageParam = 1, searchParam = "" }) =>
{
  
    try
    {
        const response = await axiosInstance.get(`/user/getBusinessBookmarks?userId=${userId}&page=${pageParam}&searchParam=${searchParam}`);
        return response.data;
    }
    catch(error)
    {
        console.error("Error fetching business bookmarks:", error);
        throw error;
    }
};

const BookmarkScreen = () => {
  const user = useUserStore((state) => state.user);
  // State for tracking active tab - 'locations' or 'businesses'
  const [activeTab, setActiveTab] = useState("locations");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Set up debounce for search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  // Infinite query for location bookmarks
  const {
    data: locationsData,
    fetchNextPage: fetchNextLocations,
    hasNextPage: hasNextLocationsPage,
    isFetchingNextPage: isFetchingNextLocations,
    isLoading: isLoadingLocations,
    isError: isErrorLocations,
    error: locationsError,
    refetch: refetchLocations,
  } = useInfiniteQuery({
    queryKey: ["locationBookmarks", debouncedSearch],
    queryFn: ({ pageParam = 1}) => getLocationBookmarks({userId: user._id, pageParam, searchParam: debouncedSearch}),
    getNextPageParam: (lastPage) => {
        const { currentPage, totalPages } = lastPage;
        return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: activeTab === "locations",
  });

  // Infinite query for business bookmarks
  const {
    data: businessesData,
    fetchNextPage: fetchNextBusinesses,
    hasNextPage: hasNextBusinessesPage,
    isFetchingNextPage: isFetchingNextBusinesses,
    isLoading: isLoadingBusinesses,
    isError: isErrorBusinesses,
    error: businessesError,
    refetch: refetchBusinesses,
  } = useInfiniteQuery({
    queryKey: ["businessBookmarks", debouncedSearch],
    queryFn: ({ pageParam = 1}) => getBusinessBookmarks({userId: user._id, pageParam, searchParam: debouncedSearch}),
    getNextPageParam: (lastPage) => {
        const { currentPage, totalPages } = lastPage;
        return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: activeTab === "businesses",
  });

  // Prepare the flattened data
  const locationBookmarks = locationsData?.pages.flatMap((page) => page.bookmarks) || [];
  const businessBookmarks = businessesData?.pages.flatMap((page) => page.bookmarks) || [];

  // Function to load more when nearing the end of the list
  const loadMore = () => {
    if (activeTab === "locations" &&hasNextLocationsPage &&!isFetchingNextLocations ) fetchNextLocations();
    else if (activeTab === "businesses" && hasNextBusinessesPage && !isFetchingNextBusinesses) fetchNextBusinesses();
  };

  // Refresh function for pull-to-refresh
  const onRefresh = useCallback(() => {
    if (activeTab === "locations") refetchLocations();
    else refetchBusinesses();
  }, [activeTab, refetchLocations, refetchBusinesses]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Optionally force refetch when tab changes
    if (tab === "locations" && locationsData === undefined) refetchLocations();
    else if (tab === "businesses" && businessesData === undefined) refetchBusinesses();
  };

  // Current data based on active tab
  const currentBookmarks = activeTab === "locations" ? locationBookmarks : businessBookmarks;
  const isLoading = activeTab === "locations" ? isLoadingLocations : isLoadingBusinesses;
  const isError = activeTab === "locations" ? isErrorLocations : isErrorBusinesses;
  const error = activeTab === "locations" ? locationsError : businessesError;

  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="space-y-6 mt-10"
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 20;
          if (isCloseToBottom) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
        refreshControl={
          <RefreshControl
            refreshing={
              isLoading && !isFetchingNextLocations && !isFetchingNextBusinesses
            }
            onRefresh={onRefresh}
            tintColor="black"
            colors={["#070f1b"]}
          />
        }
      >
        <View className="mx-7 flex-row justify-between items-center mb-6">
          <Text className="font-dsbold text-neutral-200 text-3xl">
            Bookmarks
          </Text>

          <TouchableOpacity>
            <Image
              source={images.BookmarkImg}
              style={{ width: 120, height: 120, borderRadius: 9999 }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>

        {/* Tab Selector with Icons */}
        <View className="mx-5 flex-row bg-[#131e2c] rounded-xl p-1 mb-2">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${
              activeTab === "locations" ? "bg-[#253546]" : ""
            }`}
            onPress={() => handleTabChange("locations")}
          >
            <View className="flex-row justify-center items-center space-x-2">
              <Ionicons
                name="location"
                size={18}
                color={activeTab === "locations" ? "#fff" : "#a0aec0"}
              />
              <Text
                className={`text-center ${
                  activeTab === "locations"
                    ? "text-white font-bold"
                    : "text-gray-400"
                }`}
              >
                Locations
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${
              activeTab === "businesses" ? "bg-[#253546]" : ""
            }`}
            onPress={() => handleTabChange("businesses")}
          >
            <View className="flex-row justify-center items-center space-x-2">
              <FontAwesome
                name="building-o"
                size={16}
                color={activeTab === "businesses" ? "#fff" : "#a0aec0"}
              />
              <Text
                className={`text-center ${
                  activeTab === "businesses"
                    ? "text-white font-bold"
                    : "text-gray-400"
                }`}
              >
                Businesses
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search bookmarks */}
        <View className="mx-5 mb-4">
          <View className="flex-row items-center border-gray-200 border rounded-full space-x-2 pl-6">
            <MaterialIcons name="search" size={20} color="white" />

            <TextInput
              placeholder={`Search ${activeTab}`}
              placeholderTextColor={"gray"}
              value={search}
              className="flex-1 text-base mb-1 pl-1 tracking-wider text-white"
              onChangeText={(text) => setSearch(text)}
            />
          </View>
        </View>

        {/* Loading State */}
        {isLoading && !currentBookmarks.length && (
          <View className="mx-5 items-center justify-center py-10">
            <ActivityIndicator size="large" color="#fff" />
            <Text className="text-gray-400 mt-4 text-center">
              Loading your bookmarks...
            </Text>
          </View>
        )}

        {/* Error State */}
        {isError && (
          <View className="mx-5 items-center justify-center py-10">
            <MaterialIcons name="error-outline" size={60} color="#ff6b6b" />
            <Text className="text-red-400 mt-4 text-center text-lg">
              Error loading bookmarks
            </Text>
            <Text className="text-gray-500 mt-2 text-center">
              {error?.message || "Please try again later"}
            </Text>
            <TouchableOpacity
              className="mt-4 bg-[#253546] px-4 py-2 rounded-full"
              onPress={onRefresh}
            >
              <Text className="text-white">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Show no bookmarks message if empty */}
        {!isLoading && !isError && currentBookmarks.length === 0 && (
          <View className="mx-5 items-center justify-center py-10">
            <MaterialIcons name="bookmark-border" size={60} color="#546880" />
            <Text className="text-gray-400 mt-4 text-center text-lg">
              No {activeTab} bookmarks found
            </Text>
            <Text className="text-gray-500 mt-2 text-center">
              Bookmark your favorite {activeTab.slice(0, -1)} to see them here
            </Text>
          </View>
        )}

        {/* Show bookmarks */}
        {currentBookmarks.length > 0 && (
          <View className="mx-5 flex-row justify-between flex-wrap">
            {currentBookmarks.map((bookmark, index) => (
              <BookMarkCard
                bookmark={bookmark}
                key={index}
                type={activeTab === "locations" ? "location" : "business"}
              />
            ))}
          </View>
        )}

        {/* Loading more indicator at bottom */}
        {(isFetchingNextLocations || isFetchingNextBusinesses) && (
          <View className="items-center pb-5">
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const BookMarkCard = ({ bookmark, type }) => {
  const handlePress = () => {
    // Navigate to appropriate screen based on bookmark type
    if (type === "location") {
      router.push(`/location/${bookmark._id}`);
    } else {
      router.push(`/business/profile/${bookmark._id}`);
    }
  };

  return (
    <TouchableOpacity
      className="flex justify-end relative p-0 py-6 space-y-2 mb-4"
      style={{ width: "44%", height: 150 }}
      onPress={handlePress}
    >
      {
        type === "location" ? (
          <Image
            source={
              bookmark?.imageUrl
                ? { uri: bookmark?.imageUrl }
                : images.DefaultBookmarkImg
            }
            className="absolute rounded-lg h-full w-full"
          />
        ) : (
          <Image
            source={
              bookmark?.mediaUrls[0]
                ? { uri: bookmark?.mediaUrls[0] }
                : images.DefaultBookmarkImg
            }
            className="absolute rounded-lg h-full w-full"
          />
        )

      }

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,1)"]}
        style={{ width: "100%", height: 50 }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        className="absolute bottom-0 rounded-b-lg"
      />

      <View className="px-2">
        <Text className="text-white font-semibold">{bookmark.name}</Text>
        {type === "business" && bookmark.category && (
          <Text className="text-gray-300 text-xs">{bookmark.category}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default BookmarkScreen;
