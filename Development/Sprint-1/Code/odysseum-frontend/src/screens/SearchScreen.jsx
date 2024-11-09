// File: components/SearchScreen.js
// author: Luqman

import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchType, setSearchType] = useState('profiles'); // Switch between 'profiles' or 'locations'

  const handleSearch = async () => {
    try {
      if (searchType === 'profiles') {
        const profileResponse = await fetch(`http://localhost:3000/api/users/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ searchParam: query })
        });
        const profileResults = await profileResponse.json();
        setProfiles(profileResults.users || []);
      } else if (searchType === 'locations') {
        const locationResponse = await fetch(`http://localhost:3000/api/locations/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ searchParam: query })
        });
        const locationResults = await locationResponse.json();
        setLocations(locationResults.locations || []);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const renderProfileItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.username || 'Unknown Username'}</Text>
      <Text>{item.bio || 'No bio available'}</Text>
    </TouchableOpacity>
  );

  const renderLocationItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.name || 'Unnamed Location'}</Text>
      <Text>{item.description || 'No description available'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search for profiles or locations..."
        value={query}
        onChangeText={setQuery}
        style={styles.searchInput}
      />
      <View style={styles.buttonContainer}>
        <Button title="Search Profiles" onPress={() => { setSearchType('profiles'); handleSearch(); }} />
        <Button title="Search Locations" onPress={() => { setSearchType('locations'); handleSearch(); }} />
      </View>

      {searchType === 'profiles' ? (
        <FlatList
          data={profiles}
          keyExtractor={(item) => String(item._id)} // Ensure key is a string
          renderItem={renderProfileItem}
        />
      ) : (
        <FlatList
          data={locations}
          keyExtractor={(item) => String(item._id)} // Ensure key is a string
          renderItem={renderLocationItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  searchInput: { padding: 10, borderColor: 'gray', borderWidth: 1, marginBottom: 10 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  itemContainer: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  itemTitle: { fontWeight: 'bold' },
});

export default SearchScreen;
