import React, { useEffect, useState } from "react";
import axios from 'axios';
import { View, Text, StyleSheet, ImageBackground, Button, Image } from 'react-native';

export default class App extends React.Component {
    render() {
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
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'black',
    },
    button: {
        marginBottom: 10,
    }
});