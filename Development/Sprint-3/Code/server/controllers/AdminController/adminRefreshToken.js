/*
    Filename: adminRefreshToken.js
    Author: Shahrez
    Description: Controller for refreshing admin tokens
*/

import { User } from '../../models/User.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';
import { generateAccessToken, verifyRefreshToken } from '../../utils/tokenGeneration.js';

export const adminRefreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.NO_TOKEN_PROVIDED
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_REFRESH_TOKEN
            });
        }

        // Find user with this refresh token
        const user = await User.findOne({
            _id: decoded.id,
            refreshToken: refreshToken
        }).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_REFRESH_TOKEN
            });
        }

        // Check if user is an admin
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: ERROR_MESSAGES.UNAUTHORIZED
            });
        }

        // Generate new access token
        const accessToken = generateAccessToken(user._id);

        return res.status(200).json({
            success: true,
            accessToken,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        console.error('Admin refresh token error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};