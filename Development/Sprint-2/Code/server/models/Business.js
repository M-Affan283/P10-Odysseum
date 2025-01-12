import mongoose from "mongoose";

const businessSchema = new mongoose.Schema({

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    name: {
        type: String,
        required: [true, 'Please provide a business name'],
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

    imageUrls: [{
        type: String,
        // required: [true, 'Please provide an image URL'], make true later
    }],

    contactInfo: {
        phone: String,
        email: String,
        website: String,
    },

    operatingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
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



}, { timestamps: true });

businessSchema.index({ coordinates: '2dsphere' });
export const Business = mongoose.model('Business', businessSchema, 'Business');