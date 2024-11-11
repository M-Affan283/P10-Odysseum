/*

Filename: followUser.js

This file will be responsible for following a user or unfollowing a user.

*/

import { User } from "../../models/User.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../utils/constants.js";


/**
 * Follow a user or unfollow a user
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON} JSON object with success status and message
 */
export const followUser = async (req, res) =>
{
    const { userId, usertofollowId } = req.body;

    if(!userId || !usertofollowId) return res.status(400).json({success:false, message: ERROR_MESSAGES.INVALID_IDENTIFIER});

    try
    {
        const user = await User.findById(userId);
        const userToFollow = await User.findById(usertofollowId);

        if(!user || !userToFollow) return res.status(404).json({success:false, message: ERROR_MESSAGES.USER_NOT_FOUND});

        // If the user is already following the user to follow, then unfollow the user
        if(user.following.includes(usertofollowId))
        {
            user.following = user.following.filter(following => following.toString() !== usertofollowId);
            userToFollow.followers = userToFollow.followers.filter(follower => follower.toString() !== userId);
            await user.save();
            await userToFollow.save();
            return res.status(200).json({success:true, message: SUCCESS_MESSAGES.USER_UNFOLLOWED});
        }
        else // If the user is not following the user to follow, then follow the user
        {
            user.following.push(usertofollowId);
            userToFollow.followers.push(userId);
            await user.save();
            await userToFollow.save();
            return res.status(200).json({success:true, message: SUCCESS_MESSAGES.USER_FOLLOWED});
        }

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({success:false, message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR});
    }
}