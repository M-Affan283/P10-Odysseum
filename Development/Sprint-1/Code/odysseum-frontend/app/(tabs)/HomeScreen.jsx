import React, { useEffect, useState } from "react";
import axios from 'axios';
import { View, Text, StyleSheet, Button, ImageBackground, Image } from 'react-native';


export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
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
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    heading: {
        fontSize: 24,
        color: 'black',
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 50,
    },
    button: {
      width:'50%',
      marginBottom:10,
    }
});