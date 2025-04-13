import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Image } from "react-native";
import React, { useEffect, useState } from "react";
import useUserStore from "../context/userStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import axiosInstance from "../utils/axios";
import { ArrowLeftIcon, LightBulbIcon, MagnifyingGlassIcon } from "react-native-heroicons/outline";
import images from "../../assets/images/images";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import BookingManageModal from "../components/BookingManageModal";

const getQueryUserBookings = async ({ pageParam = 1, userId }) =>
{
    console.log
    try
    {
        const res = await axiosInstance.get(`/booking/getByUser?userId=${userId}&page=${pageParam}`);
        return res.data;
    }
    catch(error)
    {
        console.log(error)
        throw error;
    }
}

const tempBookings = [
    {
        _id: '1abc123def456',
        serviceId: {
            _id: 's1',
            name: 'Website Development',
            category: 'Technology',
            description: 'Full-stack web development services',
            price: 1200
        },
        bookingDate: new Date('2024-11-15').toISOString(),
        status: 'Approved',
        payment: {
            status: 'Paid',
            amount: 1200
        }
    },
    {
        _id: '2abc123def456',
        serviceId: {
            _id: 's2',
            name: 'Interior Design Consultation',
            category: 'Home & Living',
            description: 'Professional interior design advice',
            price: 350
        },
        bookingDate: new Date('2024-10-28').toISOString(),
        status: 'Pending',
        payment: {
            status: 'Pending',
            amount: 350
        }
    },
    {
        _id: '3abc123def456',
        serviceId: {
            _id: 's3',
            name: 'Photography Session',
            category: 'Creative',
            description: 'Professional photography for events',
            price: 500
        },
        bookingDate: new Date('2024-10-10').toISOString(),
        status: 'Cancelled',
        payment: {
            status: 'Refunded',
            amount: 500
        }
    },
    {
        _id: '4abc123def456',
        serviceId: {
            _id: 's4',
            name: 'Marketing Strategy',
            category: 'Business',
            description: 'Comprehensive marketing plan for your business',
            price: 800
        },
        bookingDate: new Date('2024-11-05').toISOString(),
        status: 'Approved',
        payment: {
            status: 'Paid',
            amount: 800
        }
    }
]

const UserBookingsScreen = () => {

    const user = useUserStore((state) => state.user);

    const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, error, refetch } = useInfiniteQuery({
        queryKey: ["userBookings", user?._id],
        queryFn: ({ pageParam = 1 }) => getQueryUserBookings({ pageParam, userId: user?._id }),
        getNextPageParam: (lastPage) => {
            const { currentPage, totalPages } = lastPage;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        // enabled: !!user?._id,
        enabled: true // disable for now. test ui with tempBookings
    });

    let bookings = data?.pages.flatMap((page) => page.bookings) || [];
    // const bookings = tempBookings;

    const loadMoreBookings = () =>
    {
        if(hasNextPage) fetchNextPage();
    }

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
        refreshing={isFetching}
        onRefresh={refetch}
        contentContainerStyle={{ paddingVertical: 12 }}
        ListEmptyComponent={() => {
          if (isFetching) {
            return (
              <View className="flex-1 mt-8 justify-center items-center">
                <ActivityIndicator size="large" color="#9333ea" />
                <Text className="mt-3 text-gray-300 font-medium">Loading bookings...</Text>
              </View>
            );
          } 
          else if (error) {
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
          else if (bookings.length === 0)
          {
            return (
              <View className="flex-1 mt-8 justify-center items-center">
                <LightBulbIcon size={40} color="#ffd454" />
                <Text className="mt-3 text-lg text-gray-300 font-medium">No bookings found.</Text>
                <Text className="text-gray-400 text-base mt-1 text-center">You have no bookings at the moment.</Text>
              </View>
            );
          }
          return null;
        }}
        renderItem={({item}) => (
          <TouchableOpacity 
            className="mx-4 mb-4 rounded-xl overflow-hidden shadow-lg"
            onPress={() => router.push(`user/booking/${item._id}`)}
          >
            <LinearGradient
              colors={['#1e0938', '#2d0a56']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4"
            >
              <View className="flex-row">
                
                <View className="flex-1 mr-4">
                    <Text className="text-xl text-white font-dsbold mb-1">{item?.serviceId?.name}</Text>
                    
                    <View className="flex-row items-center mb-1">
                        <View className="bg-purple-500/30 px-2 py-0.5 rounded-md">
                            <Text className="text-sm text-purple-300 font-medium">{item?.serviceId?.category}</Text>
                        </View>
                    </View>
                    
                    <View className="flex-row items-center space-x-2 mb-2">
                        <Text className="text-sm text-gray-300 font-medium">
                            Booking for Date: {new Date(item?.bookingDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </Text>
                    </View>
                    
                    <View className="flex-row items-center">
                        <View className={`px-2 py-0.5 rounded-full ${
                            item?.payment?.status === "Paid" ? "bg-green-500/20" : 
                            item?.payment?.status === "Pending" ? "bg-yellow-500/20" : 
                            "bg-red-500/20"
                        }`}>
                            <Text className={`text-xs font-medium ${
                                item?.payment?.status === "Paid" ? "text-green-300" : 
                                item?.payment?.status === "Pending" ? "text-yellow-300" : 
                                "text-red-300"
                            }`}>
                                Payment Status: {item?.payment?.status || "Not Paid"}
                            </Text>
                        </View>
                    </View>
                </View>
                
                <View className="justify-center items-center">
                  <LinearGradient
                    colors={
                      item.status === "confirmed" ? ['#0d331d', '#10512e'] : 
                      item.status === "pending" ? ['#3a3000', '#554700'] : 
                      item.status === "completed" ? ['#0d330d', '#10512e'] :
                      item.status === "no-show" ? ['#330d0d', '#501010'] : 
                      ['#330d0d', '#501010']
                    }
                    className="px-3 py-1 rounded-full border"
                    style={{ 
                      borderColor: 
                        item.status === "confirmed" ? '#22c55e' : 
                        item.status === "pending" ? '#eab308' : 
                        item.status === "completed" ? ['#0d330d', '#10512e'] :
                        item.status === "no-show" ? ['#330d0d', '#501010'] : 
                        '#ef4444'
                    }}
                  >
                    <Text className={`text-xs font-medium ${
                      item.status === "confirmed" ? "text-green-400" : 
                      item.status === "pending" ? "text-yellow-400" :
                      item.status === "completed" ? ['#0d330d', '#10512e'] :
                      item.status === "no-show" ? ['#330d0d', '#501010'] : 
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

    </SafeAreaView>
    )
}

export default UserBookingsScreen