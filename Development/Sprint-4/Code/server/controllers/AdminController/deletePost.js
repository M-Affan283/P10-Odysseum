/*
    Filename: deletePost.js
    Author: Shahrez
    Description: Controller for deleting a post
*/

import { Post, Comment } from '../../models/Post.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants.js';
import { deleteFiles } from '../../services/firebaseService.js';

export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const adminId = req.user._id;

        if (!postId) {
            return res.status(400).json({
                success: false,
                message: 'Post ID is required'
            });
        }

        // Find the post
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Delete all media files if any
        if (post.mediaUrls && post.mediaUrls.length > 0) {
            await deleteFiles(post.mediaUrls);
        }

        // Delete all associated comments
        await Comment.deleteMany({ postId: postId });

        // Delete the post
        await post.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'Post and associated comments deleted successfully'
        });

    } catch (error) {
        console.error('Delete post error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};