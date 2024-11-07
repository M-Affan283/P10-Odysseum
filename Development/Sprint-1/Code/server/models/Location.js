/*

Filename: Location.js

This file contains the schema for the Location model. It defines the structure of the location document in the MongoDB database.

While each location will have an ID, the location name will be unique. This is because we want to avoid having multiple locations with the same name. For example, we don't want two locations named "New York City" in our database.

*/

import mongoose from "mongoose";


/**
 * Location Schema
 * @param {String} name - The name of the location
 * @param {Object} coordinates - The coordinates of the location in GeoJSON format. This will be used to calculate distances between locations, find nearby locations, etc.
 * @param {String} description - A brief description of the location
 * @param {Timestamp} createdAt - The timestamp when the location was created
 * @param {Timestamp} updatedAt - The timestamp when the location was last updated
 */
const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Please provide a location name'],
    },

    // Coordinates are stored in GeoJSON format. GeoJSON is a format for encoding a variety of geographic data structures. It supports various types of geometries, such as Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, and GeometryCollection.
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinatess: {
            type: [Number], // [longitude, latitude] !!!IMPORTANT!!! Since MongoDB uses GeoJSON format, the order of coordinates is [longitude, latitude]
            required: true
        }
    },

    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    }

}, { timestamps: true });

locationSchema.index({ coordinates: '2dsphere' }); // create a 2dsphere index on the coordinates field. This index supports queries that calculate geometries on an earth-like sphere.

export const Location = mongoose.model('Location', locationSchema, 'Location'); // create a model from the schema and export it