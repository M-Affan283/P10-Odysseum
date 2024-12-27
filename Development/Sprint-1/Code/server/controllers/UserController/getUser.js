/*
    filename: getUser.js
    Author: Affan
*/

import { User } from "../../models/User.js";
import { Location } from "../../models/Location.js";
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
    const {requestorId, userToViewId} = req.query;
    console.log(req.query)
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
        userToView = {
            firstName: userToView.firstName,
            lastName: userToView.lastName,
            username: userToView.username,
            profilePicture: userToView.profilePicture,
            bio: userToView.bio,
            location: userToView.location,
            followers: userToView.followers,
            following: userToView.following,
        }

        return res.status(200).json({message: SUCCESS_MESSAGES.USER_FOUND, user: userToView});
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
 * Get a user by their username, first and last name. This function is implemented for the search functionality so
   it is the primary api function to use. 
   It will use cursor-based pagination to return a list of users based on the search parameters.
 * @param {Object} req - request object. Must contain the requestorId and the search parameters and the cursor (last user id).
 * @param {Object} res - response object
 * @returns {Object} - response object
 */
const getUserBySearchParams = async (req,res) =>
{
    const {requestorId, limit=5 ,searchParam="", lastId} = req.query;
    console.log(req.query)
    if(!requestorId || !searchParam) return res.status(400).json({error: ERROR_MESSAGES.NO_USER_ID});
    // if(!lastId) return res.status(400).json({error: ERROR_MESSAGES.NO_CURSOR});

    try
    {
        const requestor = await User.findById(requestorId);

        if(!requestor) return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});

        let searchQuery = {
            isDeactivated: false  // Always filter out deactivated users
        };

        if (searchParam) {
            searchQuery.username = { $regex: searchParam.toLowerCase(), $options: 'i' };
        }

        if(lastId) searchQuery._id = { $gt: lastId };

        let users = await User.find(searchQuery).limit(Number(limit)).sort({_id: 1}).exec();

        const hasMore = users.length === Number(limit) ? true : false; // if the number of users returned is equal to the limit, then there are potentially more users to fetch
        

        // console.log(users);
        // change users to send only username. once user clicks on the username, then we can fetch the user details
        users = users.map(user => {
            return {
                _id: user._id,
                username: user.username
            }
        });

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