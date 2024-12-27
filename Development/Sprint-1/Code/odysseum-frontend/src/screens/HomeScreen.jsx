import React, { useEffect, useState } from "react";
import { View, Text, Image, SectionList } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import axiosInstance from "../utils/axios";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import FindUserImg from '../../assets/FindUserJPG.jpg';
import DiscoverLocationImg from '../../assets/DiscoverLocationJPG.jpg';
import PostCard from "../components/PostCard";
import Toast from "react-native-toast-message";
import LottieView from "lottie-react-native";

const tempPosts = [
    {
      _id: "6730787a070ca3617028ad30",
      "creatorId": {
            "_id": "672f358fb3e56fac046d76a5",
            "username": "affantest",
            "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
        },
      caption: "Hi this is a caption",
      mediaUrls: [
        "https://plus.unsplash.com/premium_photo-1685086785641-1c4dbf5853b2?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://firebasestorage.googleapis.com/v0/b/odysseumstorage.appspot.com/o/672f358fb3e56fac046d76a5%2F5a4c5f16-b526-48e9-a8b8-56150d33febc_43784.jpg?alt=media&token=e8d4c066-06db-4a62-8d5a-de9703f61433",
      ],
      likes: [],
      createdAt: "2024-11-10T09:10:18.147Z",
    },
    {
      _id: "67307bbe0fe5cfaf17cbe7c4",
      "creatorId": {
            "_id": "672f358fb3e56fac046d76a5",
            "username": "affantest",
            "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
        },
      caption: "Second post",
      mediaUrls: [
        "https://firebasestorage.googleapis.com/v0/b/odysseumstorage.appspot.com/o/672f358fb3e56fac046d76a5%2Ff59e94b0-f6ee-4b31-9eec-18fe905368fa_37042.jpg?alt=media&token=659018b2-3a81-43ef-9edb-610b68c4a4c7",
      ],
      likes: [],
    },
    {
      _id: "67307bbe0fe5cfaf17cbe7c2",
      "creatorId": {
            "_id": "672f358fb3e56fac046d76a5",
            "username": "affantest",
            "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
        },
      caption: "third post",
      mediaUrls: [
        "https://firebasestorage.googleapis.com/v0/b/odysseumstorage.appspot.com/o/672f358fb3e56fac046d76a5%2Ff59e94b0-f6ee-4b31-9eec-18fe905368fa_37042.jpg?alt=media&token=659018b2-3a81-43ef-9edb-610b68c4a4c7",
        "https://plus.unsplash.com/premium_photo-1685086785054-d047cdc0e525?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      ],
      likes: [],
    },
    {
      _id: "67307bbe0fe5cfaf171be7c4",
      "creatorId": {
            "_id": "672f358fb3e56fac046d76a5",
            "username": "affantest",
            "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
        },
      caption: "4th post",
      mediaUrls: [
        "https://images.unsplash.com/photo-1517404215738-15263e9f9178?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
      likes: [],
    },
  ]

const HomeScreen = () => {

    const [posts, setPosts] = useState(tempPosts || []);
    const [loading, setLoading] = useState(true);

    // temp method to get all posts right now. we will switch to pagination later using react-query (tanstack)
    const getPosts = async () =>
    {
      console.log('Getting posts....');
      setLoading(true);

      axiosInstance.get('/post/getAllPosts')
      .then((res)=>
      {
        // console.log(res.data);
        setPosts(res.data.posts);
        setLoading(false);
      })
      .catch((err)=>
      {
        console.log(err);
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Failed to fetch posts",
          text2: "Error occurred server side",
          visibilityTime: 3000,
        })
        
      })
    }

    useEffect(() => {
      getPosts();
    }, []) 
    
    const sections = [
      {
        title: 'Home',
        data: [],
        renderItem: ()=>null
      },
      {
        title: 'StickyHeader',
        data: [],
      },
      {
        title: 'Posts',
        data: posts,
      }
    ]

    // if(loading)
    // {
    //   return (
    //     <SafeAreaView className="flex items-center justify-center h-full">
    //       <LottieView
    //         source={require('../../assets/LoadingAnimation.json')}
    //         style={{
    //           width: 100,
    //           height: 100,
    //         }}
    //         autoPlay
    //         loop
    //       />
    //     </SafeAreaView>
    //   )
    // }

    return (

        <SafeAreaView className="flex-1 bg-primary h-full">   

            <SectionList 
              sections={sections}
              extraData={loading}
              keyExtractor={(item, index) => item?._id || index.toString()}
              ListHeaderComponent={() => (
                <View className="mx-5 py-3 flex-row justify-between items-center mb-5 space-y-6 mt-3">
                  <Text className="font-dsbold text-white" style={{fontSize: 50}}>Home</Text>

                  { loading && (
                      <LottieView
                      source={require('../../assets/LoadingAnimation.json')}
                      style={{
                        width: 100,
                        height: 100,
                      }}
                      autoPlay
                      loop
                    />
                  )}
                </View>
              )}
              stickySectionHeadersEnabled={true}
              stickyHeaderHiddenOnScroll={true}
              renderSectionHeader={({section}) => {
                if(section.title === 'StickyHeader')
                {
                  return <StickyHeaderComponent />
                }
                  return null;
                }}
                
              renderItem={({item}) => (
                  <SafeAreaView className="flex-1 items-center justify-center">
                    <PostCard post={item} />
                  </SafeAreaView>
              )}

              
            />
        </SafeAreaView>
    )
}


const StickyHeaderComponent = React.forwardRef((props, ref) => {
    return (
        <View className="space-y-4">
            <View className=" mb-3 justify-between">
                {/* user and location search buttons */}
                <View className="flex-row gap-5 p-2 bg-primary">
                     <TouchableOpacity className="flex justify-end relative p-0 space-y-2 mb-4" style={{ width: '44%', height: 100 }} /*onPress={()=> router.push(`/location/${bookmark._id}`)}*/>
                        <Image source={FindUserImg}  className="absolute rounded-lg h-full w-full" />
                    
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,1)']}
                            style={{width: '100%', height: 30, borderBottomLeftRadius: 5, borderBottomRightRadius: 5}}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            className="absolute bottom-0"
                        />
            
                        <Text className="text-white font-dsregular mb-1 text-lg"> Find Users </Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex justify-end relative p-0 space-y-2 mb-4" style={{ width: '44%', height: 100 }} onPress={()=> router.push('/location')}>
                        <Image source={DiscoverLocationImg}  className="absolute rounded-lg h-full w-full" />
                    
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,1)']}
                            style={{width: '100%', height: 30, borderBottomLeftRadius: 5, borderBottomRightRadius: 5}}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            className="absolute bottom-0"
                        />
            
                        <Text className="text-white font-dsregular mb-1 text-lg"> Discover Locations </Text>
                    </TouchableOpacity>

                    
                </View>
            </View>
        </View>
    )
})


export default HomeScreen;