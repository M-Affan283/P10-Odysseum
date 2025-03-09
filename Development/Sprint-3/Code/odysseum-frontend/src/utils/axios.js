/*

Filename: axios.js

Author: Affan

This file contains custom axios instance that is used to make API requests to the backend server. It is used to set the base URL of the server and other configurations that are required to make API requests.

Use this once access token implementation is done.
*/

import axios from "axios";
import { getAccessToken, setAccessToken } from "./tokenUtils.js";
// Base URL of the backend server

// const API_BASE_URL = `https://p10-odysseum.onrender.com/api`;
const API_BASE_URL = `http://192.168.100.29:8000/api`;

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    // timeout: 10000,
    headers: {
        "Content-Type": "application/json", // we can change this to mutlipart/form-data if we need to send files in the frontend file for post creation
    },
});

// Add a request interceptor to add the access token to the request headers
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await getAccessToken();
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Debug log
        // console.log('Making request to:', config.baseURL + config.url);
        // console.log('With headers:', config.headers);
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor for failed (status 401) requests to refresh the access token and retry the request
//later



export default axiosInstance;
