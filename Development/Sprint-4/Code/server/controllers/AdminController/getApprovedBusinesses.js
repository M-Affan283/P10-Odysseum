// File: controllers/AdminController/getApprovedBusinesses.js

import { Business } from '../../models/Business.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const getApprovedBusinesses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        // Build query for approved businesses
        const query = {
            status: 'Approved',
            ...(search ? { name: { $regex: search, $options: 'i' } } : {})
        };

        // Get total count for pagination
        const totalBusinesses = await Business.countDocuments(query);

        // Fetch businesses with populated data
        const businesses = await Business.find(query)
            .populate('ownerId', 'username firstName lastName email profilePicture')
            .populate('locationId', 'name coordinates')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            businesses,
            pagination: {
                totalBusinesses,
                currentPage: page,
                totalPages: Math.ceil(totalBusinesses / limit),
                limit
            }
        });

    } catch (error) {
        console.error('Get approved businesses error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};