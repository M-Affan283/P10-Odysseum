import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import MapView, {
  Heatmap,
  Marker,
  PROVIDER_GOOGLE,
  Callout,
} from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "../utils/axios";
import Toast from "react-native-toast-message";
import { useQuery } from "@tanstack/react-query";
import LottieView from "lottie-react-native";
import {
  ChevronLeftIcon,
  FunnelIcon,
  MapIcon,
  ArrowRightIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  InformationCircleIcon,
  HomeIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon,
} from "react-native-heroicons/solid";
import { Flame, Crosshair } from "lucide-react-native";
import { router } from "expo-router";
import themes from "../../assets/themes/themes";

const getQueryHeatmapData = async ({ locationId }) => {
  try {
    const res = await axiosInstance.get(
      `/business/getMapData?locationId=${locationId}`
    );
    return res.data;
  } catch (error) {
    throw new Error("Failed to fetch heatmap data");
  }
};

// Define categories and their corresponding colors
const CATEGORIES = {
  All: "#6D28D9", // Default purple
  Restaurant: "#EF4444", // Red
  Hotel: "#3B82F6", // Blue
  Shopping: "#10B981", // Green
  Fitness: "#F59E0B", // Amber
  Health: "#EC4899", // Pink
  Beauty: "#8B5CF6", // Indigo
  Education: "#F97316", // Orange
  Entertainment: "#14B8A6", // Teal
  Services: "#6366F1", // Indigo
  Other: "#6B7280", // Gray
};

// Map theme options
const MAP_THEMES = {
  Dark: themes.dark,
  Light: { styles: [] }, // Default Google Maps
  Retro: themes.retro || themes.dark, // Fallback to dark if retro not available
  Night: themes.night || themes.dark, // Fallback to dark if night not available
};

const BusinessLocationHeatmapScreen = ({ locationId, locationName }) => {
  const [showMarkers, setShowMarkers] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentMapTheme, setCurrentMapTheme] = useState("Dark");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(true);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const mapRef = React.useRef(null);
  // Add key to force map re-render when theme changes
  const [mapKey, setMapKey] = useState(1);

  // Animation values
  const infoPanelHeight = useRef(new Animated.Value(0)).current;
  const controlPanelOpacity = useRef(new Animated.Value(1)).current;

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ["heatmapData", locationId],
    queryFn: () => getQueryHeatmapData({ locationId }),
    enabled: true,
  });

  // Add effect to update map when theme changes
  useEffect(() => {
    setMapKey((prevKey) => prevKey + 1);
  }, [currentMapTheme]);

  // Animation for info panel
  useEffect(() => {
    Animated.timing(infoPanelHeight, {
      toValue: showInfoPanel ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showInfoPanel]);

  // Animation for control panel
  useEffect(() => {
    Animated.timing(controlPanelOpacity, {
      toValue: showControlPanel ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showControlPanel]);

  const locationCoordinates = data?.locationCoords || null;
  const mapData = data?.businesses || [];

  // Filter businesses based on selected category
  const filteredMapData =
    selectedCategory === "All"
      ? mapData
      : mapData.filter((item) => item.category === selectedCategory);

  // Navigate to business profile
  const navigateToBusinessProfile = (businessId) => {
    router.push(`/business/profile/${businessId}`);
  };

  if (error) {
    Toast.show({
      type: "error",
      position: "bottom",
      text1: "Failed to fetch heatmap data",
      text2: "Error occurred server side",
      visibilityTime: 2000,
    });

    return (
      <SafeAreaView className="flex-1 bg-[#1f1235]">
        <View className="flex-1 items-center justify-center">
          <Text className="font-dsbold text-white text-lg">
            Failed to fetch heatmap data
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isFetching) {
    return (
      <View className="flex-1 bg-[#070f1b] justify-center items-center">
        <LottieView
          source={require("../../assets/animations/Loading1.json")}
          style={{
            width: 150,
            height: 150,
          }}
          autoPlay
          loop
        />
      </View>
    );
  }

  // Calculate stats for the info panel
  const calculateStats = () => {
    if (!filteredMapData.length)
      return { count: 0, avgRating: 0, topCategory: "None" };

    // Count categories
    const categoryCount = {};
    filteredMapData.forEach((item) => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    // Find most common category
    let topCategory = "None";
    let maxCount = 0;
    Object.entries(categoryCount).forEach(([category, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCategory = category;
      }
    });

    return {
      count: filteredMapData.length,
      avgRating: (
        filteredMapData.reduce(
          (sum, item) => sum + (item.averageRating || 0),
          0
        ) / filteredMapData.length
      ).toFixed(1),
      topCategory,
    };
  };

  const stats = calculateStats();

  // Get color for marker based on category
  const getCategoryColor = (category) =>
    CATEGORIES[category] || CATEGORIES["Other"];

  // Function to center the map on location
  const centerMapOnLocation = () => {
    if (mapRef.current && locationCoordinates) {
      mapRef.current.animateToRegion({
        latitude: locationCoordinates[1],
        longitude: locationCoordinates[0],
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">
      {error ? (
        <SafeAreaView className="flex-1 items-center justify-center">
          <Text className="font-dsbold text-white text-lg">
            Failed to fetch heatmap data
          </Text>
        </SafeAreaView>
      ) : isFetching ? (
        <View className="flex-1 justify-center items-center">
          <LottieView
            source={require("../../assets/animations/Loading1.json")}
            style={{
              width: 150,
              height: 150,
            }}
            autoPlay
            loop
          />
        </View>
      ) : (
        <View className="flex-1">
          <SafeAreaView className="absolute top-0 left-0 right-0 z-10">
            <View className="flex-row justify-between items-center mx-4 mt-2">
              <TouchableOpacity
                className="p-3 rounded-full"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
                onPress={() => router.back()}
              >
                <ChevronLeftIcon size={32} color="white" />
              </TouchableOpacity>

              <View>
                <Text
                  className="text-white font-dsbold text-xl text-center py-1 px-3 rounded-lg"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
                >
                  {locationName}
                </Text>
              </View>

              <TouchableOpacity
                className="p-3 rounded-full"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
                onPress={() => setShowControlPanel(!showControlPanel)}
              >
                <AdjustmentsHorizontalIcon size={24} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <MapView
            key={mapKey}
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ height: "100%", width: "100%" }}
            customMapStyle={
              MAP_THEMES[currentMapTheme].styles || MAP_THEMES[currentMapTheme]
            }
            initialRegion={{
              latitude: locationCoordinates ? locationCoordinates[1] : 0.0,
              longitude: locationCoordinates ? locationCoordinates[0] : 0.0,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {!showMarkers && mapData.length > 0 && (
              <Heatmap
                points={mapData.map((item) => ({
                  latitude: item.coordinates[1],
                  longitude: item.coordinates[0],
                  weight: item.heatmapScore || 1,
                }))}
                radius={40}
                opacity={0.7}
                gradient={{
                  colors: ["black", "purple", "red", "yellow", "white"],
                  startPoints: [0.01, 0.04, 0.1, 0.45, 5],
                  colorMapSize: 256,
                }}
              />
            )}

            {showMarkers &&
              filteredMapData.map((item, index) => (
                <Marker
                  key={index}
                  coordinate={{
                    latitude: item.coordinates[1],
                    longitude: item.coordinates[0],
                  }}
                  pinColor={getCategoryColor(item.category)}
                >
                  <Callout
                    tooltip
                    onPress={() => navigateToBusinessProfile(item._id)}
                  >
                    <View
                      className="bg-white p-3 rounded-lg shadow-lg"
                      style={{ width: 160 }}
                    >
                      <Text className="font-dsbold text-purple-900">
                        {item.name || "Business"}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Text className="text-gray-800 mr-1">Rating:</Text>
                        <Text className="font-dsmedium">
                          {item.averageRating?.toFixed(1) || "N/A"}★
                        </Text>
                      </View>
                      <Text className="text-gray-600 mt-1">
                        {item.category}
                      </Text>

                      <View className="flex-row items-center justify-center mt-2 bg-purple-100 p-1 rounded-lg">
                        <Text className="text-purple-900 text-xs mr-1 font-dsmedium">
                          View Profile
                        </Text>
                        <ArrowRightIcon size={12} color="#6D28D9" />
                      </View>
                    </View>
                  </Callout>
                </Marker>
              ))}
          </MapView>

          {/* Info Panel - Statistics and Category Info */}
          <Animated.View
            className="absolute top-32 bg-black/80 rounded-lg shadow-lg overflow-hidden"
            style={{
              maxHeight: infoPanelHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 500],
              }),
              opacity: infoPanelHeight,
              transform: [
                {
                  translateY: infoPanelHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
            }}
          >
            <View className="p-3">
              <View className="flex-row justify-between items-center">
                <Text className="font-dsbold text-white mb-1">
                  Area Statistics
                </Text>
                <TouchableOpacity onPress={() => setShowInfoPanel(false)}>
                  <XMarkIcon size={20} color="white" />
                </TouchableOpacity>
              </View>
              <Text className="text-gray-200">
                • {stats.count} business{stats.count !== 1 ? "es" : ""}
              </Text>
              <Text className="text-gray-200">
                • Avg rating: {stats.avgRating}★
              </Text>
              {selectedCategory === "All" && (
                <Text className="text-gray-200">
                  • Top category: {stats.topCategory}
                </Text>
              )}

              {/* Category Legend */}
              {showMarkers && (
                <View className="mt-3 pt-3 border-t border-gray-500">
                  <Text className="font-dsbold text-white mb-1">
                    Categories
                  </Text>
                  <View className="flex-row flex-wrap">
                    {Object.entries(CATEGORIES)
                      .filter(
                        ([cat]) =>
                          cat === selectedCategory || selectedCategory === "All"
                      )
                      .map(([cat, color], i) => (
                        <View
                          key={i}
                          className="flex-row items-center m-1 bg-black/40 px-2 py-1 rounded-md"
                        >
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              backgroundColor: color,
                              borderRadius: 4,
                            }}
                          />
                          <Text className="text-xs ml-1 text-white">{cat}</Text>
                        </View>
                      ))}
                  </View>
                </View>
              )}

              {/* Heatmap Legend */}
              {!showMarkers && (
                <View className="mt-3 pt-3 border-t border-gray-500">
                  <Text className="font-dsbold text-white mb-1">Density</Text>
                  <View className="w-full h-4 flex-row rounded-full overflow-hidden">
                    {["black", "purple", "red", "yellow", "white"].map(
                      (color, i) => (
                        <View
                          key={i}
                          style={{ flex: 1, backgroundColor: color }}
                        />
                      )
                    )}
                  </View>
                  <View className="flex-row justify-between w-full">
                    <Text className="text-xs text-white">Low</Text>
                    <Text className="text-xs text-white">High</Text>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Control Panel - Moved to left side */}
          <Animated.View
            className="absolute bottom-8 left-4 bg-black/80 p-2 rounded-2xl shadow-lg"
            style={{
              opacity: controlPanelOpacity,
              transform: [{ scale: controlPanelOpacity }],
            }}
          >
            <View className="items-center">
              {/* Info Button */}
              <TouchableOpacity
                className="p-3 m-1 bg-purple-900/70 rounded-full"
                onPress={() => setShowInfoPanel(!showInfoPanel)}
              >
                <InformationCircleIcon size={22} color="white" />
              </TouchableOpacity>

              {/* Category Filter Button */}
              <TouchableOpacity
                className="p-3 m-1 bg-purple-900/70 rounded-full"
                onPress={() => setShowCategoryModal(true)}
              >
                <FunnelIcon size={22} color="white" />
              </TouchableOpacity>

              {/* Map Theme Button */}
              <TouchableOpacity
                className="p-3 m-1 bg-purple-900/70 rounded-full"
                onPress={() => setShowThemeModal(true)}
              >
                <MapIcon size={22} color="white" />
              </TouchableOpacity>

              {/* Toggle Markers/Heatmap Button - Updated with Flame icon */}
              <TouchableOpacity
                className="p-3 m-1 bg-purple-900/70 rounded-full"
                onPress={() => setShowMarkers(!showMarkers)}
              >
                {showMarkers ? (
                  <EyeIcon size={22} color="white" />
                ) : (
                  <Flame size={22} color="white" />
                )}
              </TouchableOpacity>

              {/* Center Map Button - Updated with Crosshair icon */}
              <TouchableOpacity
                className="p-3 m-1 bg-purple-900/70 rounded-full"
                onPress={centerMapOnLocation}
              >
                <Crosshair size={22} color="white" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Modals remain the same */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showCategoryModal}
            onRequestClose={() => setShowCategoryModal(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/50">
              <View
                className="bg-[#1f1235] rounded-3xl p-6 mx-4"
                style={{ maxWidth: 380, width: "95%" }}
              >
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="font-dsbold text-white text-2xl">
                    Filter by Category
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowCategoryModal(false)}
                    className="rounded-full p-2 bg-purple-900/50"
                  >
                    <Text className="text-white font-bold text-xl px-2">×</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  className="max-h-96"
                  showsVerticalScrollIndicator={false}
                >
                  <View className="flex-row flex-wrap justify-between">
                    {Object.keys(CATEGORIES).map((category) => (
                      <TouchableOpacity
                        key={category}
                        className={`flex-row items-center p-3 mb-3 rounded-lg ${
                          selectedCategory === category
                            ? "bg-purple-800"
                            : "bg-purple-900/50"
                        }`}
                        style={{ width: "48%" }}
                        onPress={() => {
                          setSelectedCategory(category);
                          setShowCategoryModal(false);
                        }}
                      >
                        <View
                          style={{
                            width: 16,
                            height: 16,
                            backgroundColor: CATEGORIES[category],
                            borderRadius: 8,
                          }}
                        />
                        <Text className="ml-3 font-dsmedium text-white text-base">
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* <TouchableOpacity
                  className="bg-purple-700 p-4 rounded-lg mt-4"
                  onPress={() => setShowCategoryModal(false)}
                >
                  <Text className="text-white font-dsbold text-lg text-center">Done</Text>
                </TouchableOpacity> */}
              </View>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={showThemeModal}
            onRequestClose={() => setShowThemeModal(false)}
          >
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-[#1f1235] rounded-t-3xl p-6">
                <Text className="font-dsbold text-white text-xl mb-4">
                  Select Map Theme
                </Text>
                {Object.keys(MAP_THEMES).map((theme) => (
                  <TouchableOpacity
                    key={theme}
                    className={`p-3 mb-2 rounded-lg ${
                      currentMapTheme === theme
                        ? "bg-purple-800"
                        : "bg-purple-900/50"
                    }`}
                    onPress={() => {
                      setCurrentMapTheme(theme);
                      setShowThemeModal(false);
                    }}
                  >
                    <Text className="text-lg text-white">{theme}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  className="bg-purple-700 p-3 rounded-lg mt-4"
                  onPress={() => setShowThemeModal(false)}
                >
                  <Text className="text-white font-dsbold text-center">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </SafeAreaView>
  );
};

export default BusinessLocationHeatmapScreen;
