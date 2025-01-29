/*

Filename: deletePost.js

This file contains the controller function for deleting a post. It checks if the post exists in the database and if the user is the owner of the post. If the conditions are met, it deletes the post from the database.

Author: Affan


Note: Post deletion is a critical operation and should be handled with care. Make sure to validate the user's identity and authorization before deleting a post.

*/

import { Post, Comment } from "../../models/Post.js";
import { User } from "../../models/User.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../utils/constants.js";
import { deleteFiles } from "../../services/firebaseService.js";


/**
 * Deletes a post from the database
 */
export const deletePost = async (req,res) =>
{
    const { postId, userId } = req.query;

    if(!postId) return res.status(400).json({error: ERROR_MESSAGES.NO_POST_ID});
    if(!userId) return res.status(400).json({error: ERROR_MESSAGES.NO_USER_ID});

    try
    {
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({error: ERROR_MESSAGES.INVALID_POST});
        
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});

        //Aiuthorization check. If not creator or admin, return unauthorized
        if(post.creatorId.toString() !== userId && user.role !== 'admin') return res.status(401).json({error: ERROR_MESSAGES.UNAUTHORIZED});

        //delete all media files for the post if any
        const deletefiles = await deleteFiles(post.mediaUrls);

        if(deletefiles.status !== 200) return res.status(500).json({error: deletefiles.message});

        //delete all comments for the post if any
        await Comment.deleteMany({postId: postId});

        await post.deleteOne();

        return res.status(200).json({message: SUCCESS_MESSAGES.POST_DELETED});

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
    }
}