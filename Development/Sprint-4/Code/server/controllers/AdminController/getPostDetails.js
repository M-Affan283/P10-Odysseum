/*
    Filename: getPostDetails.js
    Author: Shahrez
    Description: Controller for fetching post details with comments
*/

import { Post, Comment } from '../../models/Post.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const getPostDetails = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!postId) {
            return res.status(400).json({
                success: false,
                message: 'Post ID is required'
            });
        }

        // Get post details
        const post = await Post.findById(postId)
            .populate('creatorId', 'username firstName lastName profilePicture')
            .populate('locationId', 'name');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Get top-level comments
        const comments = await Comment.find({ 
            postId: postId,
            isReply: false
        })
        .populate('creatorId', 'username profilePicture')
        .sort({ createdAt: -1 });

        // Get all replies
        let replies = [];
        if (comments.length > 0) {
            const replyIds = comments.flatMap(comment => comment.replies || []);
            
            if (replyIds.length > 0) {
                replies = await Comment.find({
                    _id: { $in: replyIds }
                }).populate('creatorId', 'username profilePicture');
            }
        }

        // Format comments with their replies
        const formattedComments = comments.map(comment => {
            const commentReplies = replies.filter(reply => 
                comment.replies.includes(reply._id)
            );
            
            return {
                ...comment.toObject(),
                replies: commentReplies
            };
        });

        return res.status(200).json({
            success: true,
            post,
            comments: formattedComments
        });

    } catch (error) {
        console.error('Get post details error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};