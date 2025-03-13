/*

Filename: refreshToken.js

This file contains the controller function for refreshing the access token using a valid refresh token.

Author: Shahrez
*/

import { User } from "../../models/User.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../utils/constants.js";
import { generateAccessToken, verifyRefreshToken } from "../../utils/tokenGeneration.js";

export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: ERROR_MESSAGES.NO_TOKEN_PROVIDED
        });
    }

    try {
        // Verify the refresh token
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_TOKEN
            });
        }

        // Find user and check if refresh token matches
        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_TOKEN
            });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user._id);

        return res.status(200).json({
            success: true,
            accessToken: newAccessToken
        });
    } catch (error) {
        console.log("Error refreshing token", error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};