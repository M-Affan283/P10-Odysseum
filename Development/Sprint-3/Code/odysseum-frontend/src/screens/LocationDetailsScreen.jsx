import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import axiosInstance from '../utils/axios';
import { router } from 'expo-router';
import useUserStore from '../context/userStore';
import {SafeAreaView} from 'react-native-safe-area-context';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { BookmarkIcon, ChevronDoubleUpIcon, BriefcaseIcon, PencilSquareIcon, ArrowPathIcon, MapPinIcon } from 'react-native-heroicons/solid';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import * as Animatable from 'react-native-animatable';
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import { StarRatingDisplay } from 'react-native-star-rating-widget';
import { useQuery } from '@tanstack/react-query';
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import LottieView from 'lottie-react-native';
import images from '../../assets/images/images';
import themes from '../../assets/themes/themes';

const tempLocation = {
  _id: "67310369aa977e99fcc2c31e",
  name: "Chitral, KPK",
  avgRating: 4.5,
  coordinates: {
    type: "Point",
    coordinates: [71.8003, 35.8989]
  },
  description: "Chitral is the capital of the Chitral District, situated on the western bank of the Chitral River in Khyber Pakhtunkhwa, Pakistan. It also served as the capital of the princely state of Chitral until 1969. The town is at the foot of Tirich Mir, the highest peak of the Hindu Kush, which is 25,289 ft (7,708 m) high. It has a population of 20,000. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora aut vitae quibusdam architecto numquam. Rerum asperiores sunt, eaque, animi praesentium natus sed fugiat quaerat magni eligendi voluptatum accusamus laudantium. Earum.Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam, voluptates porro fuga temporibus iusto ipsum? Facere architecto.",
}

const getQueryLocation = async ({locationId, requestorId}) => {
  console.log("Retrieving location info...");

  try
  {
    const res = await axiosInstance.get(`/location/getById?locationId=${locationId}&requestorId=${requestorId}`);
    // console.log(res.data)
    return res.data
  }
  catch(error)
  {
    console.log(error);
    throw error;
  }
}

const LocationDetailsScreen = ({locationId}) => {
  
  // const [location, setLocation] = useState(tempLocation);
  // const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  
  const viewOpacity = useSharedValue(0);

  const viewStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(viewOpacity.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    };
  })

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => getQueryLocation({locationId, requestorId: user._id}),
    // enabled: !!locationId,
  })

  const location = data?.location || tempLocation; //later change to {}
  // const location = tempLocation; //later change to {}

  useEffect(() => {
    // Trigger the animation based on loading state
    viewOpacity.value = withTiming(isFetching ? 0 : 1, { duration: 500 }); // Interpolate from 0 to 1
  }, [isFetching]);

  useEffect(() => {
    //convert this to use usequery hook
    if(location.bookmarked) setBookmarked(true);
  }, [location])


  // add or remove bookmark 
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

      { isFetching ? (
        <View className="flex-1 justify-center items-center">
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
      :
      (
        <Animated.View style={viewStyle}>
            <Image source={location?.imageUrl ? { uri: location?.imageUrl } : images.DefaultLocationImg} style={{width: "100%", height: '100%'}} resizeMode='cover'/>
    
            <SafeAreaView className="flex-row justify-between items-center w-full absolute mt-4">
              <TouchableOpacity className="p-2 rounded-full ml-4" style={{backgroundColor: 'rgba(255, 255, 255, 0.5)'}} onPress={()=>router.back()}>
                <ChevronLeftIcon size={30} strokeWidth={4} color='white' />
              </TouchableOpacity>

              <View className="flex-row items-center">
                <TouchableOpacity className="p-2 rounded-full mr-4" style={{backgroundColor: 'rgba(255, 255, 255, 0.5)'}} onPress={refetch}>
                  <ArrowPathIcon size={30} strokeWidth={4} color={'white'} />
                </TouchableOpacity>
                
                <TouchableOpacity className="p-2 rounded-full mr-4" style={{backgroundColor: 'rgba(255, 255, 255, 0.5)'}} onPress={bookmarkLocation}>
                  <BookmarkIcon size={30} strokeWidth={4} color={bookmarked ? 'red' : 'white'} />
                </TouchableOpacity>


              </View>
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

  const mapRef = useRef(null);

  const focusOnLocation = () => 
  { 
    mapRef.current?.animateToRegion({
      latitude: location?.coordinates?.coordinates[1],
      longitude: location?.coordinates?.coordinates[0],
      latitudeDelta: 0.0922,
      longitudeDelta: 0.042
    });
  }
  
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
      ['black', 'white'],
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
      backgroundColor: '#070f1b',
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
        style={{paddingHorizontal: 24, paddingVertical: 24, gap: 10}}
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
        showsHorizontalScrollIndicator={false}
      >
        <Animated.View style={contentStyle}>


          {/* Action buttons */}
          <View className="flex-row mt-4">
            <TouchableOpacity onPress={()=>router.push({pathname: `/business/location/${location._id}`, params: {name: location?.name}})} className="w-28 h-28 rounded-full items-center justify-center mx-auto mt-2 border-2 border-purple-700"  >
              <BriefcaseIcon size={40} strokeWidth={4} color={'purple'} />
              <Text className="font-dsregular text-white text-lg">Businesses</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>router.push({pathname: `/review/location/${location._id}`, params: {name: location?.name}})} className="w-28 h-28 rounded-full items-center justify-center mx-auto mt-2 border-2 border-orange-700">
              <PencilSquareIcon size={40} strokeWidth={4} color={'orange'} />
              <Text className="font-dsregular text-white text-lg">Reviews</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between items-center mx-4 mt-4">
            <Text className="text-base font-medium text-white">Rating</Text>
            <StarRatingDisplay rating={location?.avgRating} starSize={25} color='orange'/>
          </View>


          <View className="flex-1 bg-gray-800 rounded-xl p-4 mt-4 w-[95%] mx-auto">
            <Text className="text-lg font-semibold text-white">About</Text>
            <Text className="text-white">{location?.description}</Text>
          </View>

          <View className="bg-gray-800 rounded-xl p-4 mt-4 mx-auto w-[95%]">

            <Text className="text-lg font-semibold text-white">Location</Text>

            <View className="flex-1 mt-5 justify-center items-center">
                
                <TouchableOpacity className="flex-row bg-[#ff6b6b] rounded-full py-2 px-2" onPress={focusOnLocation}>
                  <MapPinIcon size={25} color="white" />
                  <Text className="text-white text-base">Refocus</Text>
                </TouchableOpacity>

                <MapView
                  ref={mapRef}
                  className="mt-3"
                  provider={PROVIDER_GOOGLE}
                  style={{ width: 330, height: 250 }}
                  customMapStyle={themes.dark}
                  initialRegion={{
                    latitude: location?.coordinates?.coordinates[1] || 0,
                    longitude: location?.coordinates?.coordinates[0] || 0,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.042
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: location?.coordinates?.coordinates[1] || 0,
                      longitude: location?.coordinates?.coordinates[0] || 0
                    }}
                    title={location?.name}
                  />
                </MapView>
              </View>
          </View>


          <View className="justify-between mt-4">

            <View className="flex-row justify-between items-center">
              <Text className="text-lg mx-4 font-semibold text-gray-700 ">Review Summary</Text>
            </View>

          </View>
        </Animated.View>
      </BottomSheetScrollView>
    </BottomSheet>
  )
}




export default LocationDetailsScreen