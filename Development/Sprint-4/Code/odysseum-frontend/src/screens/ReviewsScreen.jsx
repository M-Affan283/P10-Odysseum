import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StarRatingDisplay } from "react-native-star-rating-widget";
import {
  ShareIcon,
  ChevronLeftIcon,
  XMarkIcon,
} from "react-native-heroicons/outline";
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  PencilSquareIcon,
  TrashIcon,
} from "react-native-heroicons/solid";
import { calculateDuration } from "../utils/dateTimCalc";
import { router } from "expo-router";
import AddReviewModal from "../components/AddReviewModal";
import axiosInstance from "../utils/axios";
import useUserStore from "../context/userStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import Toast from "react-native-toast-message";

const getQueryReviews = async ({
  entityType,
  entityId,
  pageParam = 1,
  requestorId,
}) => {
  try {
    const res = await axiosInstance.get(
      `/review/getByEntity?page=${pageParam}&entityType=${entityType}&entityId=${entityId}&requestorId=${requestorId}`
    );
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const ReviewsScreen = ({ entityType, entityId, entityName }) => {
  const [addReviewModalVisible, setAddReviewModalVisible] =
    React.useState(false);
  const user = useUserStore((state) => state.user);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["reviews", { entityType, entityId, requestorId: user._id }],
    queryFn: ({ pageParam = 1 }) =>
      getQueryReviews({
        entityType,
        entityId,
        pageParam,
        requestorId: user._id,
      }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: true,
  });

  const reviews = data?.pages.flatMap((page) => page.reviews) || [];

  const loadMoreReviews = () => {
    if (hasNextPage) fetchNextPage();
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const upvoteReview = (reviewId) => {
    console.log("Upvoting: ", reviewId);
    axiosInstance
      .post("/review/upvote", { reviewId, userId: user._id })
      .then((res) => {
        console.log(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const downvoteReview = (reviewId) => {
    console.log("Downvoting: ", reviewId);
    axiosInstance
      .post("/review/downvote", { reviewId, userId: user._id })
      .then((res) => {
        console.log(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteReview = (reviewId, onDeleteStart, onDeleteComplete) => {
    console.log("Deleting: ", reviewId);

    if (onDeleteStart) onDeleteStart();

    axiosInstance
      .delete(`/review/delete?reviewId=${reviewId}&reviewerId=${user._id}`)
      .then((res) => {
        Toast.show({
          type: "success",
          text1: "Review Deleted",
          text2: res.data.message,
          position: "bottom",
          visibilityTime: 2000,
        });

        if (onDeleteComplete) onDeleteComplete(true);
        refetch();
      })
      .catch((error) => {
        console.log(error);
        Toast.show({
          type: "error",
          text1: "Error Deleting Review",
          text2: error.response?.data?.message || "Something went wrong",
          position: "bottom",
          visibilityTime: 5000,
        });
        if (onDeleteComplete) onDeleteComplete(false);
      });
  };

  const ListHeaderComponent = () => {
    return (
      <View className="mt-2 px-4">
        <View className="flex-row items-center mb-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-3 bg-[#1e293b] rounded-full"
          >
            <ChevronLeftIcon size={28} strokeWidth={2.5} color="#60a5fa" />
          </TouchableOpacity>

          <Text className="font-dsbold text-white text-2xl ml-4 flex-1">
            {entityName}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-300 font-semibold text-xl">Reviews</Text>
          <Text className="text-blue-400">{reviews.length} total</Text>
        </View>
      </View>
    );
  };

  const ListEmptyComponent = () => {
    if (isFetching) {
      return (
        <View className="flex-1 mt-10 justify-center items-center">
          <ActivityIndicator size="large" color="#60a5fa" />
          <Text className="mt-3 text-gray-400">Loading reviews...</Text>
        </View>
      );
    } else if (error) {
      return (
        <View className="flex-1 mt-10 justify-center items-center">
          <Text className="text-lg text-red-400">Failed to fetch reviews</Text>
          <Text className="text-sm text-gray-400 mt-1">{error.message}</Text>
          <TouchableOpacity
            className="mt-5 bg-blue-600 py-2 px-6 rounded-full"
            onPress={handleRefresh}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (reviews?.length === 0) {
      return (
        <View className="flex-1 mt-10 justify-center items-center">
          <Text className="text-lg text-gray-400">No reviews yet</Text>
          <TouchableOpacity
            className="mt-5 bg-blue-600 py-2 px-6 rounded-full"
            onPress={() => setAddReviewModalVisible(true)}
          >
            <Text className="text-white font-semibold">
              Be the first to review
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const renderItem = ({ item }) => {
    return (
      <View className="mx-4 mb-4">
        <ReviewCard
          review={item}
          upvote={upvoteReview}
          downvote={downvoteReview}
          userId={user._id}
          deleteReview={deleteReview}
        />
      </View>
    );
  };

  return (
    <LinearGradient colors={["#070f1b", "#0f172a"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <FlatList
          data={reviews}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 50 }}
          onEndReached={loadMoreReviews}
          onEndReachedThreshold={0.5}
          refreshing={isFetching && !isFetchingNextPage}
          onRefresh={handleRefresh}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity
          onPress={() => setAddReviewModalVisible(true)}
          className="absolute bottom-6 right-6"
        >
          <LinearGradient
            colors={["#8C00E3", "#1e40af"]}
            className="w-16 h-16 rounded-full justify-center items-center shadow-lg"
          >
            <PencilSquareIcon size={28} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        <AddReviewModal
          entityId={entityId}
          entityType={entityType}
          entityName={entityName}
          visible={addReviewModalVisible}
          setVisible={setAddReviewModalVisible}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const ReviewCard = ({ review, upvote, downvote, userId, deleteReview }) => {
  const [showMore, setShowMore] = React.useState(false);
  const [upvoted, setUpvoted] = React.useState(false);
  const [downvoted, setDownvoted] = React.useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [isOwnReview, setIsOwnReview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const progress = useSharedValue(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    // Check if the current user is the creator of the review
    setIsOwnReview(review?.creatorId?._id === userId);

    // Check vote status
    if (review?.upvotes?.includes(userId)) {
      setUpvoted(true);
      setDownvoted(false);
    }
    if (review?.downvotes?.includes(userId)) {
      setDownvoted(true);
      setUpvoted(false);
    }
  }, [review, userId]);

  const handleUpvote = () => {
    if (upvoted) setUpvoted(false);
    else {
      setUpvoted(true);
      setDownvoted(false);
      upvote(review._id);
    }
  };

  const handleDownvote = () => {
    if (downvoted) setDownvoted(false);
    else {
      setUpvoted(false);
      setDownvoted(true);
      downvote(review._id);
    }
  };

  const onPressPagination = (index) => {
    carouselRef.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const handleDeleteConfirm = () => {
    setIsDeleting(true);
    deleteReview(
      review._id,
      () => setIsDeleting(true),
      (success) => {
        setIsDeleting(false);
        if (success) {
          setDeleteConfirmVisible(false);
        }
      }
    );
  };

  const CardFooter = () => {
    return (
      <View className="flex-row justify-between items-center mt-4 px-2 pb-1">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleUpvote}
            className={`p-2 mr-2 rounded-full ${
              upvoted ? "bg-blue-900/30" : "bg-gray-800/30"
            }`}
          >
            <HandThumbUpIcon
              size={22}
              color={upvoted ? "#60a5fa" : "#9ca3af"}
            />
          </TouchableOpacity>
          <Text className="text-gray-400 mr-3">
            {review?.upvotes?.length || 0}
          </Text>

          <TouchableOpacity
            onPress={handleDownvote}
            className={`p-2 mr-2 rounded-full ${
              downvoted ? "bg-blue-900/30" : "bg-gray-800/30"
            }`}
          >
            <HandThumbDownIcon
              size={22}
              color={downvoted ? "#60a5fa" : "#9ca3af"}
            />
          </TouchableOpacity>
          <Text className="text-gray-400">
            {review?.downvotes?.length || 0}
          </Text>
        </View>

        <TouchableOpacity className="p-2 rounded-full bg-gray-800/30">
          <ShareIcon size={22} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={["#1e293b", "#111827"]}
      className="rounded-2xl overflow-hidden"
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View className="px-4">
        <View className="flex-row items-center justify-between py-4 border-b border-gray-800">
          <View className="flex-row items-center">
            <Image
              source={{ uri: review?.creatorId?.profilePicture }}
              className="rounded-full"
              style={{ width: 40, height: 40 }}
              resizeMode="cover"
            />
            <View className="ml-3">
              <Text className="text-white font-semibold">
                {review?.creatorId?.username || "Username"}
              </Text>
              <Text className="text-gray-400 text-xs">
                {calculateDuration(review?.createdAt)}
              </Text>
            </View>
          </View>

          {isOwnReview && (
            <TouchableOpacity
              onPress={() => setDeleteConfirmVisible(true)}
              className="p-2 rounded-full bg-red-900/20"
            >
              <TrashIcon size={18} color="#f87171" />
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row justify-between items-center py-3">
          <Text className="text-lg text-white font-semibold flex-1">
            {review?.title}
          </Text>
          <StarRatingDisplay
            rating={review?.rating}
            starSize={20}
            color="#f59e0b"
          />
        </View>

        <Text
          onPress={() => setShowMore(!showMore)}
          numberOfLines={showMore ? undefined : 3}
          className="text-gray-300 leading-5"
        >
          {review?.reviewContent}
        </Text>

        {review?.reviewContent && review?.reviewContent.length > 200 && (
          <Text
            onPress={() => setShowMore(!showMore)}
            className="text-blue-400 text-center mt-2"
          >
            {showMore ? "See Less" : "See More"}
          </Text>
        )}

        {/* Display review images if available - Updated with fixed height container */}
        {review?.imageUrls && review?.imageUrls?.length > 0 && (
          <View className="mt-4 mb-4">
            <View className="items-center" style={{ height: 240 }}>
              <Carousel
                data={review?.imageUrls}
                loop={review?.imageUrls.length > 1}
                ref={carouselRef}
                width={300}
                height={200}
                scrollAnimationDuration={100}
                style={{ alignItems: "center", justifyContent: "center" }}
                onProgressChange={progress}
                onConfigurePanGesture={(panGesture) => {
                  panGesture.activeOffsetX([-5, 5]);
                  panGesture.failOffsetY([-5, 5]);
                }}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    className="items-center"
                    onPress={() => {
                      setSelectedImageIndex(index);
                      setImageViewerVisible(true);
                    }}
                  >
                    <Image
                      source={{ uri: item }}
                      style={{ width: 300, height: 200, borderRadius: 10 }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
              />

              {review?.imageUrls?.length > 1 && (
                <Pagination.Basic
                  progress={progress}
                  data={review?.imageUrls}
                  onPress={onPressPagination}
                  size={5}
                  dotStyle={{ backgroundColor: "gray", borderRadius: 100 }}
                  activeDotStyle={{
                    backgroundColor: "white",
                    overflow: "hidden",
                    aspectRatio: 1,
                    borderRadius: 15,
                  }}
                  containerStyle={{ gap: 5, marginTop: 10 }}
                  horizontal
                />
              )}
            </View>
          </View>
        )}

        <LinearGradient
          colors={["#1e293b", "#0f172a"]}
          className="rounded-lg p-3 mt-2"
        >
          <View className="flex-row justify-between">
            <View>
              <Text className="font-semibold text-xs text-gray-400">
                Category
              </Text>
              <Text className="text-gray-200">
                {review?.entityType === "Location"
                  ? "Municipality"
                  : review?.entityId?.category}
              </Text>
            </View>
            <View>
              <Text className="font-semibold text-xs text-gray-400">
                {review?.entityType}
              </Text>
              <Text className="text-gray-200">{review?.entityId?.name}</Text>
            </View>
          </View>
        </LinearGradient>

        <CardFooter />
      </View>

      {/* Full screen image viewer */}
      {imageViewerVisible && (
        <TouchableOpacity
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/90 z-50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setImageViewerVisible(false)}
        >
          <Carousel
            data={review?.imageUrls || []}
            loop={review?.imageUrls?.length > 1}
            width={350}
            height={400}
            scrollAnimationDuration={200}
            initialIndex={selectedImageIndex}
            style={{ alignItems: "center", justifyContent: "center" }}
            onProgressChange={progress}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{ width: 350, height: 400, borderRadius: 10 }}
                resizeMode="cover"
              />
            )}
          />

          {review?.imageUrls?.length > 1 && (
            <Pagination.Basic
              progress={progress}
              data={review?.imageUrls || []}
              size={8}
              dotStyle={{ backgroundColor: "gray", borderRadius: 100 }}
              activeDotStyle={{
                backgroundColor: "white",
                overflow: "hidden",
                aspectRatio: 1,
                borderRadius: 15,
              }}
              containerStyle={{ gap: 8, marginTop: 20 }}
              horizontal
            />
          )}

          <Text className="text-white mt-6 text-center">
            {Math.floor(progress.value) + 1} / {review?.imageUrls?.length || 0}
          </Text>

          <TouchableOpacity
            className="absolute top-10 right-5 bg-gray-800/50 p-2 rounded-full"
            onPress={() => setImageViewerVisible(false)}
          >
            <XMarkIcon size={24} color="white" />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        transparent={true}
        visible={deleteConfirmVisible}
        animationType="fade"
        onRequestClose={() => !isDeleting && setDeleteConfirmVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className="bg-[#1e293b] p-6 rounded-2xl w-[80%] max-w-[350px]">
            <Text className="text-white text-lg font-bold mb-4">
              Delete Review
            </Text>
            <Text className="text-gray-300 mb-5">
              Are you sure you want to delete this review? This action cannot be
              undone.
            </Text>

            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setDeleteConfirmVisible(false)}
                className="py-3 px-5 rounded-lg bg-gray-700"
                disabled={isDeleting}
              >
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteConfirm}
                className="py-3 px-5 rounded-lg bg-red-600"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-semibold ml-2">
                      Deleting...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold">Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default ReviewsScreen;
