/*
    Filename: updateBusinessStatus.js
    Author: Shahrez
    Description: Controller for updating business status
*/
import { Business } from '../../models/Business.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants.js';

export const updateBusinessStatus = async (req, res) => {
    try {
        const { businessId, status, adminNotes } = req.body;
        const adminId = req.user._id;

        if (!businessId || !status) {
            return res.status(400).json({
                success: false,
                message: 'Business ID and status are required'
            });
        }

        // Validate status
        if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Status must be either "Approved", "Rejected", or "Pending"'
            });
        }

        // Find the business
        const business = await Business.findById(businessId);

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }

        // Update business status
        business.status = status;

        // Add admin notes if provided
        if (adminNotes) {
            business.adminNotes = adminNotes;
        }

        await business.save();

        // Return the updated business
        return res.status(200).json({
            success: true,
            message: `Business ${status.toLowerCase()} successfully`,
            business
        });

    } catch (error) {
        console.error('Update business status error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};