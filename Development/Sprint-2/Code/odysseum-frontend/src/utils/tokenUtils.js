/*

file: tokenUtils.js

This file contains the utility functions for getting and saving the access token in the react native secure store.

*/

//use this later once we have the access token implementation

import * as SecureStore from 'expo-secure-store';


/**
 * Save the access token in the secure store
 * @param {string} accessToken 
 * @returns 
 */
export const setAccessToken = async (accessToken) => {
    try {
        await SecureStore.setItemAsync('accessToken', accessToken);
    } catch (error) {
        console.log(error);
    }
}

/**
 * Get the access token from the secure store
 * @returns Access token
 */
export const getAccessToken = async () => {
    try {
        return await SecureStore.getItemAsync('accessToken');
    } catch (error) {
        console.log(error);
    }
}

/**
 * Delete the access token from the secure store
 * @returns 
 */
export const deleteAccessToken = async () => {
    try {
        await SecureStore.deleteItemAsync('accessToken');
        return true;
    } catch (error) {
        console.log(error);
    }
}