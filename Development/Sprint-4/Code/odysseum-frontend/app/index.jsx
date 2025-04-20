import React, { useEffect } from "react";
import { Redirect } from "expo-router";
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

/**
 * Generates route URLs for testing different screens in the application
 * 
 * @param {Object} config - Configuration object for generating the route
 * @param {string} config.routeType - The type of route to generate (e.g., 'business', 'service', 'post')
 * @param {Object} config.params - Route parameters to include in the URL
 * @param {Object} config.query - Query parameters to include in the URL
 * @returns {string} The generated route URL
 */
const generateRouteUrl = ({ routeType, params = {}, query = {} }) => {
  const routes = {
    // Main tab routes
    'home': '/(tabs)/home',
    'search': '/(tabs)/search',
    'create': '/(tabs)/create',
    'bookmark': '/(tabs)/bookmark',
    'profile': '/(tabs)/profile',
    
    // Post routes
    'post': `/post/${params.id || '[id]'}`,
    
    // User routes
    'user': `/user/${params.id || '[id]'}`,
    'userBookings': '/user/booking/bookings',
    'userBooking': `/user/booking/${params.id || '[id]'}`,
    
    // Location routes
    'location': `/location/${params.id || '[id]'}`,
    'locationPosts': `/location/${params.id || '[id]'}/posts`,
    
    // Business routes
    'businessLocation': `/business/location/${params.id || '[id]'}`,
    'businessCategory': `/business/location/${params.id || '[id]'}/${params.category || '[category]'}`,
    'businessAll': `/business/location/${params.id || '[id]'}/all`,
    'businessHeatmap': `/business/location/${params.id || '[id]'}/heatmap`,
    'businessProfile': `/business/profile/${params.id || '[id]'}`,
    
    // Service routes
    'serviceBusiness': `/service/business/${params.id || '[id]'}`,
    'serviceProfile': `/service/profile/${params.id || '[id]'}`,
    'serviceBooking': `/service/${params.id || '[id]'}/booking`,
    'serviceBookings': `/service/bookings/${params.id || '[id]'}`,
    
    // Review routes
    'reviewBusiness': `/review/business/${params.id || '[id]'}`,
    'reviewLocation': `/review/location/${params.id || '[id]'}`,
    
    // Settings routes
    'settings': '/settings',
    'businessSettings': '/settings/business',
    'businessCreate': '/settings/business/create',
    'businessManage': '/settings/business/manage',
    'serviceCreate': `/settings/service/create/${params.createId || '[createId]'}`,
    'serviceManage': `/settings/service/manage/${params.manageId || '[manageId]'}`,
    'profileSettings': '/settings/profile',
    'profileManage': '/settings/profile/manage',
    'profilePassword': '/settings/profile/password',
    
    // Itinerary routes
    'itineraryTemplates': '/itinerary/templates',
    'itineraryCreate': '/itinerary/create_itinerary',
    'itineraryAI': '/itinerary/AI_create',
    
    // Chat routes
    'chat': '/chat',
  };

  // Get the base route
  const baseRoute = routes[routeType];
  if (!baseRoute) {
    throw new Error(`Unknown route type: ${routeType}`);
  }

  // Add query parameters if any
  const queryParams = Object.entries(query)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return queryParams ? `${baseRoute}?${queryParams}` : baseRoute;
};

/**
 * Helper function to quickly redirect to a test route
 * Usage example in App component:
 * 
 * return getTestRedirect('businessAll', { id: '123456' }, { name: 'Test Location' });
 */
const getTestRedirect = (routeType, params = {}, query = {}) => {
  const url = generateRouteUrl({ routeType, params, query });
  return <Redirect href={url} />;
};

export default function App() {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  // Redirect to the tab-based home route if logged in
  if (isLoggedIn) {
    return <Redirect href="/(tabs)/home" />;
    // return <Redirect href={`/(tabs)/profile`} />
    // return <Redirect href="/settings" />;
    // return getTestRedirect('businessAll', { id: '123456' }, { name: 'Test Location' });
    
  }

  // Show welcome screen if not logged in
  return <WelcomeScreen />;
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


