/*
    Filename: getUserDetails.js
    Author: Shahrez
    Description: Controller for fetching user details with posts and comments
*/

import { User } from '../../models/User.js';
import { Post, Comment } from '../../models/Post.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const postsPage = parseInt(req.query.postsPage) || 1;
        const commentsPage = parseInt(req.query.commentsPage) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Get user details
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user posts
        const postsSkip = (postsPage - 1) * limit;
        const totalPosts = await Post.countDocuments({ creatorId: userId });
        const posts = await Post.find({ creatorId: userId })
            .sort({ createdAt: -1 })
            .skip(postsSkip)
            .limit(limit)
            .populate('locationId', 'name');

        // Get user comments
        const commentsSkip = (commentsPage - 1) * limit;
        const totalComments = await Comment.countDocuments({ creatorId: userId });
        const comments = await Comment.find({ creatorId: userId })
            .sort({ createdAt: -1 })
            .skip(commentsSkip)
            .limit(limit)
            .populate('postId', 'caption');

        return res.status(200).json({
            success: true,
            user,
            posts: {
                items: posts,
                pagination: {
                    currentPage: postsPage,
                    totalPages: Math.ceil(totalPosts / limit),
                    totalPosts
                }
            },
            comments: {
                items: comments,
                pagination: {
                    currentPage: commentsPage,
                    totalPages: Math.ceil(totalComments / limit),
                    totalComments
                }
            }
        });

    } catch (error) {
        console.error('Get user details error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};