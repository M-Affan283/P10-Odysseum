/*
    Filename: updateUserRole.js
    Author: Shahrez
    Description: Controller for updating a user's role
*/

import { User } from '../../models/User.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants.js';

export const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        const adminId = req.user._id;

        if (!userId || !role) {
            return res.status(400).json({
                success: false,
                message: 'User ID and role are required'
            });
        }

        // Validate role
        if (!['user', 'admin', 'businessOwner'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be user, admin, or businessOwner'
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

        // Update user's role
        user.role = role;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `User role updated to ${role} successfully`,
            user: {
                _id: user._id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Update user role error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};