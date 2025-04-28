import { View, Text, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, {useEffect, useState} from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { PaperAirplaneIcon, ExclamationCircleIcon } from 'react-native-heroicons/outline';
import { ChatBubbleBottomCenterTextIcon, TrashIcon } from 'react-native-heroicons/solid';
import ActionSheet from 'react-native-actions-sheet';
import axiosInstance from '../utils/axios';
import useUserStore from '../context/userStore';
import LottieView from 'lottie-react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { calculateDuration } from '../utils/dateTimCalc';
import Toast from 'react-native-toast-message';

const getQueryComments = async ({pageParam = 1, postId }) => {
    console.log("Page param:", pageParam);

    try {
        const res = await axiosInstance.get(`/comment/getByPostId?page=${pageParam}&postId=${postId}`);
        return res.data;
    } catch(error) {
        console.log(error);
        throw error;
    }
}

const CommentModal = ({postId, visible, setVisible, postCreatorId}) => {
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const user = useUserStore((state) => state.user);

    const actionSheetRef = React.useRef();
    const inputRef = React.useRef();

    const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, error, refetch } = useInfiniteQuery({
        queryKey: ['comments', postId],
        queryFn: ({pageParam=1}) => getQueryComments({pageParam, postId: postId}),
        getNextPageParam: (lastPage) => {
            const { currentPage, totalPages } = lastPage;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        enabled: visible,
    });

    useEffect(() => {
        if(visible) {
            actionSheetRef.current?.setModalVisible(true);
            inputRef.current?.focus();
        } else {
            actionSheetRef.current?.setModalVisible(false);
        }
    }, [visible]);

    useEffect(() => {
        if(data) {
            const commentsList = data?.pages.flatMap((page) => page.comments) || [];
            setComments(commentsList);
        }
    }, [data]);

    const addComment = async (text) => {
        if (!text.trim()) return;
        
        setIsSubmitting(true);
        const tempId = Math.random().toString();

        setComments((prevComments) => [
            ...prevComments, 
            { 
                _id: tempId,
                postId: postId,
                creatorId: { 
                    _id: user?._id, 
                    username: user?.username, 
                    profilePicture: user?.profilePicture 
                },
                text: text,
                blurred: true,
                createdAt: new Date().toISOString()
            }
        ]); 
        
        axiosInstance.post('/comment/addTopComment', {postId: postId, creatorId: user._id, text: text})
            .then((res) => {

                console.log(res.data.comment);
                setComments((prevComments) => prevComments.map((comment) => {
                    if(comment._id === tempId) return {
                        ...comment,
                        _id: res.data.comment._id,
                        blurred: false
                    }
                    
                    return comment;
                }));
                setIsSubmitting(false);
            })
            .catch((error) => {
                console.log(error);
                Toast.show({
                    type: 'error',
                    position: 'bottom',
                    text1: 'Error',
                    text2: error.response.data.error
                });
                setComments((prevComments) => prevComments.filter((comment) => comment._id !== tempId));
                setIsSubmitting(false);
            });    
    }
    
    const handleCommentInput = (text) => {
        addComment(text);
        setCommentInput('');
    }

    const loadMoreComments = () => {
        if(hasNextPage) fetchNextPage();
    }

    const deleteComment = async (commentId) =>
    {
        // if (!commentId) return;

        // optimistic update

        // getting the comment to delete from the comments array in case of failure
        let comment_to_delete = comments.find((comment) => comment._id === commentId);
        if (!comment_to_delete) return;

        setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));

        axiosInstance.delete(`/comment/delete?commentId=${commentId}&postId=${postId}&deletinguserId=${user._id}`)
        .then((res)=>
        {
            console.log(res.data.message);
        })
        .catch((error) =>
        {
            console.log(error);
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'Error',
                text2: error.response.data.error
            });

            // revert optimistic update
            setComments((prevComments) => [...prevComments, comment_to_delete]);
        });
    }

    const ListEmptyComponent = () => {
        return (
            <View className="flex-1 justify-center items-center py-16">
                {isFetching ? (
                    <LottieView
                        source={require('../../assets/animations/Loading2.json')}
                        style={{
                            width: 100,
                            height: 100,
                        }}
                        autoPlay
                        loop
                    />
                ) : error ? (
                    <View className="flex justify-center items-center p-6 bg-[#291b2a] rounded-3xl">
                        <ExclamationCircleIcon size={32} color="#ff6b81" />
                        <Text className="text-lg text-center font-semibold text-white mt-3">
                            Something went wrong
                        </Text>
                        <Text className="text-sm text-center text-gray-400 mt-1">
                            Please try again later
                        </Text>
                        <TouchableOpacity 
                            onPress={() => refetch()} 
                            className="mt-4 bg-[#3d2a84] py-2 px-6 rounded-full"
                        >
                            <Text className="text-white font-semibold">Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="flex justify-center items-center p-6 bg-[#191b2a] rounded-3xl">
                        <ChatBubbleBottomCenterTextIcon size={40} color="#7b61ff" />
                        <Text className="text-xl text-center font-semibold text-white mt-3">
                            No comments yet
                        </Text>
                        <Text className="text-sm text-center text-gray-400 mt-1">
                            Be the first to comment
                        </Text>
                    </View>
                )}
            </View>
        );
    }

    const ListHeaderComponent = () => (
        <View className="pb-2 pt-4 px-4">
            <Text className="text-white text-xl font-bold">Comments</Text>
        </View>
    );

    const CommentCard = ({comment}) => {
        // Check if current user can delete this comment
        // (user is either post creator or comment creator)
        const canDelete = 
            user?._id === postCreatorId || 
            user?._id === comment?.creatorId?._id;

        return (
            <View 
                className={`mx-2 my-1 p-3 rounded-2xl ${comment?.blurred ? 'opacity-50' : 'opacity-100'}`}
                style={{
                    backgroundColor: 'rgba(41, 27, 62, 0.4)',
                    borderWidth: 1,
                    borderColor: 'rgba(123, 97, 255, 0.15)',
                }}
            >
                <View className="flex-row">
                    <Image 
                        source={{ uri: comment?.creatorId?.profilePicture }} 
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                        resizeMode='cover'
                    />
                    <View className="flex-1 ml-3">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-white text-sm font-bold">{comment?.creatorId?.username}</Text>
                            <View className="flex-row items-center">
                                {comment?.createdAt && (
                                    <Text className="text-gray-400 text-xs mr-2">{calculateDuration(comment?.createdAt)}</Text>
                                )}
                                {/* Only show delete button if user can delete */}
                                {canDelete && !comment?.blurred && (
                                    <TouchableOpacity 
                                        onPress={() => deleteComment(comment?._id)}
                                        className="p-1"
                                    >
                                        <TrashIcon size={16} color="#ff6b81" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <Text className="text-white text-sm mt-1 leading-5">{comment?.text}</Text>
                    </View>
                </View>
            </View>
        );
    }
    
    return (
        <View className="flex-1">
            <ActionSheet
                ref={actionSheetRef}
                containerStyle={{
                    backgroundColor: '#0f111a', 
                    borderTopLeftRadius: 24, 
                    borderTopRightRadius: 24,
                }}
                indicatorStyle={{
                    width: 60, 
                    height: 6,
                    marginVertical: 12, 
                    backgroundColor: '#3d3d5c'
                }}
                gestureEnabled={true}
                onClose={() => setVisible(false)}
                statusBarTranslucent={true}
                keyboardHandlerEnabled={true}
            >
                <LinearGradient
                    colors={['rgba(17, 9, 47, 0.95)', 'rgba(15, 17, 26, 0.95)']}
                    style={{ paddingBottom: 60 }}
                >
                    <FlatList
                        data={comments}
                        keyExtractor={(item) => item._id}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingHorizontal: 6, paddingBottom: 20 }}
                        ListHeaderComponent={ListHeaderComponent}
                        ListEmptyComponent={ListEmptyComponent}
                        onEndReached={loadMoreComments}
                        onEndReachedThreshold={0.5}
                        renderItem={({item}) => <CommentCard comment={item} />}
                        ListFooterComponent={isFetchingNextPage ? 
                            <ActivityIndicator size="small" color="#7b61ff" style={{marginVertical: 20}} /> 
                            : null
                        }
                    />
                </LinearGradient>

                <View className="absolute bottom-0 right-0 left-0">
                    <LinearGradient
                        colors={['rgba(25, 27, 42, 0.95)', 'rgba(33, 22, 85, 0.95)']}
                        style={{ 
                            borderTopWidth: 1, 
                            borderTopColor: 'rgba(123, 97, 255, 0.3)',
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <View className="flex-row items-center flex-1 bg-[#191b2a] rounded-full px-4 mr-2">
                            <Image 
                                source={{ uri: user?.profilePicture }} 
                                style={{ width: 28, height: 28, borderRadius: 14 }}
                                className="mr-2"
                            />
                            <TextInput
                                ref={inputRef}
                                placeholder="Add a comment..."
                                placeholderTextColor={'#6b7280'}
                                value={commentInput}
                                onChangeText={(text) => setCommentInput(text)}
                                keyboardType='default'
                                style={{
                                    flex: 1, 
                                    color: 'white', 
                                    fontSize: 14,
                                    paddingVertical: 10,
                                }}
                                multiline
                                maxLength={500}
                            />
                        </View>
                        <TouchableOpacity 
                            onPress={() => handleCommentInput(commentInput)}
                            disabled={isSubmitting || !commentInput.trim()} 
                            className={`p-2 rounded-full ${isSubmitting || !commentInput.trim() ? 'bg-[#21295A]' : 'bg-[#3d2a84]'}`}
                            style={{
                                shadowColor: "#7b61ff",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 3,
                            }}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <PaperAirplaneIcon size={20} color={commentInput.trim() ? "white" : "#6b7280"} />
                            )}
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </ActionSheet>
        </View>
    );
}


export default CommentModal;