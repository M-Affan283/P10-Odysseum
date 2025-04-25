import { View, StyleSheet, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { TemplateContext } from '../../../app/itinerary/_layout';
import { MapPinIcon, PlusIcon, XMarkIcon, ArrowRightIcon } from "react-native-heroicons/outline";
import DisplayLocationsSearchBar from '../../components/LocationsSearchBar';
import AddStops from './AddStops';
import OptimizationScreen from './OptimizationScreen';
import ItineraryRecommendationsScreen from './ItineraryRecommendationsScreen';
import llmaxiosInstance from "../../utils/llm_axios";
import React, { useState, useEffect, useContext } from 'react';

const CreateItineraryScreenV2 = ({ navigation }) => {
  const { selectedTemplate } = useContext(TemplateContext);
  const [itineraryState, setItineraryState] = useState({
    destinations: [],
    stopsData: [],
    optimization: null,
    compiledData: null,
    finalSelections: null,
    recommendationsData: null
  });

  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [showAddStopsScreen, setShowAddStopsScreen] = useState(false);
  const [showOptimizationScreen, setShowOptimizationScreen] = useState(false);
  const [showConfirmationScreen, setShowConfirmationScreen] = useState(false);
  const [showRecommendationsScreen, setShowRecommendationsScreen] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  useEffect(() => {
    setItineraryState(prev => {
      const updatedStopsData = prev.destinations.map(destination => {
        const existing = prev.stopsData.find(sd => sd.id === destination._id);
        return existing || {
          id: destination._id,
          location: destination,
          stops: [],
          optimization: null,
          compiledData: null,
          finalSelections: null,
          recommendationsData: null
        };
      });

      return {
        ...prev,
        stopsData: updatedStopsData
      };
    });
  }, [itineraryState.destinations]);

  const removeDestination = (id) => {
    const updatedDestinations = itineraryState.destinations.filter(dest => dest._id !== id);
    setItineraryState(prev => ({
      ...prev,
      destinations: updatedDestinations,
      stopsData: prev.stopsData.filter(dest => dest.id !== id)
    }));
  };

  const openLocationSearch = () => setShowLocationSearch(true);

  const goToStopsScreen = () => {
    setShowAddStopsScreen(true);
    setShowLocationSearch(false);
  };

  const handleStopsData = (stopsData) => {
    setItineraryState(prev => ({ ...prev, stopsData }));
    setShowAddStopsScreen(false);
    setShowOptimizationScreen(true);
  };

  const handleOptimizationComplete = async (compiledData) => {
    setItineraryState(prev => ({
      ...prev,
      optimization: compiledData.optimization,
      compiledData: compiledData
    }));

    setIsLoadingRecommendations(true);

    try {
      const response = await llmaxiosInstance.post("/itinerary/process", compiledData);
      setItineraryState(prev => ({
        ...prev,
        recommendationsData: response.data || []
      }));
      setShowRecommendationsScreen(true);
    } catch (error) {
      console.error('Error sending itinerary to backend:', error);
      setShowRecommendationsScreen(false);
      setShowOptimizationScreen(true);
    } finally {
      setIsLoadingRecommendations(false);
      setShowOptimizationScreen(false);
    }
  };

  const handleRecommendationsComplete = (finalItinerary) => {
    setItineraryState(prev => ({
      ...prev,
      finalSelections: finalItinerary.selections
    }));
    setShowRecommendationsScreen(false);
    setShowConfirmationScreen(true);
  };

  const backToMainScreen = () => {
    setShowLocationSearch(false);
    setShowAddStopsScreen(false);
    setShowOptimizationScreen(false);
    setShowRecommendationsScreen(false);
    setShowConfirmationScreen(false);
  };

  const createNewItinerary = () => {
    setItineraryState({
      destinations: [],
      stopsData: [],
      optimization: null,
      compiledData: null,
      finalSelections: null,
      recommendationsData: null
    });
    backToMainScreen();
  };

  if (isLoadingRecommendations) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size="large" 
          color="#10b981"  
          style={styles.activityIndicator} 
        />
        <Text style={styles.loadingText}>Generating your recommendations...</Text>
      </View>
    );
  }

  if (showLocationSearch) {
    return (
      <DisplayLocationsSearchBar
        destinations={itineraryState.destinations}
        setDestinations={(newDestinations) => {
          setItineraryState(prev => ({
            ...prev,
            destinations: newDestinations
          }));
        }}
        navigation={{
          goBack: () => setShowLocationSearch(false),
        }}
      />
    );
  }

  if (showAddStopsScreen) {
    return (
      <AddStops
        destinations={itineraryState.destinations}
        stopsData={itineraryState.stopsData}
        onUpdateStops={(updatedStopsData) => setItineraryState(prev => ({ ...prev, stopsData: updatedStopsData }))}
        onBack={() => setShowAddStopsScreen(false)}
        onContinue={handleStopsData}
      />
    );
  }

  if (showOptimizationScreen) {
    return (
      <OptimizationScreen
        itinerary={itineraryState.stopsData}
        onBack={() => {
          setShowOptimizationScreen(false);
          setShowAddStopsScreen(true);
        }}
        onComplete={handleOptimizationComplete}
      />
    );
  }

  if (showRecommendationsScreen) {
    return (
      <ItineraryRecommendationsScreen
        recommendations={itineraryState.recommendationsData}
        onBack={() => {
          setShowRecommendationsScreen(false);
          setShowOptimizationScreen(true);
        }}
        onComplete={handleRecommendationsComplete}
      />
    );
  }

  if (showConfirmationScreen) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Itinerary Created!</Text>
        <View style={styles.confirmationBox}>
          <Text style={styles.confirmationText}>
            Your itinerary has been successfully created with {itineraryState.destinations.length} destinations and optimized for {itineraryState.optimization}.
          </Text>
          {itineraryState.finalSelections && (
            <View style={styles.selectionsContainer}>
              <Text style={styles.selectionsTitle}>Your Selections:</Text>
              {Object.entries(itineraryState.finalSelections).map(([category, selection]) => (
                <View key={category} style={styles.selectionItem}>
                  <Text style={styles.categoryName}>
                    {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                  </Text>
                  <Text style={styles.selectionValue}>{selection}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.continueButton} onPress={createNewItinerary}>
          <Text style={styles.continueButtonText}>Create Another Itinerary</Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Itinerary</Text>
      {selectedTemplate && (
        <View style={styles.templateInfo}>
          <Text style={styles.templateText}>Using template: {selectedTemplate.name}</Text>
        </View>
      )}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Destinations</Text>
        {itineraryState.destinations.length > 0 ? (
          <FlatList
            data={itineraryState.destinations}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.destinationItem}>
                <MapPinIcon size={18} color="#93c5fd" />
                <Text style={styles.destinationText}>{item.name}</Text>
                <TouchableOpacity onPress={() => removeDestination(item._id)} style={styles.removeButton}>
                  <XMarkIcon size={16} color="white" />
                </TouchableOpacity>
              </View>
            )}
            style={styles.destinationsList}
          />
        ) : (
          <Text style={styles.noDestinationsText}>No destinations added yet</Text>
        )}
        <TouchableOpacity style={styles.addButton} onPress={openLocationSearch}>
          <PlusIcon size={18} color="white" />
          <Text style={styles.addButtonText}>Add Destinations</Text>
        </TouchableOpacity>
      </View>

      {itineraryState.destinations.length > 0 && (
        <TouchableOpacity style={styles.continueButton} onPress={goToStopsScreen}>
          <Text style={styles.continueButtonText}>Continue to Add Stops</Text>
          <ArrowRightIcon size={20} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070f1b', padding: 16 },
  title: { fontSize: 24, fontWeight: "700", color: "white", marginBottom: 24, marginTop: 24 },
  templateInfo: { backgroundColor: '#1e3a5f', padding: 12, borderRadius: 8, marginBottom: 16 },
  templateText: { color: 'white', fontWeight: '500' },
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "white", marginBottom: 12 },
  destinationsList: { maxHeight: 200 },
  destinationItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#1c2536", padding: 12, borderRadius: 8, marginBottom: 8 },
  destinationText: { marginLeft: 8, color: "white", flex: 1 },
  removeButton: { backgroundColor: "#ef4444", width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  noDestinationsText: { color: "gray", marginBottom: 16, fontStyle: "italic" },
  addButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#2563eb", padding: 12, borderRadius: 8, justifyContent: "center" },
  addButtonText: { color: "white", marginLeft: 8, fontWeight: "600" },
  continueButton: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#10b981", padding: 16,
    borderRadius: 8, justifyContent: "center", position: "absolute", bottom: 24, left: 16, right: 16
  },
  continueButtonText: { color: "white", fontWeight: "600", fontSize: 16, marginRight: 8 },
  confirmationBox: { backgroundColor: '#1c2536', borderRadius: 8, padding: 16, marginBottom: 32 },
  confirmationText: { color: 'white', fontSize: 16, lineHeight: 24, marginBottom: 16 },
  selectionsContainer: { marginTop: 16 },
  selectionsTitle: { color: '#93c5fd', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  selectionItem: { backgroundColor: '#151f32', padding: 10, borderRadius: 6, marginBottom: 8 },
  categoryName: { color: '#9ca3af', fontSize: 14, marginBottom: 4 },
  selectionValue: { color: 'white', fontSize: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#070f1b",
    zIndex: 100, 
  },
  loadingText: { marginTop: 16, fontSize: 16, color: "white" },
});

export default CreateItineraryScreenV2;
