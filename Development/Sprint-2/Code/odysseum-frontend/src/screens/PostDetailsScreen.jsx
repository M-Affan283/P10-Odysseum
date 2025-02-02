import { View, Text, Image, ScrollView } from 'react-native'
import {useCallback, useEffect, useRef, useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../utils/axios';
import Toast from 'react-native-toast-message';
import useUserStore from '../context/userStore';
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { HeartIcon, ChatBubbleLeftEllipsisIcon, ChevronLeftIcon } from "react-native-heroicons/outline";
import { HeartIcon as HeartIconSolid } from 'react-native-heroicons/solid';
import LottieView from 'lottie-react-native';
import CommentModal from '../components/CommentsModal';
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

const PostDetailsScreen = ({postId}) => {

    const [post, setPost] = useState(null); //post details will be fetched from backend
    const [loading, setLoading] = useState(false);
    const [commentModalVisibile, setCommentModalVisible] = useState(false);

    const user = useUserStore((state) => state.user);

    const carouselRef = useRef(null); 
    const progress = useSharedValue(0);

    const onPressPagination = (index) => {
      carouselRef.current?.scrollTo({
        count: index - progress.value,
        animated: true
      })
    }

    const getPost = async () =>
    {
      console.log("Retrieving post details...");

      setLoading(true);

      try
      {
        axiosInstance.get(`/post/getById?postId=${postId}&requestorId=${user._id}`) //, {params: {requestorId: user._id, postId: postId}})
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
        setLoading(false);
      }
    }

    useEffect(()=>
    {
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

          <TouchableOpacity onPress={() => router.back()} className="items-start justify-start py-4 ml-3">
            <ChevronLeftIcon size={30} strokeWidth={4} color="white" />
          </TouchableOpacity>

          {/* user data first */}
          <View className="flex flex-row justify-start gap-4 py-5">
            <Image source={{uri: post?.creatorId?.profilePicture}} className="w-16 h-16 rounded-full" />
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
                style={{alignItems: 'center',justifyContent: 'center'}}
                onProgressChange={progress}
                onConfigurePanGesture={(panGesture) => {
                    panGesture.activeOffsetX([-5, 5]);
                    panGesture.failOffsetY([-5, 5]);
                }}
                renderItem={({item}) => (
                    <View className="items-center">
                        <Image
                            source={{uri: item}}
                            style={{width: 350,height: 400, borderRadius: 5}}
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
                  dotStyle={{backgroundColor: 'gray', borderRadius: 100}}
                  activeDotStyle={{backgroundColor: 'white', overflow: 'hidden', aspectRatio: 1, borderRadius: 15}}
                  containerStyle={{gap: 5, marginTop: 20}}
                  horizontal
                />
              )}
            </View>


          {/* heart icon on left end and likes on right end */}
          <View className="flex-row my-5 gap-x-5">
            <TouchableOpacity>
              <HeartIcon size={30} color="white" />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.6} onPress={()=> setCommentModalVisible(true)}>
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
        <CommentModal postId={postId} visible={commentModalVisibile} setVisible={setCommentModalVisible}/>

    </SafeAreaView>
  )
}


export default PostDetailsScreen