/* Author: Affan */

import mongoose from "mongoose";

/**
 * Review Schema
 * @param {ObjectId} creatorId  - The ID of the user who created the review
 * @param {String} entityType    - The type of entity being reviewed (Location or Business)
 * @param {ObjectId} entityId    - The ID
 * @param {Number} rating        - The rating given by the user (1-5)
 * @param {String} reviewContent - The content of the review
 * @param {Number} upvotes       - The number of upvotes for the review
 * @param {Number} downvotes     - The number of downvotes for the review
*/

const reviewSchema = new mongoose.Schema({
    
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a creator ID']
    },

    entityType: {
        type: String,
        required: [true, 'Please provide an entity type'],
        enum: ['Location', 'Business']
    },

    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please provide an entity ID'],
        refPath: 'entityType'
    },

    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: 0.5,
        max: 5
    },

    title: {
        type: String,
        required: [true, 'Please provide a review title'],
        trim: true,
        maxlength: [100, 'Review title cannot be more than 100 characters']
    },

    reviewContent: {
        type: String,
        required: [true, 'Please provide a review content'],
        trim: true,
        maxlength: [500, 'Review content cannot be more than 500 characters']
    },

    imageUrls: [{
        type: String
    }],

    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],

    downvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],

}, { timestamps: true });


export const Review = mongoose.model('Review', reviewSchema, 'Review');