import React from 'react'
import { Text, View, TouchableOpacity, ScrollView, Image, Dimensions } from "react-native";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { calculateDuration } from "../utils/dateTimCalc";
import FontAwesome from '@expo/vector-icons/FontAwesome';

const width = Dimensions.get("window").width;


const PostCard = (({post}) => {

    const progress = useSharedValue(0);
    const ref = React.useRef(null);

    const onPressPagination = (index) => {
        ref.current?.scrollTo({
        count: index - progress.value,
        animated: true
        })
    }

    return (
        // parent view is card
        <View className="flex-1 bg-[#0e1c30] w-[95%] h-full mb-5 rounded-2xl">
            {/* user info */}
            <View className="flex-row justify-start p-4">
                {/* profile pic */}
                <Image source={{uri:post?.creatorId?.profilePicture}} className="w-16 h-16 rounded-full" />

                <View className="flex-col justify-center ml-3">
                    <TouchableOpacity>
                        <Text className="font-bold text-white">
                            {post?.creatorId?.username || "Username"}
                        </Text>
                    </TouchableOpacity>
                    <Text className="text-white">
                        {calculateDuration(post?.createdAt)}
                    </Text>
                </View>

            </View>
            {/* caption */}
            <Text className="text-white p-4 mb-4">
                {post.caption}
            </Text>

            {/* carousel of images*/}
            {/* keep this commented out until fix is given */}
            <View className="flex-1 items-center justify-center mt-3">
                <Carousel 
                    // loop={false}
                    ref={ref}
                    width={350}
                    height={400}
                    data={post.mediaUrls}
                    style={{alignItems: 'center',justifyContent: 'center'}}
                    onProgressChange={progress}
                    onConfigurePanGesture={(panGesture) => {
                        // for iOS and Android
                        panGesture.activeOffsetX([-5, 5]);
                        panGesture.failOffsetY([-5, 5]);
                    }}
                    scrollAnimationDuration={200}
                    renderItem={({item}) => (
                        <View className="flex-1 items-center">
                            <Image
                                source={{uri: item}}
                                style={{width: 350,height: 400, borderRadius: 15}}
                                resizeMode="cover"
                            />
                        </View>
                    )}
                />

                <Pagination.Basic 
                    progress={progress}
                    data={post.mediaUrls}
                    onPress={onPressPagination}
                    size={15}
                    dotStyle={{backgroundColor: 'gray', borderRadius: 100}}
                    activeDotStyle={{backgroundColor: 'white', overflow: 'hidden', aspectRatio: 1, borderRadius: 15}}
                    containerStyle={{gap: 5, marginTop: 10}}
                    horizontal
                
                />
            </View>

            {/* divider */}
            <View className="border-b-2 border-gray-300 w-11/12 self-center mt-4"></View>

            {/* like, comment, share buttons */}
            <View className="flex-row justify-around p-1">
            <TouchableOpacity className="flex-row justify-center p-5 rounded-md">
                <FontAwesome name="heart-o" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row justify-center p-5 rounded-md">
                <FontAwesome name="comment-o" size={24} color="white" />
            </TouchableOpacity>

            </View>

        </View>
    )
})

export default PostCard