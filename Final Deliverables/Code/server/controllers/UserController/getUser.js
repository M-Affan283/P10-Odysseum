/*
    filename: getUser.js
    Author: Affan
*/

import { User } from "../../models/User.js";
import { Location } from "../../models/Location.js";
import { SUCCESS_MESSAGES,ERROR_MESSAGES } from "../../utils/constants.js";

/**
 * Get all users. (Restricted to admin users only)
 */
const getAllUsers = async (req,res) =>
{
    const { requestorId, page=1 } = req.query;
    let limit = 10;

    if(!requestorId) return res.status(400).json({error: ERROR_MESSAGES.NO_USER_ID});

    try
    {
        const requestor = await User.findById(requestorId);

        if(!requestor) return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});
        // if(requestor.role !== 'admin') return res.status(403).json({error: ERROR_MESSAGES.UNAUTHORIZED});
        const totalUsers = await User.countDocuments({});

        const skip = (page - 1) * limit;
        const users = await User.find({}).skip(skip).limit(limit);
        return res.status(200).json({
            message: SUCCESS_MESSAGES.USERS_FOUND,
            users: users,
            currentPage: Number(page),
            totalPages: Math.ceil(totalUsers / limit)
        });

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
    }

}



/**
 * Get a user by their id.
*/
const getUserById = async (req,res) =>
{
    const {requestorId, userToViewId} = req.query;
    if(!requestorId || !userToViewId) return res.status(400).json({error: ERROR_MESSAGES.NO_USER_ID});

    try
    {
        let requestor = await User.findById(requestorId);
        let userToView = await User.findById(userToViewId);

        // console.log(requestor, " ", userToView);

        if(!requestor || !userToView) return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});

        if(userToView.isDeactivated) return res.status(403).json({error: ERROR_MESSAGES.USER_NOT_FOUND});

        //assume all profiles are public for now
        // if(!requestor.following.includes(userToViewId))
        // {
        //     if(requestorId !== userToViewId) return res.status(403).json({error: ERROR_MESSAGES.UNAUTHORIZED});
        // }

        //only send the necessary user details for security reasons
        const retUserToView = {
            firstName: userToView.firstName,
            lastName: userToView.lastName,
            username: userToView.username,
            profilePicture: userToView.profilePicture,
            bio: userToView.bio,
            location: userToView.location,
            followers: userToView.followers,
            following: userToView.following,
            followed: (requestor.following.includes(userToViewId) && userToView.followers.includes(requestorId))
        }

        return res.status(200).json({message: SUCCESS_MESSAGES.USER_FOUND, user: retUserToView});
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
    }

}

/**
 * Get a user by their username. (alternative to getUserById)
*/
const getUserByUsername = async (req,res) =>
{
    const {requestorId, username} = req.query;

    if(!requestorId || !username) return res.status(400).json({error: ERROR_MESSAGES.NO_USER_ID});

    try
    {
        const requestor = await User.findById(requestorId);
        const userToView = await User.findOne({username: username});

        if(!requestor || !userToView) return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});

        if(userToView.isDeactivated) return res.status(403).json({error: ERROR_MESSAGES.USER_NOT_FOUND});

        //assume all profiles are public for now
        // if(!requestor.following.includes(userToView._id))
        // {
        //     if(requestorId !== userToView._id) return res.status(403).json({error: ERROR_MESSAGES.UNAUTHORIZED});
        // }

        return res.status(200).json({message: SUCCESS_MESSAGES.USER_FOUND, user: userToView});
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
    }
}


/**
 * Get a user by their username. This function is implemented for the search functionality so
   it is the primary api function to use. 
 */
const searchUser = async (req,res) =>
{
    const {searchParam="", page = 1} = req.query;
    // console.log(req.query)
    if(!searchParam) return res.status(400).json({error: "This api requires a search parameter"});
    let limit = 10;

    try
    {
        let skip = (page - 1) * limit;

        const users = await User.find({username: { $regex: searchParam, $options: 'i' }}).skip(skip).limit(limit).select('_id username profilePicture');
        
        const numberOfUsers = await User.countDocuments({username: { $regex: searchParam, $options: 'i' }});

        return res.status(200).json({
            message: "Users found",
            users: users,
            currentPage: Number(page),
            totalPages: Math.ceil(numberOfUsers / limit)
        });


    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
    }

}

const getFollowingUsers = async (req,res) =>
{
    const { userId } = req.query;

    if(!userId) return res.status(400).json({error: ERROR_MESSAGES.NO_USER_ID});

    try
    {
        const user = await User.findById(userId);

        if(!user) return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});

        const followingUsers = await User.find({_id: { $in: user.following }}).select('_id username profilePicture');

        return res.status(200).json({message: SUCCESS_MESSAGES.USERS_FOUND, users: followingUsers});
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
    }
}

export { getAllUsers, getUserById, getUserByUsername, searchUser, getFollowingUsers };