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
        name: "Chitral, KPK",
        coordinates: {
            type: "Point",
            coordinates: [0, 0],
        },
        description: "A beautiful isolated valley in the Khyber Pakhtunkhwa province.",
    },
    {
        name: "Nathia Gali, KPK",
        coordinates: {
            type: "Point",
            coordinates: [0, 0],
        },
        description: "A hill station and mountain resort town with stunning views and plenty of hiking trails.",
    },
    {
        name: "Murree, Punjab",
        coordinates: {
            type: "Point",
            coordinates: [0, 0],
        },
        description: "A beautiful mountain resort city situated 30km from the capital city of Pakistan.",
    },
    {
        name: "Fairy Meadows, Gilgit-Baltistan",
        coordinates: {
            type: "Point",
            coordinates: [0, 0],
        },
        description: "A stunning area of grassland near one of the base camp sites of Nanga Parbat.",
    },
    {
        name: "Swat, KPK",
        coordinates: {
            type: "Point",
            coordinates: [0, 0],
        },
        description: "A stunningly beautiful valley with winding roads and many trekking locations scattered throughout.",
    },
]

// Creating function to add locations
const addLocations = async () => {
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
    .catch((error) => {
        console.log("Could not connect");
    });


