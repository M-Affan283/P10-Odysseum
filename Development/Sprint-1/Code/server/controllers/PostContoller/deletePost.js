/*

Filename: deletePost.js

This file contains the controller function for deleting a post. It checks if the post exists in the database and if the user is the owner of the post. If the conditions are met, it deletes the post from the database.

Author: Affan


Note: Post deletion is a critical operation and should be handled with care. Make sure to validate the user's identity and authorization before deleting a post.

*/

import { Post } from "../../models/Post";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../utils/constants";

export const deletePost = async (req,res) =>
{
    
}