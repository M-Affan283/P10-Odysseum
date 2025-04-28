/*
    Filename: getUserReports.js
    Author: Shahrez
    Description: Controller for fetching user reports for admin dashboard
*/

import { Report } from '../../models/Report.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const getUserReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status || null;

        // Build query based on filters
        const query = {};
        if (status) {
            query.status = status;
        }

        // Get total count for pagination
        const totalReports = await Report.countDocuments(query);

        // Fetch reports with populated user data
        const reports = await Report.find(query)
            .populate('reportedUser', 'username firstName lastName profilePicture')
            .populate('reportingUser', 'username firstName lastName')
            .populate('reviewedBy', 'username firstName lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            reports,
            pagination: {
                totalReports,
                currentPage: page,
                totalPages: Math.ceil(totalReports / limit),
                limit
            }
        });

    } catch (error) {
        console.error('Get user reports error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};