/*
    Filename: deleteUserPost.js
    Author: Shahrez
    Description: Controller for admin to delete a user's post
*/

import { Post, Comment } from '../../models/Post.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants.js';
import { deleteFiles } from '../../services/firebaseService.js';

export const deleteUserPost = async (req, res) => {
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

        // Delete post media if any
        if (post.mediaUrls && post.mediaUrls.length > 0) {
            await deleteFiles(post.mediaUrls);
        }

        // Delete all comments associated with the post
        await Comment.deleteMany({ postId });

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