import { View, Text, ScrollView, Image, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native'
import {useState, useEffect, useCallback} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import useUserStore from '../context/userStore'
import { router, useFocusEffect } from 'expo-router'
import axios from 'axios'
import axiosInstance from '../utils/axios'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import InfoBox from '../components/InfoBox';

const UserProfileScreen = () => {


    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);
    const logout = useUserStore((state) => state.logout);

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateBio, setUpdateBio] = useState(false);
    const [form, setForm] = useState({ //for updating user info
        bio: '',
        profilePicture: ''
    });

    const userLogout = () =>
    {
        console.log("Logging out user: ", user.username);
        logout();
        // router.dismissAll();
        router.replace('/sign-in')
    }


    // this hook will run when the screen is focused meaning when the user navigates to this screen again since the screen is already mounted
    useFocusEffect(
        useCallback(() => {
            // Do something when the screen is focused
            getPosts();
        }, [])
    );


    const getPosts = async () =>
    {
        console.log("Retrieving user posts...");
        setLoading(true);
        try
        {
            axiosInstance.get(`/post/getUserPosts`, {
                params: {
                    requestorId: user._id,
                    userId: user._id
                }
            })
            .then((res)=>
            {
                if(res.data.posts.length > 0)
                {
                    // console.log("Posts received: ", res.data.posts)
                    setPosts(res.data.posts);
                }
                else
                {
                    console.log("User has no posts");
                }

                
            })
            .catch((error) =>
            {
                console.log(error);
                setError(error.message);
            })
            .finally(()=>
            {
                setLoading(false);
            })
        }
        catch(error)
        {
            setError(error.message);
            setLoading(false);
        }
    }

    // Updates user bio
    const updateUserBio = async () => {
        try {
            axiosInstance.post('/user/updateUserBio', {userId: user._id, bio: form.bio})
            .then((res) => {
                console.log("message: ", res.data.message);
                setUser({
                    ...user,
                    bio: form.bio,
                    // profilePicture: form.profilePicture
                })
            })
            .catch((error) => {
                console.log(error);
                setError(error.message);
            })
        }
        catch(error) {
            setError(error.message);
        }
    }

    //show username, profile picture, bio, number of followers, number of following, number of posts, then in a scrollview and gridview (like instagram) show the posts. also show logout button
  return (
    <SafeAreaView className="bg-primary h-full">
        <FlatList 
            data={posts}
            keyExtractor={(item) => item._id}
            key={'_'}
            numColumns={3}
            columnWrapperStyle={{justifyContent: 'space-between'}}
            renderItem={({item}) => (
                <View className="flex-1 p-1">
                    <Image source={{uri: item.mediaUrls[0]}} style={{width: 100, height: 100}} />
                    <Text className="text-white">{item.caption}</Text>
                    <Text className="text-white">{item.commentCount} comments</Text> 
                    {/* <Text>{item.likeCount} likes</Text> */}
                </View>
            )}
            ListEmptyComponent={() => ( 
                <View className="flex justify-center items-center px-4">
                    <MaterialIcons name='hourglass-empty' size={24} color='white' className="w-[270px] h-[216px]"/>
                    <Text className="text-sm font-medium text-gray-100">Empty</Text>
                    <Text className="text-xl text-center font-semibold text-white mt-2">
                        This user has not posted anything yet.
                    </Text>
                </View>
             )}

            //show user data and logout button in header
            ListHeaderComponent={() => (
                <View className='w-full flex justify-center items-center mt-6 mb-12 px-4'>
                    <TouchableOpacity onPress={userLogout} className="flex w-full items-end mb-10">
                        <MaterialIcons name="logout" size={24} color="white" className='w-6 h-6'/>
                    </TouchableOpacity>

                    {/* place button to update profile picture later which will open media and update picture*/}
                    <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
                        <Image source={{uri: user.profilePicture}} className="w-[90%] h-[90%] rounded-lg" resizeMode='cover' />
                    </View>

                    <InfoBox title={user?.firstName + ' ' + user?.lastName} containerStyles="mt-7" titleStyles="text-lg"/>
                    <Text style={{ fontSize: 15, color: "grey" }}>{user?.username}</Text>

                    <View className="mt-5 flex flex-row space-x-5">
                        <InfoBox title={user?.followers.length || 0} subtitle="Followers" containerStyles="mr-4"/>
                        <InfoBox title={user?.following.length || 0} subtitle="Following" containerStyles="mr-4"/>
                        <InfoBox title={posts?.length || 0} subtitle="Posts" containerStyles="mr-4"/>
                    </View>

                    {/* for bio */}
                    <View className="w-full mt-5">
                        <TouchableOpacity onPress={() => setUpdateBio(true)} className="w-full flex justify-center items-center">
                            <InfoBox title={user?.bio || '...'} subtitle="Click to update bio" containerStyles="p-2" titleStyles="text-base" />
                        </TouchableOpacity>


                    </View>
                </View>
            )}
        />

        {/*  Open a modal to update bio */}
        <Modal visible={updateBio} animationType='slide' transparent={true}>

            <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                <View className="bg-white p-6 rounded-lg w-80">
                    <Text className="text-xl font-semibold mb-4">Update Bio</Text>
                    <TextInput
                        value={form.bio}
                        onChangeText={(text) => setForm({ ...form, bio: text })}
                        placeholder="Enter your new bio"
                        multiline
                        numberOfLines={4}
                        className="border border-gray-300 p-3 rounded-md mb-4"
                    />
                    <TouchableOpacity
                        onPress={()=> {updateUserBio(); setUpdateBio(false)}}
                        className="bg-primary p-3 rounded-lg items-center"
                    >
                        <Text className="text-white font-semibold">Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setUpdateBio(false)}
                        className="mt-4 items-center"
                    >
                        <Text className="text-red-500">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>


        </Modal>

    </SafeAreaView>
  )
}

export default UserProfileScreen