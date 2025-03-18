import React, { useContext } from 'react'
import { View, Text, Image, StyleSheet } from "react-native";
import CreateOptimizedItineraryScreen from '../../src/screens/CreateOptimizeditineraryScreen';
import { TemplateContext } from './_layout'

const CreateOptimizedItinerary = () => {
  const { selectedTemplate } = useContext(TemplateContext)

  return (
    <View style={styles.container}>
      <Text style={styles.header}> Generate an AI-based Itinerary</Text>
      {selectedTemplate ? (
            <Text style={styles.template}>Template: {selectedTemplate.title}</Text>
        ) : (
            <Text style={styles.template}>Template: No template selected.</Text>
        )}
      <CreateOptimizedItineraryScreen/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#070f1b",
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: "center" 
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  templateImage: { 
    width: 300, 
    height: 400, 
    resizeMode: "contain" 
  },
  template: { 
    color: "white", 
    fontWeight: "bold", 
    textAlign: "center", 
    marginTop: 20 
  },
});

export default CreateOptimizedItinerary