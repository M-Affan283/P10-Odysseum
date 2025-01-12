import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StarRatingDisplay } from 'react-native-star-rating-widget';
import {ShareIcon, ChevronLeftIcon } from "react-native-heroicons/outline";
import { HandThumbUpIcon, HandThumbDownIcon } from "react-native-heroicons/solid";
import { calculateDuration } from "../utils/dateTimCalc";
import { router } from "expo-router";
import AddReviewModal from "../components/AddReviewModal";
import axiosInstance from "../utils/axios";

const tempReviews = [
  {
    "_id": "67813933b4e348d916a9047d",
    "creatorId": {
      "_id": "672f358fb3e56fac046d76a5",
      "username": "affantest",
      "profilePicture": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    },
    "entityType": "Location",
    "entityId": {
      "_id": "67310369aa977e99fcc2c31e",
      "name": "Chitral, KPK",
    },
    "rating": 4.5,
    "title": "Test Review",
    "reviewContent": "This is some test review content.",
    "imageUrls": [],
    "upvotes": 0,
    "downvotes": 0,
    "createdAt": "2025-01-10T15:13:55.665Z",
    "updatedAt": "2025-01-10T15:13:55.665Z",
    "__v": 0
  },
]

const getQueryReviews = async ({ entityType, entityId, pageParam = 1 }) =>
{
  console.log(pageParam);

  try
  {
    const res = await axiosInstance.get(`/review/getByEntity?page=${pageParam}&entityType=${entityType}&entityId=${entityId}`);
    // console.log(res.data);
    return res.data;
  }
  catch(error)
  {
    console.log(error);
    throw error;
  }
}

const ReviewsScreen = ({ entityType, entityId, entityName }) => {

  const [reviews, setReviews] = React.useState(tempReviews || null);
  const [addReviewModalVisible, setAddReviewModalVisible] = React.useState(false);

  const upvoteReview = (reviewId) => {}
  const downvoteReview = (reviewId) => {}

  const ListHeaderComponent = () => {
    return (
      <View>
        <View className="flex-row items-center mb-5 gap-5">

          <TouchableOpacity onPress={() => router.back()} className="py-4">
              <ChevronLeftIcon size={30} strokeWidth={4} color="white" />
          </TouchableOpacity>

          <Text className="font-dsbold text-white text-3xl">Reviews: {entityName}</Text>

        </View>

          <TouchableOpacity className="px-5" onPress={() => setAddReviewModalVisible(true)}>
            <Text className="text-lg font-semibold text-blue-500">Write a review</Text>
          </TouchableOpacity>
      </View>
    )
  }

  const renderItem = ({item}) => {
    return (
      <View className="mx-3 mt-5">
        <ReviewCard review={item} upvote={upvoteReview} downvote={downvoteReview} />
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">

        <FlatList
          data={reviews}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{paddingBottom: 50, gap:20}}
          // onEndReached={}
          // onEndReachedThreshold={}
          // refreshing
          // onRefresh={}
          ListHeaderComponent={ListHeaderComponent}
          renderItem={renderItem}
        
        />

        <AddReviewModal entityId={entityId} entityType={entityType} entityName={entityName} visible={addReviewModalVisible} setVisible={setAddReviewModalVisible} />

    </SafeAreaView>
  );
};

const ReviewCard = ({ review, upvote, downvote }) => {

  const [showMore, setShowMore] = React.useState(false); // change this to true if lines exceed 2
  const [upvoted, setUpvoted] = React.useState(false);
  const [downvoted, setDownvoted] = React.useState(false);

  const CardFooter = () => {
    return (
      <View style={{marginHorizontal: 20, paddingVertical: 15}}>
          <View className="flex-row justify-between items-center mt-2 px-2">

              <View>
                <HandThumbUpIcon size={20} color="gray" />
                <Text style={{color: "gray", paddingHorizontal: 5}}>{review?.upvotes}</Text>
              </View>

              <View>
                <HandThumbDownIcon size={20} color="gray" />
                <Text style={{color: "gray", paddingHorizontal: 5}}>{review?.downvotes}</Text>
              </View>

              <ShareIcon size={20} color="gray" />
              
          </View>
      </View>
    )
  }

  return (
    <View className="bg-white rounded-2xl px-3">
      
      <View className="flex flex-row justify-start gap-4 py-5 items-center"> 
        <Image source={{uri: review?.creatorId?.profilePicture}} className="rounded-full" style={{width: 30, height: 30}} resizeMode="cover"/>
        <View className="">
          <Text className="text-l">{review?.creatorId?.username || "Username"}</Text>
          <Text className="text-gray-500">{calculateDuration(review?.createdAt)}</Text>
        </View>
      </View>

      <View className="flex justify-between items-center gap-y-2">
        <Text className="text-lg">{review?.title}</Text>
        <StarRatingDisplay rating={review?.rating} size={20} />
      </View>

      <Text
        onPress={() => setShowMore(!showMore)}
        numberOfLines={showMore ? undefined : 2}  // Toggle between truncated (2 lines) and full (undefined)
        style={{
          marginTop: 10,
          color: "black",
          paddingHorizontal: 5,
        }}
      >
        {review?.reviewContent}
      </Text>

      {/* Show the See More / See Less button if content exceeds 2 lines */}
      {review?.reviewContent && review?.reviewContent.length > 200 && (
        <Text
          onPress={() => setShowMore(!showMore)}
          style={{ color: "blue", textAlign: "center", marginTop: 5 }}
        >
          {showMore ? 'See Less' : 'See More'}
        </Text>
      )}

      <View className="flex-row justify-between items-center mt-4 bg-gray-200 rounded-lg p-2">
        <View className="px-5">
          <Text className="font-semibold text-xs">Category</Text>
          <Text className="text-gray-800">{review?.entityType === "Location" ? "Municipality" : review?.entityId?.category}</Text> 
        </View>
        <View className="px-5">
          <Text className="font-semibold text-xs">{review?.entityType}</Text>
          <Text className="text-gray-800">{review?.entityId?.name}</Text>
        </View>
      </View>

      <CardFooter />
    
    </View>
  )
};

export default ReviewsScreen;
