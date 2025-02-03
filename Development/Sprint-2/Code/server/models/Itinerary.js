/*
    Author: Haroon Khawaja
*/
import mongoose from "mongoose";

const itinerarySchema = new mongoose.Schema({
    destinations: [{
        destination: {
            type: String,
            required: true,
            trim: true,
        },
        day: {
            type: Number,
            required: true,
        },
        time: {
            hours: {
                type: String,
                required: true,
                trim: true,
            },
            minutes: {
                type: String,
                required: true,
                trim: true,
            }
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

export const Itinerary = mongoose.model('Itinerary', itinerarySchema, 'Itinerary');
