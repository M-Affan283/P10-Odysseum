/*

Filename: reportUser.js

This file contains the controller function for reporting a user.
It validates the report data and creates a new report in the database.

Author: Shahrez

*/

import { Report } from "../../models/Report.js";
import { User } from "../../models/User.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../utils/constants.js";

export const reportUser = async (req, res) => {
    const { reportedUserId, reason, reportingUserId } = req.body;
    // const reportingUserId = req.user._id; // From auth middleware

    if (!reportedUserId || !reason) 
        return res.status(400).json({
            success: false, 
            message: ERROR_MESSAGES.MISSING_FIELDS
        });

    try {
        // Check if reported user exists
        const reportedUser = await User.findById(reportedUserId);
        if (!reportedUser)
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.USER_NOT_FOUND
            });

        // Check if user is trying to report themselves
        if (reportedUserId.toString() === reportingUserId.toString())
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.CANNOT_REPORT_SELF
            });

        // Create new report
        const newReport = await Report.create({
            reportedUser: reportedUserId,
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
        console.log("Error reporting user:", error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
}