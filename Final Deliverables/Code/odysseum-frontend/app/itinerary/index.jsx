import ItineraryTemplatesScreen from '../../src/screens/itinerary_screens/ItineraryTemplatesScreen'
import React from 'react'
import { View, Text, StyleSheet } from "react-native";

const ItineraryTemplates = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Template Selection</Text>
      <View style={styles.screenContainer}>
        <ItineraryTemplatesScreen />
      </View>
    </View>
  )
}
export default ItineraryTemplates

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#070f1b",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginTop: 24,
  },
  screenContainer: {
    flex: 1
  }
});
