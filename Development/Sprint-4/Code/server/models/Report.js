/*  
Author: Shahrez
Filename: Report.js
Description:
    This file contains the schema for the Report model. 
    It defines the structure of user reports in the MongoDB database.
*/

import mongoose from "mongoose";

/**
 * Report Schema
 * @param {ObjectId} reportedUser - The ID of the user being reported
 * @param {ObjectId} reportingUser - The ID of the user making the report
 * @param {String} reason - The detailed reason for the report
 * @param {String} status - The current status of the report
 * @param {Timestamp} createdAt - The timestamp when the report was created
 * @param {Timestamp} updatedAt - The timestamp when the report was last updated
 * @param {ObjectId} reviewedBy - The ID of the admin who reviewed the report
 * @param {String} adminNotes - Notes added by the admin during review
 */

const reportSchema = new mongoose.Schema({
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Reported user ID is required']
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
        maxlength: [1000, 'Report reason cannot be more than 1000 characters']
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

export const Report = mongoose.model('Report', reportSchema, 'Report');