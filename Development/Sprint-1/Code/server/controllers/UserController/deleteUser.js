/*

Filename: deleteUser.js

This file contains the controller function for deleting a user. It deletes the user document from the MongoDB database or marks as deactivated in case of inappropriateness.

Author: Affan

*/

import { User } from "../../models/User.js";
import { Post,Comment } from "../../models/Post.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../utils/constants.js";

const deleteUser = async (req,res) =>
{

}

/**
 * Deactivate a user. This is an admin-only feature.
 * @param {Object} req - request object. Must contain userId and requestorId
 * @param {Object} res - response object
 * @returns {Object} - response object
 * 
 */
const deactivateUser = async (req,res) =>
{
    
}