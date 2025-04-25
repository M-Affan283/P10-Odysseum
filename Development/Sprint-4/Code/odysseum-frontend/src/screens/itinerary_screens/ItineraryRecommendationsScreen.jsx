import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from 'react-native-heroicons/solid';

const ItineraryRecommendationsScreen = ({ route, recommendations, userLocation, onBack, onComplete }) => {
  const recommendationsData = recommendations['i_reqs'];
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isComplete, setIsComplete] = useState(false);

  const locationKeys = Object.keys(recommendationsData);
  const currentLocation = locationKeys[currentLocationIndex];
  const categories = Object.keys(recommendationsData[currentLocation]);
  const currentCategory = categories[currentCategoryIndex];
  const currentRecommendations = recommendationsData[currentLocation][currentCategory];

  const userLatitude = userLocation['latitude']
  const userLongitude = userLocation['longitude']

  const selectOption = (option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [`${currentLocation}-${currentCategory}`]: option
    }));
  };

  const goToNextCategory = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
    } else if (currentLocationIndex < locationKeys.length - 1) {
      setCurrentLocationIndex(prev => prev + 1);
      setCurrentCategoryIndex(0);
    } else {
      setIsComplete(true);
    }
  };

  const goToPreviousCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
    } else if (currentLocationIndex > 0) {
      const newLocationIndex = currentLocationIndex - 1;
      const prevLocation = locationKeys[newLocationIndex];
      const prevCategories = Object.keys(recommendationsData[prevLocation]);
      setCurrentLocationIndex(newLocationIndex);
      setCurrentCategoryIndex(prevCategories.length - 1);
    }
  };

  const formatCategoryTitle = (category) => {
    if (!category) return "";
    return category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const handleCreateItinerary = () => {
    const finalItinerary = {
      selections: selectedOptions,
      finalSelections: selectedOptions || route?.params?.originalData || {}
    };
    onComplete(finalItinerary);
  };

  const getDistanceFromLatLonInKM = (lat1, lon1, lat2, lon2) => {
    const toRad = value => (value * Math.PI) / 180;
    const R = 6371000; 
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round((R * c) / 1000); 
  };
  
  if (isComplete) {
    return (
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={onBack} style={styles.backIcon}>
            <ArrowLeftIcon size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Your Itinerary</Text>
        </View>

        <ScrollView style={styles.optionsContainer}>
          {Object.entries(selectedOptions).map(([key, option], i) => (
            <View key={i} style={styles.optionCard}>

              <Text style={styles.optionTitle}>
                {(() => {
                  const categoryName = key.split("-")
                  const label = categoryName.slice(0, -1).join(' ');
                  const lastWord = categoryName.slice(-1)[0];
                  return `${label} - [${lastWord.toUpperCase()}]`;
                })()}
              </Text>

              <Text style={styles.optionDescription}>
                {typeof option === 'object' ? option.name : option}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setIsComplete(false)}
          >
            <ArrowLeftIcon size={20} color="white" />
            <Text style={styles.backButtonText}>Review Options</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleCreateItinerary}
          >
            <Text style={styles.confirmButtonText}>Create Itinerary</Text>
            <CheckCircleIconSolid size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={onBack} style={styles.backIcon}>
            <ArrowLeftIcon size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>{currentLocation}</Text>
        </View>
        <Text style={styles.categoryTitle}>Choose {formatCategoryTitle(currentCategory)}</Text>
      </View>

      <ScrollView style={styles.optionsContainer}>
        {currentRecommendations?.map((option, index) => {
          // Determine the display name
          const displayName = typeof option === 'object' && option !== null 
            ? (option.name || 'Unnamed Option') 
            : (option || 'Unnamed Option');
          const locationAddress = option['address']
          const [longitude, latitude] = option['coordinates']
          
          const distanceFromUser = getDistanceFromLatLonInKM(
            userLatitude, 
            userLongitude, 
            latitude,
            longitude
          )
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionCard,
                selectedOptions[`${currentLocation}-${currentCategory}`] === option && styles.selectedCard
              ]}
              onPress={() => selectOption(option)}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{displayName}</Text>
                <Text style={styles.optionDescription}>Address: {locationAddress}</Text>
                <Text style={styles.optionDescription}>Distance: {distanceFromUser} km</Text>
                <Text style={styles.optionDescription}>
                  {typeof option === 'object' && option.rating 
                    ? `Rating: ${option.rating}` 
                    : `Recommended for ${currentCategory}`}
                </Text>
              </View>
              {selectedOptions[`${currentLocation}-${currentCategory}`] === option ? (
                <CheckCircleIconSolid size={24} color="#10b981" />
              ) : (
                <CheckCircleIcon size={24} color="#6b7280" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.buttonContainer}>
        {currentLocationIndex > 0 || currentCategoryIndex > 0 ? (
          <TouchableOpacity style={styles.backButton} onPress={goToPreviousCategory}>
            <ArrowLeftIcon size={20} color="white" />
            <Text style={styles.backButtonText}>Previous</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedOptions[`${currentLocation}-${currentCategory}`] && styles.disabledButton
          ]}
          onPress={goToNextCategory}
          disabled={!selectedOptions[`${currentLocation}-${currentCategory}`]}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <ArrowRightIcon size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070f1b',
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  backIcon: {
    padding: 4,
    marginRight: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  progressText: {
    color: '#93c5fd',
    fontSize: 14,
    marginBottom: 16,
  },
  categoryTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
  },
  optionsContainer: {
    flex: 1,
    marginBottom: 16,
    marginTop: 16,
  },
  optionCard: {
    backgroundColor: '#1c2536',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    width: '100%',         
    alignSelf: 'stretch',  
  },
  selectedCard: {
    borderColor: '#10b981',
    backgroundColor: '#1c3a36',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  optionDescription: {
    color: '#9ca3af',
    fontSize: 14,
    flexWrap: 'wrap',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  nextButtonText: {
    color: 'white',
    marginRight: 8,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#1e3a5f',
    opacity: 0.7,
  },
  summaryContainer: {
    flex: 1,
    marginBottom: 16,
  },
  summaryItem: {
    backgroundColor: '#1c2536',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  summaryDestination: {
    fontSize: 16,
    fontWeight: '600',
    color: '#93c5fd',
    marginBottom: 8,
  },
  summaryCategory: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  summaryOption: {
    fontSize: 18,
    color: 'white',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: 'white',
    marginRight: 8,
    fontWeight: '600',
  },
});

export default ItineraryRecommendationsScreen;