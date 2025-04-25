import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowRightIcon, ArrowLeftIcon } from "react-native-heroicons/outline";

const ItineraryConfirmationScreen= ({ destinations=[], optimization, finalSelections, onComplete }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Itinerary Plan Created!</Text>
      
      <View style={styles.confirmationBox}>
        <Text style={styles.confirmationText}>
          Your itinerary plan has been successfully created with {destinations.length} destinations 
          and optimized for {optimization.toUpperCase()}.
        </Text>
        
        {finalSelections && (
          <View style={styles.selectionsContainer}>
            <Text style={styles.selectionsTitle}>Your Selections:</Text>
            {Object.entries(finalSelections).map(([category, selection]) => (
              <View key={category} style={styles.selectionItem}>
                <Text style={styles.categoryName}>
                  {(() => {
                    const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).split("-");
                    const label = categoryName.slice(0, -1).join(' ');
                    const lastWord = categoryName.slice(-1)[0];
                    return `${label} - [${lastWord.toUpperCase()}]`;
                  })()}
                </Text>
                <Text style={styles.selectionValue}>
                  {typeof selection === 'object' 
                    ? (selection.name || JSON.stringify(selection)) 
                    : selection}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
      
      <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
        <Text style={styles.continueButtonText}>Create Another Itinerary Plan</Text>
        <ArrowRightIcon size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default ItineraryConfirmationScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#070f1b', 
    padding: 16,
    position: 'relative' 
  },
  backIcon: {
    position: 'absolute',
    top: 15,
    left: 20,
    zIndex: 10,
    marginTop: 24,
  },
  title: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "white", 
    marginBottom: 24, 
    marginTop: 64, // Adjusted to make space for back icon
    textAlign: 'center'
  },
  confirmationBox: { 
    backgroundColor: '#1c2536', 
    borderRadius: 8, 
    padding: 16, 
    marginBottom: 32 
  },
  confirmationText: { 
    color: 'white', 
    fontSize: 16, 
    lineHeight: 24, 
    marginBottom: 16,
    textAlign: 'center'
  },
  selectionsContainer: { 
    marginTop: 16 
  },
  selectionsTitle: { 
    color: '#93c5fd', 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 12,
    textAlign: 'center'
  },
  selectionItem: { 
    backgroundColor: '#151f32', 
    padding: 10, 
    borderRadius: 6, 
    marginBottom: 8 
  },
  categoryName: { 
    color: '#9ca3af', 
    fontSize: 14, 
    marginBottom: 4 
  },
  selectionValue: { 
    color: 'white', 
    fontSize: 16 
  },
  continueButton: {
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#10b981", 
    padding: 16,
    borderRadius: 8, 
    justifyContent: "center", 
    position: "absolute", 
    bottom: 24, 
    left: 16, 
    right: 16
  },
  continueButtonText: { 
    color: "white", 
    fontWeight: "600", 
    fontSize: 16, 
    marginRight: 8 
  },
});