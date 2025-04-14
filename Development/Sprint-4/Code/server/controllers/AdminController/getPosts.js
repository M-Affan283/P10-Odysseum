/*
    Filename: getPosts.js
    Author: Shahrez
    Description: Controller for fetching all posts
*/

import { Post } from '../../models/Post.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchQuery = req.query.search || '';
        const skip = (page - 1) * limit;

        // Build query based on search parameter
        const query = searchQuery 
            ? { caption: { $regex: searchQuery, $options: 'i' } } 
            : {};

        // Get total count for pagination
        const totalPosts = await Post.countDocuments(query);

        // Fetch posts
        const posts = await Post.find(query)
            .populate('creatorId', 'username profilePicture')
            .populate('locationId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts,
                limit
            }
        });

    } catch (error) {
        console.error('Get posts error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};