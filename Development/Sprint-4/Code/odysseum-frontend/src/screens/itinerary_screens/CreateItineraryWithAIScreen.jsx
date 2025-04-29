import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Image, 
  ActivityIndicator,
  Alert,
  Keyboard
} from "react-native";
import Toast from "react-native-toast-message";
import llmaxiosInstance from "../../utils/llm_axios";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { ArrowRightIcon, ArrowDownTrayIcon, PlusIcon } from 'react-native-heroicons/outline';

const CreateItineraryWithAIScreen = ({ selectedTemplate }) => {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatedItinerary, setGeneratedItinerary] = useState(null);
    const [overlayImageUri, setOverlayImageUri] = useState(null);
    const [activeScreen, setActiveScreen] = useState('form');
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const fileReaderRef = useRef(new FileReader());

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

    const generatePath = async () => {
        setLoading(true);
        setError(null);
        setGeneratedItinerary(null);
        setOverlayImageUri(null);
        setActiveScreen('loading');
    
        if (query.trim() === "") {
            Toast.show({
                type: "error",
                text1: "Missing Information",
                text2: "Please fill in the query before trying to generate an itinerary.",
            });
            setLoading(false);
            setActiveScreen('form');
            return;
        }
    
        if (!selectedTemplate) {
            Toast.show({
                type: "error",
                text1: "Missing Template",
                text2: "Please select a template before submitting.",
            });
            setLoading(false);
            setActiveScreen('form');
            return;
        }
    
        try {
            const textResponse = await llmaxiosInstance.post("/itinerary/processAiItinerary", query);
            const itineraryText = textResponse.data.generated_itinerary;
            
            setGeneratedItinerary(itineraryText);
            try {
                // Set up the FileReader onload handler before making the request
                fileReaderRef.current.onload = () => {
                    const base64data = fileReaderRef.current.result;
                    console.log("Image loaded successfully, length:", base64data.length);
                    setOverlayImageUri(base64data);
                    setActiveScreen('result');
                };
                
                fileReaderRef.current.onerror = (error) => {
                    console.error("FileReader error:", error);
                    setError("Error processing the image data");
                    setActiveScreen('form');
                };
                
                const overlayResponse = await llmaxiosInstance.post(
                    "/itinerary/processItineraryOverlay", 
                    {
                        template: selectedTemplate,
                        itinerary: itineraryText
                    },
                    { responseType: "blob" }
                );

                const blob = overlayResponse.data;
                fileReaderRef.current.readAsDataURL(blob);
                
            } catch (overlayError) {
                console.error("Overlay Error:", overlayError);
                setError("Generated the itinerary, but failed to create the image overlay.");
                setActiveScreen('form');
            }

            Toast.show({
                type: "success",
                text1: "Itinerary Generated",
                text2: "Successfully created your itinerary",
            });
        } catch (err) {
            console.error("API Error:", err);
            setError("Failed to generate itinerary. Please try again later.");
            setActiveScreen('form');
            Toast.show({
                type: "error",
                text1: "Generation Failed",
                text2: "Please try again later.",
            });
        }
    
        setLoading(false);
    };
    
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

    const downloadItinerary = async () => {
        try {
            if (!overlayImageUri) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "No image available to download"
                });
                return;
            }
            
            // Check permissions first
            const hasPermission = await checkPermissions();
            if (!hasPermission) {
                Alert.alert("Permission Denied", "Media library access is required to save images.");
                return;
            }
            
            let fileUri;
            const base64Data = overlayImageUri.split(',')[1];
            const filename = `itinerary_${new Date().getTime()}.png`;

            fileUri = `${FileSystem.documentDirectory}${filename}`;
            await FileSystem.writeAsStringAsync(fileUri, base64Data, {
                encoding: FileSystem.EncodingType.Base64
            });
            
            const asset = await MediaLibrary.createAssetAsync(fileUri);
            try {
                await MediaLibrary.createAlbumAsync("Itineraries", asset, false);
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
        setQuery("");
        setGeneratedItinerary(null);
        setOverlayImageUri(null);
        setActiveScreen('form');
    };

    // Creating a dedicated result screen component
    const ItineraryResultScreen = () => (
        <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Your Generated Itinerary</Text>
            
            <View style={styles.imageWrapper}>
                {overlayImageUri ? (
                    <>
                        <Image 
                            source={{ uri: overlayImageUri }} 
                            style={styles.resultImage}
                            onError={(e) => console.error("Image loading error:", e.nativeEvent.error)}
                        />
                    </>
                ) : (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Image failed to load</Text>
                    </View>
                )}
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
    if (activeScreen === 'result') {
        return <ItineraryResultScreen />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Generate an AI-based Itinerary</Text>
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
            
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formContainer}>
                    <Text style={styles.inputLabel}>Enter your travel details</Text>
                    <TextInput
                        value={query}
                        placeholder="Plan a trip from Murree to Chitral."
                        onChangeText={setQuery}
                        style={styles.input}
                        multiline={true}
                        textAlignVertical="top"
                        placeholderTextColor="#6b7280"
                    />
                    
                    {error && <Text style={styles.error}>{error}</Text>}
                </View>
            </ScrollView>
            
            {!isKeyboardVisible && (
                <View style={styles.bottomButtonsContainer}>
                    {/* Submit itinerary button */}
                    <TouchableOpacity 
                        style={[
                            styles.submitButton,
                            !selectedTemplate && styles.submitButtonDisabled
                        ]} 
                        onPress={generatePath}
                        disabled={!selectedTemplate}
                    >
                        <Text style={styles.submitButtonText}>Generate Itinerary</Text>
                        <ArrowRightIcon size={20} color="white" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

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
    scrollContainer: {
        flexGrow: 1,
        width: "100%", 
        paddingBottom: 100,
    },
    formContainer: {
        width: "100%",
        backgroundColor: "#070f1b",
        padding: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "white",
        marginBottom: 12
    },
    input: {
        width: "100%",         
        minHeight: 120,
        backgroundColor: "#1c2536",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,   
        fontSize: 18,
        marginBottom: 20,
        textAlign: "left",    
        textAlignVertical: "top", 
        multiline: true,
        color: "white"
    },
    error: {
        color: "red",
        marginTop: 10,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: "#ef4444",
        fontSize: 16,
        fontWeight: "500",
    },
    bottomButtonsContainer: {
        position: "absolute",
        bottom: 20,
        left: 16,
        right: 16,
    },
    submitButton: {
        flexDirection: "row", 
        alignItems: "center", 
        backgroundColor: "#10b981", 
        padding: 16,
        borderRadius: 8, 
        justifyContent: "center"
    },
    submitButtonDisabled: {
        backgroundColor: "#6b7280",
        opacity: 0.7
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

export default CreateItineraryWithAIScreen;