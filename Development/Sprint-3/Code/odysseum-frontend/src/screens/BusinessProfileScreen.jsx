import { View, Text, Image, TouchableOpacity, ScrollView, FlatList, Dimensions } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../utils/axios";
import useUserStore from "../context/userStore";
import { router } from "expo-router";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { ChevronLeftIcon, BookmarkIcon, MapPinIcon, PhoneIcon, InboxIcon, GlobeAltIcon, ShareIcon, PencilSquareIcon, BuildingStorefrontIcon } from "react-native-heroicons/solid";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSharedValue } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import images from "../../assets/images/images";
import themes from "../../assets/themes/themes";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Linking from "expo-linking"; 
import LottieView from "lottie-react-native";

const width = Dimensions.get('window').width;

const tempBusiness = {
  "owner": "672f358fb3e56fac046d76a5",
  "name": "Peak Fitness Center",
  "address": "4000 Mountain Rd, Hilltop",
  "category": "Fitness",
  "description": "A top-notch fitness center offering personalized training and wellness classes.",
  "website": "http://www.peakfitness.com",
  "mediaUrls": [
  ],
  "contactInfo": {
  "phone": "444-555-6666",
  "email": "contact@peakfitness.com",
  "website": "http://www.peakfitness.com"
  },
  "operatingHours": {
    "monday": "5:30 - 22:00",
    "tuesday": "5:30 - 22:00",
    "wednesday": "5:30 - 22:00",
    "thursday": "5:30 - 22:00",
    "friday": "5:30 - 20:00",
    "saturday": "7:00 - 18:00",
    "sunday": "8:00 - 18:00"
  },
  "locationId": "6781353badab4c338ff55148",
  "coordinates": {
  "type": "Point",
  "coordinates": [-120.5000, 38.5000] //mongoDB coordinates are [longitude, latitude]
  },
  "activityCount": 170,
  "averageRating": 4.5,
  "lastInteraction": "2025-01-19T14:20:00Z"
}

const getQueryBusiness = async ({businessId, requestorId}) =>
{
  try
  {
    const res = await axiosInstance.get(`/business/getById?businessId=${businessId}&requestorId=${requestorId}`);
    // console.log(res.data)
    return res.data;
  }
  catch(error)
  {
    console.log(error);
    throw error;
  }
}

const BusinessProfileScreen = ({ businessId }) => {
  
  // const [business, setBusiness] = useState(tempBusiness);
  const [bookmarked, setBookmarked] = useState(false);
  const [selectedButton, setSelectedButton] = useState('about');
  const user = useUserStore(state => state.user);

  const { data, isFetching, error, refetch} = useQuery({
    queryKey: ['business', {businessId}],
    queryFn: () => getQueryBusiness({businessId, requestorId: user._id}),
    // enabled: !!businessId
  });

  const business = data?.business || tempBusiness;
  // const business = tempBusiness;
  // const isFetching = false;

  useEffect(() => {
    if(business.bookmarked) setBookmarked(true);
  }, [business]);


  const carouselRef = useRef(null);
  const progress = useSharedValue(0);

  const onPressPagination = (index) => {
    carouselRef.current?.scrollTo({
      count: index - progress.value,
      animated: true
    })
  }


  const actionButtons = [
    {
      id: 1,
      name: 'Services',
      icon: <BuildingStorefrontIcon size={30} color="yellow" />,
      url: `/service/business/${businessId}`
    },
    {
      id: 2,
      name: 'Reviews',
      icon: <PencilSquareIcon size={30} color="orange" />,
      url: `/review/business/${businessId}`
    },
    {
      id: 3,
      name: 'Call',
      icon: <PhoneIcon size={30} color="#3cd221" />,
      url: `tel:${business?.contactInfo?.phone}`
    },
    {
      id: 4,
      name: 'Email',
      icon: <InboxIcon size={30} color="#218cd2" />,
      url: `mailto:${business?.contactInfo?.email}`
    },
    {
      id: 5,
      name: 'Website',
      icon: <GlobeAltIcon size={30} color="white" />,
      url: business?.contactInfo?.website
    },
    {
      // share button will allow users to share a link to the business. clicking the link will redirect to the business profile in the app
      // use expo-sharing to implement this feature. url will be like odysseum://business/profile/{businessId}.
      id: 6,
      name: 'Share',
      icon: <ShareIcon size={30} color="#ca21d2" />,
      url: business?.contactInfo?.website
    }
  ]

  const handleActionPress = (item) =>
  {
  
    if(item.name === 'Share') return;
    if(item.name === 'Reviews') router.push({pathname: item.url, params: {name: business?.name}});
    if(item.name === 'Services') router.push(item.url);
    else Linking.openURL(item.url);
  }

  const bookmarkBusiness = async () => {};

  const mapRef = useRef(null);
  
  // move the map back to the business location
  const focusOnBusiness = () => 
  { 
    mapRef.current?.animateToRegion({
      latitude: business?.coordinates?.coordinates[1],
      longitude: business?.coordinates?.coordinates[0],
      latitudeDelta: 0.0922,
      longitudeDelta: 0.042
    });
  }

  const displayAbout = () =>
  {
    return (
      <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
        <Text className="text-white text-xl font-dsbold mb-3">About</Text>
        <View className="space-y-2">
          <Text className="text-white">{business?.description || 'No description available'}</Text>
        </View>
      </View>
    );
  };

  const displayOperatingHours = () => 
  {
    return (
      <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
        <Text className="text-white text-xl font-dsbold mb-3">Operating Hours</Text>
        <View className="space-y-2">
          {
            Object.entries(business?.operatingHours).map(([day, hours]) => (
              <View key={day} className="flex-row justify-between">
                <Text className="text-white">{day}</Text>
                <Text className="text-white">{hours}</Text>
              </View>
            ))
          }
        </View>
      </View>
    )
  }

  const displayContactInfo = () => 
  {
    return (
      <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
        <Text className="text-white text-xl font-dsbold mb-3">Contact Information</Text>
        <View className="space-y-2 gap-y-4">
          <View className="flex-row items-center gap-x-3">
            <PhoneIcon size={20} color="gray" />
            <Text className="text-white">{business?.contactInfo?.phone || 'N/A'}</Text>
          </View>
          <View className="flex-row items-center gap-x-3">
            <InboxIcon size={20} color="gray" />
            <Text className="text-white">{business?.contactInfo?.email || 'N/A'}</Text>
          </View>
          <View className="flex-row items-center gap-x-3">
            <GlobeAltIcon size={20} color="gray" />
            <Text className="text-white">{business?.contactInfo?.website || 'N/A'}</Text>
          </View>
        </View>
      </View>
    )
  }

  const displayLocation = () =>
  {
    return (
      <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
        <View className="flex-1 mt-5 justify-center items-center">
            
            <TouchableOpacity className="flex-row bg-[#ff6b6b] rounded-full py-2 px-2" onPress={focusOnBusiness}>
              <MapPinIcon size={25} color="white" />
              <Text className="text-white text-base">Refocus</Text>
            </TouchableOpacity>

            <MapView
              ref={mapRef}
              className="mt-3"
              provider={PROVIDER_GOOGLE}
              style={{ width: 300, height: 300, }}
              customMapStyle={themes.aubergine}
              initialRegion={{
                latitude: business?.coordinates?.coordinates[1] || 0,
                longitude: business?.coordinates?.coordinates[0] || 0,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.042
              }}
            >
              <Marker
                coordinate={{
                  latitude: business?.coordinates?.coordinates[1] || 0,
                  longitude: business?.coordinates?.coordinates[0] || 0
                }}
                title={business?.name}
                description={business?.address}
              />
            </MapView>
          </View>
      </View>
    )
  }

  const buttonOptions = [
    {
      key: 'about',
      title: 'About',
      onPress: () => setSelectedButton('about')
    },
    {
      key: 'hours',
      title: 'Hours',
      onPress: () => setSelectedButton('hours')
    },
    {
      key: 'contact',
      title: 'Contact',
      onPress: () => setSelectedButton('contact')
    },
    {
      key: 'location',
      title: 'Location',
      onPress: () => setSelectedButton('location')
    },
  ];

  const renderContent = () => 
  {
    switch (selectedButton) 
    {
      case 'about':
        return displayAbout();
      case 'hours':
        return displayOperatingHours();
      case 'contact':
        return displayContactInfo();
      case 'location':
        return displayLocation();
      default:
        return displayAbout();
    }
  };


  if(isFetching)
  {
    return (
      <View className="bg-[#070f1b] flex-1 justify-center items-center">
        <LottieView
          source={require('../../assets/animations/Loading1.json')}
          style={{
            width: 150,
            height: 150,
          }}
          autoPlay
          loop
        />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-[#070f1b]">
      {/* Fixed carousel at the top */}
      <View style={{ height: 310, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
        {
          business?.mediaUrls.length > 0 ?
          (
            <>
              <Carousel
                // if no media urls, use default image
                data={business?.mediaUrls}
                loop={false}
                ref={carouselRef}
                width={500}
                height={300}
                scrollAnimationDuration={100}
                onProgressChange={progress}
                onConfigurePanGesture={(panGesture) => {
                    panGesture.activeOffsetX([-5, 5]);
                    panGesture.failOffsetY([-5, 5]);
                }}
                style={{ alignItems: "center", justifyContent: "center" }}
                renderItem={({ item }) => (
                  <View className="items-center">
                    <Image
                      source={{uri: item}}
                      style={{ width: width, height: 310, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
                      resizeMode="cover"
                    />
                  </View>
                )}
                />
                
                <Pagination.Basic 
                  progress={progress}
                  data={business?.mediaUrls}
                  onPress={onPressPagination}
                  size={10}
                  dotStyle={{backgroundColor: 'gray', borderRadius: 100}}
                  activeDotStyle={{backgroundColor: 'white', overflow: 'hidden', aspectRatio: 1, borderRadius: 15}}
                  containerStyle={{gap: 5, marginBottom: 10}}
                  horizontal
                />
              </>
          )
          :
          (
            <Image source={images.BusinessSearchImg} style={{ width: width, height: 315, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }} resizeMode="cover" />
          )
        }

      </View>

      {/* Scrollable content below the carousel */}
      <ScrollView className="flex-1 mt-2">
        <View className="py-4 px-4">
          <Text className="font-dsregular text-white text-xl">{business?.category || 'N/A'}</Text>
          <Text className="font-dsbold text-white text-4xl mt-2">{business?.name || 'N/A'}</Text>

          <View className="flex-row gap-1 items-center mt-2">
            <MapPinIcon size={20} color="gray" />
            <Text className="font-regular text-white text-lg">{business?.address || 'N/A'}</Text>
          </View>
          
          <View className="flex-row mt-4">
            {
              actionButtons.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  className="items-center rounded-full mx-auto py-2 mt-2"
                  onPress={() => handleActionPress(action)}
                >
                  {action.icon}
                  <Text className="font-dsregular text-white text-lg ">{action.name}</Text>
                </TouchableOpacity>
              ))
            }
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
            <View className="flex-row gap-x-3">
              {buttonOptions.map((button, index) => (
                <TouchableOpacity 
                  key={index}
                  className={`items-center py-2 px-4 rounded-xl ${selectedButton === button.key ? 'bg-purple-600' : 'bg-gray-800'}`}
                  onPress={button.onPress}
                >
                <Text className="font-dsbold text-white text-lg">{button.title}</Text>
              </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* here display inservice?ation based on what is selected. ideally availablity and pricing should be shown in a simialr as that in reveiwscreen function in service create screen */}
          <View className="flex-1 mt-5">
            {renderContent()}
          </View>

          

        </View>
      </ScrollView>

      {/* Back and Bookmark icons */}
      <SafeAreaView className="flex-row justify-between items-center w-full absolute mt-4">
        <TouchableOpacity className="p-2 rounded-full ml-4" style={{backgroundColor: 'rgba(255, 255, 255, 0.5)'}} onPress={() => router.back()}>
          <ChevronLeftIcon size={30} strokeWidth={4} color='white' />
        </TouchableOpacity>

        <TouchableOpacity className="p-2 rounded-full mr-4" style={{backgroundColor: 'rgba(255, 255, 255, 0.5)'}} onPress={bookmarkBusiness}>
          <BookmarkIcon size={30} strokeWidth={4} color={bookmarked ? 'red' : 'white'} />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default BusinessProfileScreen;
