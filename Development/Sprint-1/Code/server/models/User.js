/*

Filename: User.js

This file contains the schema for the User model. It defines the structure of the user document in the MongoDB database.

Author: Affan


*/

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please provide a first name'],
        trim: true, // removes whitespace from both ends of a string
        maxlength: [50, 'First name cannot be more than 50 characters']
    },
    
    lastName: {
        type: String,
        required: [true, 'Please provide a last name'],
        trim: true,
        maxlength: [50, 'Last name cannot be more than 50 characters']
    },

    //if new user then add bio,location,profile picture, followers, following, emailVerified fields when user first logs in. each will have their own screen.
    newUser: {
        type: Boolean,
        default: true
    },
    
    email: {
        type: String,
        required: [true, 'Please provide an email address'],
        unique: true,
        trim: true,
        maxlength: [100, 'Email cannot be more than 100 characters']
    },

    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true,
        maxlength: [50, 'Username cannot be more than 50 characters']
    },
    
    password: { //will be hashed before saving
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password cannot be less than 6 characters'],
        select: false // exclude password from query results
    },
    
    profilePicture: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    
    bio: {
        type: String,
        default: '',
        maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    
    location: {
        type: String,
        default: '',
        maxlength: [100, 'Location cannot be more than 100 characters']
    },
    
    followers: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
    }],
    
    following: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    emailVerified: {
        type: Boolean,
        default: false
    },
    
    role: {
        type: String,
        enum: ['user', 'admin', 'businessOwner'],
        default: 'user'
    },

    resetPasswordToken: String, // for password reset
    resetPasswordExpire: Date, 
    
    verificationToken: String, // for email verification (if we want to add email verification)
    verificationExpire: Date,
    
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: String,// for two factor authentication
    
    refreshToken: {
        type: String,
        default: '',
    }
    }, 
    
    {
        timestamps: true
    }
);

export const User = mongoose.model('User', userSchema, 'User');