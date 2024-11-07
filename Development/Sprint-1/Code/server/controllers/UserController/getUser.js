/*

filename: getUser.js

This file contains the controller function for getting a user by their id (admin) or username or email (admins) or all users. It checks if the user exists in the database and returns the user details if found.

Author: Affan

*/

import { User } from "../../models/User.js";
import { SUCCESS_MESSAGES,ERROR_MESSAGES } from "../../utils/constants.js";

/**
 * Get all users. This is an admin function.
 * @param {Object} req - request object. Must contain the requestorId.
 * @param {Object} res - response object
 * @returns {Object} - response object

 */
const getAllUsers = async (req,res) =>
{
    const { requestorId } = req.body;

    if(!requestorId) return res.status(400).json({error: ERROR_MESSAGES.NO_USER_ID});

    try
    {
        const requestor = await User.findById(requestorId);

        if(!requestor) return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});
        if(requestor.role !== 'admin') return res.status(403).json({error: ERROR_MESSAGES.UNAUTHORIZED});

        const users = await User.find({});
        return res.status(200).json({message: SUCCESS_MESSAGES.USERS_FOUND, users: users});

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
    }

}

/**
 * Get a user by their id. This function if for when users click on a user profile.
 * @param {Object} req - request object. Must contain the requestorId and the userToViewId.
 * @param {Object} res - response object
 * @returns {Object} - response object
 * 
*/
const getUserById = async (req,res) =>
{
    const {requestorId, userToViewId} = req.body;

    if(!requestorId || !userToViewId) return res.status(400).json({error: ERROR_MESSAGES.NO_USER_ID});

    try
    {
        const requestor = await User.findById(requestorId);
        const userToView = await User.findById(userToViewId);

        if(!requestor || !userToView) return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});

        if(userToView.isDeactivated) return res.status(403).json({error: ERROR_MESSAGES.USER_NOT_FOUND});

        if(requestor.following.includes(userToViewId) && userToView.followers.includes(requestorId)) return res.status(200).json({message: SUCCESS_MESSAGES.USER_FOUND, user: userToView});
        else return res.status(403).json({error: ERROR_MESSAGES.UNAUTHORIZED});
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
    }

}

/**
 * Get a user by their username. This function is for when users search for a user. This function is an alternative to the getUserById function.
 * @param {Object} req - request object. Must contain the requestorId and the username.
 * @param {Object} res - response object
 * @returns {Object} - response object
 * 
*/
const getUserByUsername = async (req,res) =>
{
    const {requestorId, username} = req.body;

    if(!requestorId || !username) return res.status(400).json({error: ERROR_MESSAGES.NO_USER_ID});

    try
    {
        const requestor = await User.findById(requestorId);
        const userToView = await User.findOne({username: username});

        if(!requestor || !userToView) return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});

        if(userToView.isDeactivated) return res.status(403).json({error: ERROR_MESSAGES.USER_NOT_FOUND});

        if(requestor.following.includes(userToView._id) && userToView.followers.includes(requestorId)) return res.status(200).json({message: SUCCESS_MESSAGES.USER_FOUND, user: userToView});
        else return res.status(403).json({error: ERROR_MESSAGES.UNAUTHORIZED});
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
    }
}


/**
 * Get a user by their username, first and last name. This function is implemented for the search functionality so
   it is the primary api function to use. 
   It will use cursor-based pagination to return a list of users based on the search parameters.
 * @param {Object} req - request object. Must contain the requestorId and the search parameters and the cursor (last user id).
 * @param {Object} res - response object
 * @returns {Object} - response object
 */
const getUserBySearchParams = async (req,res) =>
{
    const {requestorId, limit=10 ,searchParam, lastId} = req.body;

    if(!requestorId || !searchParam) return res.status(400).json({error: ERROR_MESSAGES.NO_USER_ID});
    if(!lastId) return res.status(400).json({error: ERROR_MESSAGES.NO_CURSOR});

    try
    {
        const requestor = await User.findById(requestorId);

        if(!requestor) return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});

        const searchQuery = {
            $or: [
                {username: { $regex: searchParam, $options: 'i' }},
                {firstName: { $regex: searchParam, $options: 'i' }},
                {lastName: { $regex: searchParam, $options: 'i' }},
                {isDeactivated: false}
            ]
        };  

        if(lastId) searchQuery._id = { $gt: lastId };

        const users = await User.find(searchQuery).limit(Number(limit)).sort({_id: 1}).exec();

        const hasMore = users.length === Number(limit) ? true : false; // if the number of users returned is equal to the limit, then there are potentially more users to fetch

        return res.status(200).json({
            users: users,
            pagination: {
                hasMore: hasMore,
                lastId: users.length > 0 ? users[users.length - 1]._id : null
            }
        });


    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
    }

}

export { getAllUsers, getUserById, getUserByUsername, getUserBySearchParams };