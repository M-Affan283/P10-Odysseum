/*
    Filename: deleteReportedUser.js
    Author: Shahrez
    Description: Controller for deleting a reported user
*/

import { User } from '../../models/User.js';
import { Report } from '../../models/Report.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants.js';

export const deleteReportedUser = async (req, res) => {
    try {
        const { reportId, userId } = req.body;
        const adminId = req.user._id;

        if (!reportId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Report ID and User ID are required'
            });
        }

        // Find the report to ensure it exists
        const report = await Report.findById(reportId);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Check if the user ID matches the reported user
        if (report.reportedUser.toString() !== userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID does not match the reported user'
            });
        }

        // Update report status to resolved
        report.status = 'resolved';
        report.reviewedBy = adminId;
        report.adminNotes = report.adminNotes ?
            `${report.adminNotes}\nUser deleted by admin.` :
            'User deleted by admin.';

        await report.save();

        // Delete or deactivate the user (this depends on how you want to handle deletion)
        // Option 1: Hard delete (removes the user completely)
        // await User.findByIdAndDelete(userId);

        // Option 2: Soft delete (deactivates the user but keeps the record)
        const user = await User.findByIdAndUpdate(
            userId,
            {
                isDeactivated: true,
                // You might want to anonymize some user data here
                // For example, reset profile picture, nullify email, etc.
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User has been deactivated and report resolved',
            report
        });

    } catch (error) {
        console.error('Delete reported user error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};