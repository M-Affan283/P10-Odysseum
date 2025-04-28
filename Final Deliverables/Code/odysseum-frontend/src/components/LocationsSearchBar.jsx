import { View, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator, StyleSheet, SafeAreaView } from "react-native";
import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon, XMarkIcon, MapPinIcon, CheckIcon, PlusCircleIcon, ArrowRightIcon } from "react-native-heroicons/outline";
import axiosInstance from "../utils/axios";
import { useInfiniteQuery } from "@tanstack/react-query";

const getQueryLocations = async ({ pageParam = 1, searchQuery }) => {
    try {
        searchQuery = searchQuery.trim();
        const res = await axiosInstance.get(`/location/search?searchParam=${searchQuery}&page=${pageParam}`);
        return res.data;
    } catch (error) {
        console.error("Could not load:", error);
        throw error;
    }
};

const DisplayLocationsSearchBar = ({ navigation, destinations = [], setDestinations }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const { data, isFetching, error, fetchNextPage, hasNextPage, refetch, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["createPostLocations", debouncedSearchQuery],
    queryFn: ({ pageParam = 1 }) => getQueryLocations({ pageParam, searchQuery: debouncedSearchQuery }),
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: debouncedSearchQuery.length > 0,
  });

  const locations = data?.pages.flatMap((page) => page.locations) || [];
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Checks if a location is already in the destinations list
  const isLocationSelected = (locationId) => {
    return destinations.some(dest => dest._id === locationId);
  };

  // Toggles location selection
  const toggleLocation = (item) => {
    if (isLocationSelected(item._id)) {
      setDestinations(destinations.filter(dest => dest._id !== item._id));
    } else {
      setDestinations([...destinations, item]);
    }
  };

  // Go back to main screen
  const finishSelection = () => {
    // Use the navigation object passed as prop to go back
    navigation.goBack();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Done button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Destinations</Text>

        {/* Done button */}
        <TouchableOpacity 
          style={styles.doneButton} 
          onPress={finishSelection}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <MagnifyingGlassIcon size={20} color="white" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search locations..."
          placeholderTextColor="gray"
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <XMarkIcon size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Destinations Count */}
      {destinations.length > 0 && (
        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>
            {destinations.length} {destinations.length === 1 ? 'destination' : 'destinations'} selected
          </Text>
        </View>
      )}

      {/* Initial Loading Indicator */}
      {isFetching && !isFetchingNextPage && locations.length === 0 && (
        <View style={styles.messageContainer}>
          <ActivityIndicator color="white" size="large" />
          <Text style={styles.messageText}>Searching...</Text>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>
            Error loading results: {error.message}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results List */}
      <FlatList
        data={locations}
        keyExtractor={(item) => item._id}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.6}
        contentContainerStyle={styles.resultsContainer}
        renderItem={({ item }) => {
          const selected = isLocationSelected(item._id);
          return (
            <TouchableOpacity
              onPress={() => toggleLocation(item)}
              style={[styles.locationItem, selected && styles.selectedItem]}
            >
              <MapPinIcon size={20} color="#93c5fd" />
              <Text style={styles.locationText}>{item.name}</Text>
              <View style={styles.locationCheckbox}>
                {selected ? (
                  <CheckIcon size={22} color="#4ade80" />
                ) : (
                  <PlusCircleIcon size={22} color="gray" />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.loading} color="white" />
          ) : null
        }
        ListEmptyComponent={() =>
          debouncedSearchQuery.length > 0 && !isFetching && !error ? (
            <Text style={styles.noResultsText}>No locations found.</Text>
          ) : debouncedSearchQuery.length === 0 ? (
            <Text style={styles.noResultsText}>Search for a location to add to your itinerary</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default DisplayLocationsSearchBar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070f1b",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  doneButton: {
    backgroundColor: "#374151",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  doneButtonText: {
    color: "white",
    fontWeight: "600",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#4B5563",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: "#0d1524",
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "white",
    fontSize: 16,
  },
  selectedCount: {
    marginTop: 12,
    marginBottom: 4,
  },
  selectedCountText: {
    color: "#93c5fd",
    fontWeight: "500",
  },
  resultsContainer: {
    marginTop: 16,
    paddingBottom: 80,
    flexGrow: 1,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c2536",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedItem: {
    backgroundColor: "#1e3a5f",
    borderColor: "#3b82f6",
    borderWidth: 1,
  },
  locationText: {
    marginLeft: 12,
    color: "white",
    fontSize: 16,
    flex: 1,
  },
  locationCheckbox: {
    marginLeft: 10,
  },
  loading: {
    marginTop: 16,
  },
  noResultsText: {
    color: "white",
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  messageText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: "#f87171",
    textAlign: "center",
    fontSize: 16,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontSize: 16,
  },
  continueButton: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    padding: 16,
    borderRadius: 8,
  },
  continueButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginRight: 8,
  },
});