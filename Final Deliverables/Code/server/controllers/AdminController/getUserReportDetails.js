/*
    Filename: getUserReportDetails.js
    Author: Shahrez
    Description: Controller for fetching detailed information about a user report
*/

import { Report } from '../../models/Report.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const getUserReportDetails = async (req, res) => {
    try {
        const { reportId } = req.params;

        if (!reportId) {
            return res.status(400).json({
                success: false,
                message: 'Report ID is required'
            });
        }

        const report = await Report.findById(reportId)
            .populate('reportedUser', 'username firstName lastName email profilePicture bio createdAt')
            .populate('reportingUser', 'username firstName lastName profilePicture')
            .populate('reviewedBy', 'username firstName lastName');

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        return res.status(200).json({
            success: true,
            report
        });

    } catch (error) {
        console.error('Get user report details error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};