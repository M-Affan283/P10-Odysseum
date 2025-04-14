/*
    Filename: updateReportStatus.js
    Author: Shahrez
    Description: Controller for updating the status of a report
*/

import { Report } from '../../models/Report.js';
import { PostReport } from '../../models/PostReport.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants.js';

export const updateReportStatus = async (req, res) => {
    try {
        const { reportId, reportType, status, adminNotes } = req.body;
        const adminId = req.user._id;

        if (!reportId || !reportType || !status) {
            return res.status(400).json({
                success: false,
                message: 'Report ID, type, and status are required'
            });
        }

        // Validate report type
        if (reportType !== 'user' && reportType !== 'post') {
            return res.status(400).json({
                success: false,
                message: 'Invalid report type'
            });
        }

        // Validate status
        const validStatuses = ['pending', 'under_review', 'resolved', 'dismissed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        let report;
        const updateData = {
            status,
            reviewedBy: adminId
        };

        if (adminNotes) {
            updateData.adminNotes = adminNotes;
        }

        // Update the appropriate report type
        if (reportType === 'user') {
            report = await Report.findByIdAndUpdate(
                reportId,
                updateData,
                { new: true }
            )
                .populate('reportedUser', 'username')
                .populate('reportingUser', 'username')
                .populate('reviewedBy', 'username');
        } else {
            report = await PostReport.findByIdAndUpdate(
                reportId,
                updateData,
                { new: true }
            )
                .populate('reportedPost', 'caption')
                .populate('reportingUser', 'username')
                .populate('reviewedBy', 'username');
        }

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Report status updated successfully',
            report
        });

    } catch (error) {
        console.error('Update report status error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};