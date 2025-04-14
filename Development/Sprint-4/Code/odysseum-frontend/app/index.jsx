import React from "react";
import WelcomeScreen from "../src/screens/WelcomeScreen";
import HomeScreen from "../src/screens/HomeScreen";
import useUserStore from "../src/context/userStore";
// import CreatePostScreen from "../src/screens/CreatePostScreen";
// import BookmarkScreen from "../src/screens/BookmarkScreen";
// import PostDetailsScreen from "../src/screens/PostDetailsScreen";
// import DiscoverLocationsScreen from "../src/screens/DiscoverLocationsScreen";
// import PostCard from "../src/components/PostCard";
// import UserSearchScreen from "../src/screens/UserSearchScreen";
// import MainSearchScreen from "../src/screens/MainSearchScreen";
// import CreateItineraryScreen from "../src/screens/CreateItineraryScreen";
// import ReviewsScreen from "../src/screens/ReviewsScreen";
// import BusinessLocationScreen from "../src/screens/BusinessLocationScreen";
// import LocationDetailsScreen from "../src/screens/LocationDetailsScreen";
// import BusinessCategoryScreen from "../src/screens/BusinessCategoryScreen";
// import BusinessProfileScreen from "../src/screens/BusinessProfileScreen";
// import BusinessCreateScreen from "../src/screens/BusinessCreateScreen";
// import SettingsScreen from "../src/screens/SettingsScreen";
// import AboutScreen from "../src/screens/AboutScreen";
// import SecurityScreen from "../src/screens/SecurityScreen";
// import PrivacyScreen from "../src/screens/PrivacyScreen";
// import ServiceCreateScreen from "../src/screens/ServiceCreateScreen";
// import BusinessManageScreen from "../src/screens/BusinessManageScreen";
// import ServiceProfileScreen from "../src/screens/ServiceProfileScreen";
// import BusinessLocationHeatmapScreen from "../src/screens/BusinessLocationHeatmapScreen";
// import SingleUserProfileScreen from "../src/screens/SingleUserProfileScreen";
// import ChatListScreen from "../src/screens/ChatListScreen";
// import LoginScreen from "../src/screens/LoginScreen";
// import BookingCreateScreen from "../src/screens/BookingCreateScreen";
// import UserBookingsScreen from "../src/screens/UserBookingsScreen";
// import ServiceBookingsScreen from "../src/screens/ServiceBookingsScreen";
// import UserBookingProfileScreen from "../src/screens/UserBookingProfileScreen";
// import ManageProfileScreen from "../src/screens/ManageProfileScreen";
// import MainCreateScreen from "../src/screens/MainCreateScreen";


export default function App() {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  // Directly render HomeScreen if user is logged in
  return isLoggedIn ? <HomeScreen /> : <WelcomeScreen />;
}


// Component testing
// export default function App() {

//   return (
//     <>
//       <WelcomeScreen /> 
//       {/* <HomeScreen /> */}
//       {/* <LoginScreen /> */}
//       {/* <BookmarkScreen /> */}
//       {/* <DiscoverLocationsScreen /> */}
//       {/* <CreatePostScreen /> */}
//       {/* <UserProfileScreen /> */}
//       {/* <PostDetailsScreen postId="67703efb15c0aad3657ac7b7" /> */}
//       {/* <UserSearchScreen /> */}
//       {/* <MainSearchScreen /> */}
//       {/* <MainCreateScreen /> */}
//       {/* <SingleUserProfileScreen userId={'67719c4bbf46669c947acedc'} /> */}
//       {/* <CreateItineraryScreen /> */}
//       {/* <ReviewsScreen entityId={'6781353badab4c338ff55148'} entityType={"Location"} entityName={"TestLocation, Test1"} /> */}
//       {/* <LocationDetailsScreen locationId={'6781353badab4c338ff55148'}/> */}
//       {/* <SettingsScreen /> */}
//       {/* <AboutScreen /> */}
//       {/* <SecurityScreen /> */}
//       {/* <PrivacyScreen /> */}
//       {/* <BusinessLocationScreen locationId={'6781353badab4c338ff55148'} locationName={'Test Location'}/> */}
//       {/* <BusinessCategoryScreen locationId={'6781353badab4c338ff55148'} locationName={'Test Location'} category={'Restaurant'}/> */}
//       {/* <BusinessProfileScreen businessId={'67ecf968dc31bf9b620bf223'}/> */}
//       {/* <BusinessLocationHeatmapScreen locationId={'6781353badab4c338ff55148'} locationName={'Test Location'}/> */}
//       {/* <BusinessCreateScreen /> */}
//       {/* <BusinessManageScreen /> */}
//       {/* <ServiceCreateScreen /> */}
//       {/* <ServiceProfileScreen serviceId={'67c549430fae13c7efcd1173'}/> */}
//       {/* <ChatListScreen /> */}
//       {/* <ManageProfileScreen /> */}
//       {/* <BookingCreateScreen serviceId={'67c549430fae13c7efcd1173'}/> */}
//       {/* <UserBookingsScreen /> */}
//       {/* <UserBookingProfileScreen bookingId={'67e9000145ebed69024c3128'}/> */}
//       {/* <ServiceBookingsScreen serviceId={"67c549430fae13c7efcd1173"} /> */}
//     </>
//   );
// }