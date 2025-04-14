import React, { useContext } from 'react'
import { View, Text, Image, StyleSheet } from "react-native";
import CreateItineraryScreen from '../../src/screens/itinerary_screens/CreateItineraryScreen'
import { TemplateContext } from './_layout'

const CreateItinerary = () => {
  const { selectedTemplate } = useContext(TemplateContext)

  return (
    <View style={styles.container}>
      <Text style={styles.header}> Create Itinerary</Text>
      {selectedTemplate ? (
        <Text style={styles.template}>Template: template selected</Text>
      ) : (
        <Text style={styles.template}>Template: No template selected.</Text>
      )}
      <CreateItineraryScreen />
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

export default CreateItinerary