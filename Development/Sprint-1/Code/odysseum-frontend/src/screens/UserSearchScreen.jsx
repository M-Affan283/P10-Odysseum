import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, Image, ScrollView, TouchableHighlight, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import axiosInstance from "../../src/utils/axios";
import useUserStore from "../../src/context/userStore";
import Toast from "react-native-toast-message";
import LottieView from "lottie-react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from "expo-router";
import { ChevronLeftIcon } from 'react-native-heroicons/outline';

const UserSearchScreen = () => {


  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const user = useUserStore((state) => state.user);

  //change to pagination later
  const getUsers = async () =>
  {
      console.log("Getting users");
      
      axiosInstance.get(`/user/getAll`, {params: {requestorId: user._id}})
      .then((res) => {
          console.log(res.data);
          setUsers(res.data.users);
          setLoading(false);
      })
      .catch((error) => {
          console.log(error);
          Toast.show({
              type: 'error',
              position: 'bottom',
              text1: 'Error',
              text2: error.response.data.error
          });
          setLoading(false);
      });
  }

  useEffect(() => {
      getUsers();
  }, []);

  const filterUsers = () =>
  {
    if (search.trim() === '')
    {
      setFilteredUsers([]);
    }
    else 
    {
      const filtered = users.filter((user) =>
        user.username.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }

  useEffect(()=>
  {
    filterUsers();
  }, [search, users]);

  return (
    <SafeAreaView className="flex-1 pt-4 h-full" style={{marginHorizontal:20}}>

      <View className="mb-4">
        <View className="flex-row items-center space-x-2">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="py-4"
          >
            <ChevronLeftIcon size={30} strokeWidth={4} color="black" />
          </TouchableOpacity>

          {/* Search Bar */}
          <View className="flex-1 flex-row items-center bg-neutral-200 rounded-full pl-6">
            <MaterialIcons name="search" size={20} color="black" />
            <TextInput
              placeholder="Search locations"
              placeholderTextColor="gray"
              value={search}
              clearButtonMode="always"
              autoCapitalize="none"
              autoCorrect={false}
              className="flex-1 text-base mb-1 pl-1 tracking-wider"
              onChangeText={(text) => setSearch(text)}
            />
          </View>
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
        renderItem={({item}) => (
          <View>
            <TouchableOpacity className="flex-row items-center ml-2 mt-2" onPress={() => item._id !== user._id ? router.push(`/user/${item._id}`) : router.push(`/profile`)}>
              <Image source={{uri: item.profilePicture}} style={{width: 50, height: 50, borderRadius: 25}} />

              <View>
                <Text className="text-lg text-neutral-700 ml-2">{item.username}</Text>
                <Text className="text-sm text-neutral-500 ml-2">{item.firstName} {item.lastName}</Text>
              </View>

            </TouchableOpacity>

            <View className="bg-neutral-300 h-0.5 w-full mt-2" />
          </View>
        )}
      />

    </SafeAreaView>
  )
}

export default UserSearchScreen