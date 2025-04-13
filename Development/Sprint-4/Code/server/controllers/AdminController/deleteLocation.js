/*
    Filename: deleteLocation.js
    Author: Shahrez
    Description: Controller for deleting a location
*/

import { Location } from '../../models/Location.js';
import { Business } from '../../models/Business.js';
import { Post } from '../../models/Post.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants.js';

export const deleteLocation = async (req, res) => {
    try {
        const { locationId } = req.params;

        if (!locationId) {
            return res.status(400).json({
                success: false,
                message: 'Location ID is required'
            });
        }

        // Check if there are any businesses or posts associated with this location
        const businessCount = await Business.countDocuments({ locationId });
        const postCount = await Post.countDocuments({ locationId });

        if (businessCount > 0 || postCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete location. It has ${businessCount} businesses and ${postCount} posts associated with it.`
            });
        }

        // Find and delete the location
        const deletedLocation = await Location.findByIdAndDelete(locationId);

        if (!deletedLocation) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Location deleted successfully'
        });

    } catch (error) {
        console.error('Delete location error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};