/*
    Filename: getDashboardStats.js
    Author: Shahrez
    Description: Controller for getting admin dashboard statistics
*/

import { User } from '../../models/User.js';
import { Post } from '../../models/Post.js';
import { Location } from '../../models/Location.js';
import { Business } from '../../models/Business.js';
import { Report } from '../../models/Report.js';
import { PostReport } from '../../models/PostReport.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const getDashboardStats = async (req, res) => {
    try {
        // Get counts from different collections
        const [
            userCount, 
            postCount, 
            locationCount, 
            businessCount,
            pendingUserReports,
            pendingPostReports
        ] = await Promise.all([
            User.countDocuments(),
            Post.countDocuments(),
            Location.countDocuments(),
            Business.countDocuments(),
            Report.countDocuments({ status: 'pending' }),
            PostReport.countDocuments({ status: 'pending' })
        ]);

        // Get recent user registrations (last 7 days)
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const recentUsers = await User.find({ 
            createdAt: { $gte: lastWeek } 
        })
        .select('_id username email profilePicture createdAt')
        .sort({ createdAt: -1 })
        .limit(5);

        // Get pending business approval count
        const pendingBusinessCount = await Business.countDocuments({ status: 'Pending' });

        return res.status(200).json({
            success: true,
            stats: {
                userCount,
                postCount,
                locationCount,
                businessCount,
                pendingUserReports,
                pendingPostReports,
                pendingBusinessCount,
                recentUsers
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};