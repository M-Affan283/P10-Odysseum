import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StarRatingDisplay } from 'react-native-star-rating-widget';
import {ShareIcon, ChevronLeftIcon } from "react-native-heroicons/outline";
import { HandThumbUpIcon, HandThumbDownIcon } from "react-native-heroicons/solid";
import { calculateDuration } from "../utils/dateTimCalc";
import { router } from "expo-router";
import AddReviewModal from "../components/AddReviewModal";
import axiosInstance from "../utils/axios";
import useUserStore from "../context/userStore";
import { useInfiniteQuery } from "@tanstack/react-query";

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
    "upvotes": [],
    "downvotes": [],
    "createdAt": "2025-01-10T15:13:55.665Z",
    "updatedAt": "2025-01-10T15:13:55.665Z",
    "__v": 0
  },
]

const getQueryReviews = async ({ entityType, entityId, pageParam = 1, requestorId }) =>
{
  // console.log(pageParam);

  try
  {
    const res = await axiosInstance.get(`/review/getByEntity?page=${pageParam}&entityType=${entityType}&entityId=${entityId}&requestorId=${requestorId}`);
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

  // const [reviews, setReviews] = React.useState(tempReviews || null);
  const [addReviewModalVisible, setAddReviewModalVisible] = React.useState(false);

  const user = useUserStore((state) => state.user);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, error, refetch } = useInfiniteQuery({
    queryKey: ["reviews", { entityType, entityId, requestorId: user._id }],
    queryFn: ({ pageParam = 1 }) => getQueryReviews({ entityType, entityId, pageParam, requestorId: user._id }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: true,
  });

  const reviews = data?.pages.flatMap((page) => page.reviews) || tempReviews;


  const loadMoreReviews = () =>
  {
    if(hasNextPage) fetchNextPage();
  }

  const handleRefresh = async () =>
  {
    await refetch();
  }


  const upvoteReview = (reviewId) =>
  {
    console.log("Upvoting: ", reviewId);

    axiosInstance.post("/review/upvote", { reviewId, userId: user._id })
    .then((res) => {
      console.log(res.data);
    })
    .catch((error) => {
      console.log(error);
    })


  }
  const downvoteReview = (reviewId) =>
  {
    console.log("Downvoting: ", reviewId);

    axiosInstance.post("/review/downvote", { reviewId, userId: user._id })
    .then((res) => {
      console.log(res.data);
    })
    .catch((error) => {
      console.log(error);
    })
  }

  const ListHeaderComponent = () => {
    return (
      <View className="mt-2">
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

  const ListEmptyComponent = () =>
  {
    if (isFetching) 
    {
      return (
        <View className="flex-1 mt-5 justify-center items-center">
          <ActivityIndicator size="large" color="black" />
          <Text className="mt-3 text-gray-500">Loading reviews...</Text>
        </View>
      );
    }
    else if (error) 
    {
      return (
        <View className="flex-1 mt-5 justify-center items-center">
          <Text className="text-lg text-red-500">Failed to fetch reviews.</Text>
          <Text className="text-lg text-red-500">{error.message}</Text>
          <TouchableOpacity
            className="mt-3 bg-blue-500 py-2 px-4 rounded-full"
            onPress={handleRefresh}
          >
            <Text className="text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    else if (reviews?.length === 0)
    {
      return (
        <View className="flex-1 mt-5 justify-center items-center">
          <Text className="text-lg text-gray-500">No reviews found</Text>
        </View>
      );

    }
    return null;
  }

  const renderItem = ({item}) => {
    return (
      <View className="mx-3 mt-5">
        <ReviewCard review={item} upvote={upvoteReview} downvote={downvoteReview} userId={user._id} />
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">

        <FlatList
          data={reviews}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{paddingBottom: 50, gap:20}}
          onEndReached={loadMoreReviews}
          onEndReachedThreshold={0.5}
          refreshing={isFetching && !isFetchingNextPage}
          onRefresh={handleRefresh}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          renderItem={renderItem}
        
        />

        <AddReviewModal entityId={entityId} entityType={entityType} entityName={entityName} visible={addReviewModalVisible} setVisible={setAddReviewModalVisible} />

    </SafeAreaView>
  );
};

const ReviewCard = ({ review, upvote, downvote, userId }) => {

  const [showMore, setShowMore] = React.useState(false); // change this to true if lines exceed 2
  const [upvoted, setUpvoted] = React.useState(false);
  const [downvoted, setDownvoted] = React.useState(false);

  useEffect(() => {
    if (review?.upvotes?.includes(userId)) setUpvoted(true); setDownvoted(false);
    if (review?.downvotes?.includes(userId)) setDownvoted(true); setUpvoted(false);
  }, [review]);


  //WARNING: Upvote and downvote are unstable and untested so don't use them
  const handleUpvote = () => {
    if (upvoted) setUpvoted(false);
    else 
    {
      // upvote
      setUpvoted(true);
      setDownvoted(false);
    }

    // call upvote API
    // upvote(review._id);
  }

  const handleDownvote = () => {
    if (downvoted) setDownvoted(false);
    else
    {
      // downvote
      setUpvoted(false);
      setDownvoted(true);
    }

    // call downvote API
    // downvote(review._id);
  }

  const CardFooter = () => {
    return (
      <View style={{marginHorizontal: 20, paddingVertical: 15}}>
          <View className="flex-row justify-between items-center mt-2 px-2">

              <View>
                <TouchableOpacity onPress={handleUpvote}>
                  <HandThumbUpIcon size={30} color={upvoted ? "blue" : "gray"} />
                  <Text className="text-gray-500 mx-auto">{review?.upvotes?.length}</Text>
                </TouchableOpacity>
              </View>

              <View>
                <TouchableOpacity onPress={handleDownvote}>
                  <HandThumbDownIcon size={30} color={downvoted ? "blue" : "gray"} />
                  <Text className="text-gray-500 mx-auto">{review?.downvotes?.length}</Text>
                </TouchableOpacity>
              </View>

              <ShareIcon size={30} color="gray" />
              
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
