import mongoose from "mongoose";

const businessSchema = new mongoose.Schema({

    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
    },

    name: {
        type: String,
        required: [true, 'Please provide a business name'],
    },

    address: {
        type: String,
        required: [true, 'Please provide a business address'],
    },

    category: {
        type: String,
        required: [true, 'Please provide a business type'],
        enum: ["Restaurant", "Hotel", "Shopping", "Fitness", "Health", "Beauty", "Education", "Entertainment", "Services", "Other"],
    },

    description: {
        type: String,
        trim: true,
        maxlength: [250, 'Description cannot be more than 500 characters']
    },

    mediaUrls: [{
        type: String,
        // required: [true, 'Please provide an image URL'], make true later
    }],

    contactInfo: {
        phone: String,
        email: String,
        website: String,
    },

    operatingHours: {
        monday: String,
        tuesday: String,
        wednesday: String,
        thursday: String,
        friday: String,
        saturday: String,
        sunday: String
    },

    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: [true, 'Please provide a location ID']
    },

    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },

    activityCount: { // New field for tracking popularity
        type: Number,
        default: 0.0,
    },

    averageRating: { // New field for heatmap intensity
        type: Number,
        default: 0.0,
    },

    lastInteraction: { // To track dynamic popularity
        type: Date,
        default: null,
    },

    heatmapScore: { // To track heatmap intensity
        type: Number,
        default: 0.0,
    },

    adminNotes: { // Notes added by admin during approval/rejection
        type: String,
        default: ''
    }



}, { timestamps: true });

businessSchema.index({ coordinates: '2dsphere' });
export const Business = mongoose.model('Business', businessSchema, 'Business');