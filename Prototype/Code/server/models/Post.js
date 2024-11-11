/*

Filename: Post.js

This file contains the schema for the Post and Comment model. It defines the structure of the post and comment document in the MongoDB database.

*/

import mongoose from "mongoose";


/**
 * Post Schema
 * @param {ObjectId} creatorId - The ID of the user who created the post
 * @param {String} caption - The caption of the post (optional)
 * @param {Array} mediaUrls - An array of URLs to media files associated with the post, stored in Firebase Storage
 * @param {Array} likes - An array of user IDs who liked the post
 * @param {ObjectId} location - The ID of the location associated with the post
 * @param {Timestamp} createdAt - The timestamp when the post was created
 * @param {Timestamp} updatedAt - The timestamp when the post was last updated
 */
const postSchema = new mongoose.Schema({
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please provide a creator ID']
    },

    caption: {//not required
        type: String,
        trim: true,
        maxlength: [1000, 'Caption cannot be more than 1000 characters']
    },

    // mediaUrls: [String] // array of strings. each string is a URL to a media file stored in firebase storage. Not required (might change to required)
    mediaUrls: [{
        type: String,
        // required: [true, 'Please provide a media URL']
    }],

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // uncomment later once location schema is created and populated
    // location: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Location'
    // }

}, { timestamps: true });


/**
 * Comment Schema
 * @param {ObjectId} postId - The ID of the post the comment belongs to
 * @param {ObjectId} creatorId - The ID of the user who created the comment
 * @param {String} text - The text content of the comment
 * @param {Boolean} owner - A flag to indicate if the user is the owner of the post (for styling purposes)
 * @param {Timestamp} createdAt - The timestamp when the comment was created
 * @param {Timestamp} updatedAt - The timestamp when the comment was
 */
const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please provide a post ID']
    },

    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please provide a creator ID']
    },

    text: {
        type: String,
        required: [true, 'Please provide a text'],
        trim: true,
        maxlength: [500, 'Text cannot be more than 500 characters']
    },

    isReply: {
        type: Boolean,
        default: false
    },

    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: []
    }],

    // if the user is the owner of the post, then the comment is considered as a post owner comment and will have different styling in the frontend
    owner: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

const Post = mongoose.model('Post', postSchema, 'Post');    
const Comment = mongoose.model('Comment', commentSchema, 'Comment');

export { Post, Comment };