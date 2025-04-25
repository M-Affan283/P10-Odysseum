import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList, Keyboard, Image, ActivityIndicator, Share, Platform } from 'react-native';
import { MapPinIcon, PlusIcon, XMarkIcon, ArrowRightIcon, ClockIcon, CalendarIcon, ArrowDownTrayIcon } from 'react-native-heroicons/outline';
import axiosInstance from "../../utils/axios";
import Toast from "react-native-toast-message";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

const CreateItineraryScreen = ({ selectedTemplate }) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeScreen, setActiveScreen] = useState('form');
  const fileReaderInstance = new FileReader();

  // Keyboard visibility listeners
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

  const resetForm = () => {
    setDestinations([
      { destination: "", day: "", time: { hours: "", minutes: "" }, description: "" },
      { destination: "", day: "", time: { hours: "", minutes: "" }, description: "" },
    ]);
  };

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
      Alert.alert("Minimum Destinations", "You must have at least 2 destinations in your itinerary.");
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
    const emptyFields = destinations.some(
      dest => dest.destination.trim() === "" || dest.day.trim() === "" || dest.time.hours.trim() === "" ||  dest.time.minutes.trim() === ""
    );
    
    if (emptyFields) {
      Alert.alert(
        "Missing Information",
        "Please fill in all destination names and days before submitting."
      );
      return;
    }
    if (selectedTemplate === null) {
      Alert.alert(
        "Missing Template",
        "Please select a template before submitting."
      );
      return;
    }

    setLoading(true);
    setActiveScreen('loading');
    setImageUri(null);
    
    try {
      const response = await axiosInstance.post("/itinerary/create",
        { 
          destinations, 
          template_id: selectedTemplate?.template_id 
        },
        { responseType: "blob" } 
      );

      // Converting blob to base64 and reading
      const blob = response.data;
      fileReaderInstance.onload = () => {
        setImageUri(fileReaderInstance.result);   
        setActiveScreen('result');
      };
      fileReaderInstance.readAsDataURL(blob); 

    } catch (err) {
      console.error("API Error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to create itinerary. Please try again."
      });
      setActiveScreen('form');
    }
    
    setLoading(false);
  };

  // Check and request permissions for file storage
  const checkPermissions = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permission Required", 
          "Please grant photo library permissions to save images."
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  };

  // Download the itinerary to device storage
  const downloadItinerary = async () => {
    try {
      // Check permissions first
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        Alert.alert("Permission Denied", "Media library access is required to save images.");
        return;
      }
      
      let fileUri;
      const base64Data = imageUri.split(',')[1];
      const filename = `itinerary_${new Date().getTime()}.png`;

      fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      try {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        Alert.alert("Success", "Itinerary saved to your Photos gallery");
      } catch (albumError) {
        console.log("Album error:", albumError);
      }
      
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Itinerary saved to Photos"
      });
    } catch (error) {
      console.error("Error downloading itinerary:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to download: " + error.message
      });
    }
  };

  const handleReset = () => {
    setImageUri(null);
    resetForm();
    setActiveScreen('form');
  };

  // Creating a dedicated result screen component
  const ItineraryResultScreen = () => (
    <View style={styles.resultContainer}>
      <Text style={styles.resultTitle}>Your Generated Itinerary</Text>
      
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageUri }} style={styles.resultImage} />
      </View>
      
      <View style={styles.resultButtonsContainer}>
        <TouchableOpacity style={styles.resultDownloadButton} onPress={downloadItinerary}>
          <ArrowDownTrayIcon size={22} color="white" />
          <Text style={styles.resultDownloadButtonText}>Download Itinerary</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.createNewButton} onPress={handleReset}>
          <PlusIcon size={22} color="white" />
          <Text style={styles.createNewButtonText}>Create Another</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Loading screen
  if (activeScreen === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size="large" 
          color="#10b981"
        />
        <Text style={styles.loadingText}>Generating your itinerary...</Text>
      </View>
    );
  }

  // Result screen (when image is generated)
  if (activeScreen === 'result' && imageUri) {
    return <ItineraryResultScreen />;
  }

  // Form screen (default)
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Itinerary</Text>
      {selectedTemplate ? (
        <View style={styles.templateInfo}>
          <Text style={styles.template}>
            Template: {selectedTemplate.name || "Selected template"}
          </Text>
        </View>
      ) : (
        <View style={styles.templateInfo}>
          <Text style={styles.template}>Template: No template selected.</Text>
        </View>
      )}
    
      <View style={[
        styles.sectionContainer,
        isKeyboardVisible && styles.sectionContainerKeyboardVisible
      ]}>
        <Text style={styles.sectionTitle}>Destinations</Text>
        
        <FlatList
          removeClippedSubviews={false}
          data={destinations}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.destinationItem}>
              <View style={styles.destinationHeader}>
                <View style={styles.destinationTitleRow}>
                  <MapPinIcon size={18} color="#93c5fd" />
                  <Text style={styles.destinationTitle}>Destination {index + 1}</Text>
                </View>
                
                {index >= 2 && (
                  <TouchableOpacity 
                    style={styles.removeButton} 
                    onPress={() => deleteDestination(index)}
                  >
                    <XMarkIcon size={16} color="white" />
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Destination Input */}
              <Text style={styles.inputLabel}>Location Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter destination"
                placeholderTextColor="#6b7280"
                value={item.destination}
                onChangeText={(text) => handleChange(text, index, "destination", "destination")}
              />
              
              {/* Day and Time Row */}
              <View style={styles.dayTimeRow}>
                <View style={styles.dayContainer}>
                  <Text style={styles.inputLabel}>
                    <CalendarIcon size={14} color="white" style={styles.inputIcon} /> Day
                  </Text>
                  <TextInput
                    style={styles.dayInput}
                    placeholder="1, 2..."
                    placeholderTextColor="#6b7280"
                    value={item.day}
                    keyboardType="numeric"
                    maxLength={2}
                    onChangeText={(text) => handleChange(text, index, "day", "day")}
                  />
                </View>
                
                <View style={styles.timeContainer}>
                  <Text style={styles.inputLabel}>
                    <ClockIcon size={14} color="white" style={styles.inputIcon} /> Time
                  </Text>
                  <View style={styles.timeInputRow}>
                    <TextInput
                      style={styles.timeInput}
                      placeholder="HH"
                      placeholderTextColor="#6b7280"
                      value={item.time.hours}
                      keyboardType="numeric"
                      maxLength={2}
                      onChangeText={(text) => handleTimeChange(text, index, "hours")}
                    />
                    <Text style={styles.timeSeparator}>:</Text>
                    <TextInput
                      style={styles.timeInput}
                      placeholder="MM"
                      placeholderTextColor="#6b7280"
                      value={item.time.minutes}
                      keyboardType="numeric" 
                      maxLength={2}
                      onChangeText={(text) => handleTimeChange(text, index, "minutes")}
                    />
                  </View>
                </View>
              </View>
              
              {/* Description */}
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Enter description"
                placeholderTextColor="#6b7280"
                value={item.description}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
                onChangeText={(text) => handleChange(text, index, "description", "description")}
              />
            </View>
          )}
        />
      </View>
      
      {/* Bottom Buttons - Hidden when keyboard shows */}
      {!isKeyboardVisible && (
        <View style={styles.bottomButtonsContainer}>
          {/* Add destination button */}
          <TouchableOpacity style={styles.addButton} onPress={addDestination}>
            <PlusIcon size={18} color="white" />
            <Text style={styles.addButtonText}>Add Destination</Text>
          </TouchableOpacity>

          {/* Submit itinerary button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Create Itinerary</Text>
            <ArrowRightIcon size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
export default CreateItineraryScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#070f1b", 
    padding: 16 
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginTop: 24,
    marginBottom: 24,
  },
  templateInfo: {
    backgroundColor: "#1e3a5f",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  template: { 
    color: "white", 
    fontWeight: "500"
  },
  sectionContainer: { 
    flex: 1,
    marginBottom: 110 
  },
  sectionContainerKeyboardVisible: {
    marginBottom: 0 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "white", 
    marginBottom: 12 
  },
  destinationItem: { 
    backgroundColor: "#1c2536", 
    padding: 16, 
    marginBottom: 12, 
    borderRadius: 8 
  },
  destinationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  destinationTitleRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  destinationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#93c5fd",
    marginLeft: 8
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
    marginBottom: 8
  },
  inputIcon: {
    marginRight: 4
  },
  input: {
    backgroundColor: "#151f32",
    color: "white",
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 12,
  },
  dayTimeRow: {
    flexDirection: "row",
    marginBottom: 12
  },
  dayContainer: {
    flex: 1,
    marginRight: 10, 
  },
  timeContainer: {
    flex: 1,
    marginRight: 10, 
  },
  dayInput: {
    backgroundColor: "#151f32",
    color: "white",
    padding: 12,
    borderRadius: 8,
    fontSize: 14
  },
  timeInputRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  timeInput: {
    backgroundColor: "#151f32",
    color: "white",
    padding: 12,
    borderRadius: 8,
    width: 60,
    fontSize: 14,
    textAlign: "center"
  },
  timeSeparator: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 8
  },
  textArea: {
    backgroundColor: "#151f32",
    color: "white",
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: "top"
  },
  removeButton: { 
    backgroundColor: "#ef4444", 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  bottomButtonsContainer: {
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
  },
  addButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#2563eb", 
    padding: 12, 
    borderRadius: 8, 
    justifyContent: "center",
    marginBottom: 12
  },
  addButtonText: { 
    color: "white", 
    marginLeft: 8, 
    fontWeight: "600",
    fontSize: 16
  },
  submitButton: {
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#10b981", 
    padding: 16,
    borderRadius: 8, 
    justifyContent: "center"
  },
  submitButtonText: { 
    color: "white", 
    fontWeight: "600", 
    fontSize: 16, 
    marginRight: 8 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#070f1b",
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16, 
    color: "white",
    fontWeight: "500"
  },
  resultContainer: {
    flex: 1,
    backgroundColor: "#070f1b",
    padding: 16,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginTop: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  imageWrapper: {
    width: 300,
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1c2536',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2a3752',
  },
  resultImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  resultButtonsContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  resultDownloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    justifyContent: "center",
    marginBottom: 12,
  },
  resultDownloadButtonText: { 
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 12,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366f1",
    padding: 14,
    borderRadius: 8,
    justifyContent: "center",
    marginBottom: 12,
  },
  shareButtonText: { 
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 12,
  },
  createNewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 8,
    justifyContent: "center",
  },
  createNewButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 12,
  },
});
