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
    const { userId, userToFollowId } = req.body;
    console.log("Following user...");
    if(!userId || !userToFollowId) return res.status(400).json({success:false, message: ERROR_MESSAGES.INVALID_IDENTIFIER});

    try
    {
        const user = await User.findById(userId);
        const userToFollow = await User.findById(userToFollowId);

        if(!user || !userToFollow) return res.status(404).json({success:false, message: ERROR_MESSAGES.USER_NOT_FOUND});

        const isFollowing = user.following.includes(userToFollowId);

        if(isFollowing)
        {
            await User.updateOne({_id: userId}, {$pull: {following: userToFollowId}});
            await User.updateOne({_id: userToFollowId}, {$pull: {followers: userId}});

            return res.status(200).json({success:true, message: SUCCESS_MESSAGES.USER_UNFOLLOWED, status: "unfollowed"});
        }
        else
        {
            //use addToSet to avoid duplicates
            await User.updateOne({_id: userId}, {$addToSet: {following: userToFollowId}});
            await User.updateOne({_id: userToFollowId}, {$addToSet: {followers: userId}});

            return res.status(200).json({success:true, message: SUCCESS_MESSAGES.USER_FOLLOWED, status: "followed"});
        }

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({success:false, message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR});
    }
}