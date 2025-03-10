/**
 * File: Service.js
*/

import mongoose from "mongoose"

/**
 * Schema for a reservation
 */
const serviceSchema = new mongoose.Schema({

    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: [true, 'Please provide a business ID']
    },

    name: {
        type: String,
        required: [true, 'Please provide a service name'],
    },

    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },

    mediaUrls: [{
        type: String,
    }],

    category: {
        type: String,
        required: [true, 'Please provide a service type'],
        enum: ["Restaurant", "Hotel", "Shopping", "Fitness", "Health", "Beauty", "Education", "Entertainment", "Services", "Other"],
    },

    pricing: {
        pricingModel: {
            type: String,
            enum: ['fixed', 'perHour', 'perDay', 'perPerson'], // Choose one
            default: 'fixed'
        },
        basePrice: {
            type: Number,
            required: true
        },
        specialPrices: [{
            name: String,
            price: Number,
            conditions: {
                daysOfWeek: [String], // ["Monday", "Tuesday"]
                specificDates: [Date], // ["2022-01-01", "2022-02-14"]
                minPeople: Number,
            }
        }]
    },

    paymentSettings: {
        acceptOnlinePayment: {
            type: Boolean,
            default: false, //if false then only cash on site payment assumed
        },
        deposit: {
            enabled: { type: Boolean, default: false }, // Require deposit on booking?
            percentage: { type: Number, default: 0 }, // Percentage of total price
        },
        chargeOnNoShow: {
            enabled: { type: Boolean, default: false }, // Charge on no-show?
            amount: { type: Number, default: 0 }, // Amount to charge
        },
        taxRate: {
            type: Number,
            default: 0
        }
    },

    bookingSettings: {
        requiresApproval: { //if not required, assumed instant booking
            type: Boolean,
            default: false
        },
        minAdvanceBooking: {
            type: Number, // in hours
            default: 1
        },
        maxAdvanceBooking: {
            type: Number, // in days
            default: 30
        },
        bookingTimeout: {
            type: Number, // in minutes
            default: 15
        },
    },

    cancellationPolicy: {
        allowCancellation: {
            type: Boolean,
            default: true
        },
        freeCancellationHours: { //do cancellation checking based on when the booking was made
            type: Number,
            default: 24
        },
        cancellationFee: {
            type: Number,
            default: 0
        }
    },

    availability: {
        // Available specific dates (for tours, events)/ NOTE: ONLY IF NOT RECURRING
        dates: [{
            date: Date,
            totalCapacity: Number,
            bookingsMade: Number,
        }], 
        // check this later
        recurring: {
            type: Boolean, // Whether it's a recurring service
            default: false,
        },
        recurringStartDate: {
            type: Date, // Start date of recurring service
            default: null,
        },
        daysOfWeek: [{
            day: String, // "Monday", "Tuesday", etc.
            totalCapacity: Number,
            bookingsMade: Number,
            
        }], // If recurring, which days (e.g., ["Monday", "Wednesday"])

    },

    //custom values based on category. such as for a restaurant, table size, for a hotel, room type, etc.
    customDetails: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
});

export const Service = mongoose.model('Service', serviceSchema, 'Service');