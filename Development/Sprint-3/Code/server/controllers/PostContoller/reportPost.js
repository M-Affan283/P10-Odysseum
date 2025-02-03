/*

Filename: reportPost.js

This file contains the controller function for reporting a post.
It validates the report data and creates a new report in the database.

Author: Shahrez

*/

import { PostReport } from "../../models/PostReport.js";
import { Post } from "../../models/Post.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../utils/constants.js";

export const reportPost = async (req, res) => {
    const { reportedPostId, reason } = req.body;
    const reportingUserId = req.user._id; 

    if (!reportedPostId || !reason) 
        return res.status(400).json({
            success: false, 
            message: ERROR_MESSAGES.MISSING_FIELDS
        });

    if (reason.length > 300)
        return res.status(400).json({
            success: false,
            message: "Report reason cannot be more than 300 characters"
        });

    if (reason.length === 0)
        return res.status(400).json({
            success: false,
            message: "Report reason cannot be empty"
        });

    try {
        // Check if reported post exists
        const reportedPost = await Post.findById(reportedPostId);
        if (!reportedPost)
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.POST_NOT_FOUND
            });

        // Check if user is trying to report their own post
        if (reportedPost.creatorId.toString() === reportingUserId.toString())
            return res.status(400).json({
                success: false,
                message: "You cannot report your own post"
            });

        // Create new report
        const newReport = await PostReport.create({
            reportedPost: reportedPostId,
            reportingUser: reportingUserId,
            reason,
            status: 'pending'
        });

        return res.status(201).json({
            success: true,
            message: SUCCESS_MESSAGES.REPORT_SUBMITTED,
            report: newReport
        });
    }
    catch(error) {
        console.log("Error reporting post:", error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
}