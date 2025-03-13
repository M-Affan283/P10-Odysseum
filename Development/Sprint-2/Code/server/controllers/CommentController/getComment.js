    /*

File: getComment.js

This file contains the controller function for getting comments. It retrieves a comment from the database and returns it to the client.

Author: Affan

*/


import { Comment } from "../../models/Post.js";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../utils/constants.js";


//also show what req should contain
/**
 * Get all comments for a post
 * @param {Object} req - Request object. Must Contain postId
 * @param {Object} res - Response object
 * @returns {Object} - Returns a response object with comments
 * 
 */
export const getCommentsByPostId = async (req, res) => 
{
    const { postId, page = 1 } = req.query;

    if(!postId) return res.status(400).json({error: ERROR_MESSAGES.NO_POST_ID});
    let limit = 10;

    try
    {
        //find comment populated creatorId with username and profile picture
        let skip = (page - 1) * limit;
        const comments = await Comment.find({postId: postId}).sort({createdAt: -1}).skip(skip).limit(Number(limit)).populate('creatorId', 'username profilePicture');

        if(!comments) return res.status(200).json({comments: []});

        const totalComments = await Comment.countDocuments({postId: postId});

        return res.status(200).json({
            message: SUCCESS_MESSAGES.COMMENTS_FOUND,
            comments: comments,
            currentPage: Number(page),
            totalPages: Math.ceil(totalComments / limit)
        });

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
    }
}

/**
 * Get a comment by its ID
 * @param {Object} req - Request object. Must Contain commentId
 * @param {Object} res - Response object
 * @returns {Object} - Returns a response object with the comment
 */
export const getCommentById = async (req, res) =>
{
    const { commentId } = req.params;

    if(!commentId) return res.status(400).json({error: ERROR_MESSAGES.NO_COMMENT_ID});

    try
    {
        const comment = await Comment.findById(commentId);

        if(!comment) return res.status(404).json({error: ERROR_MESSAGES.NO_COMMENTS});

        return res.status(200).json({message: SUCCESS_MESSAGES.COMMENT_FOUND, comment: comment});

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
    }
}