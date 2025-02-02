/*

Filename: registerUser.js

This file contains the controller function for registering a new user. It checks if the email or username provided by the user already exists in the database. If not, it creates a new user in the database.

Author: Affan & Shahrez

*/

import { User } from "../../models/User.js";
import bcrypt from 'bcryptjs';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, REGEX_PATTERNS } from "../../utils/constants.js";
import validator from "validator";
import { generateAccessToken, generateRefreshToken } from "../../utils/tokenGeneration.js";

export const registerUser = async (req, res) => {
    const { firstName, lastName, email, username, password } = req.body;

    if(!firstName || !lastName || !email || !username || !password) 
        return res.status(400).json({success:false, message: ERROR_MESSAGES.MISSING_FIELDS});

    if(!validator.isEmail(email)) 
        return res.status(400).json({success:false, message: ERROR_MESSAGES.INVALID_EMAIL});

    if(!validator.isAlphanumeric(username)) 
        return res.status(400).json({success:false, message: ERROR_MESSAGES.INVALID_USERNAME});

    if(REGEX_PATTERNS.PASSWORD.test(password) === false) 
        return res.status(400).json({success:false, message: ERROR_MESSAGES.INVALID_PASSWORD});

    try {
        //check if user already exists
        const userExists = await User.findOne({$or: [{email: email}, {username: username}]});
        if(userExists) 
            return res.status(400).json({success:false, message: ERROR_MESSAGES.USER_EXISTS});

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create new user
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            username,
            password: hashedPassword,
            role: 'user',
        });

        // Generate tokens
        const accessToken = generateAccessToken(newUser._id);
        const refreshToken = generateRefreshToken(newUser._id);

        // Store refresh token in database
        newUser.refreshToken = refreshToken;
        await newUser.save();

        return res.status(201).json({
            success: true,
            message: SUCCESS_MESSAGES.USER_REGISTERED,
            user: {
                _id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role,
                profilePicture: newUser.profilePicture,
                bio: newUser.bio,
                following: newUser.following,
                followers: newUser.followers,
                newUser: newUser.newUser
            },
            accessToken,
            refreshToken
        });
    }
    catch(error) {
        console.log("Error registering user", error);
        res.status(500).json({success:false, message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR});
    }
}