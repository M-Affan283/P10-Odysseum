import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../utils/axios';
import { router } from 'expo-router';
import useUserStore from '../context/userStore';
import DefaultLocationPNG from '../../assets/Sunset.jpg';
import {SafeAreaView} from 'react-native-safe-area-context';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { BookmarkIcon, ChevronDoubleUpIcon } from 'react-native-heroicons/solid';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import * as Animatable from 'react-native-animatable';
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import { StarRatingDisplay } from 'react-native-star-rating-widget';

const tempLocation = {
  _id: "67310369aa977e99fcc2c31e",
  name: "Chitral, KPK",
  coordinates: {
    type: "Point",
    coordinates: [71.8003, 35.8989]
  },
  description: "Chitral is the capital of the Chitral District, situated on the western bank of the Chitral River in Khyber Pakhtunkhwa, Pakistan. It also served as the capital of the princely state of Chitral until 1969. The town is at the foot of Tirich Mir, the highest peak of the Hindu Kush, which is 25,289 ft (7,708 m) high. It has a population of 20,000. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora aut vitae quibusdam architecto numquam. Rerum asperiores sunt, eaque, animi praesentium natus sed fugiat quaerat magni eligendi voluptatum accusamus laudantium. Earum.Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam, voluptates porro fuga temporibus iusto ipsum? Facere architecto.",
}

const LocationDetailsScreen = ({locationId}) => {
  
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  
  const viewOpacity = useSharedValue(0);

  const viewStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(viewOpacity.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    };
  })

  useEffect(() => {
    // Trigger the animation based on loading state
    viewOpacity.value = withTiming(loading ? 0 : 1, { duration: 500 }); // Interpolate from 0 to 1
  }, [loading]);

  useEffect(() => {
    getLocationInfo();
    if(user.bookmarks.some(bookmark => bookmark._id === locationId)) setBookmarked(true);
  }, [])

  const getLocationInfo = async () =>
  {
    console.log("Retrieving location info...");

    setLoading(true);

    axiosInstance.get(`/location/getById?locationId=${locationId}`)
    .then((res)=>
    {
      setLocation(res.data.location);
      setLoading(false);
    })
    .catch((error)=>
    {
      console.log(error);
      setError(error);
      setLoading(false);
    })
  }

  //add or remove bookmark 
  // TODO: UPDATE THE BOOKMARK ICON ON PRESS
  const bookmarkLocation = async () =>
  {
      console.log("Bookmarking location...");
      setBookmarked(!bookmarked); //optimistic update

      axiosInstance.post('/user/bookmark', {userId: user._id, locationId: locationId})
      .then(async (res)=>
      {
        // console.log("Bookmarked location: ", res.data.bookmarks);
        await setUser({
          ...user,
          bookmarks: res.data.bookmarks
        })

        console.log("User bookmarks: ", user.bookmarks);
      })
      .catch((error)=>
      {
        console.log(error);
        setBookmarked(!bookmarked); //revert back to original state
      })
  }

  // THIS IS FOR USE CASE LATER ON. AN LLM WILL SUMMARISE THE REVIEWS STORED IN THE DB. AND RETURN WHAT USERS THINK. BOTH PROS AND CONS
  const getSummariserReviews = async () => {}

  

  return (
    <View className="bg-primary flex-1">

      { loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="white" />
        </View>
      )
      :
      (
        <Animated.View style={viewStyle}>
            <Image source={location?.imageUrl ? { uri: location?.imageUrl } : DefaultLocationPNG} style={{width: "100%", height: '100%'}} resizeMode='cover'/>
    
            <SafeAreaView className="flex-row justify-between items-center w-full absolute mt-4">
              <TouchableOpacity className="p-2 rounded-full ml-4" style={{backgroundColor: 'rgba(255, 255, 255, 0.5)'}} onPress={()=>router.back()}>
                <ChevronLeftIcon size={30} strokeWidth={4} color='white' />
              </TouchableOpacity>
              <TouchableOpacity className="p-2 rounded-full mr-4" style={{backgroundColor: 'rgba(255, 255, 255, 0.5)'}} onPress={bookmarkLocation}>
                <BookmarkIcon size={30} strokeWidth={4} color={bookmarked ? 'red' : 'white'} />
              </TouchableOpacity>
            </SafeAreaView>
    
            
          <LocationDetailsComponent location={location} />
        </Animated.View>
      )
      }

    </View>
  )
}



const LocationDetailsComponent = ({location}) => {

  const animatedIndex = useSharedValue(0);
  const snapPoints = useMemo(() => ['20%', '80%'], []);
  
  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          animatedIndex.value,
          [0, 0.08],
          [40, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(
      animatedIndex.value,
      [0, 0.08],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      animatedIndex.value,
      [0, 0.08],
      ['black', '#070f18'],
    ),
    marginBottom: interpolate(
      animatedIndex.value,
      [0, 0.08],
      [0, 10],
      Extrapolation.CLAMP,
    ),
  }));

  const CustomBackground = ({animatedIndex, style}) => {
    const containerStyle = useAnimatedStyle(() => ({
      ...style,
      backgroundColor: '#fff',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      opacity: interpolate(
        animatedIndex.value,
        [0, 0.08],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    }));
    return <Animated.View style={containerStyle} />;
  };

  const HandleIndicatorComponent = () => {

    const indicatorStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        animatedIndex.value,
        [0, 0.5], // Adjust the range as needed
        [1, 0],   // Fully visible at index 0, invisible at index > 0
        Extrapolation.CLAMP,
      ),
    }));

    return (
      <Animated.View style={[indicatorStyle, { flexDirection: 'row', justifyContent: 'center' }]}>
        <ChevronDoubleUpIcon size={24} color="black" />
        <Text className="text-black font-semibold">Swipe up for details</Text>
      </Animated.View>
    )
  }




  return (
    <BottomSheet
      index={0}
      animatedIndex={animatedIndex}
      snapPoints={snapPoints}
      backgroundComponent={CustomBackground}
      handleComponent={null}
    >

      <Animatable.View
        style={{paddingHorizontal: 24, paddingVertical: 24}}
        animation="fadeInUp"
        delay={500}
        easing="ease-in-out"
        duration={400}>

        <HandleIndicatorComponent />
        <Animated.Text style={[{fontSize: 32, fontWeight: 'bold', color: 'black'}, titleStyle]}>
          {location?.name}
        </Animated.Text>

      </Animatable.View>
      
      {/* // Divider */}
      <Animated.View style={[{height: 3, backgroundColor: '#e0e0e0', borderRadius: 10, width: '80%', marginHorizontal: 40}, contentStyle]} />
      
      <BottomSheetScrollView
        style={{marginTop: 8, marginBottom: 18}}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        <Animated.View style={contentStyle}>
          <Text className="text-lg mx-4 font-semibold text-gray-700 mt-4">Description</Text>
          <View style={{marginHorizontal: 24}}>
            <Text className="text-black">{location?.description}</Text>
          </View>

          <View className="justify-between mt-4">
            <Text className="text-lg mx-4 font-semibold text-gray-700 mt-4">Review Summary</Text>

            <View className="flex-row justify-between items-center mx-4 mt-4">
              <Text className="text-base font-medium text-gray-700">Average Rating</Text>
              <StarRatingDisplay rating={4.5} starSize={25} color='purple'/>
            </View>

            <TouchableOpacity>
              <Text className="text-base mx-4 font-medium text-blue-600">View All</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BottomSheetScrollView>
    </BottomSheet>
  )
}




export default LocationDetailsScreen