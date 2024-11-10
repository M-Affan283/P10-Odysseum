import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, TextInput, ActivityIndicator, FlatList, Image } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import axios from 'axios';
import filter from "lodash.filter"

const HomeScreen = () => {
    
    // Initializng constants
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [fullData, setFullData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Query searching/handling
    const handleSearch = (query) => {
        setSearchQuery(query)

        if (!query) {
            setData(fullData);
            return
        }
        
        const formattedQuery = query.toLowerCase();
        const filteredData = filter(fullData, (user) => contains(user, formattedQuery));
        setData(filteredData);
        console.log(filteredData)
    }

    const contains = (user, query) => {
        const { firstName, lastName, email, username } = user;
        return (
            firstName.toLowerCase().includes(query) ||
            lastName.toLowerCase().includes(query) ||
            email.toLowerCase().includes(query) ||
            username.toLowerCase().includes(query)
        );

    } 

    // Function fetches data
    const fetchData = async(url) => {
        try {
            const response = await axios.get(url);
            console.log(response.data.users)
            setData(response.data.users);
            setFullData(response.data.users);
        } catch (error) {
            setError(error);
        } finally {
            setIsLoading(false)
        }
    }
 
    // Constantly fetches data
    const API_ENDPOINT = "http://192.168.68.67:8000/api/user/getAll"

    useEffect(() => {
        setIsLoading(false);
        fetchData(API_ENDPOINT);
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator
                    size={"large"} color={"#5500dc"}                
                />
            </View>
        )
    }
    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>
                    Error in fetching data... Please check your internet connection
                </Text>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <TextInput
                placeholder="Search"
                clearButtonMode="always"
                style={styles.searchBar}
                autoCapitalize="none"
                autoCorrect={false}
                value={searchQuery}
                onChangeText={(query) => handleSearch(query)}
            />

            <FlatList
                data={data}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.displays}>
                        <Text style={styles.textName}>{item.firstName + ' ' + item.lastName}</Text>
                        <Text style={styles.textEmail}>{item.username}</Text>
                    </View>
                )}
            />
        </SafeAreaView>

        /* <View style={styles.container}>
            
            
            
            /* <Text style={styles.heading}>
                "Welcome To Odyssuem: A Voyage For Travellers"
            </Text>

            <Button
                title="Explore Destinations"
                onPress={() => alert("Explore destinations clicked")}
                style={styles.button}
            />
            <Button
                title="My Bookmarks"
                onPress={() => alert("My Bookmarks clicked")}
                style={styles.button}
            />
        </View> */
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    safeAreaView: {
        justifyContent: 'center',
        verticalAlign: 'center',
        marginHorizontal: 20,
        paddingTop: 20,
        width: 400,
    },
    searchBar: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        width: '300%',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'black',
    },
    button: {
        marginBottom: 10,
    },
    displays: {
        width:"200%",
    },
    textName: {
        fontSize: 17,
        marginLeft: 10,
        fontWeight: "600",
    },
    textEmail: {
        fontSize: 14,
        marginLeft: 10,
        color: "grey"
    }
});

export default HomeScreen;