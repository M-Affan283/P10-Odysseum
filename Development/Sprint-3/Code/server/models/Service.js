/**
 * File: Service.js
 * 
 * This file contains the schema for a service. Service can be created by a business a business owner such as for hotels a room,
 * for a restaurant a table, for a fitness center a class, etc.
 * There will some custom details based on category of the service.
 * which will be stored in the customDetails field.
 * Business will make the create these and then toursits can then view these services and make reservations/bookings.
 * This needs a intricate system and handling of locks, race conditions, etc.
 * Front end to create this reservation will be in the form of a horizonal flat list.
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
        }],
        //possibly remove it
        groupPricing: {
            enabled: Boolean,
            tiers: [{
                minPeople: Number,
                maxPeople: Number,
                pricePerPerson: Number
            }]
        }
    },

    paymentSettings: {
        acceptOnlinePayment: {
            type: Boolean,
            default: false
        },
        acceptOnSitePayment: {
            type: Boolean,
            default: true
        },
        deposit: {
            required: { type: Boolean, default: false },
            percentage: { type: Number, default: 0 }, // Percentage of total price
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
        creditCardPolicy: {
            required: { type: Boolean, default: false }, // Require card details?
            chargeOnNoShow: { type: Boolean, default: false }, // Charge if no-show? charge same as service price in price object
            depositOnBooking: { type: Boolean, default: false }, // Charge deposit on booking?
            depositAmount: { type: Number, default: 0 }, // Deposit amount if depositOnBooking is true
        }
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
        dates: [Date], // Available specific dates (for tours, events)
        // check this later
        recurring: {
            type: Boolean, // Whether it's a recurring service
            default: false,
        },
        daysOfWeek: [String], // If recurring, which days (e.g., ["Monday", "Wednesday"])

        totalCapacity: {
            type: Number, // Max bookings per day
            default: null, // Null means unlimited
        },
        
        bookingsMade: {
            type: Number, // Track how many bookings have been made
            default: 0,
        }
    },

    //custom values based on category. such as for a restaurant, table size, for a hotel, room type, etc.
    customDetails: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },


});

export const Service = mongoose.model('Service', serviceSchema, 'Service');