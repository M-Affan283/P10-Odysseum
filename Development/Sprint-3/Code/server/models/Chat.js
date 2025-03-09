import mongoose from "mongoose";

/**
 * Chat Schema
 * @description Represents a chat conversation between two users
 */
const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    lastMessage: {
        content: {
            type: String,
            default: ""
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    unreadCounts: {
        // Maps user IDs to their unread message counts
        type: Map,
        of: Number,
        default: new Map()
    },
    // For future media support
    mediaCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Ensure participants are always exactly 2 users
chatSchema.pre('save', function(next) {
    if (this.participants.length !== 2) {
        next(new Error('Chat must have exactly 2 participants'));
    }
    next();
});

// Index for faster queries
chatSchema.index({ participants: 1 });

export const Chat = mongoose.model('Chat', chatSchema, 'Chat');