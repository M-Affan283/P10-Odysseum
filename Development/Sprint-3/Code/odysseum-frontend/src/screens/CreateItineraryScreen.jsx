import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import React, { useState } from 'react';
import axiosInstance from "../utils/axios";
import Toast from "react-native-toast-message";
import axios from 'axios';

const CreateItineraryScreen = () => {

  // Initially displays 2 (minimum) input fields
  const [destinations, setDestinations] = useState([
    { destination: "", day: "", time: { hours: "", minutes: "" }, description: "" },
    { destination: "", day: "", time: { hours: "", minutes: "" }, description: "" },
  ]);

  const addDestination = () => {
    setDestinations((destinations) => [
      ...destinations, 
      { destination: "", day: "", time: { hours: "", minutes: "" }, description: "" }
    ]);
  };

  const deleteDestination = (index) => {
    if (destinations.length > 2) {
      const updatedDestinations = destinations.filter((_, i) => i !== index);
      setDestinations(updatedDestinations);
    } else {
      Alert.alert("Minimum locations", "You must have at least 2 locations.");
    }
  };

  const handleChange = (text, index, field, type) => {
    const updatedDestinations = [...destinations];

    if (type === 'time') {
      updatedDestinations[index].time[field] = text;
    } else {
      updatedDestinations[index][field] = text;
    }
    setDestinations(updatedDestinations);
  };

  const handleTimeChange = (text, index, field) => {
    const validTime = /^[0-9]*$/; 
    if (text === "" || validTime.test(text)) {
      handleChange(text, index, field, "time");
    }
  };

  const printDestinations = () => {
    destinations.forEach((item, index) => {
      console.log(`Location ${index + 1}: ${item.destination} - Day: ${item.day} - Time: ${item.time.hours}:${item.time.minutes} - Description: ${item.description}`);
    });
  };

  const handleSubmit = () => {
    console.log(JSON.stringify(destinations, null, 2))

    axiosInstance.post("/itinerary/create", { destinations })
    .then((res) => {
      if (res.data.success) {
        console.log(res.data);
        
        // Pop-up message indicating successful itinerary creation
        Toast.show({  
          type: "success",
          position: "top",
          text1: "Itinerary created successfully.",
          visibilityTime: 3000,
        })
      }
    })
    .catch((error) => {
      console.log(error);
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Itinerary creation failed.",
        visibilityTime: 3000,
      })
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}> Create Itinerary</Text>

      <FlatList
        removeClippedSubviews={false}
        data={destinations}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.destinationRow}>
            {/* Destination Input */}
            <TextInput
              style={styles.input}
              placeholder="Enter Destination"
              value={item.destination}
              onChangeText={(text) => handleChange(text, index, "destination", "destination")}
            />
            
            {/* Day label & input field, time label & input field */}
            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>Day # :</Text>
              {/* Input for the nth day */}
              <TextInput
                style={styles.dayInput}
                placeholder='1,2...'
                value={item.day}
                keyboardType="numeric"
                maxLength={2}
                onChangeText={(text) => handleChange(text, index, "day", "day")}
              />

              <Text style={styles.timeLabel}>Time :</Text>
              {/* Input for hours */}
              <TextInput
                style={styles.timeInput}
                placeholder="HH"
                value={item.time.hours}
                keyboardType="numeric"
                maxLength={2}
                onChangeText={(text) => handleTimeChange(text, index, "hours")}
              />
              <Text style={styles.timeLabel}> :</Text>
              {/* Input for minutes */}
              <TextInput
                style={styles.timeInput}
                placeholder="MM"
                value={item.time.minutes}
                keyboardType="numeric" 
                maxLength={2}
                onChangeText={(text) => handleTimeChange(text, index, "minutes")}
              />
            </View>
            
            <Text style={styles.timeLabel}>Description :</Text>
            <TextInput
              style={styles.inputActivity}
              placeholder="Enter description"
              value={item.description}
              onChangeText={(text) => handleChange(text, index, "description", "description")}
            />

            {/* Delete Button for destinations after 2 */}
            {index >= 2 && (
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteDestination(index)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* Print destinations button */}
      <TouchableOpacity onPress={printDestinations} style={styles.printButton}>
        <Text style={styles.printButtonText}>Print Destinations</Text>
      </TouchableOpacity>
      
      {/* Add destination button */}
      <TouchableOpacity style={styles.button} onPress={addDestination}>
        <Text style={styles.buttonText}>Add Destination</Text>
      </TouchableOpacity>

      {/* Submit itinerary button */}
      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Submit Itinerary</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5"
  },
  button: {
    marginTop: 10,
    backgroundColor: "#4CAF50", // Green color for submit
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold"
  },
  printButton: {
    marginTop: 10,
    backgroundColor: "#2196F3", // Blue color for print button
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  printButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  },
  destinationRow: {
    padding: 10,
    backgroundColor: "#e0f7fa",
    borderRadius: 5,
    marginBottom: 10
  },
  dayInput:  {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
    borderRadius: 5,
    backgroundColor: "#fff",
    width: 40, 
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff"
  },
  inputActivity : {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff"
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
    marginTop: 10, 
  },
  timeLabel: {
    fontSize: 16, 
    marginRight: 10,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
    borderRadius: 5,
    backgroundColor: "#fff",
    width: 40, 
  },
  deleteButton: {
    backgroundColor: "#FF5722", // Red color for delete
    padding: 10,
    borderRadius: 5,
    marginTop: 10
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold"
  },
});

export default CreateItineraryScreen;