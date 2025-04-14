/*
    Filename: deleteReportedPost.js
    Author: Shahrez
    Description: Controller for deleting a reported post
*/

import { Post } from '../../models/Post.js';
import { PostReport } from '../../models/PostReport.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants.js';

export const deleteReportedPost = async (req, res) => {
    try {
        const { reportId, postId } = req.body;
        const adminId = req.user._id;

        if (!reportId || !postId) {
            return res.status(400).json({
                success: false,
                message: 'Report ID and Post ID are required'
            });
        }

        // Find the report to ensure it exists
        const report = await PostReport.findById(reportId);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Check if the post ID matches the reported post
        if (report.reportedPost.toString() !== postId) {
            return res.status(400).json({
                success: false,
                message: 'Post ID does not match the reported post'
            });
        }

        // Update report status to resolved
        report.status = 'resolved';
        report.reviewedBy = adminId;
        report.adminNotes = report.adminNotes ?
            `${report.adminNotes}\nPost deleted by admin.` :
            'Post deleted by admin.';

        await report.save();

        // Delete the post
        const post = await Post.findByIdAndDelete(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Optionally: delete comments associated with this post
        // await Comment.deleteMany({ postId });

        return res.status(200).json({
            success: true,
            message: 'Post has been deleted and report resolved',
            report
        });

    } catch (error) {
        console.error('Delete reported post error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};