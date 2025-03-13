import { View, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { FlatList, TextInput } from "react-native-gesture-handler";
import axiosInstance from "../utils/axios";
import ActionSheet from "react-native-actions-sheet";
import { useInfiniteQuery } from "@tanstack/react-query";
import tempLocations from "../screens/tempfiles/templocations";
import { MagnifyingGlassIcon, XMarkIcon } from "react-native-heroicons/outline";
import { ActivityIndicator } from "react-native";

const getQueryLocations = async ({ pageParam = 1, searchQuery }) => 
{
  console.log("Search query: ", searchQuery);

  try
  {
    //remove end spaces eg "location " -> "location"
    searchQuery = searchQuery.trim();
    const res = await axiosInstance.get(`/location/search?searchParam=${searchQuery}&page=${pageParam}`);
    // console.log(res.data);
    return res.data;
  }
  catch(error)
  {
    console.log(error);
    throw error;
  }
};


const LocationsModal = ({ visible, setVisible, setForm }) => {

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(""); //for debouncing search query to limit api calls
  const actionSheetRef = React.useRef();

  const onClose = () => {
    setSearchQuery("");
    setVisible(false);
  };

  const selectLocation = (item) => {
    setForm((prev) => ({...prev, location: item}));
    onClose();
  }

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, error, refetch } = useInfiniteQuery({
    queryKey: ["createPostLocations", debouncedSearchQuery],
    queryFn: ({ pageParam = 1 }) => getQueryLocations({ pageParam, searchQuery: debouncedSearchQuery }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: (debouncedSearchQuery.length > 0), //only work if search query is present
  });

  let locations = data?.pages.flatMap((page)=> page.locations) || [];

  useEffect(()=>
  {
    if(visible) actionSheetRef.current?.setModalVisible(true);
    else actionSheetRef.current?.setModalVisible(false);
  },[visible])

  useEffect(()=>
  {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timer);
    }
  }, [searchQuery]);
  

  return (
    <View className="flex-1">
      <ActionSheet 
        ref={actionSheetRef}
        containerStyle={{backgroundColor: '#070f1b', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '90%'}}
        indicatorStyle={{width: 50, marginVertical: 10, backgroundColor: 'black'}}
        gestureEnabled={true} //check if disabling this and adding a cancel button is better UI
        onClose={onClose}
        statusBarTranslucent={true}
        keyboardHandlerEnabled={true}
      >

        <View className="flex-row items-center justify-between p-4 gap-x-3">

          <View className="flex-1 flex-row h-[40] items-center border-gray-500 border rounded-full pl-2 w-[80%]">
            <MagnifyingGlassIcon size={20} color="white" />
            <TextInput
              placeholder="Search locations"
              placeholderTextColor="gray"
              value={searchQuery}
              clearButtonMode="always"
              autoCapitalize="none"
              autoCorrect={false}
              className="flex-1 text-base pl-2 tracking-wider text-white"
              onChangeText={(text) => setSearchQuery(text)}
            />
          </View>

          <TouchableOpacity onPress={onClose} className="p-0.5">
            <XMarkIcon size={30} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList 
          data={locations}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 0, paddingBottom: 60 }}
          ListEmptyComponent={() => {
            if (isFetching) 
            {
              // Show a loading spinner while fetching
              return (
                <View className="flex-1 mt-5 justify-center items-center">
                  <ActivityIndicator size="large" color="white" />
                  <Text className="mt-3 text-gray-400">Loading locations...</Text>
                </View>
              );
            } 
            else if (error) 
            {
              // Show an error message if the query fails
              return (
                <View className="flex-1 mt-5 justify-center items-center">
                  <Text className="text-lg text-red-500">Failed to fetch locations.</Text>
                  <TouchableOpacity
                    className="mt-3 bg-blue-500 py-2 px-4 rounded-full"
                    onPress={refetch}
                  >
                    <Text className="text-white">Retry</Text>
                  </TouchableOpacity>
                </View>
              );
            }
            else if (debouncedSearchQuery.length > 0 && locations.length === 0)
            {
              // Show a "No locations found" message when there are no results
              return (
                <View className="flex-1 mt-5 justify-center items-center">
                  <Text className="text-lg text-gray-400">No locations found for "{debouncedSearchQuery}"</Text>
                </View>
              );
            }
            else if (debouncedSearchQuery.length === 0)
            {
              // Show a "Search for locations" message when search query is empty
              return (
                <View className="flex-1 mt-5 justify-center items-center">
                  <Text className="text-lg text-gray-400">Search for locations</Text>
                </View>
              );
            }
            return null;
          }}

          renderItem={({item}) => (
            <TouchableOpacity className="flex-row items-center justify-between p-5" onPress={() => selectLocation(item)}>
                <Text className="text-lg text-white">{item.name}</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => (<View className="bg-gray-200 h-0.5 w-3/4 mx-auto" />)}
        
        />

      </ActionSheet>
    </View>
  );
};

export default LocationsModal;
