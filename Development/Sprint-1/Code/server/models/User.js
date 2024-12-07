/*  
    Author/s: Affan & Haroon
*/

import mongoose from "mongoose";
/**
 * User Schema
 * @param {String} firstName - The first name of the user
 * @param {String} lastName - The last name of the user
 * @param {String} email - The email address of the user
 * @param {String} username - The username of the user
 * @param {String} password - The hashed password of the user
 * @param {String} profilePicture - The URL to the user's profile picture
 * @param {String} bio - The bio of the user
 * @param {String} location - The location of the user
 * @param {Array} followers - An array of user IDs who follow the user
 * @param {Array} following - An array of user IDs who the user follows
 * @param {Boolean} emailVerified - A flag to indicate if the user's email is verified
 * @param {String} role - The role of the user (user, admin, businessOwner)
 * @param {String} resetPasswordToken - The token for resetting the user's password
 * @param {Date} resetPasswordExpire - The expiration date for the reset password token
 * @param {String} verificationToken - The token for verifying the user's email address
 * @param {Date} verificationExpire - The expiration date for the verification token
 * @param {Boolean} twoFactorEnabled - A flag to indicate if two-factor authentication is enabled
 * @param {String} twoFactorSecret - The secret key for two-factor authentication
 * @param {String} refreshToken - The refresh token for the user's session
 * @param {Boolean} newUser - A flag to indicate if the user is a new user
 * @param {Timestamp} createdAt - The timestamp when the user was created
 * @param {Timestamp} updatedAt - The timestamp when the user was last updated
 */

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
    
    // verificationToken: String, // for email verification (if we want to add email verification)
    // verificationExpire: Date,
    
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },

    twoFactorSecret: String,// for two factor authentication
    
    refreshToken: {
        type: String,
        default: '',
    },

    isDeactivated: {
        type: Boolean,
        default: false
    },

    //array of location ids that the user has bookmarked
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    }]

}, {timestamps: true});

export const User = mongoose.model('User', userSchema, 'User');