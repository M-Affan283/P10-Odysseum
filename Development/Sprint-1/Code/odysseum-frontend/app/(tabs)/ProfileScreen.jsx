import React, { useEffect, useState } from "react";
import axios from 'axios';
import { View, Text, StyleSheet, Button, ImageBackground, Image } from 'react-native';

// The profile page will have the user profile data as well as tabs for the user to see their saved/likes/etc. posts.
export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        "User Profile"
      </Text>
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
});