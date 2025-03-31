/**
 * Booking Model based on Service Model
 * Author: Affan
*/


import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true
    },

    bookingDate: { // date at whoch customer wants to book the service
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
        default: 'pending'
    },

    numberOfPeople: {
        type: Number,
        required: true
    },

    timeSlot: {
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date,
            required: true
        }
    },

    pricing: {
        basePrice: Number,
        specialPrice: {
            applied: Boolean,
            name: String,
            price: Number
        },
        taxAmount: Number,
        depositAmount: Number,
        totalAmount: Number
    },

    payment: {
        status: {
            type: String,
            enum: ['pending', 'deposit_paid', 'fully_paid', 'refunded', 'failed'],
            default: 'pending'
        },
        transactions: [{
            transactionType: String,
            amount: Number,
            date: Date,
            status: String,
            paymentMethod: String,
            transactionId: String
        }]
    },

    cancellation: {
        cancelled: {
            type: Boolean,
            default: false
        },
        cancellationDate: Date,
        reason: String,
        refundAmount: Number,
        cancellationFee: Number
    },


}, { timestamps: true });


export const Booking = mongoose.model("Booking", bookingSchema, "Booking");