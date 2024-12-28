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


// Component testing

export default function App() {

  const user = useUserStore((state) => state.user); //check if user is logged in. if not, show welcome screen, else show home screen


  return (
    <>
      <WelcomeScreen />
      {/* <HomeScreen /> */}
      {/* <BookmarkScreen /> */}
      {/* <CreatePostScreen /> */}
      {/* <UserProfileScreen /> */}
      {/* <PostDetailsScreen postId="6730787a070ca3617028ad30" /> */}
      {/* <DiscoverLocationsScreen /> */}
    </>
  );
}