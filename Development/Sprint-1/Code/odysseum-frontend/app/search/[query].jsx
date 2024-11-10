// File: app/search/[query].jsx
import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

const SearchScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) return; // Do nothing if search is empty
    setLoading(true);
    setError('');
    try {
      const [profileResponse, locationResponse] = await Promise.all([
        fetch(`http://192.168.100.24:3000/api/users/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ searchParam: searchTerm }),
        }),
        fetch(`http://192.168.100.24:3000/api/locations/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ searchParam: searchTerm }),
        }),
      ]);
      const profileData = await profileResponse.json();
      const locationData = await locationResponse.json();
      setProfiles(profileData.users || []);
      setLocations(locationData.locations || []);
    } catch (error) {
      setError('Failed to fetch results. Please try again.');
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProfileItem = ({ item }) => (
    <TouchableOpacity style={styles.resultItem}>
      <Text style={styles.resultTitle}>{item.username}</Text>
      <Text style={styles.resultDescription}>{item.bio}</Text>
    </TouchableOpacity>
  );

  const renderLocationItem = ({ item }) => (
    <TouchableOpacity style={styles.resultItem}>
      <Text style={styles.resultTitle}>{item.name}</Text>
      <Text style={styles.resultDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Profiles & Locations</Text>
      <TextInput
        placeholder="Type to search..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        onSubmitEditing={handleSearch}
        style={styles.searchInput}
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Searching...</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Profiles</Text>
          <FlatList
            data={profiles}
            keyExtractor={(item) => String(item._id)}
            renderItem={renderProfileItem}
            ListEmptyComponent={<Text style={styles.noResultsText}>No profiles found</Text>}
          />
          <Text style={styles.sectionTitle}>Locations</Text>
          <FlatList
            data={locations}
            keyExtractor={(item) => String(item._id)}
            renderItem={renderLocationItem}
            ListEmptyComponent={<Text style={styles.noResultsText}>No locations found</Text>}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  searchInput: {
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, color: '#007AFF' },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  resultDescription: { color: '#666', marginTop: 5 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: { color: 'red', fontSize: 16, marginTop: 20, textAlign: 'center' },
  noResultsText: { color: '#666', fontSize: 16, textAlign: 'center', paddingVertical: 10 },
});

export default SearchScreen;