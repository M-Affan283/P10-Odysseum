import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import axiosInstance from "../utils/axios";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import BookingManageModal from "../components/BookingManageModal";
import axios from "axios";

const tempBookings = [
  {
    _id: '1',
    userId: { username: 'johnDoe', firstName: 'John', lastName: 'Doe' },
    bookingDate: new Date('2024-10-15'),
    payment: { status: 'Paid' },
    status: 'Approved'
  },
  {
    _id: '2',
    userId: { username: 'janeDoe', firstName: 'Jane', lastName: 'Doe' },
    bookingDate: new Date('2024-10-20'),
    payment: { status: 'Pending' },
    status: 'Pending'
  },
  {
    _id: '3',
    userId: { username: 'bobSmith', firstName: 'Bob', lastName: 'Smith' },
    bookingDate: new Date('2024-10-25'),
    payment: { status: 'Not Processed' },
    status: 'Rejected'
  },
  {
    _id: '4',
    userId: { username: 'aliceWonder', firstName: 'Alice', lastName: 'Wonder' },
    bookingDate: new Date('2024-11-01'),
    payment: { status: 'Paid' },
    status: 'Pending'
  }
]

const getQueryServiceBookings = async ({ pageParam = 1, serviceId }) =>
{
  console.log("Fetching bookings for service ID:", serviceId, "Page:", pageParam);

  try
  {
    const res = await axiosInstance.get(`/booking/getByService?serviceId=${serviceId}&page=${pageParam}`);
    // console.log(res.data);
    return res.data;
  }
  catch(error)
  {
    console.log(error);
    throw error;
  }
}
  

const ServiceBookingsScreen = ({serviceId}) => {

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const selectBooking = (booking) =>
  {
    setSelectedBooking(booking);
    setModalVisible(true);
  }

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, error, refetch } = useInfiniteQuery({
    queryKey: ["serviceBookings", serviceId],
    queryFn: ({ pageParam = 1 }) => getQueryServiceBookings({ pageParam, serviceId: serviceId }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!serviceId, //only work if service id is present
    // enabled: false // disable for now. test ui with tempBookings
  });

  let bookings = data?.pages.flatMap((page)=> page.bookings) || [];
  // const bookings = tempBookings;
  
  const loadMoreBookings = () =>
  {
    if(hasNextPage) fetchNextPage();
  }

  //once the modal is closed, refetch the bookings in case of any changes made
  useEffect(()=>
  {
    if(!modalVisible)
    {
      refetch();
    }
  }, [modalVisible]);

  return (
    <SafeAreaView className="flex-1 bg-primary">
          
      <View className="m-4">
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity onPress={() => router.back()} className="py-4">
            <ArrowLeftIcon size={30} color='white' />
          </TouchableOpacity>
          <Text className="text-3xl font-dsbold text-purple-500">Manage Service Bookings</Text>
        </View>
      </View>
      

      <FlatList
        data={bookings}
        keyExtractor={(item) => item?._id}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
        onEndReached={loadMoreBookings}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingVertical: 12 }}
        ListEmptyComponent={() => {
          if (isFetching) {
            return (
              <View className="flex-1 mt-8 justify-center items-center">
                <ActivityIndicator size="large" color="#9333ea" />
                <Text className="mt-3 text-gray-300 font-medium">Loading bookings...</Text>
              </View>
            );
          } else if (error) {
            return (
              <View className="flex-1 mt-8 justify-center items-center">
                <Text className="text-lg text-red-400 font-medium">Failed to fetch bookings.</Text>
                <TouchableOpacity
                  className="mt-4 bg-purple-500 py-2.5 px-6 rounded-lg shadow"
                  onPress={refetch}
                >
                  <Text className="text-white font-medium">Retry</Text>
                </TouchableOpacity>
              </View>
            );
          }
          return null;
        }}
        renderItem={({item}) => (
          <TouchableOpacity 
            className="mx-4 mb-4 rounded-xl overflow-hidden shadow-lg"
            onPress={() => selectBooking(item)}
          >
            <LinearGradient
              colors={['#1e0938', '#2d0a56']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4"
            >
              <View className="flex-row">
                
                <View className="flex-1 px-4 justify-center">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-lg text-white font-bold">{item?.userId?.username || 'User'}</Text>
                    <Text className="text-sm text-gray-300 ml-2">({item?.userId?.firstName} {item?.userId?.lastName})</Text>
                  </View>
                  
                  <View className="flex-row items-center mb-1">
                    <Text className="text-sm text-purple-300 font-medium">Booking for Date: </Text>
                    <Text className="text-sm text-gray-300">{new Date(item?.bookingDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center">
                    <Text className="text-sm text-purple-300 font-medium">Payment: </Text>
                    <Text className={`text-xs font-medium ${
                      item?.payment?.status === "paid" ? "text-green-400" : 
                      item?.payment?.status === "pending" ? "text-yellow-400" : 
                      "text-red-400"
                    }`}>
                      {item?.payment?.status || 'Not Processed'}
                    </Text>
                  </View>
                </View>
                
                <View className="justify-center items-center">
                  <LinearGradient
                    colors={
                      item.status === "confirmed" ? ['#0d331d', '#10512e'] : 
                      item.status === "pending" ? ['#3a3000', '#554700'] : 
                      ['#330d0d', '#501010']
                    }
                    className="px-3 py-1 rounded-full border"
                    style={{ 
                      borderColor: 
                        item.status === "confirmed" ? '#22c55e' : 
                        item.status === "pending" ? '#eab308' : 
                        '#ef4444'
                    }}
                  >
                    <Text className={`text-xs font-medium ${
                      item.status === "confirmed" ? "text-green-400" : 
                      item.status === "pending" ? "text-yellow-400" : 
                      "text-red-400"
                    }`}>
                      {item.status}
                    </Text>
                  </LinearGradient>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

        )}
      />

      <BookingManageModal booking={selectedBooking} visible={modalVisible} setVisible={setModalVisible} />
    </SafeAreaView>
  )
}

export default ServiceBookingsScreen