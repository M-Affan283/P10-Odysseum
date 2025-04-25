/*
    Filename: deleteUserComment.js
    Author: Shahrez
    Description: Controller for admin to delete a user's comment
*/

import { Comment } from '../../models/Post.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants.js';

export const deleteUserComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const adminId = req.user._id;

        if (!commentId) {
            return res.status(400).json({
                success: false,
                message: 'Comment ID is required'
            });
        }

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        if (!comment.isReply) {
            await Comment.deleteMany({ _id: { $in: comment.replies } });
        } else {
            await Comment.findOneAndUpdate(
                { replies: commentId },
                { $pull: { replies: commentId } }
            );
        }

        await comment.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });

    } catch (error) {
        console.error('Delete comment error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};