import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, TextInput, ActivityIndicator, FlatList, Image } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import axios from 'axios';
import filter from "lodash.filter"

const HomeScreen = () => {
    
    // Initializng constants
    const [userData, setUserData] = useState([]);
    const [locationData, setLocationData] = useState([]);

    const [filteredUserData, setFilteredUserData] = useState([]);
    const [filteredLocationData, setFilteredLocationData] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Query searching/handling
    const handleSearch = (query) => {
        setSearchQuery(query);
        const formattedQuery = query.toLowerCase();

        // Filtering users based on search query
        const filteredUsers = filter(userData, (user) => contains(user, formattedQuery));
        setFilteredUserData(filteredUsers)

        // Filtering locations based on search query
        const filteredLocations = filter(locationData, (loc) => containsLoc(loc, formattedQuery));
        setFilteredLocationData(filteredLocations)
    }

    // Filters the queries
    const contains = (item, query) => {
        const { firstName, lastName, email, username } = item;
        return (
            (firstName && lastName && (firstName + lastName).toLowerCase().includes(query.trim())) ||
            (firstName && firstName.trim().toLowerCase().includes(query)) ||
            (lastName && lastName.toLowerCase().includes(query)) ||
            (username && username.toLowerCase().includes(query)) ||
            (email && email.toLowerCase().includes(query))

        );
    }
    const containsLoc = (item, query) => {
        const { name } = item;
        return (
            (name && name.toLowerCase().includes(query))
        );
    }

    // APIs
    const API_USERS = "http://192.168.68.67:8000/api/user/getAll"
    const API_LOCATIONS = "http://192.168.68.67:8000/api/user/getAllLocs"

    // Function fetches data
    const fetchData = async(url) => {
        try {
            const response = await axios.get(API_USERS);
            const loc_response = await axios.get(API_LOCATIONS);

            setUserData(response.data.users);
            setLocationData(loc_response.data.locations);
        } catch (error) {
            setError(error);
        } finally {
            setIsLoading(false)
        }
    }
 
    // Constantly fetches data
    useEffect(() => {
        setIsLoading(false);
        fetchData();
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
                data={[...filteredUserData, ...filteredLocationData]}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    searchQuery !== "" ? (
                    <View style={styles.displays}>
                        {item.firstName ? (
                            <>
                            <Text style={styles.textName}>{item.firstName + ' ' + item.lastName}</Text>
                            <Text style={styles.textEmail}>{item.username}</Text>
                            </>
                        ): (
                            <>
                            <Text style={styles.textName}>{item.name}</Text>
                            <Text style={styles.textEmail}>{item.description}</Text>
                            </>
                        )}
                        
                    </View>
                    ) : null            
                )}
            />
            <View>
                <Text style={styles.heading}>
                    Welcome To Odyssuem: A Voyage For Travellers
                </Text>

                <Button
                    title="Explore Destinations"
                    onPress={() => alert("Explore destinations clicked")}
                    style={styles.button}
                />
            </View>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeAreaView: {
        justifyContent: 'center',
        verticalAlign: 'center',
        marginHorizontal: 20,
        paddingTop: 20,
        width: '%100',
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
        alignContent: 'center',
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