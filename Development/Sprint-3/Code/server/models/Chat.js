import mongoose from "mongoose";

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
    // Changed from Map to regular object for better handling
    unreadCounts: {
        type: Object,
        default: {}
    },
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

// Helper methods for unread counts
chatSchema.methods.getUnreadCount = function(userId) {
    return this.unreadCounts[userId.toString()] || 0;
};

chatSchema.methods.setUnreadCount = function(userId, count) {
    this.unreadCounts[userId.toString()] = count;
};

chatSchema.methods.incrementUnreadCount = function(userId) {
    const userIdStr = userId.toString();
    this.unreadCounts[userIdStr] = (this.unreadCounts[userIdStr] || 0) + 1;
};

// Index for faster queries
chatSchema.index({ participants: 1 });

export const Chat = mongoose.model('Chat', chatSchema, 'Chat');