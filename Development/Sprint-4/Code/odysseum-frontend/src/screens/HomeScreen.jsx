import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "../utils/axios";
import { router } from "expo-router";
import PostCard from "../components/PostCard";
import Toast from "react-native-toast-message";
import LottieView from "lottie-react-native";
import { ChatBubbleLeftRightIcon, ExclamationCircleIcon } from "react-native-heroicons/solid";
import { LightBulbIcon } from "react-native-heroicons/outline";
import useUserStore from "../context/userStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator,Keyboard } from 'react-native';

const HomeScreen = () => {
  // State for sorting and searching
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterLocationId, setFilterLocationId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const user = useUserStore((state) => state.user);

  // Function to fetch posts from followed users (default)
  const getQueryPosts = async ({ userId, pageParam = 1, sortField, sortOrder }) => {
    try {
      const res = await axiosInstance.get(
        `/post/getFollowing?requestorId=${userId}&page=${pageParam}&sortField=${sortField}&sortOrder=${sortOrder}`
      );
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Function to fetch posts by a location (filtered by followed users)
  const getFilteredPosts = async ({ userId, pageParam = 1, filterLocationId }) => {
    try {
      let endpoint = "";
      if (Array.isArray(filterLocationId)) {
        // Join array of IDs into a comma-separated string.
        const locationIdsStr = filterLocationId.join(',');
        endpoint = `/post/getByLocation?locationIds=${locationIdsStr}&requestorId=${userId}&page=${pageParam}`;
      } else {
        endpoint = `/post/getByLocation?locationId=${filterLocationId}&requestorId=${userId}&page=${pageParam}`;
      }
      const res = await axiosInstance.get(endpoint);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // UseInfiniteQuery: if filterLocationId is set, fetch filtered posts, otherwise default posts.
  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: filterLocationId ? ['filteredPosts', filterLocationId] : ['posts', sortField, sortOrder],
    queryFn: ({ pageParam = 1 }) => {
      if (filterLocationId) {
        return getFilteredPosts({ userId: user._id, pageParam, filterLocationId });
      } else {
        return getQueryPosts({ userId: user._id, pageParam, sortField, sortOrder });
      }
    },
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  // Memoized item renderer
  const renderItem = useCallback(({ item }) => <PostCard post={item} />, []);

  // Sorting options
  const sortOptions = [
    { label: 'Time New-Old', field: 'createdAt', order: 'desc' },
    { label: 'Time Old-New', field: 'createdAt', order: 'asc' },
    { label: 'Popular High-Low', field: 'likesCount', order: 'desc' },
    { label: 'Popular Low-High', field: 'likesCount', order: 'asc' },
  ];

  // Header: sort & search buttons on left; title at center; chat on right.
  const ListHeaderComponent = useMemo(() => {
    return (
      <LinearGradient
        colors={['rgba(17, 9, 47, 0.9)', 'rgba(7, 15, 27, 0.5)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContainer}>
          {/* Left side: Column for Sort and Search buttons */}
          <View style={styles.buttonColumn}>
            <TouchableOpacity 
              style={[styles.headerButton, { marginBottom: 8 }]}
              onPress={() => setSortModalVisible(true)}
            >
              <Text style={styles.headerButtonText}>Sort</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => {
                setSearchText(""); 
                setSuggestions([]); 
                setSearchModalVisible(true);
              }}
            >
              <Text style={styles.headerButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
  
          {/* Center: Title - now wrapped in TouchableOpacity to reset all filters */}
          <TouchableOpacity 
            style={styles.titleContainer}
            onPress={() => {
              // Reset filters on pressing the logo
              setFilterLocationId(null);
              setSearchText("");
              setSuggestions([]);
              refetch();
            }}
          >
            <Text style={styles.titleText}>Odysseum</Text>
            <Text style={styles.subtitleText}>Hello @{user.username}</Text>
          </TouchableOpacity>
  
          {/* Right: Chat button */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/chat')}
          >
            <ChatBubbleLeftRightIcon size={30} color="#f8f8ff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }, [user]);
  
  

  // List empty state
  const ListEmptyComponent = useMemo(() => {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        {isFetching ? (
          <LottieView
            source={require('../../assets/animations/Loading2.json')}
            style={{ width: 120, height: 120 }}
            autoPlay
            loop
          />
        ) : error ? (
          <View style={styles.errorCard}>
            <ExclamationCircleIcon size={40} color="#ff5c75" />
            <Text style={styles.errorText}>Failed to fetch posts</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noPostCard}>
            <LightBulbIcon size={40} color="#ffd454" />
            <Text style={styles.noPostText}>No posts found</Text>
            <Text style={styles.noPostSubText}>Start following users to see their posts</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }, [isFetching, error]);

  const loadMorePosts = () => {
    if (hasNextPage) fetchNextPage();
  };

  const handleRefresh = async () => {
    await refetch();
  };

  // Handle search submission (if user taps "Submit")
  const handleSearchSubmit = async () => {
    if (!searchText.trim()) return;
    if (suggestions.length === 1) {
      setFilterLocationId(suggestions[0]._id);
    } else if (suggestions.length > 1) {
      // Use all suggestion IDs.
      setFilterLocationId(suggestions.map(item => item._id));
    } else {
      setFilterLocationId(null);
      Toast.show({
        type: 'info',
        position: 'bottom',
        text1: 'No location found',
        text2: `No matching location for "${searchText}"`,
        visibilityTime: 3000,
      });
    }
    setSearchModalVisible(false);
    setSearchText("");
    setSuggestions([]);
    refetch();
  };


  // Auto-suggestions for location names: debounce searchText and query backend.
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchText.trim().length > 0) {
        setIsFetchingSuggestions(true);
        axiosInstance.get(`/location/search?searchParam=${searchText}&page=1`)
          .then((res) => {
            if (res.data.locations) {
              setSuggestions(res.data.locations);
            }
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => setIsFetchingSuggestions(false));
      } else {
        setSuggestions([]);
      }
    }, 300); // 300ms debounce delay
    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);
  

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Failed to fetch posts',
        text2: error.message,
        visibilityTime: 3000,
      });
    }
  }, [error]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#070f1b' }}>
      {/* SORT MODAL */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={sortModalVisible}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Sort Posts</Text>
            {sortOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSortField(option.field);
                  setSortOrder(option.order);
                  setSortModalVisible(false);
                  setFilterLocationId(null); // Reset filter when sorting changes.
                }}
                style={styles.modalOption}
              >
                <Text style={styles.modalOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setSortModalVisible(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SEARCH MODAL */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={searchModalVisible}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Search by Location</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Chitral"
              placeholderTextColor="#aaa"
              value={searchText}
              onChangeText={setSearchText}
            />
            {suggestions.length > 0 || isFetchingSuggestions ? (
              <ScrollView style={styles.suggestionContainer}>
                {isFetchingSuggestions ? (
                  <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                ) : (
                  suggestions.map((item) => (
                    <TouchableOpacity
                      key={item._id}
                      style={styles.suggestionItem}
                      onPressIn={() => {
                        Keyboard.dismiss(); // Dismiss keyboard immediately
                        setSearchText(item.name);
                        setFilterLocationId(item._id);
                        setSearchModalVisible(false);
                        setSuggestions([]);
                        refetch();
                      }}
                    >
                      <Text style={styles.suggestionText}>{item.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            ) : null}
            <TouchableOpacity onPress={handleSearchSubmit} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSearchModalVisible(false);
                setSuggestions([]);
              }}
              style={styles.modalCancel}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MAIN FLATLIST */}
      <LinearGradient
        colors={['rgba(17, 9, 47, 0.5)', 'rgba(7, 15, 27, 0.9)']}
        style={{ flex: 1 }}
      >
        <FlatList
          removeClippedSubviews={true}
          data={posts}
          contentContainerStyle={{ paddingBottom: 90, gap: 20 }}
          keyExtractor={(item) => item._id}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          refreshing={isFetching && !isFetchingNextPage}
          onRefresh={handleRefresh}
          ListHeaderComponent={ListHeaderComponent}
          renderItem={renderItem}
          ListEmptyComponent={ListEmptyComponent}
          getItemLayout={(_, index) => ({
            length: 500,
            offset: 500 * index,
            index,
          })}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    padding: 16,
    borderRadius: 24,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  headerContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  buttonColumn: {
    flexDirection: 'column',
  },
  headerButton: {
    backgroundColor: '#211655',
    padding: 8,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  headerButtonText: {
    color: '#f8f8ff',
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'center'
  },
  titleText: {
    color: '#ffffff',
    fontSize: 34,
    textShadowColor: 'rgba(123, 97, 255, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitleText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  errorCard: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#191b2a',
    borderRadius: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    marginVertical: 8,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 10,
    backgroundColor: '#3d2a84',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noPostCard: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#191b2a',
    borderRadius: 16,
  },
  noPostText: {
    color: '#fff',
    fontSize: 20,
    marginVertical: 8,
    fontWeight: '600',
  },
  noPostSubText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1d1f27',
    padding: 20,
    borderRadius: 16,
    width: '90%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  modalOptionText: {
    color: '#fff',
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: '#3d2a84',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancel: {
    marginTop: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#ff5c75',
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#2a2d36',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  suggestionContainer: {
    maxHeight: 150,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#64559D", 
    paddingHorizontal: 10,
  },
  suggestionItem: {
    paddingVertical: 10,
    borderBottomColor: "#444",
    borderBottomWidth: 1,
  },
  suggestionText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default HomeScreen;
