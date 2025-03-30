/*
    Filename: getPostReportDetails.js
    Author: Shahrez
    Description: Controller for fetching detailed information about a post report
*/

import { PostReport } from '../../models/PostReport.js';
import { Comment } from '../../models/Post.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const getPostReportDetails = async (req, res) => {
    try {
        const { reportId } = req.params;

        if (!reportId) {
            return res.status(400).json({
                success: false,
                message: 'Report ID is required'
            });
        }

        // Fetch the report with all relevant data
        const report = await PostReport.findById(reportId)
            .populate({
                path: 'reportedPost',
                select: 'caption mediaUrls createdAt likes locationId',
                populate: [
                    {
                        path: 'creatorId',
                        select: 'username firstName lastName profilePicture'
                    },
                    {
                        path: 'locationId',
                        select: 'name'
                    }
                ]
            })
            .populate('reportingUser', 'username firstName lastName profilePicture')
            .populate('reviewedBy', 'username firstName lastName');

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Get comments for the post
        const comments = await Comment.find({ postId: report.reportedPost._id })
            .populate('creatorId', 'username profilePicture')
            .sort({ createdAt: -1 })
            .limit(10);

        return res.status(200).json({
            success: true,
            report,
            comments
        });

    } catch (error) {
        console.error('Get post report details error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};