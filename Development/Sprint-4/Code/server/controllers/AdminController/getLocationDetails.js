/*
    Filename: getLocationDetails.js
    Author: Shahrez
    Description: Controller for fetching location details
*/

import { Location } from '../../models/Location.js';
import { Business } from '../../models/Business.js';
import { Post } from '../../models/Post.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const getLocationDetails = async (req, res) => {
    try {
        const { locationId } = req.params;

        if (!locationId) {
            return res.status(400).json({
                success: false,
                message: 'Location ID is required'
            });
        }

        // Get location details
        const location = await Location.findById(locationId);

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        // Count businesses and posts for this location
        const businessCount = await Business.countDocuments({ locationId });
        const postCount = await Post.countDocuments({ locationId });

        return res.status(200).json({
            success: true,
            location,
            businessCount,
            postCount
        });

    } catch (error) {
        console.error('Get location details error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};