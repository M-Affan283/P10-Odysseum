import { View, Text, TouchableOpacity, FlatList, TextInput, Image, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "../utils/axios";
import { router } from "expo-router";
import { ArrowLeftIcon } from "react-native-heroicons/outline";
import { useInfiniteQuery } from "@tanstack/react-query";
import images from "../../assets/images/images";
import ServiceManageModal from "../components/ServiceManageModal";
import { LinearGradient } from 'expo-linear-gradient';
//screen to display business services
const getQueryBusinessServices = async ({businessId, pageParam=1}) =>
{
  try
  {
    const res = await axiosInstance.get(`/service/getByBusiness?businessId=${businessId}&page=${pageParam}`);
    return res.data;
  }
  catch(error)
  {
    console.log(error);
    throw error;
  }
}

// show services of a
const ServiceManageScreen = ({ businessId }) => {

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const selectService = (serviceId) =>
  {
    setSelectedService(serviceId);
    setModalVisible(true);
  }

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, error, refetch } = useInfiniteQuery({
    queryKey: ["businessServices", businessId],
    queryFn: ({ pageParam = 1 }) => getQueryBusinessServices({ businessId, pageParam }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: true,
  });

  let services = data?.pages.flatMap((page)=> page.services) || [];

  const loadMoreServices = () => {
    if(hasNextPage) fetchNextPage();
  }

  const handleRefresh = async () => {
    await refetch();
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
          
      <View className="m-4">
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity onPress={() => router.back()} className="py-4">
              <ArrowLeftIcon size={30} color='white' />
          </TouchableOpacity>
          <Text className="text-3xl font-dsbold text-purple-500">Manage Services</Text>
        </View>
      </View>
      

      <FlatList
        data={services}
        keyExtractor={(item) => item?._id}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
        onEndReached={loadMoreServices}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={() => {
          if (isFetching) 
          {
            return (
              <View className="flex-1 mt-5 justify-center items-center">
                <ActivityIndicator size="large" color="black" />
                <Text className="mt-3 text-gray-300">Loading services...</Text>
              </View>
            );
          } 
          else if (error) 
          {
            return (
              <View className="flex-1 mt-5 justify-center items-center">
                <Text className="text-lg text-red-500">Failed to fetch services.</Text>
                <TouchableOpacity
                  className="mt-3 bg-blue-500 py-2 px-4 rounded-full"
                  onPress={refetch}
                >
                  <Text className="text-white">Retry</Text>
                </TouchableOpacity>
              </View>
            );
          }
          return null;
        }}
        renderItem={({item}) => (
          <TouchableOpacity 
            className="mx-4 mb-4 rounded-xl overflow-hidden shadow-lg"
            onPress={() => selectService(item?._id)}
          >
            <LinearGradient
              colors={['#08293a', 'darkblue']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4"
            >
              <View className="flex-row">
                <Image 
                  source={item?.mediaUrls.length > 0 ? {uri: item?.mediaUrls[0]} : images.ActivityImg} 
                  style={{ width: 70, height: 70, borderRadius: 8 }} 
                  className="shadow-md" 
                />
                
                <View className="flex-1 px-4 justify-center">
                  <Text className="text-xs text-blue-300 mb-1">{item?._id}</Text>
                  <Text className="text-lg text-white font-bold">{item?.name}</Text>
                  <Text className="text-sm text-gray-300 mt-1">{item?.category}</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => (<View className="bg-gray-600 h-0.5 w-[90%] mx-auto mt-4" />)}
      />

      <ServiceManageModal serviceId={selectedService} visible={modalVisible} setVisible={setModalVisible} refetch={refetch}/>
    </SafeAreaView>
  );
};

export default ServiceManageScreen;
