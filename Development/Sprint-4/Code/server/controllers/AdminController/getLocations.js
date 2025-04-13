/*
    Filename: getLocations.js
    Author: Shahrez
    Description: Controller for fetching all locations
*/

import { Location } from '../../models/Location.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const getLocations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchQuery = req.query.search || '';
        const skip = (page - 1) * limit;

        // Build query based on search parameter
        const query = searchQuery 
            ? { name: { $regex: searchQuery, $options: 'i' } } 
            : {};

        // Get total count for pagination
        const totalLocations = await Location.countDocuments(query);

        // Fetch locations
        const locations = await Location.find(query)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            locations,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalLocations / limit),
                totalLocations,
                limit
            }
        });

    } catch (error) {
        console.error('Get locations error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};