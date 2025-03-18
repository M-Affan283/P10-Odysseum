import { View, Text, TouchableOpacity, FlatList, TextInput, Image, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import axiosInstance from "../utils/axios";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useInfiniteQuery } from "@tanstack/react-query";
import tempBusinesses from "./tempfiles/tempbusinesses";
import icons from "../../assets/icons/icons";
import images from "../../assets/images/images";


const getQueryBusinesses = async ({pageParam = 1, locationId, searchParam}) =>
{
  try
  {
    const res = await axiosInstance.get(`/business/getByLocation?locationId=${locationId}&page=${pageParam}&searchParam=${searchParam}`);
    // console.log(res.data)
    return res.data;
  }
  catch(error)
  {
    console.log(error);
    throw error;
  }
}

const BusinessViewAllScreen = ({ locationId, locationName }) => {

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, error, refetch } = useInfiniteQuery({
    queryKey: ["viewAllBusinesses", locationId, debouncedSearchQuery],
    queryFn: ({ pageParam = 1 }) => getQueryBusinesses({ pageParam, locationId, searchParam: debouncedSearchQuery }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: true,
  });

  let businesses = data?.pages.flatMap((page)=> page.businesses) || [];

  
  useEffect(()=>
    {
      const timer = setTimeout(() => {
        setDebouncedSearchQuery(searchQuery);
      }, 500);
      
      return () => {
        clearTimeout(timer);
      }
    }, [searchQuery]);
    
  const loadMoreBusinesses = () => {
    if(hasNextPage) fetchNextPage();
  }

  const handleRefresh = async () => {
    await refetch();
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">

      <View className="bg-primary z-10 py-1 rounded-b-xl">
        <View className="px-4 flex-row ">

          <TouchableOpacity onPress={() => router.back()} className="mr-4 py-4">
              <ChevronLeftIcon size={30} strokeWidth={4} color="white" />
          </TouchableOpacity>

          <View className="flex-col">
            <Text className="font-dsbold text-white text-2xl">All Businesses</Text>
            <Text className="font-dsbold text-white text-lg">{locationName}</Text>
          </View>


        </View>

        <View className="flex-row mx-auto mt-3 mb-3 items-center bg-neutral-200 rounded-full pl-6 w-[90%] h-[50px]">
          <MaterialIcons name="search" size={20} color="black" />
          <TextInput
            placeholder="Search businesses"
            placeholderTextColor="gray"
            value={searchQuery}
            clearButtonMode="always"
            autoCapitalize="none"
            autoCorrect={false}
            className="flex-1 text-base pl-1 tracking-wider"
            onChangeText={(text) => setSearchQuery(text)}
          />
        </View>
      </View>

      <FlatList
        data={businesses}
        stickyHeaderHiddenOnScroll
        stickyHeaderIndices={[0]}
        style={{marginTop: 10}}
        contentContainerStyle={{paddingBottom: 100, gap: 20}}
        refreshing={isFetching && !isFetchingNextPage}
        onRefresh={handleRefresh} 
        onEndReached={loadMoreBusinesses}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={()=> (
          <View className="h-0" />
        )}
        ListEmptyComponent={() => {
          if (isFetching) 
          {
            return (
              <View className="flex-1 mt-5 justify-center items-center">
                <ActivityIndicator size="large" color="black" />
                <Text className="mt-3 text-gray-500">Loading businesses...</Text>
              </View>
            );
          }
          else if (error) 
          {
            return (
              <View className="flex-1 mt-5 justify-center items-center">
                <Text className="text-lg text-red-500">Failed to fetch businesses.</Text>
                <TouchableOpacity
                  className="mt-3 bg-blue-500 py-2 px-4 rounded-full"
                  onPress={refetch}
                >
                  <Text className="text-white">Retry</Text>
                </TouchableOpacity>
              </View>
            );
          }
          else if (debouncedSearchQuery?.length > 0 && businesses?.length === 0)
          {
            return (
              <View className="flex-1 mt-5 justify-center items-center">
                <Text className="text-lg text-gray-500">No business found for "{debouncedSearchQuery}"</Text>
              </View>
            );
          }
          else if (debouncedSearchQuery?.length === 0 && businesses?.length === 0)
          {
            return (
              <View className="flex-1 mt-5 justify-center items-center">
                <Text className="text-lg text-gray-500">No businesses found</Text>
              </View>
            );

          }
          return null;
        }}
        renderItem={({item}) => <BusinessCard business={item} />}
        
      />

    </SafeAreaView>
  );
};

const BusinessCard = ({business}) => 
{
  return (
    // bg-[#221242]
    <View className="justify-center items-center">
    <TouchableOpacity className="flex-row p-1 bg-[#221242] rounded-xl w-[95%]" activeOpacity={0.7} onPress={() => router.push(`/business/profile/${business?._id}`)}>
      <Image source={business?.mediaUrls?.length > 0 ? { uri: business?.mediaUrls[0] } : images.BusinessSearchImg} style={{width:150, height:150}} className="rounded-xl" resizeMode="cover"/>
    
      <View className="mt-3 ml-1 flex-1">

        <View className="flex-row items-center gap-1 py-1">
          <Image source={icons.category} style={{width: 15, height: 15, tintColor:'gray'}}/>
          <Text className="text-gray-400 font-medium text-xs">{business?.category}</Text>

          {/* star rating at other end */}
          <View className="flex-row justify-end flex-1 mr-1">
            <Image source={icons.star} style={{width: 20, height: 20, tintColor:'orange',}}/>
            <Text className="text-gray-400 font-medium text-sm">{business?.averageRating}</Text>
          </View>

        </View>

        <View className="space-y-1 ml-1">
          <Text className="font-ds bold text-2xl text-neutral-200 break-words">{business?.name} </Text>
          <Text className="text-gray-400 font-medium text-sm break-words">{business?.address}</Text>
        </View>
      </View>
    </TouchableOpacity>

    </View>
  )
}

export default BusinessViewAllScreen