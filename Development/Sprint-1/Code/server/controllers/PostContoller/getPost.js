/*

Filename: getPosts.js

This file contains the controller function for getting all posts. It fetches all posts from the database and returns them to the client.

Author: Affan



*/


import { Post, Comment } from "../../models/Post.js";
import { User } from "../../models/User.js";
import { ERROR_MESSAGES,SUCCESS_MESSAGES } from "../../utils/constants.js";


/**
 * Get the posts of a specific user.
 * @param {Object} req - request object. Must contain requestorId and userId.
 * @param {Object} res - response object
 * @returns {Object} - response object
 */
const getUserPosts = async (req,res) =>
{
    const { requestorId, userId } = req.body;

    if(!userId) return res.status(400).json({error: ERROR_MESSAGES.NO_USER_ID});
    if(!requestorId) return res.status(400).json({error: ERROR_MESSAGES.NO_REQUESTOR_ID});

    try
    {
        const user = await User.findById(userId);
        const requestor = await User.findById(requestorId);

        if(!user) return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});
        if(!requestor) return res.status(404).json({error: ERROR_MESSAGES.REQUESTOR_NOT_FOUND});

        //check if the requestor is following the user whose posts are being fetched or if the requestor is the user whose posts are being fetched
        if(!requestor.following.includes(userId) && userId !== requestorId) return res.status(401).json({error: ERROR_MESSAGES.UNAUTHORIZED});

        if(user.isDeactivated) return res.status(401).json({error: ERROR_MESSAGES.USER_NOT_FOUND});

        //sort by most recent
        const posts = await Post.find({userId: userId}).sort({createdAt: -1});

        if(!posts) return res.status(404).json({error: ERROR_MESSAGES.NO_POSTS});

        //no need to get comments for each post. only get the number of comments for each post
        const numberOfComments = await Comment.countDocuments({postId: posts._id});


        return res.status(200).json({message: SUCCESS_MESSAGES.POSTS_FOUND, posts: posts, numberOfComments: numberOfComments});
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: error.message});
    }

}

/**
 * Get all posts of the users the current user is following
 * @param {Object} req - request object. Must contain requestorId.
 * @param {Object} res - response object
 * @returns {Object} - response object
 */
const getFollowingPosts = async (req,res) => //find the posts of the users the current user is following sorted by most recent
{
    const { requestorId } = req.body;

    if(!requestorId) return res.status(400).json({error: ERROR_MESSAGES.NO_REQUESTOR_ID});

    try
    {
        const requestor = await User.findById(requestorId);

        if(!requestor) return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});

        //sort by most recent
        const posts = await Post.find({userId: {$in: requestor.following}, isDeactivated: false}).sort({createdAt: -1});

        if(!posts) return res.status(404).json({error: ERROR_MESSAGES.NO_POSTS});

        //no need to get comments for each post. only get the number of comments for each post
        const numberOfComments = await Comment.countDocuments({postId: posts._id});

        return res.status(200).json({message: SUCCESS_MESSAGES.POSTS_FOUND, posts: posts, numberOfComments: numberOfComments});
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: error.message});
    }
}

/**
 * Get a single post of a user. Ideally it is not a use case for the cleint to get a single post. It is used for internal purposes.
 * @param {Object} req - request object. Must contain requestorId and postId. 
 * @param {Object} res - response object
 * @returns {Object} - response object
 */
const getSinglePost = async (req,res) =>
{
    const { requestorId, postId } = req.body;

    if(!postId) return res.status(400).json({error: ERROR_MESSAGES.NO_POST_ID});
    if(!requestorId) return res.status(400).json({error: ERROR_MESSAGES.NO_REQUESTOR_ID});

    try
    {
        const post = await Post.findById(postId);
        const requestor = await User.findById(requestorId);

        if(!post) return res.status(404).json({error: ERROR_MESSAGES.INVALID_POST});
        if(!requestor) return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});

        //check if the requestor is following the user who created the post or if the requestor is the user who created the post
        if(post.userId !== requestorId && !requestor.following.includes(post.userId)) return res.status(401).json({error: ERROR_MESSAGES.UNAUTHORIZED});

        //no need to get comments for each post. only get the number of comments for each post
        const numberOfComments = await Comment.countDocuments({postId: postId});

        return res.status(200).json({message: SUCCESS_MESSAGES.POST_FOUND, post: post, numberOfComments: numberOfComments});

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: error.message});
    }
}


export { getUserPosts, getFollowingPosts, getSinglePost };