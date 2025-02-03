import { View, Text, Image, TouchableOpacity, ScrollView, FlatList } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../utils/axios";
import useUserStore from "../context/userStore";
import { router } from "expo-router";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { ChevronLeftIcon, BookmarkIcon, MapPinIcon, PhoneIcon, InboxIcon, GlobeAltIcon, ShareIcon, PencilSquareIcon } from "react-native-heroicons/solid";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSharedValue } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import images from "../../assets/images/images";
import * as Linking from "expo-linking"; 

const tempBusiness = {
  "owner": "672f358fb3e56fac046d76a5",
  "name": "Peak Fitness Center",
  "address": "4000 Mountain Rd, Hilltop",
  "category": "Fitness",
  "description": "A top-notch fitness center offering personalized training and wellness classes.",
  "website": "http://www.peakfitness.com",
  "mediaUrls": [
    images.BusinessSearchImg,
    images.BusinessSearchImg,
    images.BusinessSearchImg
  ],
  "contactInfo": {
  "phone": "444-555-6666",
  "email": "contact@peakfitness.com",
  "website": "http://www.peakfitness.com"
  },
  "operatingHours": {
  "monday": { "open": "5:30 AM", "close": "10:00 PM" },
  "tuesday": { "open": "5:30 AM", "close": "10:00 PM" },
  "wednesday": { "open": "5:30 AM", "close": "10:00 PM" },
  "thursday": { "open": "5:30 AM", "close": "10:00 PM" },
  "friday": { "open": "5:30 AM", "close": "8:00 PM" },
  "saturday": { "open": "7:00 AM", "close": "6:00 PM" },
  "sunday": { "open": "8:00 AM", "close": "6:00 PM" }
  },
  "locationId": "6781353badab4c338ff55148",
  "coordinates": {
  "type": "Point",
  "coordinates": [-120.5000, 38.5000]
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
  const user = useUserStore(state => state.user);

  const { data, isFetching, error, refetch} = useQuery({
    queryKey: ['business', {businessId}],
    queryFn: () => getQueryBusiness({businessId, requestorId: user._id}),
    // enabled: !!businessId
  });

  const business = data?.business || tempBusiness;

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
      name: 'Reviews',
      icon: <PencilSquareIcon size={30} color="orange" />,
      url: `/review/business/${businessId}`
    },
    {
      id: 2,
      name: 'Call',
      icon: <PhoneIcon size={30} color="#3cd221" />,
      url: `tel:${business?.contactInfo?.phone}`
    },
    {
      id: 3,
      name: 'Email',
      icon: <InboxIcon size={30} color="#218cd2" />,
      url: `mailto:${business?.contactInfo?.email}`
    },
    {
      id: 4,
      name: 'Website',
      icon: <GlobeAltIcon size={30} color="white" />,
      url: business?.contactInfo?.website
    },
    {
      // share button will allow users to share a link to the business. clicking the link will redirect to the business profile in the app
      // use expo-sharing to implement this feature. url will be like odysseum://business/profile/{businessId}.
      id: 5,
      name: 'Share',
      icon: <ShareIcon size={30} color="#ca21d2" />,
      url: business?.contactInfo?.website
    }
  ]

  const handleActionPress = (item) =>
  {
  
    if(item.name === 'Share') return;
    if(item.name === 'Reviews') router.push({pathname: item.url, params: {name: business?.name}});
    else Linking.openURL(item.url);
  }

  const bookmarkBusiness = async () => {};

  if(isFetching)
  {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <Text className="text-white">Loading...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-primary">
      {/* Fixed carousel at the top */}
      <View style={{ height: 300 }}>
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
                      style={{ width: 500, height: 300 }}
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
            <Image source={images.BusinessSearchImg} style={{ width: 500, height: 300 }} resizeMode="cover" />
          )
        }

      </View>

      {/* Scrollable content below the carousel */}
      <ScrollView className="flex-1 mt-2">
        <View className="py-4 px-4">
          <Text className="font-dsregular text-white text-xl">{business?.category}</Text>
          <Text className="font-dsbold text-white text-4xl mt-2">{business?.name}</Text>

          <View className="flex-row gap-1 items-center mt-2">
            <MapPinIcon size={20} color="gray" />
            <Text className="font-regular text-white text-lg">{business?.address}</Text>
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

          <View className="flex-1 mt-5">
            <Text className="font-bold text-white text-xl">About</Text>
            <Text className="font-regular text-white text-base mt-1">{business?.description}</Text>
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
