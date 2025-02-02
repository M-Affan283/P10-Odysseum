import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from "react-native";
import React, {useEffect, useState} from "react";
import { router } from "expo-router";
import { ChevronLeftIcon } from "react-native-heroicons/solid";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import axiosInstance from "../utils/axios";
import tempBusinesses from "./tempfiles/tempbusinesses";
import { FlatList } from "react-native-gesture-handler";
import icons from "../../assets/icons/icons";
import Toast from "react-native-toast-message";
import images from "../../assets/images/images";
import LottieView from "lottie-react-native";

const categories = [
  {
    name: "Restaurant",
    icon: icons.dining,
  },
  {
    name: "Hotel",
    icon: icons.hotel,
  },
  {
    name: "Shopping",
    icon: icons.shopping,
  },
  {
    name: "Fitness",
    icon: icons.fitness,
  },
  {
    name: "Health",
    icon: icons.health,
  },
  {
    name: "Beauty",
    icon: icons.beauty,
  },
  {
    name: "Education",
    icon: icons.history,
  },
  {
    name: "Entertainment",
    icon: icons.celebration,
  },
  {
    name: "Services",
    icon: icons.accessibility,
  },
  {
    name: "Other",
    icon: icons.star,
  }
]

const BusinessLocationScreen = ({ locationId, locationName }) => {

  const [searchQuery, setSearchQuery] = useState("");
  const [popularBusinesses, setPopularBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const getPopularBusinesses = async () => 
  {
    console.log("Retrieving popular businesses...");

    setLoading(true);

    axiosInstance.get(`/business/getByHeatmapScoreAndLocation?locationId=${locationId}`)
    .then(res => {
      // console.log(res.data);
      setPopularBusinesses(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.log(err);
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Failed to fetch popular businesses",
        text2: "Error occurred server side",
        visibilityTime: 2000
      });
      setLoading(false);
    })

  }

  useEffect(()=>
  {
    getPopularBusinesses();
  }, [])

  return (
    <View className="flex-1 bg-primary">
    
      <View>
        <View className="py-10 bg-[#28154e] w-full rounded-b-3xl">
          <View className="px-4 flex-row ">

            <TouchableOpacity onPress={() => router.back()} className="mr-4 py-4">
                <ChevronLeftIcon size={30} strokeWidth={4} color="white" />
            </TouchableOpacity>

            <View className="flex-col">
              <Text className="font-dsbold text-white text-2xl">Discover Businesses</Text>
              <Text className="font-dsbold text-white text-lg">{locationName}</Text>
            </View>

            
          </View>

          <View className="flex-row mx-auto mt-6 items-center bg-neutral-200 rounded-full pl-6 w-[90%] h-[50px]">
            <MaterialIcons name="search" size={20} color="black" />
              <TextInput
                placeholder="Search businesses"
                placeholderTextColor="gray"
                value={searchQuery}
                clearButtonMode="always"
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 text-base mb-1 pl-1 tracking-wider"
                onChangeText={(text) => setSearchQuery(text)}
              />
          </View> 
        </View>
        
        <View className="flex-col gap-y-4">
          <CategorySlider locationId={locationId} locationName={locationName} />
          <PopularBusinessesSlider businesses={popularBusinesses} loading={loading}/>
        </View>
      </View>

    </View>
  );
};

const CategorySlider = ({locationId, locationName}) =>
{
  return (
    <View className="space-y-5 py-7">
        <View className="mx-5 flex-row justify-between items-center">
            <Text className="font-semibold text-white text-xl">Categories:</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4" nestedScrollEnabled={true}>
            {categories.map((category, index) => (
                <TouchableOpacity key={index} className="items-center space-y-2" style={{ width: 100 }} activeOpacity={0.7} onPress={() => router.push({pathname: `/business/location/${locationId}/${category?.name}`, params: {name: locationName}})}>
                    <View className="rounded-3xl overflow-hidden" style={{ width: 75, height: 75 }}>
                      {/* icon */}
                      <Image source={category?.icon} className="w-full h-full" style={{tintColor: '#657383'}} resizeMode="cover"/>
                    </View>
                    <Text className="text-[#657383] font-medium text-center">{category?.name}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
  )
}

const PopularBusinessesSlider = ({businesses, loading}) =>
{
  //temportary data
  // const businesses = tempBusinesses.slice(0, 5);

  const BusinessCard = ({business}) => 
  {
    return (
      // bg-[#221242]
      <TouchableOpacity className="mx-3 p-2 bg-[#221242] rounded-xl" activeOpacity={0.7} onPress={() => router.push(`/business/profile/${business?._id}`)}>
        <Image source={business?.imageUrls?.length>0 ? { uri: business?.mediaUrls[0] } : images.BusinessSearchImg} style={{width:250, height:170}} className="rounded-xl" resizeMode="cover"/>
      
        <View className="mt-3">

          <View className="flex-row items-center gap-1 py-1">
            <Image source={icons.category} style={{width: 15, height: 15, tintColor:'gray'}}/>
            <Text className="text-gray-400 font-medium text-xs">{business?.category}</Text>

            {/* star rating at other end */}
            <View className="flex-row justify-end flex-1 gap-x-1">
              <Image source={icons.star} style={{width: 20, height: 20, tintColor:'orange',}}/>
              <Text className="text-gray-400 font-medium text-sm">{business?.averageRating}</Text>
            </View>

          </View>

          <View className="space-y-1">
            <Text className="font-ds bold text-2xl text-neutral-200">{business?.name}</Text>
            <Text className="text-gray-400 font-medium text-sm">{business?.address}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View className="space-y-5 py-4">
        <View className="mx-5 flex-row justify-between items-center">
            <Text className="font-semibold text-white text-xl">Popular Businesses:</Text>
        </View>

        
        <FlatList 
          data = {businesses}
          horizontal
          ListEmptyComponent={() => {
            if(loading)
            {
              return (
                <View className="items-center justify-center ml-28">
                  <LottieView
                    source={require('../../assets/animations/Loading1.json')}
                    autoPlay
                    loop
                    style={{width: 150, height: 150}}
                  />
                </View>
              )
            }
            return null;
          }}
          renderItem={({item, index}) => <BusinessCard business={item} />}
        />

    </View>
  )
}

export default BusinessLocationScreen;
