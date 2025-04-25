import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MapPinIcon, PlusCircleIcon, XMarkIcon, ChevronDownIcon, ArrowLeftIcon } from 'react-native-heroicons/outline';

// Stop categories with icons/colors
const STOP_CATEGORIES = [
  { id: 'hotel', name: 'Hotel', color: '#ec4899' },
  { id: 'restaurant', name: 'Restaurant', color: '#3b82f6' },
  { id: 'entertainment', name: 'Entertainment', color: '#8b5cf6' },
  { id: 'services', name: 'Services', color: '#f59e0b' },
  { id: 'other', name: 'Other', color: '#523c0b' },
];

const AddStops = ({ destinations, stopsData, onUpdateStops, onBack, onContinue }) => {
  // Initialize itinerary with passed stopsData or create new from destinations
  const [itinerary, setItinerary] = useState([]);
  
  useEffect(() => {
    // If stopsData is provided and not empty, use it
    if (stopsData && stopsData.length > 0) {
      setItinerary(stopsData);
    } 
    // Otherwise create a new stopsData structure from destinations
    else if (destinations && destinations.length > 0) {
      setItinerary(
        destinations.map(destination => ({
          id: destination._id,
          location: destination,
          stops: []
        }))
      );
    }
  }, [destinations, stopsData]);

  // When itinerary changes, call the update function to persist changes
  useEffect(() => {
    if (itinerary.length > 0) {
      onUpdateStops(itinerary);
    }
  }, [itinerary]);
  
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [activeDestinationId, setActiveDestinationId] = useState(null);
  
  // Add a stop with selected category
  const addStop = (destinationId, category) => {
    setItinerary(prevItinerary => 
      prevItinerary.map(item => {
        if (item.id === destinationId) {
          return {
            ...item,
            stops: [
              ...item.stops,
              {
                id: `stop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                category
              }
            ]
          };
        }
        return item;
      })
    );
    setDropdownVisible(false);
  };
  
  // Remove a stop
  const removeStop = (destinationId, stopId) => {
    setItinerary(prevItinerary => 
        prevItinerary.map(item => {
        if (item.id === destinationId) {
          return {
            ...item,
            stops: item.stops.filter(stop => stop.id !== stopId)
          };
        }
        return item;
      })
    );
  };
  
  // Open category dropdown for a destination
  const openCategoryDropdown = (destinationId) => {
    setActiveDestinationId(destinationId);
    setDropdownVisible(true);
  };
  
  // Continue to optimization
  const goToOptimization = () => {
    onContinue(itinerary);
  };
  
  // Get category details by id
  const getCategoryDetails = (categoryId) => {
    return STOP_CATEGORIES.find(cat => cat.id === categoryId) || 
      { name: 'Category', color: '#9ca3af' };
  };

  // Check if any stops have been added
  const hasStops = itinerary.some(dest => dest.stops.length > 0);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Back arrow button */}
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={20} color="white" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Add Stops to Your Itinerary</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {itinerary.map((destination) => (
          <View key={destination.id} style={styles.destinationContainer}>
            <View style={styles.destinationHeader}>
              <MapPinIcon size={20} color="#93c5fd" />
              <Text style={styles.destinationName}>{destination.location.name}</Text>
            </View>
            
            {/* Stops for this destination */}
            {destination.stops.map(stop => {
              const category = getCategoryDetails(stop.category);
              return (
                <View key={stop.id} style={styles.stopItem}>
                  <View style={styles.stopItemContent}>
                    <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
                      <Text style={styles.categoryText}>{category.name}</Text>
                    </View>
                    
                    <TouchableOpacity 
                      onPress={() => removeStop(destination.id, stop.id)}
                      style={styles.removeStopButton}
                    >
                      <XMarkIcon size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
            
            {/* Add stop button */}
            <TouchableOpacity 
              style={styles.addStopButton}
              onPress={() => openCategoryDropdown(destination.id)}
            >
              <PlusCircleIcon size={16} color="#93c5fd" />
              <Text style={styles.addStopText}>Add Stop</Text>
              <ChevronDownIcon size={14} color="#93c5fd" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      
      {/* Category Selection Modal */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Stop Category</Text>
            
            {/* Category options */}
            {STOP_CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryOption}
                onPress={() => addStop(activeDestinationId, category.id)}
              >
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <Text style={styles.categoryOptionText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setDropdownVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      <TouchableOpacity 
        style={[styles.continueButton, !hasStops && styles.disabledButton]}
        onPress={goToOptimization}
        disabled={!hasStops}
      >
        <Text style={styles.continueButtonText}>Continue to Optimization</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070f1b',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    marginTop: 24,
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  destinationContainer: {
    backgroundColor: '#0d1524',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  destinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e3a5f',
    paddingBottom: 12,
    marginBottom: 16,
  },
  destinationName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  stopItem: {
    backgroundColor: '#1c2536',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  stopItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  categoryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  removeStopButton: {
    backgroundColor: '#ef4444',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addStopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addStopText: {
    color: '#93c5fd',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1c2536',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  categoryDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
  },
  categoryOptionText: {
    color: 'white',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  cancelButtonText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  disabledButton: {
    backgroundColor: '#1f4d43',
    opacity: 0.7,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AddStops;