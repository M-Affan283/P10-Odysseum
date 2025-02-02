import { View, Text, Image, FlatList, TouchableOpacity, ImageBackground, Dimensions, Modal, TextInput } from 'react-native'
import React, {useState, useEffect, useCallback} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import useUserStore from '../context/userStore'
import { router } from 'expo-router'
import axiosInstance from '../utils/axios'
import Foundation from '@expo/vector-icons/Foundation';
import LottieView from 'lottie-react-native'
import { ExclamationCircleIcon, UserPlusIcon } from 'react-native-heroicons/solid'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

const imageWidth = (Dimensions.get('window').width-20) / 2;

const getQueryUserPosts = async ({ pageParam = 1, userId, requestorId }) => {
    console.log("Fetching user posts...");

    try {
        const res = await axiosInstance.get(`/post/getUserPosts?page=${pageParam}&userId=${userId}&requestorId=${requestorId}`);

        return res.data;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};

const getQueryUserData = async ({ userId, requestorId }) => {
    console.log("Fetching user data...");

    try {
        const res = await axiosInstance.get(`/user/getById?userToViewId=${userId}&requestorId=${requestorId}`);

        return res.data;
    }
    catch (error) {
        console.log("Error fetching user data:", error);
        throw error;
    }
}


const SingleUserProfileScreen = ({ userId }) => {

    // console.log("User ID: ", userId);

    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);
    const [following, setFollowing] = useState(false); //to update follow button

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: userData, isFetching: isFetchingUser, error: userError, refetch: refetchUser } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => getQueryUserData({ userId, requestorId: user._id }),
        // enabled: !!user,
    });

    const userToView = userData?.user || {};


    const { data: postData, isFetching: isFetchingPosts, isFetchingNextPage: isFetchingNextPagePost, fetchNextPage: fetchNextPagePost, hasNextPage: hasNextPagePosts, error: postError, refetch: refetchPosts, isRefetching: isRefetchingPosts } = useInfiniteQuery({
        queryKey: ['posts', userId], // read as posts of user with id userId (usertoViewId)
        queryFn: ({ pageParam = 1 }) => getQueryUserPosts({ pageParam, userId: userId, requestorId: user._id }),
        // initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { currentPage, totalPages } = lastPage;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        // enabled: !!user,
    });

    // const posts = user?.posts || []; // use for ui testing
    const posts = postData?.pages.map((page) => page.posts).flat() || [];
    // console.log(posts)

    useEffect(()=>
    {
        if(userToView.followed) setFollowing(true);
    },[userToView])

    useEffect(() => {
        if (postError) {
            console.log("Post error:", postError);
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'An error occurred while fetching posts',
                text2: postError.message,
                visibilityTime: 3000,
            })
        }
    }, [postError])

    useEffect(() => {
        if (userError) {
            console.log("User error:", userError);
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'An error occurred while fetching user data',
                text2: userError.message,
                visibilityTime: 3000,
            })
        }
    }, [userError])

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

        setIsSubmitting(true);
        try {
            const response = await axiosInstance.post('/user/report', {
                reportedUserId: userId,
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

    //will follow or unfollow the user
    const followUser = async () => {
        console.log("Following user...");

        setFollowing(!following);

        try {
            const response = await axiosInstance.post('/user/follow', {
                userId: user._id,
                userToFollowId: userId
            });

            //update user context user.following and push to userId in it or remove it
            if (response.data.status === "unfollowed") {
                setUser({ ...user, following: user.following.filter(following => following !== userId) });
            }
            else if (response.data.status === "followed") {
                setUser({ ...user, following: [...user.following, userId] });
            }

            console.log(user)
            console.log(response.data.message);
        }
        catch (err) {
            console.log("Error following user:", err.response.data.message);
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'An error occurred while following user',
                text2: err.response.data.message,
                visibilityTime: 3000,
            })
            setFollowing(!following);
        }
    }


    const loadMorePosts = () => {
        if (hasNextPagePosts) fetchNextPagePost();
    }

    const handleRefresh = async () => {
        await refetchUser();
        await refetchPosts();
    }

    const ProfileStat = React.memo(({ text, subText }) => {
        return (
            <View style={{ alignItems: "center" }}>
                <Text style={{ fontWeight: "400", fontSize: 25, color: "white" }}>
                    {text}
                </Text>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                    {subText}
                </Text>
            </View>
        );
    });

    const ListHeaderComponent = () => {
        return (
            isFetchingUser ? (
                <View className="flex justify-center items-center mt-6 mb-12 px-4">
                    <LottieView
                        source={require('../../assets/LoadingAnimation.json')}
                        style={{ width: 100, height: 100 }}
                        autoPlay
                        loop
                    />
                </View>
            ) : (
                <View>
                    <View className="items-center mt-5">
                        <ImageBackground 
                            source={{ uri: userToView?.profilePicture }} 
                            style={{ width: 150, height: 150, marginHorizontal: 10 }} 
                            imageStyle={{ borderRadius: 100 }}
                        >
                            <View className="absolute bottom-0 right-0">
                                <TouchableOpacity onPress={followUser} className="bg-slate-700 p-2 rounded-full">
                                    {following ?
                                        (<FontAwesome5 name="user-check" size={30} color="white" />)
                                        :
                                        (<UserPlusIcon size={35} strokeWidth={1.5} color="white" />)
                                    }
                                </TouchableOpacity>
                            </View>
                            <View className="absolute top-0 right-0">
                                <TouchableOpacity 
                                    onPress={() => setShowReportModal(true)} 
                                    className="bg-slate-700 p-2 rounded-full"
                                >
                                    <MaterialIcons name="report" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>

                        <View className="items-center mt-5 gap-2">
                            <Text className="font-bold text-xl text-white top-1">{userToView?.firstName + " " + userToView?.lastName}</Text>
                            <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }}>@{userToView?.username}</Text>
                            <TouchableOpacity onPress={() => setUpdateBio(true)}>
                                <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }}>
                                    {userToView?.bio || "Such empty. Much wow."}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="flex-row mt-5 justify-around items-center bg-[#2B2C3E]" 
                        style={{ paddingVertical: 10, marginBottom: 20, marginHorizontal: 10, borderRadius: 20 }}
                    >
                        <ProfileStat text={userToView?.followers?.length || 0} subText="Followers" />
                        <ProfileStat text={userToView?.following?.length || 0} subText="Following" />
                        <ProfileStat text={posts?.length || 0} subText="Posts" />
                    </View>
                </View>
            )
        );
    };

    const ListEmptyComponent = () => {
        return (
            <View className="flex justify-center items-center px-4">
                {
                    isFetchingPosts ? (
                        <LottieView
                            source={require('../../assets/LoadingAnimation.json')}
                            style={{
                                width: 100,
                                height: 100,
                            }}
                            autoPlay
                            loop
                        />
                    ) : postError ? (
                        <View className="flex justify-center items-center">
                            <ExclamationCircleIcon size={24} color="white" />
                            <Text className="text-xl text-center font-semibold text-white mt-2">
                                "Something went wrong. Please try again later."
                            </Text>
                        </View>
                    ) : (
                        <Text className="text-xl text-center font-semibold text-white mt-2">
                            "No posts yet."
                        </Text>
                    )
                }
            </View>
        )
    };


    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity className="p-1" onPress={() => router.push(`/post/${item._id}`)}>
                <View className="relative">

                    {item.mediaUrls.length > 1 && <Foundation name="page-multiple" size={24} color="white" style={{ position: 'absolute', top: 8, right: 8, zIndex: 1, opacity: 0.7 }} />}
                    <Image source={{ uri: item.mediaUrls[0] }} style={{ width: imageWidth, height: 300, borderRadius: 10 }} resizeMode='cover' />

                </View>
            </TouchableOpacity>
        )
    }




    return (
        <SafeAreaView className="bg-primary h-full">
            <FlatList
                data={posts}
                keyExtractor={(item) => item._id}
                key={''}
                numColumns={2}
                contentContainerStyle={{ paddingBottom: 70 }}
                onEndReached={loadMorePosts}
                onEndReachedThreshold={0.5}
                refreshing={isRefetchingPosts && isFetchingUser && !isFetchingNextPagePost}
                onRefresh={handleRefresh}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={ListEmptyComponent}
                renderItem={renderItem}
            />

            {/* Add Report Modal */}
            <Modal visible={showReportModal} animationType='slide' transparent={true}>
                <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                    <View className="bg-slate-800 p-6 rounded-lg w-80">
                        <Text className="text-xl font-semibold mb-4 text-white">Report User</Text>

                        <View className="mb-4">
                            <Text className="text-base font-medium mb-2 text-white">
                                Reason for reporting
                            </Text>
                            <TextInput
                                value={reportReason}
                                onChangeText={setReportReason}
                                placeholder="Please provide details about why you're reporting this user"
                                placeholderTextColor="gray"
                                multiline={true}
                                numberOfLines={4}
                                className="border-2 border-gray-600 p-3 rounded-lg bg-slate-700 text-white"
                                style={{ textAlignVertical: 'top' }}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleReportSubmit}
                            disabled={isSubmitting}
                            className="bg-red-500 p-3 rounded-lg items-center"
                        >
                            <Text className="text-white font-semibold">
                                {isSubmitting ? "Submitting..." : "Submit Report"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setShowReportModal(false);
                                setReportReason('');
                            }}
                            className="mt-4 items-center"
                        >
                            <Text className="text-gray-400">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

export default SingleUserProfileScreen