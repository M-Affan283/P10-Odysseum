import React from 'react'
import { Text, View, TouchableOpacity, Image, Dimensions, ImageBackground } from "react-native";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { calculateDuration } from "../utils/dateTimCalc";
import { BookOpenIcon, HeartIcon } from "react-native-heroicons/outline";
import { HeartIcon as HeartIconSolid, MapPinIcon } from 'react-native-heroicons/solid';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import useUserStore from '../context/userStore';
import { LinearGradient } from 'expo-linear-gradient';

const width = Dimensions.get("window").width;


const PostCard = (({post}) => {

    const progress = useSharedValue(0);
    const ref = React.useRef(null);
    const user = useUserStore(state => state.user);

    const onPressPagination = (index) => {
        ref.current?.scrollTo({
        count: index - progress.value,
        animated: true
        })
    }

    const PostCardFooter = () =>
    {
        return (
            <View style={{marginHorizontal: 20, paddingVertical: 15}}>
                <View className="flex-row justify-between items-center mt-2">

                    <View className="flex-row items-center py-1">
                        <MapPinIcon size={15} color="gray" />
                        <Text style={{color: "gray", paddingHorizontal: 5}}>{post?.location || "Lahore, Pakistan"}</Text>
                    </View>

                    <Text style={{color: "gray", paddingHorizontal: 5}}>{calculateDuration(post?.createdAt)}</Text>
                </View>

                <Text className="font-bold text-white text-lg">{post?.caption}</Text>
            </View>
        )
    }

    const PostCardImage = ({ children }) =>
    {
        return (
            <View style={{borderRadius: 30, overflow: "hidden", borderWidth: 1}}>
                <ImageBackground source={{uri: post?.mediaUrls[0]}} style={{width: '100%', aspectRatio: 1}} imageStyle={{borderRadius: 30, resizeMode: "cover"}}>
                <LinearGradient
                    colors={["rgba(0,0,0,.6)", "transparent"]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={{
                        bottom: 0,
                        height: 120,
                        width: "100%",
                        position: "absolute",
                    }}
                />
                {children}
                </ImageBackground>
            </View>
        )
    }

    const Avatar = () =>
    {
        return (
            <View className="flex-row">
                <TouchableOpacity onPress={() => post?.creatorId?._id !== user?._id ? router.push(`/user/${post?.creatorId?._id}`) : router.push(`/profile`)} className="flex-row">
                    <Image source={{uri: post?.creatorId?.profilePicture}} style={{width: 35, height: 35, borderRadius: 50}} />
                    <View style={{marginLeft: 10}}>
                        <Text className="font-bold text-white" style={{fontSize: 15}}>{post?.creatorId?.username}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    const PostCardStats = () => //contains like and ppost details route button
    {
        const handleLike = async () => {};

        return (
            <>
                <View className="flex-row justify-between items-center" style={{margin: 10}}>
                    <Avatar />

                    <View className="flex-row items-center gap-1">
                        <View style={{zIndex: 10}}>
                            <TouchableOpacity>
                                <View className="bg-gray-700 p-3 rounded-full flex-row items-center">
                                    <HeartIcon size={20} color="white" style={{paddingHorizontal: 5}} />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{zIndex: 10}}>
                            <TouchableOpacity onPress={() => router.push(`/post/${post?._id}`)}>
                                <View className="bg-gray-700 p-3 rounded-full flex-row items-center">
                                    <BookOpenIcon size={20} color="white" style={{paddingHorizontal: 5}} />
                                </View>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </>
        )
    }

    return (
        <View className=" bg-[#2E2F40]" style={{borderRadius: 30, marginHorizontal: 10}}>
            <PostCardImage>
                <View style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                    <PostCardStats />
                </View>
            </PostCardImage>
            <PostCardFooter />
        </View>
    )
})

export default React.memo(PostCard)