import { View, Text, Image, ScrollView, Dimensions } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../utils/axios';
import Toast from 'react-native-toast-message';
import useUserStore from '../context/userStore';
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { HeartIcon, ChatBubbleLeftEllipsisIcon, ChevronLeftIcon, FlagIcon, MapPinIcon } from "react-native-heroicons/outline";
import { HeartIcon as HeartIconSolid } from "react-native-heroicons/solid";
import LottieView from 'lottie-react-native';
import ReportModal from '../components/ReportModal';
import CommentModal from '../components/CommentsModal';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { calculateDuration } from '../utils/dateTimCalc';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

const PostDetailsScreen = ({ postId }) => {
    const [post, setPost] = useState(null);
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [commentModalVisibile, setCommentModalVisible] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const user = useUserStore((state) => state.user);

    const carouselRef = useRef(null);
    const progress = useSharedValue(0);

    const onPressPagination = (index) => {
        carouselRef.current?.scrollTo({
            count: index - progress.value,
            animated: true
        })
    }

    const getPost = async () => {
        console.log("Retrieving post details...");
        console.log(postId);

        setLoading(true);

        try {
            axiosInstance.get(`/post/getById?postId=${postId}&requestorId=${user._id}`)
                .then((res) => {
                    setPost(res.data.post);
                    if(res.data.post.liked) setLiked(true);
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
        catch (error) {
            console.log(error);
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'Error',
                text2: 'An error occurred while fetching post details'
            });
            setLoading(false);
        }
    }

    const likePost = async () => {
        axiosInstance.post('/post/like', {postId: postId, userId: user._id})
        .then((res) => {
            console.log(res.data.message);
            setLiked(!liked);
        })
        .catch((error) => {
            console.log(error);
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'Error',
                text2: error.response.data.error
            });
        });
    }

    useEffect(() => {
        getPost();
    }, [])

    if (loading) {
        return (
            <SafeAreaView className="flex-1" style={{backgroundColor: '#070f1b'}}>
                <LinearGradient
                    colors={['rgba(17, 9, 47, 0.8)', 'rgba(7, 15, 27, 0.95)']}
                    style={{ flex: 1 }}
                >
                    <TouchableOpacity 
                        onPress={() => router.back()} 
                        className="items-start justify-start mt-5 ml-5"
                        style={{
                            shadowColor: "#7b61ff",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 3,
                        }}
                    >
                        <ChevronLeftIcon size={30} strokeWidth={3} color="#f8f8ff" />
                    </TouchableOpacity>
                    <View className="flex-1 items-center justify-center h-full">
                        <LottieView
                            source={require('../../assets/animations/Loading2.json')}
                            style={{
                                width: 180,
                                height: 180,
                            }}
                            autoPlay
                            loop
                        />
                    </View>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1" style={{backgroundColor: '#070f1b'}}>
            <LinearGradient
                colors={['rgba(17, 9, 47, 0.8)', 'rgba(7, 15, 27, 0.95)']}
                style={{ flex: 1 }}
            >
                <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
                    <View className="flex flex-row justify-between items-center my-4">
                        <TouchableOpacity 
                            onPress={() => router.back()} 
                            className="p-2 bg-[#191b2a] rounded-full"
                            style={{
                                shadowColor: "#7b61ff",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 3,
                            }}
                        >
                            <ChevronLeftIcon size={26} strokeWidth={2.5} color="#f8f8ff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowReportModal(true)}
                            className="p-2 bg-[#291b2a] rounded-full"
                            style={{
                                shadowColor: "#ff6b81",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 3,
                            }}
                        >
                            <FlagIcon size={22} color="#ff6b81" />
                        </TouchableOpacity>
                    </View>

                    {/* User profile section */}
                    <TouchableOpacity onPress={() => router.push(`/user/${post?.creatorId?._id}`)} activeOpacity={0.7}>
                        <View className="flex flex-row items-center py-4 px-2">
                            <View className="rounded-full p-1 bg-gradient-to-br from-purple-500 to-blue-500">
                                <Image 
                                    source={{ uri: post?.creatorId?.profilePicture }} 
                                    className="w-14 h-14 rounded-full border-[2px] border-[#070f1b]" 
                                />
                            </View>
                            <View className="ml-4">
                                <Text className="text-lg font-bold text-white">{post?.creatorId?.username || "Username"}</Text>
                                <View className="flex-row items-center mt-1">
                                    {post?.location && (
                                        <>
                                            <MapPinIcon size={14} color="#a0aec0" />
                                            <Text className="text-[#a0aec0] text-xs ml-1">{post?.location}</Text>
                                            <Text className="text-[#a0aec0] mx-2">•</Text>
                                        </>
                                    )}
                                    <Text className="text-[#a0aec0] text-xs">{calculateDuration(post?.createdAt)}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Media carousel */}
                    <View className="mt-4 mb-6">
                        <Carousel
                            data={post?.mediaUrls || []}
                            loop={false}
                            ref={carouselRef}
                            width={screenWidth - 32}
                            height={screenWidth}
                            scrollAnimationDuration={300}
                            style={{ alignItems: 'center', justifyContent: 'center' }}
                            onProgressChange={progress}
                            onConfigurePanGesture={(panGesture) => {
                                panGesture.activeOffsetX([-5, 5]);
                                panGesture.failOffsetY([-5, 5]);
                            }}
                            renderItem={({ item }) => (
                                <View className="items-center">
                                    <Image
                                        source={{ uri: item }}
                                        style={{ 
                                            width: screenWidth - 40, 
                                            height: screenWidth,
                                            borderRadius: 16,
                                        }}
                                        resizeMode="cover"
                                    />
                                </View>
                            )}
                        />
                        {post?.mediaUrls && post?.mediaUrls.length > 1 && (
                            <Pagination.Basic
                                progress={progress}
                                data={post?.mediaUrls}
                                onPress={onPressPagination}
                                size={8}
                                dotStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', borderRadius: 4 }}
                                activeDotStyle={{ 
                                    backgroundColor: 'white', 
                                    borderRadius: 4,
                                    width: 20,
                                }}
                                containerStyle={{ gap: 6, marginTop: 16 }}
                                horizontal
                            />
                        )}
                    </View>

                    {/* Actions section */}
                    <LinearGradient
                        colors={['rgba(41, 27, 62, 0.8)', 'rgba(25, 27, 42, 0.8)']}
                        className="rounded-2xl p-4 mb-6"
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row space-x-4">
                                <TouchableOpacity 
                                    onPress={likePost} 
                                    activeOpacity={0.7}
                                    className="bg-[#221e33] p-3 rounded-full"
                                    style={{
                                        shadowColor: liked ? "#ff6b81" : "#7b61ff",
                                        shadowOffset: { width: 0, height: 3 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 5,
                                    }}
                                >
                                    {liked ? (
                                        <HeartIconSolid size={24} color="#ff6b81" />
                                    ) : (
                                        <HeartIcon size={24} color="white" />
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    activeOpacity={0.7} 
                                    onPress={() => setCommentModalVisible(true)}
                                    className="bg-[#221e33] p-3 rounded-full"
                                    style={{
                                        shadowColor: "#7b61ff",
                                        shadowOffset: { width: 0, height: 3 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 5,
                                    }}
                                >
                                    <ChatBubbleLeftEllipsisIcon size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                            
                            <View className="flex-row space-x-4">
                                <View className="items-center">
                                    <Text className="text-white font-semibold text-base">{post?.likeCount || 0}</Text>
                                    <Text className="text-[#a0aec0] text-xs">likes</Text>
                                </View>
                                
                                <TouchableOpacity onPress={() => setCommentModalVisible(true)}>
                                    <View className="items-center">
                                        <Text className="text-white font-semibold text-base">{post?.commentCount || 0}</Text>
                                        <Text className="text-[#a0aec0] text-xs">comments</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        {/* Caption */}
                        <View className="px-1 py-2">
                            <Text className="text-white font-bold text-base mb-1">{post?.creatorId?.username || "Username"}</Text>
                            <Text className="text-white text-base leading-6">{post?.caption || "Caption"}</Text>
                        </View>
                    </LinearGradient>
                </ScrollView>

                <CommentModal postId={postId} visible={commentModalVisibile} setVisible={setCommentModalVisible} />
                <ReportModal entityId={postId} reportType="Post" visible={showReportModal} setVisible={setShowReportModal} />
            </LinearGradient>
        </SafeAreaView>
    );
}

export default PostDetailsScreen;