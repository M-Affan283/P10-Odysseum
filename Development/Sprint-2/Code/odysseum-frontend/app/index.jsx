import React from "react";
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
import BusinessScreen from "../src/screens/BusinessScreen";
import CreateItineraryScreen from "../src/screens/CreateItineraryScreen";
import ReviewsScreen from "../src/screens/ReviewsScreen";
import BusinessLocationScreen from "../src/screens/BusinessLocationScreen";
import LocationDetailsScreen from "../src/screens/LocationDetailsScreen";
import BusinessCategoryScreen from "../src/screens/BusinessCategoryScreen";
import BusinessProfileScreen from "../src/screens/BusinessProfileScreen";
import BusinessCreateScreen from "../src/screens/BusinessCreateScreen";
import LottieView from "lottie-react-native";

import SettingsScreen from "../src/screens/SettingsScreen";
import AboutScreen from "../src/screens/AboutScreen";
import SecurityScreen from "../src/screens/SecurityScreen";
import PrivacyScreen from "../src/screens/PrivacyScreen";

// Component testing

export default function App() {

  return (
    <>
      {/* <WelcomeScreen /> */}
      {/* <HomeScreen /> */}
      {/* <BookmarkScreen /> */}
      {/* <CreatePostScreen /> */}
      {/* <UserProfileScreen /> */}
      {/* <PostDetailsScreen postId="6730787a070ca3617028ad30" /> */}
      {/* <DiscoverLocationsScreen /> */}
      {/* <UserSearchScreen /> */}
      {/* <MainSearchScreen /> */}
      {/* <BusinessScreen /> */}
      {/* <CreateItineraryScreen /> */}
      {/* <ReviewsScreen entityId={'12345'} entityType={"Location"} entityName={"Test Entity"} /> */}
      {/* <BusinessScreen /> */}
      {/* <LocationDetailsScreen locationId={'6781353badab4c338ff55148'}/> */}

      <SettingsScreen />
      {/* <AboutScreen /> */}
      {/* <SecurityScreen /> */}
      {/* <PrivacyScreen /> */}

      {/* <BusinessLocationScreen locationId={'6781353badab4c338ff55148'} locationName={'Test Location'}/> */}
      {/* <BusinessCategoryScreen locationId={'6781353badab4c338ff55148'} locationName={'Test Location'} category={'Test Category'}/> */}
      {/* <BusinessProfileScreen businessId={'6781353badab4c338ff55148'}/> */}
      {/* <BusinessCreateScreen /> */}
      
    </>
  );
}