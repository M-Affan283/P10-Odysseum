import React, { useEffect, useState } from "react";
import axios from 'axios';
import { View, Text, StyleSheet, Button, ImageBackground, Image } from 'react-native';


export default function InboxScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        "User Inbox"
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