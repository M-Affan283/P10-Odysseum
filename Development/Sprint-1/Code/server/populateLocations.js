import mongoose from "mongoose";
import { Location } from "./models/Location.js";
import dotenv from 'dotenv';

// Initializing dotenv file
dotenv.config({ path: './config.env' });

const environment = process.argv[2] || 'remote';
const MONGO_URI = environment === 'local' ? process.env.MONGODB_URI_LOCAL : process.env.MONGODB_URI_REMOTE;
const PORT = process.env.PORT || 8000;
const app = (await import('./app.js')).default;

// Test location to insert
const locations = [
    {
        name: "New York City",
        coordinates: {
            type: "Point",
            coordinates: [-122.4194, 37.7749],
        },
        description: "The largest city in the United States.",
    },
    {
        name: "San Francisco",
        coordinates: {
            type: "Point",
            coordinates: [-122.4194, 37.7749],
        },
        description: "A popular tourist destination in California.",
    },
    {
        name: "Tokyo",
        coordinates: {
            type: "Point",
            coordinates: [139.6917, 35.6895],
        },
        description: "The capital city of Japan.",
    },
]

// Creating function to add locations
const addLocations = async() => {
    try {
        await Location.insertMany(locations);
        console.log("Locations inserted.")
    } catch (error) {
        console.error("Error inserting location.")
    } finally {
        mongoose.connection.close();
    }
};

// Connecting to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("\nConnected to MongoDB");
        addLocations();
    })
    .catch((error)=> {
        console.log("Could not connect");
    });


