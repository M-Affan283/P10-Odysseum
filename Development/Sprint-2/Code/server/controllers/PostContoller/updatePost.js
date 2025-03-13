/*

Filename: updatePost.js

This file will contain the logic for updating a post. The function will take in the post ID and the new post content as arguments. The function will then update the post in the database with the new content.

Author: Affan

*/

import { Post } from "../../models/Post.js";
import { User } from "../../models/User.js";
import { SUCCESS_MESSAGES,ERROR_MESSAGES } from "../../utils/constants.js";


/**
 * Updates a post in the database
 */
const updatePost = async (req, res) =>
{
    const { postId, requestorId, newContent } = req.body;

    if (!postId || !requestorId || !newContent) return res.status(400).json({ message: ERROR_MESSAGES.MISSING_FIELDS });

    try
    {
        const post = await Post.findById(postId);
        const requestor = await User.findById(requestorId);

        if (!post) return res.status(404).json({ message: ERROR_MESSAGES.POST_NOT_FOUND });
        if (!requestor) return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });

        if (post.creatorId !== requestor._id) return res.status(403).json({ message: ERROR_MESSAGES.UNAUTHORIZED });

        post.caption = newContent;

        await post.save();

        return res.status(200).json({ message: SUCCESS_MESSAGES.POST_UPDATED, post: post });

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
}

/**
 * Like/Unlike a post
 */
const likePost = async (req, res) => 
{
    const { postId, userId } = req.body;

    if (!postId || !userId) return res.status(400).json({ message: ERROR_MESSAGES.MISSING_FIELDS });

    try
    {
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({ message: ERROR_MESSAGES.POST_NOT_FOUND });

        if(post.likes.includes(userId))
        {
            post.likes = post.likes.filter(like => like.toString() !== userId);
            await post.save();
            return res.status(200).json({ message: "Unliked" });
        }
        else
        {
            post.likes.push(userId);
            await post.save();
            return res.status(200).json({ message: "Liked" });
        }

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
}

export { updatePost, likePost };