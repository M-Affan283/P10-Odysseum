//  Author: Haroon Khawaja

import mongoose from "mongoose";

// A schema to bookmark a location. 
// The associated bookmark will have a title, its url, its tags, and the time it was bookmarked
const bookmarkSchema = new mongoose.Schema({
    // Bookmarked location webpage title
    title: {
        type: String,
        required: true,
    },
    // Bookmarked location webpage url
    // location_url: {
    //     type: String, 
    //     required: true, 
    // },
    // Tag list for the bookmarked location
    // tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export default bookmarkSchema;