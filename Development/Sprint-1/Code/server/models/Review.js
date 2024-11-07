/*

Filename: Review.js

This file contains the schema for the Review model. It defines the structure of the review document in the MongoDB database.

Author: Affan

*/

import mongoose from "mongoose";

/**
 * Review Schema
 * @param {ObjectId} reviewerId - The ID of the user who created the review
 * @param {String} reviewOf - The name of the product being reviewed (location, service, etc.)
 * @param {ObjectId} reviewOfId - The ID of the product being reviewed
 * @param {Number} rating - The rating given by the reviewer
 * @param {String} reviewText - The text content of the review
 * @param {Timestamp} createdAt - The timestamp when the review was created
 * @param {Timestamp} updatedAt - The timestamp when the review was last updated
*/

const reviewSchema = new mongoose.Schema({
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please provide a reviewer ID']
    },

    reviewOf: {
        type: String,
        required: [true, 'Please provide the name of the product being reviewed'],
        enum: ['location', 'business'],
        default: 'location'
    },

    reviewOfId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please provide the ID of the product being reviewed']
    },

    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5']
    },

    reviewText: {
        type: String,
        trim: true,
        maxlength: [1000, 'Review text cannot be more than 1000 characters']
    }
}, { timestamps: true });

export const Review = mongoose.model('Review', reviewSchema, 'Review');

