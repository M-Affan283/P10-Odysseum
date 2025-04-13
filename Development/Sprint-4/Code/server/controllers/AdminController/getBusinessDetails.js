/*
    Filename: getBusinessDetails.js
    Author: Shahrez
    Description: Controller for fetching business details
*/

import { Business } from '../../models/Business.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const getBusinessDetails = async (req, res) => {
    try {
        const { businessId } = req.params;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: 'Business ID is required'
            });
        }

        const business = await Business.findById(businessId)
            .populate('ownerId', 'username firstName lastName email profilePicture')
            .populate('locationId', 'name coordinates');

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }

        return res.status(200).json({
            success: true,
            business
        });

    } catch (error) {
        console.error('Get business details error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};