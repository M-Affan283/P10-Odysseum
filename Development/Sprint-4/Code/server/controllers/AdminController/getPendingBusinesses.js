/*
    Filename: getPendingBusinesses.js
    Author: Shahrez
    Description: Controller for fetching pending business requests
*/

import { Business } from '../../models/Business.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const getPendingBusinesses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const totalPendingBusinesses = await Business.countDocuments({ status: 'Pending' });

        // Fetch pending businesses with owner info
        const pendingBusinesses = await Business.find({ status: 'Pending' })
            .populate('ownerId', 'username firstName lastName email profilePicture')
            .populate('locationId', 'name coordinates')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            businesses: pendingBusinesses,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalPendingBusinesses / limit),
                totalBusinesses: totalPendingBusinesses,
                limit
            }
        });

    } catch (error) {
        console.error('Get pending businesses error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};