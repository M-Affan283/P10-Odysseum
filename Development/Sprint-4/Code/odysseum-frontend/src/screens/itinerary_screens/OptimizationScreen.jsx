import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeftIcon, CheckCircleIcon } from 'react-native-heroicons/outline';

const OptimizationScreen = ({ itinerary, onBack, onComplete }) => {
  // Optimization options
  const OPTIMIZATION_OPTIONS = [
    { id: 'ratings', name: 'Ratings', description: 'Prioritize higher-rated attractions and experiences' },
    { id: 'distance', name: 'Distance', description: 'Plan efficient travel routes' },
    // { id: 'cost', name: 'Cost', description: 'Optimize for budget-friendly options and routes' },

  ];
  const [selectedOption, setSelectedOption] = useState(null);

  // Function to compile and format all the itinerary data
  const compileItineraryData = (itinerary, optimizationOption) => {
    // Getting the current date for timestamp
    const timestamp = new Date().toISOString();
    
    // Creating the base dictionary structure
    const itineraryData = {
      id: `itinerary-${Date.now()}`,
      createdAt: timestamp,
      lastModified: timestamp,
      optimization: optimizationOption,
      destinations: []
    };
    
    // Adding each destination with its stops
    itinerary.forEach(destination => {
      const destinationData = {
        id: destination.id,
        name: destination.location.name,
        coordinates: destination.location.coordinates || null,
        address: destination.location.address || null,
        stops: destination.stops.map(stop => ({
          id: stop.id,
          category: stop.category,
        }))
      };
      
      itineraryData.destinations.push(destinationData);
    });
    
    return itineraryData;
  };

  const handleGenerate = () => {
    // Proceeds if an option is selected
    if (selectedOption) {
      // Compiling all data into a structured dictionary
      const compiledItineraryData = compileItineraryData(itinerary, selectedOption);
      console.log('Compiled itinerary data:', compiledItineraryData);
      onComplete(compiledItineraryData);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Optimize Your Itinerary</Text>
      </View>

      <Text style={styles.subtitle}>
        Choose what's most important for your trip
      </Text>

        {/* Optimization button list */}
      <ScrollView style={styles.optionsContainer}>
        {OPTIMIZATION_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              selectedOption === option.id && styles.selectedOption
            ]}
            onPress={() => setSelectedOption(option.id)}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionName}>{option.name}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>

            {selectedOption === option.id && (
              <CheckCircleIcon size={24} color="#10b981" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
        
        {/* Generate Button */}
      <TouchableOpacity
        style={[
          styles.completeButton,
          !selectedOption && styles.disabledButton
        ]}
        onPress={handleGenerate}
        disabled={!selectedOption}
      >
        <Text style={styles.completeButtonText}>Generate Optimized Recommendations</Text>
      </TouchableOpacity>
    </View>
  );
};
export default OptimizationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070f1b',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
    marginTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 24,
  },
  optionsContainer: {
    flex: 1,
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: '#1c2536',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1c2536',
  },
  selectedOption: {
    borderColor: '#10b981',
    backgroundColor: '#0f3a2f',
  },
  optionContent: {
    flex: 1,
    marginRight: 8,
  },
  optionName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 14,
    color: '#94a3b8',
  },
  completeButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#1f4d43',
    opacity: 0.7,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
