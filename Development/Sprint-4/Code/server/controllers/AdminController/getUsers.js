/*
    Filename: getUsers.js
    Author: Shahrez
    Description: Controller for fetching all users
*/

import { User } from '../../models/User.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchQuery = req.query.search || '';
        const skip = (page - 1) * limit;

        // Build query based on search parameter
        const query = searchQuery
            ? {
                $or: [
                    { username: { $regex: searchQuery, $options: 'i' } },
                    { email: { $regex: searchQuery, $options: 'i' } },
                    { firstName: { $regex: searchQuery, $options: 'i' } },
                    { lastName: { $regex: searchQuery, $options: 'i' } }
                ]
            }
            : {};

        // Get total count for pagination
        const totalUsers = await User.countDocuments(query);

        // Fetch users
        const users = await User.find(query)
            .select('_id username email firstName lastName profilePicture role isDeactivated')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
                limit
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};