import { View, Text, Image, ScrollView, Modal, TextInput } from 'react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../utils/axios';
import Toast from 'react-native-toast-message';
import useUserStore from '../context/userStore';
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { HeartIcon, ChatBubbleLeftEllipsisIcon, ChevronLeftIcon, FlagIcon } from "react-native-heroicons/outline";
import { HeartIcon as HeartIconSolid } from 'react-native-heroicons/solid';
import LottieView from 'lottie-react-native';
import CommentModal from '../components/CommentsModal';
import { TouchableOpacity as RNTouchableOpacity } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { calculateDuration } from '../utils/dateTimCalc';

const tempPost = {
    "_id": "6730787a070ca3617028ad30",
    "creatorId": {
        "_id": "672f358fb3e56fac046d76a5",
        "username": "affantest",
        "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    },
    "caption": "Hi this is a caption",
    "mediaUrls": [
        "https://firebasestorage.googleapis.com/v0/b/odysseumstorage.appspot.com/o/672f358fb3e56fac046d76a5%2F5a4c5f16-b526-48e9-a8b8-56150d33febc_43784.jpg?alt=media&token=e8d4c066-06db-4a62-8d5a-de9703f61433"
    ],
    "likes": 0,
    "createdAt": "2024-11-10T09:10:18.147Z",
    "updatedAt": "2024-11-10T09:10:18.147Z",
    "__v": 0,
    "commentCount": 2
};

const PostDetailsScreen = ({ postId }) => {

    const [post, setPost] = useState(null); //post details will be fetched from backend
    const [loading, setLoading] = useState(false);
    const [commentModalVisibile, setCommentModalVisible] = useState(false);

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        setLoading(true);

        try {
            axiosInstance.get(`/post/getById?postId=${postId}&requestorId=${user._id}`) //, {params: {requestorId: user._id, postId: postId}})
                .then((res) => {
                    // console.log(res.data.post);
                    setPost(res.data.post);
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

    
    const handleReportSubmit = async () => {
        if (!reportReason.trim()) {
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'Please provide a reason for reporting',
                visibilityTime: 3000,
            });
            return;
        }

        if (reportReason.length > 300) {
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'Report reason too long',
                text2: 'Please keep your report under 300 characters',
                visibilityTime: 3000,
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axiosInstance.post('/post/report', {
                reportedPostId: postId,
                reason: reportReason
            });

            if (response.data.success) {
                Toast.show({
                    type: 'success',
                    position: 'bottom',
                    text1: 'Report submitted successfully',
                    visibilityTime: 3000,
                });
                setShowReportModal(false);
                setReportReason('');
            }
        } catch (error) {
            console.log('Error submitting report:', error.response?.data || error);
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'Failed to submit report',
                text2: error.response?.data?.message || error.message,
                visibilityTime: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        getPost();
    }, [])


    return loading ? (
        <SafeAreaView className="bg-primary h-full">

            <TouchableOpacity onPress={() => router.back()} className="items-start justify-start mt-5 ml-3">
                <ChevronLeftIcon size={30} strokeWidth={4} color="white" />
            </TouchableOpacity>
            <View className="flex-1 items-center justify-center h-full">

                <LottieView
                    source={require('../../assets/animations/Loading2.json')}
                    style={{
                        width: 200,
                        height: 150,

                        // backgroundColor: '#eee',
                    }}
                    autoPlay
                    loop
                />
            </View>
        </SafeAreaView>
    )
        :
        (
            <SafeAreaView className="bg-primary h-full">
                <ScrollView className="px-4 my-6" showsVerticalScrollIndicator={false}>
                    <View className="flex flex-row justify-between items-center">
                        <TouchableOpacity onPress={() => router.back()} className="py-4">
                            <ChevronLeftIcon size={30} strokeWidth={4} color="white" />
                        </TouchableOpacity>

                        {/* Report button */}
                        <TouchableOpacity
                            onPress={() => setShowReportModal(true)}
                            className="py-4 px-2"
                        >
                            <FlagIcon size={24} color="red" />
                        </TouchableOpacity>
                    </View>

                    {/* user data first */}
                    <View className="flex flex-row justify-start gap-4 py-5">
                        <Image source={{ uri: post?.creatorId?.profilePicture }} className="w-16 h-16 rounded-full" />
                        <View className="gap-y-1">
                            <Text className="text-lg text-white">{post?.creatorId?.username || "Username"}</Text>
                            <Text className="text-gray-500">{calculateDuration(post?.createdAt)}</Text>
                        </View>
                    </View>

                    {/* post media in carousel*/}
                    <View className="flex-1 items-center justify-center mt-5">

                        <Carousel
                            data={post?.mediaUrls}
                            loop={false}
                            ref={carouselRef}
                            width={350}
                            height={400}
                            scrollAnimationDuration={100}
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
                                        style={{ width: 350, height: 400, borderRadius: 5 }}
                                        resizeMode="cover"
                                    />
                                </View>
                            )}
                        />
                        {post?.mediaUrls && post?.mediaUrls.length > 0 && (
                            <Pagination.Basic
                                progress={progress}
                                data={post?.mediaUrls}
                                onPress={onPressPagination}
                                size={10}
                                dotStyle={{ backgroundColor: 'gray', borderRadius: 100 }}
                                activeDotStyle={{ backgroundColor: 'white', overflow: 'hidden', aspectRatio: 1, borderRadius: 15 }}
                                containerStyle={{ gap: 5, marginTop: 20 }}
                                horizontal
                            />
                        )}
                    </View>


                    {/* heart icon on left end and likes on right end */}
                    <View className="flex-row my-5 gap-x-5">
                        <TouchableOpacity>
                            <HeartIcon size={30} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.6} onPress={() => setCommentModalVisible(true)}>
                            <ChatBubbleLeftEllipsisIcon size={30} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* post username in bold then caption */}

                    <View className="flex flex-row justify-start gap-2">
                        <Text className="font-bold text-white">{post?.creatorId?.username || "Username"}</Text>
                        <Text className="text-white">{post?.caption || "  Some random caption"}</Text>
                    </View>

                    {/* show comments count at right end make clickable to open comments modal etc. no touchableopacity*/}
                    <View className="flex py-6 gap-y-2">
                        <Text className="text-gray-500">{post?.commentCount || 0} comments</Text>
                        <Text className="text-gray-500">{post?.likeCount || 0} likes</Text>
                    </View>

                </ScrollView>

                {/* <View className="bg-gray-500"> */}
                <CommentModal postId={postId} visible={commentModalVisibile} setVisible={setCommentModalVisible} />

                {/* Report Post Modal */}
                <Modal visible={showReportModal} animationType='slide' transparent={true}>
                    <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                        <View className="bg-slate-800 p-6 rounded-lg w-80">
                            <Text className="text-xl font-semibold mb-4 text-white">Report Post</Text>

                            <View className="mb-4">
                                <Text className="text-base font-medium mb-2 text-white">
                                    Reason for reporting
                                </Text>
                                <TextInput
                                    value={reportReason}
                                    onChangeText={setReportReason}
                                    placeholder="Please provide details about why you're reporting this post"
                                    placeholderTextColor="gray"
                                    multiline={true}
                                    numberOfLines={4}
                                    maxLength={300}
                                    className="border-2 border-gray-600 p-3 rounded-lg bg-slate-700 text-white"
                                    style={{ textAlignVertical: 'top' }}
                                />
                                <Text className="text-gray-400 text-right mt-1">
                                    {reportReason.length}/300
                                </Text>
                            </View>
                            <RNTouchableOpacity
                                onPress={handleReportSubmit}
                                disabled={isSubmitting}
                                className="bg-red-500 p-3 rounded-lg items-center"
                            >
                                <Text className="text-white font-semibold">
                                    {isSubmitting ? "Submitting..." : "Submit Report"}
                                </Text>
                            </RNTouchableOpacity>

                            <RNTouchableOpacity
                                onPress={() => {
                                    setShowReportModal(false);
                                    setReportReason('');
                                }}
                                className="mt-4 items-center"
                            >
                                <Text className="text-gray-400">Cancel</Text>
                            </RNTouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </SafeAreaView>
        )
}


export default PostDetailsScreen