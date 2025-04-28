import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import images from "../../assets/images/images";
import { Plus, ChevronRight, Edit, MapPin } from "lucide-react-native";

const { width } = Dimensions.get("window");
const cardWidth = width * 0.85;

const createList = [
  {
    img: images.UserSearchImg,
    title: "Create Post",
    description: "Share your travel experiences",
    icon: <Edit size={24} color="#fff" />,
    onPress: () => router.push(`/post`),
    gradientColors: ["#6366F1", "#8B5CF6"],
  },
  {
    img: images.DiscoverLocationImg,
    title: "Create Itinerary",
    description: "Plan your perfect adventure",
    icon: <MapPin size={24} color="#fff" />,
    onPress: () => router.push(`/itinerary`),
    gradientColors: ["#EC4899", "#D946EF"],
  },
];

const MainCreateScreen = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedLayout, setSelectedLayout] = useState(2);

  const cycleLayout = () => {
    setSelectedLayout((prev) => (prev === 3 ? 1 : prev + 1));
  };

  const renderCardOption1 = ({ item }) => (
    <TouchableOpacity
      className="mb-6 overflow-hidden"
      activeOpacity={0.9}
      onPress={item.onPress}
      style={{
        width: cardWidth,
        borderRadius: 16,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        backgroundColor: "#1a2234",
      }}
    >
      <View className="flex-row h-32">
        <View className="w-1/3 relative">
          <Image
            source={item.img}
            className="w-full h-full"
            style={{ resizeMode: "cover" }}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.4)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        </View>
        <View className="w-2/3 p-4 justify-center">
          <View className="flex-row items-center justify-between mb-2">
            <View
              className="p-2 rounded-full"
              style={{ backgroundColor: item.gradientColors[0] }}
            >
              {item.icon}
            </View>
            <ChevronRight size={20} color="white" />
          </View>
          <Text className="text-white font-dsbold text-xl">{item.title}</Text>
          <Text className="text-white/70 font-dsregular text-sm">
            {item.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCardOption2 = ({ item }) => (
    <TouchableOpacity
      className="mb-6 overflow-hidden"
      activeOpacity={0.9}
      onPress={item.onPress}
      style={{
        width: cardWidth,
        borderRadius: 16,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      }}
    >
      <LinearGradient
        colors={item.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-4 h-44"
      >
        <View className="flex-row h-full">
          <View className="flex-1 justify-between">
            <View className="bg-white/20 self-start p-2 rounded-full">
              {item.icon}
            </View>
            <View>
              <Text className="text-white font-dsbold text-2xl mb-1">
                {item.title}
              </Text>
              <Text className="text-white/80 font-dsregular text-sm mb-3">
                {item.description}
              </Text>
              <View className="bg-white/30 w-24 py-1 px-3 rounded-full flex-row items-center justify-center">
                <Text className="text-white font-dsmedium text-xs mr-1">
                  Create
                </Text>
                <ChevronRight size={14} color="white" />
              </View>
            </View>
          </View>
          <View className="w-1/3 justify-center items-center">
            <View className="bg-white/30 p-2 rounded-full overflow-hidden">
              <Image
                source={item.img}
                className="w-20 h-20 rounded-full"
                style={{ resizeMode: "cover" }}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCardOption3 = ({ item }) => (
    <TouchableOpacity
      className="mb-6 overflow-hidden"
      activeOpacity={0.9}
      onPress={item.onPress}
      style={{
        width: cardWidth,
        borderRadius: 16,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        backgroundColor: "#1a2234",
      }}
    >
      <View className="flex-row items-center p-4">
        <View
          className="mr-4 rounded-full h-14 w-14 items-center justify-center"
          style={{ backgroundColor: item.gradientColors[0] }}
        >
          {item.icon}
        </View>
        <View className="flex-1">
          <Text className="text-white font-dsbold text-xl">{item.title}</Text>
          <Text className="text-white/70 font-dsregular text-sm">
            {item.description}
          </Text>
        </View>
        <View
          className="ml-2 rounded-full p-2"
          style={{ backgroundColor: `${item.gradientColors[0]}40` }}
        >
          <ChevronRight size={20} color={item.gradientColors[0]} />
        </View>
      </View>
      <View
        className="h-0.5 w-full"
        style={{ backgroundColor: item.gradientColors[0] }}
      />
      <View className="p-2">
        <Image
          source={item.img}
          className="w-full h-48 rounded-lg"
          style={{ resizeMode: "cover" }}
        />
        <View
          className="absolute top-4 right-4 px-3 py-1 rounded-full"
          style={{ backgroundColor: item.gradientColors[0] }}
        >
          <Text className="text-white font-dsmedium text-xs">Create Now</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item, index }) => {
    switch (selectedLayout) {
      case 1:
        return renderCardOption1({ item, index });
      case 2:
        return renderCardOption2({ item, index });
      case 3:
        return renderCardOption3({ item, index });
      default:
        return renderCardOption2({ item, index });
    }
  };

  return (
    <LinearGradient colors={["#0F172A", "#070f1b"]} className="flex-1">
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1">
        <Animated.View
          style={{
            opacity: scrollY.interpolate({
              inputRange: [0, 50],
              outputRange: [1, 0.9],
              extrapolate: "clamp",
            }),
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, -20],
                  extrapolate: "clamp",
                }),
              },
            ],
          }}
          className="z-10 px-5 pt-6 pb-4"
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white font-dsbold text-3xl">Create</Text>
              <Text className="text-white/60 font-dsregular text-base">
                Share your adventures!
              </Text>
            </View>
            <TouchableOpacity
              onPress={cycleLayout}
              className="bg-white/10 p-3 rounded-full"
            >
              <Plus size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.FlatList
          data={createList}
          keyExtractor={(item) => item.title}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: 40,
            paddingHorizontal: width * 0.075,
            paddingTop: 10,
          }}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default MainCreateScreen;
