import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, TextInput, ActivityIndicator, FlatList, Image } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import axios from 'axios';
import filter from "lodash.filter"
import { Modal, TouchableOpacity } from "react-native";
import useUserStore from '../context/userStore'

const HomeScreen = () => {
    // ==== BOOKMARKING ====
    // Initializing constants for bookmarking
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);

    const openModal = (location) => {
        setSelectedLocation(location);
        setIsModalVisible(true);
    }
    
    const API_BOOKMARK = "http://192.168.68.67:8000/api/user/addBookmark/"
    const bookmarkLocation = async(location) => {
        try {

            console.log(location)
            const response = await axios.post(API_BOOKMARK, {
                userId: user._id,
                title: location
            });
            if (response.status == 201) {
                console.log(response.data.message + ": " + location);
            }
            else {
                setError("Something went wrong, please try again.")
            }

        } catch (error) {
            setError(error);
        }
    }

    // ==== SEARCHING ====
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
                    <TouchableOpacity onPress={() => openModal(item)}>
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
                    </TouchableOpacity>
                    ) : null            
                )}
            />
            <View>
                <Text style={styles.heading}>
                    Welcome To Odyssuem: A Voyage For Travellers
                </Text>
            </View>
        
        <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsModalVisible(false)}
        >   
            <View style={styles.modalBackground}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>{selectedLocation?.name}</Text>
                    <Text style={styles.modalDescription}>{selectedLocation?.description}</Text>
                    <Button title="Bookmark" onPress={() => bookmarkLocation(selectedLocation?.name)} />
                    <Button title="Close" onPress={() => setIsModalVisible(false)} />
                </View>
            </View>
        </Modal>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeAreaView: {
        justifyContent: 'center',
        verticalAlign: 'center',
        marginHorizontal: 20,
        paddingTop: 20,
        width: '93%',
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
    },
    modalBackground: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },    
    modalView: {
        width: '80%',
        height: '60%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 40,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
});

export default HomeScreen;