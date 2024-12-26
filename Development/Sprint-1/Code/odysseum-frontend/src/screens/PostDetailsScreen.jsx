import { View, Text, Image, ScrollView, TouchableWithoutFeedback, TextInput, TouchableOpacity } from 'react-native'
import {useCallback, useEffect, useRef, useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../utils/axios';
import Toast from 'react-native-toast-message';
import useUserStore from '../context/userStore';
import Carousel from '../components/Carousel';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetTextInput, BottomSheetView, BottomSheetFooter } from '@gorhom/bottom-sheet';
import Feather from '@expo/vector-icons/Feather';
import LottieView from 'lottie-react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { FlatList } from 'react-native-gesture-handler';

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

const tempComments = [
  {
    "_id": "1",
    "username": "affantest",
    "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    "text": "This is a comment",
  },
  {
    "_id": "2",
    "username": "haroontest",
    "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    "text": "This is another comment",
  },
  {
    "_id": "2543`",
    "username": "haroontest",
    "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    "text": "This is another comment",
  },
  {
    "_id": "2880",
    "username": "haroontest",
    "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    "text": "This is another comment",
  },
  {
    "_id": "2889",
    "username": "haroontest",
    "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    "text": "This is another comment",
  },
  {
    "_id": "288",
    "username": "haroontest",
    "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    "text": "This is another comment",
  },
  {
    "_id": "20",
    "username": "haroontest",
    "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    "text": "This is another comment",
  },
  {
    "_id": "21",
    "username": "haroontest",
    "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    "text": "This is another comment",
  },
  {
    "_id": "22",
    "username": "haroontest",
    "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    "text": "This is another comment",
  },
  {
    "_id": "24",
    "username": "haroontest",
    "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    "text": "This is another comment",
  },
  {
    "_id": "5",
    "username": "haroontest",
    "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    "text": "This is another comment",
  },
  {
    "_id": "75",
    "username": "haroontest2122",
    "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    "text": "This is another comment hhhhhh",
  },
  {
    "_id": "72",
    "username": "haroontest2222",
    "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    "text": "hhhhhh",
  },
  
]

const PostDetailsScreen = ({postId}) => {

    const [post, setPost] = useState(null); //post details will be fetched from backend
    const [comments, setComments] = useState([]); //if user slects show somments, a scrollable modal will appear with comments
    const [loading, setLoading] = useState(true);
    const [commentsLoading, setCommentsLoading] = useState(false);

    const user = useUserStore((state) => state.user);

    
    const bottomSheetRef = useRef(null);
    
    const handleClosePress = () =>
    {
        bottomSheetRef.current?.close();
    }

    const handleOpenPress = () =>
    {
      // setCommentsLoading(true);
      bottomSheetRef.current?.present();
      getComments();
    }

    const getPost = async () =>
    {
      console.log("Retrieving post details...");

      setLoading(true);

      try
      {
        axiosInstance.get('/post/getById', {params: {requestorId: user._id, postId: postId}})
        .then((res)=>
        {
          // console.log(res.data.post);
          setPost(res.data.post);
          setLoading(false);
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
          setLoading(false);
        });

      }
      catch(error)
      {
        console.log(error);
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Error',
          text2: 'An error occurred while fetching post details'
        });
      }
    }

    useEffect(()=>
    {
      getPost();
    }, [])

    const getComments = async () =>
    {
      console.log("Retrieving comments...");
    
      // setCommentModalVisible(true);
      setCommentsLoading(true);
      
      axiosInstance.get('/comment/getByPostId', {params: {postId: postId}})
      .then((res)=>
      {
        console.log(res.data.comments);
        
        //check if res.data.comments has comments that are already in comments array. if they are then dont add them
        if(res.data.comments.length > 0)
        {
          res.data.comments.forEach((comment) => {
            if(!comments.some((c) => c._id === comment._id))
            {
              //append new comments to existing comments
              setComments((prevComments) => [...prevComments, { _id: comment._id, username: comment.creatorId.username, profilePicture: comment.creatorId.profilePicture, text: comment.text }]);
            }
          });
        }

        setCommentsLoading(false);

        // setComments([...comments, ...res.data.comments]); //append new comments to existing comments
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
        setCommentsLoading(false);
      });
  
      
    }

    const addComment = async (text) =>
    {
      console.log(text)
      // do acios call later. for now just add comment to comments array to check if flatlist renders them properly
      const tempId = Math.random().toString();

      //blur method
      setComments((prevComments) => [...prevComments, { _id: tempId, username: user.username, profilePicture: user.profilePicture, text: text, blurred: true }]); //append hopeful comment to existing comments. set blurred to true to show that comment is being added
      
      axiosInstance.post('/comment/addTopComment', {postId: postId, creatorId: user._id, text: text})
      .then((res)=>
      {
        console.log(res.data);
        // getComments(); might do this or use the blur method

        //blur method: find the comment with tempId, update id to res.data.comment._id and set blurred to false
        setComments((prevComments) => prevComments.map((comment) => {
          if(comment._id === tempId)
          {
            return { _id: res.data.comment._id, username: user.username, profilePicture: user.profilePicture, text: text, blurred: false }
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
      });

    
    }
      
  


  return loading ? (
    <SafeAreaView className="bg-primary h-full">
      <View className="flex items-center justify-center h-full">
      <LottieView
        source={require('../../assets/LoadingAnimation.json')}
        style={{
          width: 100,
          height: 100,
          
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
        <ScrollView className="px-4 my-6">

          {/* user data first */}
          <View className="flex flex-row justify-start gap-4 py-5">
            <Image source={{uri: post?.creatorId?.profilePicture}} className="w-16 h-16 rounded-full" />
            <Text className="text-lg text-white">{post?.creatorId?.username || "Username"}</Text>
          </View>

          {/* post media in carousel*/}

          <Carousel imagesUri={post?.mediaUrls} />


          {/* heart icon on left end and likes on right end */}
          <View className="flex flex-row justify-between my-3">
            <Feather name="heart" size={24} color="white" />
            <Text className="text-white justify-end">{post?.likeCount || 0} likes</Text>
          </View>

          {/* post username in bold then caption */}

          <View className="flex flex-row justify-start gap-2">
            <Text className="font-bold text-white">{post?.creatorId?.username || "Username"}</Text>
            <Text className="text-white">{post?.caption || "  Some random caption"}</Text> 
          </View>

          {/* show comments count at right end make clickable to open comments modal etc. no touchableopacity*/}
          <View className="flex flex-row justify-end py-6">
            <TouchableWithoutFeedback onPress={()=>handleOpenPress()}>
              <Text className="text-gray-500">{post?.commentCount || 0} comments</Text>
            </TouchableWithoutFeedback>
          </View>

          

          {/* finally a created at field. Should be in the form of (months/days/hours/minutes) ago */}


        </ScrollView>

        {/* <View className="bg-gray-500"> */}
        <CommentModal bottomSheetRef={bottomSheetRef} comments={comments} loading={commentsLoading} addComment={addComment} />

    </SafeAreaView>
  )
}


//will open when user clicks on comments count
const CommentModal = ({bottomSheetRef, comments, loading, addComment}) =>
{
  const [commentInput, setCommentInput] = useState('');
  
  const renderBackDrop = useCallback((props) => (
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />
  ))

  // try npm install react-native-actions-sheet
  
  const handleCommentInput = (text) =>
  {
    addComment(text);
    setCommentInput('');
  }
    
  return (
    <BottomSheetModalProvider>
      
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={['80%']}
        index={1}
        enablePanDownToClose={true}
        handleIndicatorStyle={{ backgroundColor: '#fff' }}
        backgroundStyle={{ backgroundColor: '#1d0f4e' }}
        backdropComponent={renderBackDrop}
        keyboardBehavior='extend' //check this out
        keyboardBlurBehavior='restore'
        android_keyboardInputMode='adjustResize'
        maxDynamicContentSize={600}
      >

        <BottomSheetView style={{ flex: 1, backgroundColor: '#161622' }}>

          { loading ? (
            <View className="flex items-center justify-center h-full">
              <LottieView
                source={require('../../assets/LoadingAnimation.json')}
                style={{
                  width: 100,
                  height: 100,
                }}
                autoPlay
                loop
              />
            </View>
          )
          : 
          (
            <View className="flex-1">
              <View className="flex-1 flex-grow">
                <FlatList
                  data={comments}
                  // extraData={comments} check this out
                  renderItem={({ item }) => <CommentCard comment={item} />}
                  keyExtractor={(item) => item._id}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ padding: 5 }}
                  ListEmptyComponent={() => (
                    <View className="flex justify-center items-center px-4">
                        <MaterialIcons name='hourglass-empty' size={24} color='white' className="w-[270px] h-[216px]"/>
                        <Text className="text-sm font-medium text-gray-100">Empty</Text>
                        <Text className="text-xl text-center font-semibold text-white mt-2">
                          No comments yet.
                        </Text>
                    </View>
                  )}
                  
              />
              </View>
              {/* footer containing input*/}
              <View className="flex flex-row justify-center py-4">
                <TextInput placeholder='Add a comment...' placeholderTextColor="white" style={{color: 'white', width: '80%', padding: 10, borderRadius: 8, backgroundColor: '#333'}} onChangeText={(text)=>setCommentInput(text)} />
                <TouchableOpacity onPress={()=>handleCommentInput(commentInput)}>
                  <Feather name="send" size={24} color="indigo" /*tyle={{padding: 10, backgroundColor: '#333', borderRadius: 8}}*/ />
                </TouchableOpacity>
              </View>

            </View>
          )}

        </BottomSheetView>

      </BottomSheetModal>
    </BottomSheetModalProvider>

    

  )
}

const CommentCard = ({comment}) =>
{
  return (
    <View className="flex flex-row items-start gap-4 py-4" style={comment?.blurred ? {opacity: 0.5} : {opacity: 1}}>
      {/* Profile Picture */}
      <Image
        source={{ uri: comment?.profilePicture }}
        className="w-12 h-12 rounded-full"
      />
      {/* Comment */}
      <View className="flex flex-col">
        <Text className="text-white text-xs">{comment?.username}</Text>
        <Text className="text-white">{comment?.text}</Text>
      </View>
      
    </View>
  )
}

export default PostDetailsScreen