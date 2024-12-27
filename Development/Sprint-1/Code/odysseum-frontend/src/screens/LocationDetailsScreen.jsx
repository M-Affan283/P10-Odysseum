import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import axiosInstance from '../utils/axios';
import { router, useFocusEffect } from 'expo-router';
import useUserStore from '../context/userStore';
import DefaultLocationPNG from '../../assets/Sunset.jpg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeftIcon, MinusIcon } from 'react-native-heroicons/outline';
import { BookmarkIcon } from 'react-native-heroicons/solid';
import BottomSheet, {BottomSheetView, BottomSheetScrollView, BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetTextInput, BottomSheetFooter} from '@gorhom/bottom-sheet';
import { ScrollView} from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';

const tempLocation = {
  _id: "67310369aa977e99fcc2c31e",
  name: "Chitral, KPK",
  coordinates: {
    type: "Point",
    coordinates: [71.8003, 35.8989]
  },
  description: "Chitral is the capital of the Chitral District, situated on the western bank of the Chitral River in Khyber Pakhtunkhwa, Pakistan. It also served as the capital of the princely state of Chitral until 1969. The town is at the foot of Tirich Mir, the highest peak of the Hindu Kush, which is 25,289 ft (7,708 m) high. It has a population of 20,000. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora aut vitae quibusdam architecto numquam. Rerum asperiores sunt, eaque, animi praesentium natus sed fugiat quaerat magni eligendi voluptatum accusamus laudantium. Earum.Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam, voluptates porro fuga temporibus iusto ipsum? Facere architecto, amet itaque corporis aut ipsum molestias modi quaerat temporibus, cumque at alias magni.Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam, in quam fugiat quos illum perferendis quo? Sunt sit quos tempore non quia, totam dolorum quasi officia molestias eius praesentium molestiae!Lorem ipsum dolor, sit amet consectetur adipisicing elit. Porro accusantium eveniet id, soluta explicabo quo nihil nobis velit tempora, beatae saepe asperiores. Officiis labore est laboriosam ab, autem sapiente harum.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam voluptatum debitis ipsam perspiciatis officia inventore necessitatibus at fuga explicabo unde ad quis mollitia provident qui similique sed, nulla recusandae suscipit?Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reiciendis vitae nostrum aperiam odio et adipisci autem quibusdam ipsa? Ab expedita commodi suscipit quas fugit laborum magni odio ipsam, dolor aliquam!Lorem ipsum dolor sit amet consectetur, adipisicing elit. Reprehenderit culpa perferendis, non asperiores laborum quibusdam ea inventore? Sit fuga dolores explicabo consectetur, cumque at voluptates autem, odit vel, ea ipsam! Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quia ipsam vel dolor nostrum iure praesentium facere alias unde, magnam, id ipsa harum cum dolore quam assumenda molestiae! Et, deleniti placeat.",
}

const LocationDetailsRenderer = ({location, loading}) => {

  const ref = useRef(null);

  const snapPoints = useMemo(() => ['40%','55%', '80%'], []);

  // open the bottom sheet on mount
  useEffect(()=>
  {
    ref.current?.present(); 
  },[])

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal 
        ref={ref}
        index={1} //index 0 is 0% for some reason
        snapPoints={snapPoints}
        handleIndicatorStyle={{backgroundColor: 'transparent'}}
        enablePanDownToClose={false}
        enableDismissOnClose={false}
        // maxDynamicContentSize={Dimensions.get('window').height/2}
      >
        <BottomSheetView>
          <View className="flex-row items-center justify-between p-0" /*style={{ width: '100%' }}*/>
            {/* Left Chevron Icon */}
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="items-start justify-start py-4 ml-3" 
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
            >
              <ChevronLeftIcon size={30} strokeWidth={4} color="black" />
            </TouchableOpacity>

            {/* Centered Minus Icon */}
            <View style={{ position: 'absolute', left: '50%', transform: [{ translateX: -15 }] }}>
              <MinusIcon size={30} strokeWidth={4} color="black" />
            </View>
          </View>
          
          {loading ? (
              <View className="flex-1 items-center">
                <LottieView
                  source={require('../../assets/LoadingAnimation.json')}
                  style={{
                    width: 100,
                    height: 100,
                  }}
                  autoPlay
                  loop
                />
              </View>
            )
            :
            (
              <View className="h-full">
                <ScrollView className="p-1" contentContainerStyle={{paddingBottom: 150}}>
                  <View className="flex-row jutify-between items-center p-4">
                    <Text className="font-bold flex-1 text-neutral-700 text-3xl">
                      {location.name}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center p-4">
                    <Text className="font-semibold text-neutral-700 text-base">{location.description} </Text>
                  </View>


                </ScrollView>
              </View>
            )
        
          }
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  )
}

const LocationDetailsScreen = ({locationId}) => {

  const [location, setLocation] = useState(tempLocation || null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  // useFocusEffect(
  //   useCallback(() => {
  //     getLocationInfo();

  //     if(user.bookmarks.includes(locationId)) setBookmarked(true);
  //   }, [])
  // )

  useEffect(() => {
    getLocationInfo();
    if(user.bookmarks.some(bookmark => bookmark._id === locationId)) setBookmarked(true);
  }, [])

  const getLocationInfo = async () =>
  {
    console.log("Retrieving location info...");

    setLoading(true);

    axiosInstance.get('/location/getById', {params: {
      locationId: locationId
    }})
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

      axiosInstance.post('/user/bookmark', {userId: user._id, locationId: locationId})
      .then(async (res)=>
      {
        // console.log("Bookmarked location: ", res.data.bookmarks);
        setBookmarked(!bookmarked);
        await setUser({
          ...user,
          bookmarks: res.data.bookmarks
        })

        console.log("User bookmarks: ", user.bookmarks);
      })
      .catch((error)=>
      {
        console.log(error);
      })
  }

  // THIS IS FOR USE CASE LATER ON. AN LLM WILL SUMMARISE THE REVIEWS STORED IN THE DB. AND RETURN WHAT USERS THINK. BOTH PROS AND CONS
  const getSummariserReviews = async () => {}

  return (
    <View className="bg-white flex-1">

      <Image source={location?.imageUrl ? { uri: location?.imageUrl } : DefaultLocationPNG} style={{width: "100%", height: '65%'}} resizeMode='cover'/>
      
      <SafeAreaView className="flex-row justify-between items-center w-full absolute mt-4">
        <TouchableOpacity className="p-2 rounded-full ml-4" style={{backgroundColor: 'rgba(255, 255, 255, 0.5)'}} onPress={()=>router.back()}>
          <ChevronLeftIcon size={30} strokeWidth={4} color='white' />
        </TouchableOpacity>
        <TouchableOpacity className="p-2 rounded-full mr-4" style={{backgroundColor: 'rgba(255, 255, 255, 0.5)'}} onPress={bookmarkLocation}>
          <BookmarkIcon size={30} strokeWidth={4} color={bookmarked ? 'red' : 'white'} />
        </TouchableOpacity>
      </SafeAreaView>

      <LocationDetailsRenderer location={location} loading={loading} />
    </View>
  )
}



export default LocationDetailsScreen