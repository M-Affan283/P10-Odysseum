import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList, Keyboard, Image } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from "../../utils/axios";
import Toast from "react-native-toast-message";
import { TemplateContext } from "../../../app/itinerary/_layout";

const CreateItineraryScreen = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false)
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const { selectedTemplate } = useContext(TemplateContext);
  const fileReaderInstance = new FileReader();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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

  const handleSubmit = async() => {

    setLoading(true);
    setImageUri(null);
    try {
      const response = await axiosInstance.post("/itinerary/create",
          { destinations, template_id: selectedTemplate?.template_id },
          { responseType: "blob" } 
        );

      // Converting blob to base64 and reading
      const blob = response.data;
      fileReaderInstance.onload = () => {
        setImageUri(fileReaderInstance.result);             
      }
      fileReaderInstance.readAsDataURL(blob); 

    } catch (err) {
      console.error("API Error:", err);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        removeClippedSubviews={false}
        data={destinations}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.infoContainer}>
            {/* Destination Input */}
            <TextInput
              style={styles.input}
              placeholder="Enter Destination"
              placeholderTextColor={"gray"}
              value={item.destination}
              onChangeText={(text) => handleChange(text, index, "destination", "destination")}
            />
            
            {/* Day label & input field, time label & input field */}
            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>Day # :</Text>
              {/* Input for the nth day */}
              <TextInput
                style={styles.smallInput}
                placeholder='1,2...'
                placeholderTextColor={"gray"}
                value={item.day}
                keyboardType="numeric"
                maxLength={2}
                onChangeText={(text) => handleChange(text, index, "day", "day")}
              />

              <Text style={styles.timeLabel}>Time :</Text>
              {/* Input for hours */}
              <TextInput
                style={styles.smallInput}
                placeholder="HH"
                placeholderTextColor={"gray"}
                value={item.time.hours}
                keyboardType="numeric"
                maxLength={2}
                onChangeText={(text) => handleTimeChange(text, index, "hours")}
              />
              <Text style={styles.timeLabel}> :</Text>
              {/* Input for minutes */}
              <TextInput
                style={styles.smallInput}
                placeholder="MM"
                placeholderTextColor={"gray"}
                value={item.time.minutes}
                keyboardType="numeric" 
                maxLength={2}
                onChangeText={(text) => handleTimeChange(text, index, "minutes")}
              />
            </View>
            
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter description"
              placeholderTextColor={"gray"}
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
      {imageUri && (
          <View style={styles.imageContainer}>
              <Text style={styles.header2}>Generated Itinerary:</Text>
              <Image source={{ uri: imageUri }} style={styles.image} />
          </View>
      )}

      {!isKeyboardVisible && (
        <>
          {/* Add destination button */}
          <TouchableOpacity style={styles.submitButton} onPress={addDestination}>
            <Text style={styles.buttonText}>Add Destination</Text>
          </TouchableOpacity>

          {/* Submit itinerary button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit Itinerary</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: { 
    marginTop: 20, 
    alignItems: "center" 
  },

  container: { 
    flex: 1, 
    backgroundColor: "#070f1b", 
    paddingHorizontal: 16, 
    paddingVertical: 20 
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    // marginBottom: 20,
  },
  header2: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: "purple",
    padding: 15,
    marginBottom: 10,
    borderRadius: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    marginTop: 10,
  },
  input: {
    backgroundColor: "#1f2a3b",
    fontWeight: "bold",
    color: "white",
    paddingLeft: 5,
    borderRadius: 8,
    fontSize: 12,
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: "#1f2a3b",
    color: "white",
    borderRadius: 8,
    fontSize: 12,
    paddingLeft: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
  },
  timeLabel: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12, 
    marginRight: 10,
  },
  smallInput: {
    backgroundColor: "#1f2a3b",
    color: "white",
    fontWeight: 'bold',
    borderRadius: 8,
    width: 50,
    textAlign: "center",
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#34C759",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  templateContainer: {
    backgroundColor: "#1f2a3b",
    padding: 20,
    marginTop: 20,
    borderRadius: 10,
  },
  templateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  dayContainer: {
    marginBottom: 15,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34C759",
    marginBottom: 5,
  },
  eventText: {
    fontSize: 14,
    color: "white",
    marginLeft: 10,
  },

  loaderContainer: { 
    marginTop: 20, 
    alignItems: "center" 
  },
  loadingText: { 
    marginTop: 10, 
    color: "#00ff00", 
    fontSize: 16 
  },

  image: { 
    width: "90%",   // Ensures responsive width
    maxWidth: 350,  // Prevents it from being too large
    height: 400, 
    borderRadius: 10, 
    marginBottom: 20,
    resizeMode: "contain" // Prevents cropping issues
  },

  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
});


export default CreateItineraryScreen;