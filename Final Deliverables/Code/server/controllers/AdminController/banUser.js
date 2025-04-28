/*
    Filename: banUser.js
    Author: Shahrez
    Description: Controller for banning/unbanning a user
*/

import { User } from '../../models/User.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants.js';

export const banUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { banned, reason } = req.body;
        const adminId = req.user._id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Find the user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Don't allow admins to ban other admins
        if (user.role === 'admin' && req.user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot ban another admin'
            });
        }

        // Update user's banned status
        user.isDeactivated = banned;
        if (reason) {
            user.banReason = reason;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: banned ? 'User banned successfully' : 'User unbanned successfully',
            user: {
                _id: user._id,
                username: user.username,
                isDeactivated: user.isDeactivated
            }
        });

    } catch (error) {
        console.error('Ban user error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};