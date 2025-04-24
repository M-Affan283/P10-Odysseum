import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, Image, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import axiosInstance from "../../utils/axios";
import { TemplateContext } from "../../../app/itinerary/_layout";

const CreateOptimizedItineraryScreen = () => {
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

        if (!selectedTemplate) {
            console.error("Select a template.");
            setError("Error generating itinerary. Please select a template.");
            setLoading(false);
            return;
        }

        try {
            const response = await axiosInstance.post("/itinerary/createOptimized",
                { query, template_id: selectedTemplate.id },
                { responseType: "blob" }    // Receiving data as blob
            );

            // Converting blob to base64 and reading
            const blob = response.data;
            fileReaderInstance.onload = () => {
                setImageUri(fileReaderInstance.result);             
            }
            fileReaderInstance.readAsDataURL(blob); 

        } catch (err) {
            setError("Error generating itinerary. Please try again.");
            console.error("API Error:", err);
        }

        setLoading(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <TextInput
                    placeholder="Generate path..."
                    value={query}
                    onChangeText={setQuery}
                    style={styles.input}
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
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",  
        alignItems: "center", 
        width: "100%", 
        paddingBottom: 900,
    },
    container: {
        width: "100%", 
        maxWidth: 300, 
        backgroundColor: "#070f1b",
        padding: 20,
        alignItems: "center", 
    },
    input: {
        width: 350, 
        maxWidth: 300, 
        height: 50,
        backgroundColor: "white",
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 18,
        marginBottom: 10,
        textAlign: "left",
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

export default CreateOptimizedItineraryScreen;
