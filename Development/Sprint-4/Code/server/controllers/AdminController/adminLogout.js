/*
    Filename: adminLogout.js
    Author: Shahrez
    Description: Controller for admin logout
*/

import { User } from '../../models/User.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants.js';

export const adminLogout = async (req, res) => {
    try {
        const userId = req.user._id;

        // Clear refresh token
        await User.findByIdAndUpdate(userId, {
            refreshToken: ''
        });

        return res.status(200).json({
            success: true,
            message: SUCCESS_MESSAGES.USER_LOGGED_OUT
        });

    } catch (error) {
        console.error('Admin logout error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};