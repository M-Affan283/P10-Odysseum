/*
Filename: loginUser.js

This file contains the controller function for logging in a user. It checks if the email and password provided by the user match an existing user in the database.

Author: Affan & Shahrez
*/

import { User } from "../../models/User.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../utils/constants.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/tokenGeneration.js";
import bcrypt from 'bcryptjs';

export const loginUser = async (req, res) => {
    //user can login with either email or username
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({
            success: false,
            message: ERROR_MESSAGES.MISSING_FIELDS
        });
    }

    try {
        //check if user exists
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_CREDENTIALS
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_CREDENTIALS
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Store refresh token and update newUser status
        // Changed from user.save() to User.updateOne() to avoid bookmark validation
        let newuser = user.newUser;
        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    refreshToken: refreshToken,
                    newUser: false
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: SUCCESS_MESSAGES.USER_LOGGED_IN,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                username: user.username,
                profilePicture: user.profilePicture,
                bio: user.bio,
                role: user.role,
                newUser: newuser,
                following: user.following,
                followers: user.followers
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.log("Error logging in user", error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};

//If user is logging in with google. In frontend, use expo-google-sign-in to get the user's google id token and send it to the server. (IMplement this in the future)
export const oAuthLoginUser = async (req, res) => {
    return null;
};