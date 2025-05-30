import React from "react";
import { Text, View, TouchableOpacity, ScrollView, Image, Dimensions } from "react-native";
import WelcomeScreen from "../src/screens/WelcomeScreen";
import UserProfileScreen from "../src/screens/UserProfileScreen";
import HomeScreen from "../src/screens/HomeScreen";
import CreatePostScreen from "../src/screens/CreatePostScreen";
import BookmarkScreen from "../src/screens/BookmarkScreen";
import PostDetailsScreen from "../src/screens/PostDetailsScreen";
import DiscoverLocationsScreen from "../src/screens/DiscoverLocationsScreen";
import PostCard from "../src/components/PostCard";
import UserSearchScreen from "../src/screens/UserSearchScreen";
import MainSearchScreen from "../src/screens/MainSearchScreen";

// Component testing

export default function App() {

  return (
    <>
      <WelcomeScreen />
      {/* <HomeScreen /> */}
      {/* <BookmarkScreen /> */}
      {/* <CreatePostScreen /> */}
      {/* <UserProfileScreen /> */}
      {/* <PostDetailsScreen postId="6730787a070ca3617028ad30" /> */}
      {/* <DiscoverLocationsScreen /> */}
      {/* <UserSearchScreen /> */}
      {/* <MainSearchScreen /> */}

    </>
  );
}