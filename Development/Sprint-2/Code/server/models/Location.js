import mongoose from "mongoose";

/**
 * Location Schema
 * @param {String} name         - The name of the location
 * @param {Object} coordinates  - The coordinates of the location in GeoJSON format. This will be used to calculate distances between locations, find nearby locations, etc.
 * @param {String} description  - A brief description of the location
 * @param {Timestamp} createdAt - The timestamp when the location was created
 * @param {Timestamp} updatedAt - The timestamp when the location was last updated
 */
const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Please provide a location name'],
    },

    imageUrl: {
        type: String,
        // required: [true, 'Please provide an image URL'], make true later
    },
    // Coordinates are stored in GeoJSON format. GeoJSON is a format for encoding a variety of geographic data structures. It supports various types of geometries, such as Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, and GeometryCollection.
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude] !!!IMPORTANT!!! Since MongoDB uses GeoJSON format, the order of coordinates is [longitude, latitude]
            required: true,
            default: [0.0, 0.0] // Default coordinates are set to 0, 0
        }
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },

    activityCount: { // New field to track overall activity
        type: Number,
        default: 0.0,
    },

    avgRating: { // New field to track average rating
        type: Number,
        default: 0.0,
    },
    
    lastInteraction: { // New field for tracking dynamic heatmap data
        type: Date,
        default: null,
    },

    heatmapScore: { // New field for tracking heatmap intensity
        type: Number,
        default: 0.0,
    },

}, { timestamps: true });

locationSchema.index({ coordinates: '2dsphere' }); // create a 2dsphere index on the coordinates field. This index supports queries that calculate geometries on an earth-like sphere.

export const Location = mongoose.model('Location', locationSchema, 'Location'); // create a model from the schema and export it