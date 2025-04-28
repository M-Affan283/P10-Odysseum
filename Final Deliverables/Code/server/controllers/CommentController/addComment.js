/*

Filename: addComment.js

This file contains the controller function for adding a comment to a post. It creates a new comment in the database and associates it with the post.

Author: Affan

*/

import { Post, Comment } from "../../models/Post.js";
import { User } from "../../models/User.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../utils/constants.js";

/**
 * Adds a comment to a post
 * @param {Object} req - Request object. Must contain postId, creatorId, and text
 * @param {Object} res - Response object
 * @returns {Object} - Returns a response object with a success message or an error message
 */
export const addTopComment = async (req,res) =>
{
    const { postId, creatorId, text } = req.body;

    if(!postId) return res.status(400).json({error: ERROR_MESSAGES.NO_POST_ID});
    if(!creatorId) return res.status(400).json({error: ERROR_MESSAGES.NO_USER_ID});
    if(!text) return res.status(400).json({error: ERROR_MESSAGES.NO_TEXT});

    try
    {
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({error: ERROR_MESSAGES.INVALID_POST});
        
        const user = await User.findById(creatorId);
        if(!user) return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});

        if(creatorId.toString() !== post.creatorId.toString())
        {
            const comment = new Comment({
                postId: postId,
                creatorId: creatorId,
                text: text
            });

            await comment.save();

            await comment.populate('creatorId', 'username');

            return res.status(201).json({message: SUCCESS_MESSAGES.COMMENT_ADDED, comment: comment});
        }
        else
        {
            //if the creator of the post is adding the comment, set owner to true. this will be used in the frontend to show that the comment is by the owner of the post
            const comment = new Comment({
                postId: postId,
                creatorId: creatorId,
                text: text,
                owner: true
            });

            await comment.save();

            await comment.populate('creatorId', 'username');

            return res.status(201).json({message: SUCCESS_MESSAGES.COMMENT_ADDED, comment: comment});
        }
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
    }
}

/**
 * Adds a reply to a comment
 * @param {Object} req - Request object. Must contain commentId, creatorId, postId and text
 * @param {Object} res - Response object
 * @returns {Object} - Returns a response object with a success message or an error message
*/
export const addReplyComment = async (req,res) =>
{
    const {commentId, postId, creatorId, text} = req.body;

    if(!commentId) return res.status(400).json({error: ERROR_MESSAGES.NO_COMMENT_ID});
    if(!creatorId) return res.status(400).json({error: ERROR_MESSAGES.NO_USER_ID});
    if(!text) return res.status(400).json({error: ERROR_MESSAGES.NO_TEXT});

    try
    {
        const comment = await Comment.findById(commentId); //find the comment to which the reply is being added
        const creator = await User.findById(creatorId);
        const post = await Post.findById(postId);

        if(!comment) return res.status(404).json({error: ERROR_MESSAGES.INVALID_COMMENT});
        if(!creator) return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});
        if(!post) return res.status(404).json({error: ERROR_MESSAGES.INVALID_POST});

        if(comment.isReply) return res.status(400).json({error: ERROR_MESSAGES.CANNOT_REPLY_TO_REPLY});

        if(creatorId.toString() !== post.creatorId.toString())
        {
            const reply = new Comment({
                postId: postId,
                creatorId: creatorId,
                text: text,
                isReply: true
            });

            await reply.save();

            comment.replies.push(reply._id);
            await comment.save();

            return res.status(201).json({message: SUCCESS_MESSAGES.REPLY_ADDED, reply: reply});
        }
        else
        {
            const reply = new Comment({
                postId: postId,
                creatorId: creatorId,
                text: text,
                isReply: true,
                owner: true
            });

            await reply.save();

            comment.replies.push(reply._id);
            await comment.save();

            return res.status(201).json({message: SUCCESS_MESSAGES.REPLY_ADDED, reply: reply});
        }


    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
    }
}