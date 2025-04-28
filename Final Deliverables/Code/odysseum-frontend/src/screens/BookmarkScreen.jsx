import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Animated,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { useEffect, useState, useCallback, useRef } from "react";
import useUserStore from "../context/userStore";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "../../assets/images/images";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Ionicons,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";
import { Component, MapPinIcon } from "lucide-react-native";

const { width, height } = Dimensions.get("window");
const cardWidth = width * 0.44;
const cardHeight = height * 0.26;

// Function to fetch location bookmarks
const getLocationBookmarks = async ({
  userId,
  pageParam = 1,
  searchParam = "",
}) => {
  try {
    const response = await axiosInstance.get(
      `/user/getLocationBookmarks?userId=${userId}&page=${pageParam}&searchParam=${searchParam}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching location bookmarks:", error);
    throw error;
  }
};

// Function to fetch business bookmarks
const getBusinessBookmarks = async ({
  userId,
  pageParam = 1,
  searchParam = "",
}) => {
  try {
    const response = await axiosInstance.get(
      `/user/getBusinessBookmarks?userId=${userId}&page=${pageParam}&searchParam=${searchParam}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching business bookmarks:", error);
    throw error;
  }
};

const BookmarkScreen = () => {
  const user = useUserStore((state) => state.user);
  const [activeTab, setActiveTab] = useState("locations");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchInputRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  // Remove tabAnimation ref and its initialization

  // Remove tab animation effect

  // Search input animation values
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchFocusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(searchFocusAnim, {
      toValue: isSearchFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isSearchFocused]);

  // Animated header opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [0, 0.7, 1],
    extrapolate: "clamp",
  });

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
    queryFn: ({ pageParam = 1 }) =>
      getLocationBookmarks({
        userId: user._id,
        pageParam,
        searchParam: debouncedSearch,
      }),
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
    queryFn: ({ pageParam = 1 }) =>
      getBusinessBookmarks({
        userId: user._id,
        pageParam,
        searchParam: debouncedSearch,
      }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: activeTab === "businesses",
  });

  // Prepare the flattened data
  const locationBookmarks =
    locationsData?.pages.flatMap((page) => page.bookmarks) || [];
  const businessBookmarks =
    businessesData?.pages.flatMap((page) => page.bookmarks) || [];

  // Function to load more when nearing the end of the list
  const loadMore = () => {
    if (
      activeTab === "locations" &&
      hasNextLocationsPage &&
      !isFetchingNextLocations
    )
      fetchNextLocations();
    else if (
      activeTab === "businesses" &&
      hasNextBusinessesPage &&
      !isFetchingNextBusinesses
    )
      fetchNextBusinesses();
  };

  // Refresh function for pull-to-refresh
  const onRefresh = useCallback(() => {
    if (activeTab === "locations") refetchLocations();
    else refetchBusinesses();
  }, [activeTab, refetchLocations, refetchBusinesses]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "locations" && locationsData === undefined) refetchLocations();
    else if (tab === "businesses" && businessesData === undefined)
      refetchBusinesses();
  };

  // Current data based on active tab
  const currentBookmarks =
    activeTab === "locations" ? locationBookmarks : businessBookmarks;
  const isLoading =
    activeTab === "locations" ? isLoadingLocations : isLoadingBusinesses;
  const isError =
    activeTab === "locations" ? isErrorLocations : isErrorBusinesses;
  const error = activeTab === "locations" ? locationsError : businessesError;
  const isFetchingNext =
    activeTab === "locations"
      ? isFetchingNextLocations
      : isFetchingNextBusinesses;

  // Remove tabIndicatorPosition setup

  // Search input width animation
  const searchWidth = searchFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["88%", "100%"],
  });

  const renderItem = ({ item, index }) => (
    <BookMarkCard
      bookmark={item}
      type={activeTab === "locations" ? "location" : "business"}
      index={index}
    />
  );

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.headerText}>
        {currentBookmarks.length > 0
          ? `${currentBookmarks.length} ${activeTab}`
          : !isLoading
          ? `No ${activeTab} found`
          : ""}
      </Text>
    </View>
  );

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.emptyText}>Loading your bookmarks...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.errorIconContainer}>
            <MaterialIcons name="error-outline" size={40} color="#ff6b6b" />
          </View>
          <Text style={styles.emptyTextError}>Couldn't load bookmarks</Text>
          <Text style={styles.emptyTextSub}>
            {error?.message || "Please try again later"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Feather name="refresh-cw" size={16} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (currentBookmarks.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            {activeTab === "locations" ? (
              <Ionicons name="location-outline" size={50} color="#546880" />
            ) : (
              <FontAwesome name="building-o" size={46} color="#546880" />
            )}
          </View>
          <Text style={styles.emptyTextBold}>No {activeTab} saved yet</Text>
          <Text style={styles.emptyTextSub}>
            {`Bookmark your favorite ${
              activeTab === "locations" ? "places" : "businesses"
            } to see them here`}
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderFooter = () => {
    if (!isFetchingNext) return null;

    return (
      <View style={styles.listFooter}>
        <ActivityIndicator size="small" color="#fff" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">
      <StatusBar barStyle="light-content" />

      {/* Floating header with gradient background instead of blur */}
      <Animated.View
        className="absolute top-0 left-0 right-0 z-10"
        style={[
          { opacity: headerOpacity, height: Platform.OS === "ios" ? 120 : 100 },
        ]}
      >
        <View className="absolute inset-0 bg-[#070f1b]/90" />
      </Animated.View>

      {/* Header */}
      <View className="px-5 pt-3 pb-4 flex-row justify-between items-center z-20">
        <Text className="text-white text-3xl font-dsbold">
          My Bookmarks
        </Text>
        <TouchableOpacity className="rounded-full overflow-hidden bg-[#1a2535]">
          <Image
            source={images.BookmarkImg}
            style={{ width: 100, height: 100, borderRadius: 9999 }}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <Animated.View style={{ width: searchWidth }} className="px-5 mb-4 z-20">
        <View className="flex-row items-center h-[46px] bg-[#131e2c] rounded-xl px-3">
          <MaterialIcons
            name="search"
            size={20}
            color="#a0aec0"
            className="mr-2"
          />
          <TextInput
            ref={searchInputRef}
            placeholder={`Search ${activeTab}...`}
            placeholderTextColor="#718096"
            value={search}
            onChangeText={setSearch}
            className="flex-1 h-full text-base text-white py-2"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} className="p-1">
              <Feather name="x" size={18} color="#718096" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Tab Selector - Simplified without animation */}
      <View className="flex-row mx-5 bg-[#131e2c] rounded-xl mb-5 z-20 overflow-hidden">
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-3 ${
            activeTab === "locations" ? "bg-[#253546]" : ""
          }`}
          onPress={() => handleTabChange("locations")}
        >
          <Ionicons
            name="location"
            size={18}
            color={activeTab === "locations" ? "#38bdf8" : "#718096"}
          />
          <Text
            className={`ml-2 text-[15px] font-medium ${
              activeTab === "locations"
                ? "text-white font-semibold"
                : "text-[#718096]"
            }`}
          >
            Locations
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-3 ${
            activeTab === "businesses" ? "bg-[#253546]" : ""
          }`}
          onPress={() => handleTabChange("businesses")}
        >
          <FontAwesome
            name="building-o"
            size={16}
            color={activeTab === "businesses" ? "#38bdf8" : "#718096"}
          />
          <Text
            className={`ml-2 text-[15px] font-medium ${
              activeTab === "businesses"
                ? "text-white font-semibold"
                : "text-[#718096]"
            }`}
          >
            Businesses
          </Text>
        </TouchableOpacity>

        {/* Remove the Animated tab indicator view entirely */}
      </View>

      {/* Bookmark List */}
      <FlatList
        data={currentBookmarks}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && !isFetchingNext}
            onRefresh={onRefresh}
            tintColor="#38bdf8"
            colors={["#38bdf8"]}
            progressBackgroundColor="#131e2c"
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
    </SafeAreaView>
  );
};

const BookMarkCard = ({ bookmark, type, index }) => {
  // Animation for card appearance
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Stagger the animations based on index
    const delay = index * 100;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    if (type === "location") router.push(`/location/${bookmark._id}`);
    else router.push(`/business/profile/${bookmark._id}`);
  };

  return (
    <Animated.View
      style={[
        {
          opacity,
          transform: [{ scale }],
          width: cardWidth,
          marginBottom: 16,
          borderRadius: 16,
          overflow: "hidden",
        },
      ]}
    >
      <TouchableOpacity
        className="w-full h-full rounded-2xl overflow-hidden bg-[#131e2c]"
        style={{ height: cardHeight }}
        activeOpacity={0.7}
        onPress={handlePress}
      >
        <Image
          source={
            type === "location"
              ? bookmark?.imageUrl
                ? { uri: bookmark?.imageUrl }
                : images.DefaultBookmarkImg
              : bookmark?.mediaUrls?.[0]
              ? { uri: bookmark?.mediaUrls[0] }
              : images.BusinessSearchImg
          }
          className="w-full h-full rounded-2xl"
          resizeMode="cover"
        />

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          start={{ x: 0.5, y: 0.3 }}
          end={{ x: 0.5, y: 1 }}
          className="absolute bottom-0 left-0 right-0 h-[90px] justify-end px-3 pb-3"
        >
          <Text
            className="text-white text-base font-semibold mb-1"
            numberOfLines={1}
          >
            {bookmark.name}
          </Text>

          {type === "business" && bookmark.category && (
            <View className="flex-row items-center mt-1">
              <Component size={12} color="#38bdf8" />
              <Text className="text-[#a0aec0] text-xs ml-1">
                {bookmark.category}
              </Text>
            </View>
          )}

          {type === "location" && (
            <View className="flex-row items-center mt-1">
              <MapPinIcon size={12} color="#38bdf8" />
              <Text className="text-[#a0aec0] text-xs ml-1">
                {bookmark.region || "Pakistan"}
              </Text>
            </View>
          )}
        </LinearGradient>

        <TouchableOpacity className="absolute top-3 right-3 w-[34px] h-[34px] rounded-full bg-[#070f1b]/60 items-center justify-center">
          <MaterialCommunityIcons name="bookmark" size={18} color="#f97316" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Keep only styles that are more complex or used with Animated
const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  listHeader: {
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  headerText: {
    color: "#718096",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 30,
  },
  emptyText: {
    color: "#718096",
    marginTop: 12,
    fontSize: 15,
    textAlign: "center",
  },
  emptyTextBold: {
    color: "#e2e8f0",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptyTextSub: {
    color: "#718096",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  emptyTextError: {
    color: "#ff6b6b",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(37, 53, 70, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#253546",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  retryButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "500",
  },
  listFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  footerText: {
    color: "#718096",
    marginLeft: 10,
    fontSize: 14,
  },
});

export default BookmarkScreen;
