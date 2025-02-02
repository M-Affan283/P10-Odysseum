import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import React, {useEffect, useState} from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { PaperAirplaneIcon } from 'react-native-heroicons/outline';
import { ChatBubbleBottomCenterTextIcon } from 'react-native-heroicons/solid';
import ActionSheet from 'react-native-actions-sheet';
import axiosInstance from '../utils/axios';
import useUserStore from '../context/userStore';
import LottieView from 'lottie-react-native';
// import tempComments from '../screens/tempfiles/tempcomment';
import { useInfiniteQuery } from '@tanstack/react-query';

const getQueryComments = async ({pageParam = 1, postId }) => {

    console.log("Page param:", pageParam);

    try
    {
        const res = await axiosInstance.get(`/comment/getByPostId?page=${pageParam}&postId=${postId}`);
        return res.data;
    }
    catch(error)
    {
        console.log(error);
        throw error;
    }
}

//will open when user clicks on comments count
const CommentModal = ({postId, visible, setVisible}) =>
{
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');

    const user = useUserStore((state) => state.user);

    const actionSheetRef = React.useRef();
    const inputRef = React.useRef();

    const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, error, refetch } = useInfiniteQuery({
        queryKey: ['comments', postId],
        queryFn: ({pageParam=1}) => getQueryComments({pageParam, postId: postId}),
        getNextPageParam: (lastPage) => {
            // console.log("Last page:" , JSON.stringify(lastPage,null,2));
            const { currentPage, totalPages } = lastPage;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        //disable query until visible
        enabled: visible,
    });


    useEffect(()=>
    {
        if(visible)
        {
            console.log(postId)
            actionSheetRef.current?.setModalVisible(true);
            inputRef.current?.focus();
            // getComments();
        }
        else actionSheetRef.current?.setModalVisible(false);

    }, [visible])

    useEffect(()=>
    {
        if(data)
        {
            console.log(data.pages);
            const commentsList = data?.pages.flatMap((page) => page.comments) || [];
            setComments(commentsList);
        }
    }, [data])

    const addComment = async (text) =>
    {
        console.log(text)
        // do axios call later. for now just add comment to comments array to check if flatlist renders them properly
        const tempId = Math.random().toString();

        //blur method
        setComments((prevComments) => [...prevComments, { _id: tempId,
                                                        postId: postId,
                                                        creatorId: { _id: user?._id, username: user?.username, profilePicture: user?.profilePicture },
                                                        text: text,
                                                        blurred: true }]); 
        
        axiosInstance.post('/comment/addTopComment', {postId: postId, creatorId: user._id, text: text})
        .then((res)=>
        {
            console.log(res.data);
            // getComments(); might do this or use the blur method

            //blur method: find the comment with tempId, update id to res.data.comment._id and set blurred to false
            setComments((prevComments) => prevComments.map((comment) => {
                if(comment._id === tempId) return {
                    ...comment,
                    _id: res.data.comment._id,
                    blurred: false
                }
                
                return comment;
            }))

        })
        .catch((error)=>
        {
            console.log(error);
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'Error',
                text2: error.response.data.error
            });
            //remove the comment with tempId from comments array
            setComments((prevComments) => prevComments.filter((comment) => comment._id !== tempId));
        });    
    }

    
    
    const handleCommentInput = (text) =>
    {
        addComment(text);
        setCommentInput('');
    }

    const loadMoreComments = () => {
        if(hasNextPage) fetchNextPage();
    }

    const ListEmptyComponent = () => {

        return (
            <View className="flex-1 justify-center items-center">
                {
                    isFetching ? (
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
                        <View className="flex justify-center items-center">
                            <ExclamationCircleIcon size={24} color="white" />
                            <Text className="text-xl text-center font-semibold text-white mt-2">
                                "Something went wrong. Please try again later."
                            </Text>
                        </View>
                    ) : (
                        <View className="flex justify-center items-center pb-10 pt-4">
                            <ChatBubbleBottomCenterTextIcon size={35} color="gray" />
                            <Text className="text-xl text-center font-semibold text-gray-600 mt-2">
                                "No comments"
                            </Text>

                        </View>
                    )
                }
            </View>
        )
    }
    
    return (
    
        <View className="flex-1">
            <ActionSheet
                ref={actionSheetRef}
                containerStyle={{backgroundColor: '#161622', borderTopLeftRadius: 30, borderTopRightRadius: 30}}
                indicatorStyle={{width: 50, marginVertical: 10, backgroundColor: '#fff'}}
                gestureEnabled={true}
                onClose={() => setVisible(false)}
                statusBarTranslucent={true}
                keyboardHandlerEnabled={true}
        
            >

                <FlatList
                    data={comments}
                    keyExtractor={(item) => item._id}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ padding: 0, paddingBottom: 60 }}
                    ListEmptyComponent={ListEmptyComponent}
                    onEndReached={loadMoreComments}
                    onEndReachedThreshold={0.5}
                    renderItem={({item}) => <CommentCard comment={item} />}
                />

                <View className="flex-row absolute bottom-0 right-0 left-0 items-center w-full" style={{backgroundColor: '#161622', borderWidth: 1, borderTopColor: 'gray'}}>
                    <View style={{ flex: 1, marginVertical: 5, marginHorizontal: 5 }}> 
                        <TextInput
                            ref={inputRef}
                            placeholder="Add a comment..."
                            placeholderTextColor={'gray'}
                            value={commentInput}
                            onChangeText={(text)=>setCommentInput(text)}
                            keyboardType='default'
                            style={{flex:1, width: '95%', padding: 10, backgroundColor: '#161622', color: 'white', borderRadius: 20}}
                        />
                    </View>
                    <TouchableOpacity onPress={() => handleCommentInput(commentInput)} className="flex items-center justify-center" style={{marginRight: 10}}>
                        <PaperAirplaneIcon size={30} color="white" />
                    </TouchableOpacity>
                </View>

            </ActionSheet>
        </View>
    

    )
}

const CommentCard = ({comment}) =>
{
    return (
    <View className="flex-row items-center justify-between" style={[comment?.blurred ? {opacity: 0.5} : {opacity: 1}, {marginHorizontal: 10, marginVertical: 10, padding: 15, borderRadius: 20}]}>
        
        <View className="flex-row">
            <Image source={{ uri: comment?.creatorId?.profilePicture }} style={{ width: 50, height: 50, borderRadius: 50 }} resizeMode='cover'/>
            <View className="flex-1 justify-center" style={{marginHorizontal: 10}}>
               
                <View className="flex-col">
                    <Text className="text-white text-xs font-bold">{comment?.creatorId?.username}</Text>
                    <Text className="text-white">{comment?.text}</Text>
                </View>
            
            </View>
        </View>
        
    </View>
    )
}

export default CommentModal