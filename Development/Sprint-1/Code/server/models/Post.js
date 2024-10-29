/*

Filename: Post.js

This file contains the schema for the Post model. It defines the structure of the post document in the MongoDB database.

*/

import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please provide a creator ID']
    },

    caption: {
        type: String,
        required: [true, 'Please provide a caption'],
        trim: true,
        maxlength: [1000, 'Caption cannot be more than 1000 characters']
    },

    // mediaUrls: [String] // array of strings. each string is a URL to a media file stored in firebase storage
    mediaUrls: [{
        type: String,
        required: [true, 'Please provide a media URL']
    }],

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],

    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    }

}, { timestamps: true });

const commentSchema = new mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please provide a post ID']
    },

    creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please provide a creator ID']
    },

    text: {
        type: String,
        required: [true, 'Please provide a text'],
        trim: true,
        maxlength: [500, 'Text cannot be more than 500 characters']
    }

}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);    
const Comment = mongoose.model('Comment', commentSchema);

export { Post, Comment };