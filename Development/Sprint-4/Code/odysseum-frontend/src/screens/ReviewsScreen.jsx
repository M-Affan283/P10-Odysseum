import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from "react-native";
import React, { useEffect, useState, useRef, useCallback } from "react";
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
  RocketLaunchIcon,
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
import LottieView from "lottie-react-native";

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

  const ListHeaderComponent = useCallback(() => {
    return (
      <LinearGradient
        colors={["rgba(17, 9, 47, 0.9)", "rgba(7, 15, 27, 0.5)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pb-4 pt-2 rounded-b-3xl mb-4"
      >
        <View className="flex-row items-center mb-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-3 bg-[#211655] rounded-full"
            style={{
              shadowColor: "#7b61ff",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3,
              elevation: 4,
            }}
          >
            <ChevronLeftIcon size={28} strokeWidth={2.5} color="#60a5fa" />
          </TouchableOpacity>

          <Text
            className="font-dsbold text-white text-2xl ml-4 flex-1"
            style={{
              textShadowColor: "rgba(123, 97, 255, 0.5)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {entityName || "Reviews"}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-gray-300 font-semibold text-xl">Reviews</Text>
          <View className="bg-[#211655]/60 px-3 py-1 rounded-full">
            <Text className="text-blue-400 font-medium">
              {reviews.length} total
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  }, [entityName, reviews.length]);

  const ListEmptyComponent = () => {
    if (isFetching && !isFetchingNextPage) {
      return (
        <View className="flex-1 mt-10 justify-center items-center">
          <LottieView
            source={require("../../assets/animations/Loading2.json")}
            className="w-[120px] h-[120px]"
            autoPlay
            loop
          />
          <Text className="mt-3 text-gray-400">Loading reviews...</Text>
        </View>
      );
    } else if (error) {
      return (
        <View className="flex-1 mt-10 justify-center items-center p-4 bg-[#191b2a] rounded-2xl mx-4">
          <Text className="text-lg text-red-400 font-medium mb-2">
            Failed to fetch reviews
          </Text>
          <Text className="text-sm text-gray-400 mt-1 text-center">
            {error.message}
          </Text>
          <TouchableOpacity
            className="mt-5 bg-[#3d2a84] py-2.5 px-6 rounded-full"
            onPress={handleRefresh}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (reviews?.length === 0) {
      return (
        <View className="flex-1 mt-10 justify-center items-center p-6 bg-[#191b2a] rounded-2xl mx-4">
          <Text className="text-lg text-gray-300 font-medium mb-3">
            No reviews yet
          </Text>
          <TouchableOpacity
            className="mt-2 bg-[#3d2a84] py-3 px-7 rounded-full"
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

  const ListFooterComponent = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="items-center justify-center py-5">
          <LottieView
            source={require("../../assets/animations/Loading2.json")}
            className="w-[60px] h-[60px]"
            autoPlay
            loop
          />
        </View>
      );
    }

    if (!hasNextPage && reviews.length > 0) {
      return (
        <View className="items-center justify-center py-5 flex-row">
          <RocketLaunchIcon size={20} color="#7b61ff" />
          <Text className="text-white/80 text-base font-medium ml-2">
            End of Reviews
          </Text>
        </View>
      );
    }

    return null;
  }, [isFetchingNextPage, hasNextPage, reviews.length]);

  const renderItem = ({ item }) => {
    return (
      <View className="mx-4 mb-6">
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
          contentContainerStyle={{ paddingBottom: 80 }}
          onEndReached={loadMoreReviews}
          onEndReachedThreshold={0.5}
          refreshing={isFetching && !isFetchingNextPage}
          onRefresh={handleRefresh}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity
          onPress={() => setAddReviewModalVisible(true)}
          className="absolute bottom-6 right-6"
        >
          <LinearGradient
            colors={["#8C00E3", "#1e40af"]}
            className="w-16 h-16 rounded-full justify-center items-center"
            style={{
              shadowColor: "#7b61ff",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 8,
              elevation: 8,
            }}
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

  return (
    <LinearGradient
      colors={["#1e293b", "#101624"]}
      className="rounded-2xl overflow-hidden shadow-lg"
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {/* Header section with user info */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-800/50">
        <View className="flex-row items-center">
          <Image
            source={{
              uri:
                review?.creatorId?.profilePicture ||
                "https://i.imgur.com/6VBx3io.png",
            }}
            className="rounded-full"
            style={{ width: 46, height: 46 }}
            resizeMode="cover"
          />
          <View className="ml-3">
            <Text className="text-white font-semibold text-base">
              {review?.creatorId?.username || "Anonymous User"}
            </Text>
            <Text className="text-blue-400/80 text-xs">
              {review?.createdAt
                ? calculateDuration(review?.createdAt)
                : "Unknown time"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          {isOwnReview && (
            <TouchableOpacity
              onPress={() => setDeleteConfirmVisible(true)}
              className="p-2 rounded-full bg-red-900/20"
            >
              <TrashIcon size={18} color="#f87171" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="p-4">
        {/* Rating and title section */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl text-white font-bold flex-1 mr-2">
            {review?.title || "Untitled Review"}
          </Text>
          <View className="bg-[#211655]/50 p-1.5 rounded-lg">
            <StarRatingDisplay
              rating={review?.rating || 0}
              starSize={18}
              color="#f59e0b"
            />
          </View>
        </View>

        {/* Review content */}
        <Text
          onPress={() => setShowMore(!showMore)}
          numberOfLines={showMore ? undefined : 3}
          className="text-gray-300 leading-6 text-[15px]"
        >
          {review?.reviewContent || "No review content"}
        </Text>

        {review?.reviewContent && review?.reviewContent.length > 150 && (
          <TouchableOpacity
            onPress={() => setShowMore(!showMore)}
            className="bg-[#211655]/30 py-1 px-3 rounded-full self-start mt-2"
          >
            <Text className="text-blue-400 text-xs">
              {showMore ? "See Less" : "See More"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Display review images */}
        {review?.imageUrls && review?.imageUrls?.length > 0 && (
          <View className="mt-4 mb-2">
            <View className="items-center" style={{ height: 220 }}>
              <Carousel
                data={review?.imageUrls}
                loop={review?.imageUrls.length > 1}
                ref={carouselRef}
                width={300}
                height={180}
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
                      style={{
                        width: 300,
                        height: 180,
                        borderRadius: 12,
                      }}
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
                  size={6}
                  dotStyle={{ backgroundColor: "gray", borderRadius: 100 }}
                  activeDotStyle={{
                    backgroundColor: "#60a5fa",
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

        {/* Entity details */}
        <LinearGradient
          colors={["#211655", "#0f172a"]}
          className="rounded-xl p-3.5 mt-3"
        >
          <View className="flex-row justify-between">
            <View>
              <Text className="font-semibold text-xs text-gray-400">
                Category
              </Text>
              <Text className="text-gray-200 font-medium">
                {review?.entityType === "Location"
                  ? "Municipality"
                  : review?.entityId?.category || "Unknown"}
              </Text>
            </View>
            <View>
              <Text className="font-semibold text-xs text-gray-400">
                {review?.entityType || "Entity"}
              </Text>
              <Text className="text-gray-200 font-medium">
                {review?.entityId?.name || "Unknown"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Footer with buttons */}
        <View className="flex-row justify-between items-center mt-4 px-1">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handleUpvote}
              className={`p-2.5 mr-2 rounded-full ${
                upvoted ? "bg-blue-900/60" : "bg-gray-800/30"
              }`}
            >
              <HandThumbUpIcon
                size={20}
                color={upvoted ? "#60a5fa" : "#9ca3af"}
              />
            </TouchableOpacity>
            <Text className="text-gray-400 mr-4 min-w-[20px]">
              {review?.upvotes?.length || 0}
            </Text>

            <TouchableOpacity
              onPress={handleDownvote}
              className={`p-2.5 mr-2 rounded-full ${
                downvoted ? "bg-blue-900/60" : "bg-gray-800/30"
              }`}
            >
              <HandThumbDownIcon
                size={20}
                color={downvoted ? "#60a5fa" : "#9ca3af"}
              />
            </TouchableOpacity>
            <Text className="text-gray-400 min-w-[20px]">
              {review?.downvotes?.length || 0}
            </Text>
          </View>

          <TouchableOpacity className="p-2.5 rounded-full bg-gray-800/30">
            <ShareIcon size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Full screen image viewer */}
      {imageViewerVisible && (
        <TouchableOpacity
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/95 z-50 justify-center items-center"
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
            className="absolute top-10 right-5 bg-gray-800/70 p-3 rounded-full"
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
        <View className="flex-1 justify-center items-center bg-black/80">
          <LinearGradient
            colors={["#211655", "#101624"]}
            className="p-6 rounded-2xl w-[85%] max-w-[350px]"
          >
            <Text className="text-white text-xl font-bold mb-4">
              Delete Review
            </Text>
            <Text className="text-gray-300 mb-5">
              Are you sure you want to delete this review? This action cannot be
              undone.
            </Text>

            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setDeleteConfirmVisible(false)}
                className="py-3 px-6 rounded-lg bg-gray-700"
                disabled={isDeleting}
              >
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteConfirm}
                className="py-3 px-6 rounded-lg bg-red-600"
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
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default ReviewsScreen;
