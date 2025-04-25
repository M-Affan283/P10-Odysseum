import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, Image, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import axiosInstance from "../../utils/axios";
import { TemplateContext } from "../../../app/itinerary/_layout";
import Toast from "react-native-toast-message";
import llmaxiosInstance from "../../utils/llm_axios";

const CreateItineraryWithAIScreen = () => {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [imageUri, setImageUri] = useState(null);

    const { selectedTemplate } = useContext(TemplateContext);

    const fileReaderInstance = new FileReader();

    const generatePath = async () => {
        setLoading(true);
        setError(null);
        setImageUri(null);
    
        if (query.trim() === "") {
            Toast.show({
                type: "error",
                text1: "Missing Information",
                text2: "Please fill in the query before trying to generate an itinerary.",
            });
            setLoading(false);
            return;
        }
    
        if (!selectedTemplate) {
            Toast.show({
                type: "error",
                text1: "Missing Template",
                text2: "Please select a template before submitting.",
            });
            setLoading(false);
            return;
        }
    
        try {
            const response = await llmaxiosInstance.post("/itinerary/processAiItinerary", query);
            
            console.log(response)

            const blob = response.data;
            fileReaderInstance.onload = () => {
                setImageUri(fileReaderInstance.result);
                Toast.show({
                    type: "success",
                    text1: "Itinerary Generated",
                    text2: "Successfully created your itinerary!",
                });
            };
            fileReaderInstance.readAsDataURL(blob);
        } catch (err) {
            console.error("API Error:", err);
            Toast.show({
                type: "error",
                text1: "Generation Failed",
                text2: "Please try again later.",
            });
        }
    
        setLoading(false);
    };
    

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
                <TextInput
                    placeholder="Enter your query..."
                    value={query}
                    onChangeText={setQuery}
                    style={styles.input}
                    multiline={true}
                    textAlignVertical="top"
                />
                <Button title="Generate" onPress={generatePath} style={styles.button} />

                {loading && (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#00ff00" />
                        <Text style={styles.loadingText}>Generating Itinerary...</Text>
                    </View>
                )}

                {error && <Text style={styles.error}>{error}</Text>}

                {imageUri && (
                    <View style={styles.imageContainer}>
                        <Text style={styles.imageTitle}>Generated Itinerary:</Text>
                        <Image source={{ uri: imageUri }} style={styles.image} />
                    </View>
                )}
            </View>
        </ScrollView>
    </View>
    );
};
export default CreateItineraryWithAIScreen;

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
        justifyContent: "center",  
        alignItems: "center", 
        width: "100%", 
        paddingBottom: 900,
    },
    formContainer: {
        width: "100%",
        maxWidth: 300, 
        backgroundColor: "#070f1b",
        padding: 20,
        alignItems: "center", 
    },
    input: {
        width: 300,         
        maxWidth: 350,
        minHeight: 100,
        backgroundColor: "white",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,   
        fontSize: 18,
        marginBottom: 10,
        textAlign: "left",    
        textAlignVertical: "top", 
        multiline: true,       
        flexWrap: "wrap",      
      },
    loaderContainer: {
        marginTop: 20,
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        color: "#00ff00",
        fontSize: 16,
    },
    error: {
        color: "red",
        marginTop: 10,
    },
    imageContainer: {
        marginTop: 20,
        alignItems: "center",
    },
    imageTitle: {
        color: "white",
        fontSize: 18,
        marginBottom: 10,
    },
    image: {
        width: 300,
        height: 400,
        borderRadius: 10,
        marginBottom: 20,
    },
});
