/*
    Filename: adminLogin.js
    Author: Shahrez
    Description: Controller for admin login
*/

import { User } from '../../models/User.js';
import bcrypt from 'bcryptjs';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/tokenGeneration.js';

export const adminLogin = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.MISSING_FIELDS
            });
        }

        // Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier }
            ]
        });

        if (!user) {
            console.log("User not Found")
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_CREDENTIALS
            });
        }

        // Check if user is an admin
        if (user.role !== 'admin') {
            console.log("User is not an admin")
            return res.status(403).json({
                success: false,
                message: ERROR_MESSAGES.UNAUTHORIZED
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            console.log("Password is not valid")
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_CREDENTIALS
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Update user's refresh token in DB
        user.refreshToken = refreshToken;
        await user.save();
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

        // // Remove sensitive information
        // const userResponse = {
        //     _id: user._id,
        //     username: user.username,
        //     email: user.email,
        //     firstName: user.firstName,
        //     lastName: user.lastName,
        //     role: user.role,
        //     profilePicture: user.profilePicture
        // };

        // return res.status(200).json({
        //     success: true,
        //     message: SUCCESS_MESSAGES.USER_LOGGED_IN,
        //     user: userResponse,
        //     accessToken,
        //     refreshToken
        // });

    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};