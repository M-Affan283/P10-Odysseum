/*

Filename: deleteComment.js

This file contains the controller function for deleting a comment. It deletes a comment from the database.

Author: Affan

*/

import { Comment,Post } from "../../models/Post.js";
import { User } from "../../models/User.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../utils/constants.js";


/**
 * Delete a single comment
 */
export const deleteSingleComment = async (req, res) => {
    const { commentId, postId, deletinguserId } = req.query;

    if (!commentId) return res.status(400).json({ error: ERROR_MESSAGES.NO_COMMENT_ID });
    if (!postId) return res.status(400).json({ error: ERROR_MESSAGES.NO_POST_ID });
    if (!deletinguserId) return res.status(400).json({ error: ERROR_MESSAGES.NO_USER_ID });

    try {
        const comment = await Comment.findById(commentId);
        const post = await Post.findById(postId);
        const deletingUser = await User.findById(deletinguserId); //user who is deleting the comment

        if (!comment) return res.status(404).json({ error: ERROR_MESSAGES.NO_COMMENTS });
        if (!post) return res.status(404).json({ error: ERROR_MESSAGES.INVALID_POST });
        if (!deletingUser) return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });

        // If user is the owner of the comment or owner of the post or is admin only then delete the comment
        if(comment.creatorId.toString() !== deletinguserId.toString() && post.creatorId.toString() !== deletinguserId.toString() && deletingUser.role !== 'admin')
        {
            return res.status(403).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
        }
        
        await comment.deleteOne();

        return res.status(200).json({ message: SUCCESS_MESSAGES.COMMENT_DELETED });
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
    }
}