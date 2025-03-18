import { View, Text, TouchableOpacity, FlatList, TextInput, Image, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "../utils/axios";
import { router } from "expo-router";
import { ArrowLeftIcon } from "react-native-heroicons/outline";
import { useInfiniteQuery } from "@tanstack/react-query";
import images from "../../assets/images/images";
import ServiceManageModal from "../components/ServiceManageModal";

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

  const [modalVisible, setModalVisible] = useState(true);
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
                <Text className="mt-3 text-gray-300">Loading businesses...</Text>
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
          return null;
        }}
        renderItem={({item}) => (
          <View>
            <TouchableOpacity className="flex-row items-center ml-5 mt-5" onPress={() => selectService(item?._id)}>
              <Image source={item?.mediaUrls.length > 0 ? {uri: item?.mediaUrls[0]} : images.ActivityImg} style={{ width: 60, height: 60, borderRadius: 5 }} />

              <View className="px-3">
                <Text className="text-sm text-neutral-500 ">{item?._id}</Text>
                <Text className="text-lg text-neutral-200 ">{item?.name}</Text>
                <Text className="text-sm text-neutral-500 ">{item?.category}</Text>
              </View>

            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => (<View className="bg-gray-600 h-0.5 w-[90%] mx-auto mt-4" />)}
      />

      <ServiceManageModal serviceId={selectedService} visible={modalVisible} setVisible={setModalVisible} />
    </SafeAreaView>
  );
};

export default ServiceManageScreen;
