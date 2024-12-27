import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native'
import {useState, useEffect, useCallback} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import useUserStore from '../context/userStore'
import { router, useFocusEffect } from 'expo-router'
import axiosInstance from '../utils/axios'
import InfoBox from '../components/InfoBox';
import Foundation from '@expo/vector-icons/Foundation';
import LottieView from 'lottie-react-native'

//Similar screen as UserProfileScreen, but for a user profile that is not the current user.
//This screen will be used to display other users' profiles.
//Will contain follow button, and other user-specific information.
//Will also contain a list of the user's posts.


const SingleUserProfileScreen = ({ userId }) => {

  console.log("User ID: ", userId);

    const user = useUserStore((state) => state.user);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [following, setFollowing] = useState(false); //to update follow button
    const [userToView, setUserToView] = useState({}); //user to view
    

    // useFocusEffect(
    //   useCallback(() => {
    //     getUserInfo();
    //   })
    // )

    useEffect(()=>
    {
      getUserInfo();
      if(user.following.includes(userId)) setFollowing(true);
    },[])

    const getUserInfo = async () =>
    {
      console.log("Retrieving user info...");

      setLoading(true);

      try
      {
        const [userData, userPosts] = await Promise.all([getUserData(), getUserPosts()]);

        setUserToView({...userData, posts: userPosts});

        if(user.following.includes(userId)) setFollowing(true);
        setLoading(false);

      }
      catch(err)
      {
        setError(err);
        setLoading(false);
      }
    }

    const getUserData = async () => {
      try 
      {
        const response = await axiosInstance.get('/user/getById', {
        
          params: {
            requestorId: user._id,
            userToViewId: userId
          }
        });
    
        console.log("User data retrieved:", response.data.message);
        return response.data.user; // Return the user data for further use
      }
      catch (err) {
        console.log("Error retrieving user data:", err, ". \nCheck getUserData function.");
        throw err; // Rethrow the error to be caught by the parent function
      }
    };
    
    const getUserPosts = async () => {
      try 
      {
        const response = await axiosInstance.get('/post/getUserPosts', {

          params: {
            requestorId: user._id,
            userId: userId
          }
        });
    
        console.log("User posts retrieved:", response.data.message);
        return response.data.posts || []; // Return posts or empty array if no posts
      } 
      catch (err) 
      {
        console.log("Error retrieving user posts:", err, ". \nCheck getUserPosts function.");
        throw err; // Rethrow the error to be caught by the parent function
      }
    };

    //will follow or unfollow the user
    const followUser = async () =>
    {
      //api call /user/follow
      console.log("Following user...");

      setFollowing(!following);

      try
      {
        const response = await axiosInstance.post('/user/follow', {
          userId: user._id,
          userToFollowId: userId
        });

        console.log("User followed:", response.data.message);
      }
      catch(err)
      {
        console.log("Error following user:", err.response.data.message);
        setFollowing(!following);
      }
    }


  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
      data={userToView.posts}
      keyExtractor={(item) => item._id}
      key={''}
      numColumns={3}
      columnWrapperStyle={{justifyContent: 'flex-start', paddingHorizontal: 5}}
      renderItem={({item}) => (
        <TouchableOpacity className="p-1" onPress={()=> router.push(`/post/${item._id}`)}>
            <View className="relative">

                { item.mediaUrls.length > 1 && <Foundation name="page-multiple" size={24} color="white" style={{position: 'absolute', top:8, right:8, zIndex:1, opacity: 0.9}}/> }
                <Image source={{uri: item.mediaUrls[0]}} className="w-[120px] h-[120px] rounded-md " resizeMode='cover'/>
            
            </View>
        </TouchableOpacity>
      )}
      //add styling later
      ListEmptyComponent={() => ( 
        <View className="flex justify-center items-center px-4">
            {/* <MaterialIcons name='hourglass-empty' size={24} color='white' className="w-[270px] h-[216px]"/> */}
            {/* <Text className="text-sm font-medium text-gray-100">Empty</Text> */}
            {
                loading ? (
                    <LottieView
                        source={require('../../assets/LoadingAnimation.json')}
                        style={{
                        width: 100,
                        height: 100,
                        }}
                        autoPlay
                        loop
                    />
                ) : error ? (
                    <Text className="text-xl text-center font-semibold text-white mt-2">
                        "Something went wrong. Please try again later."
                    </Text>
                ) : (
                    <Text className="text-xl text-center font-semibold text-white mt-2">
                        "No posts yet."
                    </Text>
                )
            }
        </View>
      )}

      ListHeaderComponent={() => (
        <View className='w-full flex justify-center items-center mt-6 mb-12 px-4'>

            {/* place button to update profile picture later which will open media and update picture*/}
            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
                <Image source={{uri: userToView?.profilePicture}} className="w-[90%] h-[90%] rounded-lg" resizeMode='cover' />
            </View>

            <InfoBox title={user?.firstName + ' ' + user?.lastName} containerStyles="mt-7" titleStyles="text-lg"/>
            <Text style={{ fontSize: 15, color: "grey" }}>{user?.username}</Text>

            <View className="mt-5 flex flex-row space-x-5">
                <InfoBox title={userToView?.followers?.length || 0} subtitle="Followers" containerStyles="mr-4"/>
                <InfoBox title={userToView?.following?.length || 0} subtitle="Following" containerStyles="mr-4"/>
                <InfoBox title={userToView?.posts?.length || 0} subtitle="Posts" containerStyles="mr-4"/>
            </View>

            {/* for bio */}
            <View className="w-full mt-5">
                <View className="w-full flex justify-center items-center">
                    <InfoBox title={userToView?.bio || '...'} subtitle="" containerStyles="p-2" titleStyles="text-base" />
                </View>

            </View>

            {/* follow button */}
            <View className="w-1/2">
              <TouchableOpacity onPress={followUser} className="bg-[#8C00E3] rounded-xl min-h-[62px] flex flex-row justify-center items-center mt-10 w-full">
                <Text className={`text-white font-semibold text-lg`}>
                  {following ? "Unfollow" : "Follow"}
                </Text>
              </TouchableOpacity>
            </View>
        </View>
      )}
        
      />
    </SafeAreaView>
  )
}

export default SingleUserProfileScreen