import mongoose from "mongoose";

/**
 * Message Schema
 * @description Represents a single message in a chat
 */
const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    // For future media support
    mediaUrl: {
        type: String,
        default: null
    },
    mediaType: {
        type: String,
        enum: ['image', 'video', 'audio', null],
        default: null
    },
    read: {
        type: Boolean,
        default: false
    },
    delivered: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Indexes for faster queries
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });

export const Message = mongoose.model('Message', messageSchema, 'Message');