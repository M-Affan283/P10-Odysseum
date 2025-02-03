/*  
Author: Shahrez
Filename: PostReport.js
Description:
    This file contains the schema for the PostReport model. 
    It defines the structure of post reports in the MongoDB database.
*/

import mongoose from "mongoose";

/**
 * PostReport Schema
 * @param {ObjectId} reportedPost - The ID of the post being reported
 * @param {ObjectId} reportingUser - The ID of the user making the report
 * @param {String} reason - The detailed reason for the report
 * @param {String} status - The current status of the report
 * @param {Timestamp} createdAt - The timestamp when the report was created
 * @param {Timestamp} updatedAt - The timestamp when the report was last updated
 * @param {ObjectId} reviewedBy - The ID of the admin who reviewed the report
 * @param {String} adminNotes - Notes added by the admin during review
 */

const postReportSchema = new mongoose.Schema({
    reportedPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, 'Reported post ID is required']
    },
    
    reportingUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Reporting user ID is required']
    },
    
    reason: {
        type: String,
        required: [true, 'Report reason is required'],
        trim: true,
        minlength: [1, 'Report reason cannot be empty'],
        maxlength: [300, 'Report reason cannot be more than 300 characters']
    },
    
    status: {
        type: String,
        enum: ['pending', 'under_review', 'resolved', 'dismissed'],
        default: 'pending'
    },
    
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    
    adminNotes: {
        type: String,
        default: '',
        maxlength: [500, 'Admin notes cannot be more than 500 characters']
    }
}, { timestamps: true });

export const PostReport = mongoose.model('PostReport', postReportSchema, 'PostReport');