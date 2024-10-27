/*

Filename: createPost.js

This file contains the controller function for creating a new post. It c creates a new post in the database. The user can then view the post on their feed.

Author: Affan


Postt will also contain photo/s and video/s. We use firebase-admin to get and store image based on userIds. So dynamic fodlers in each firestore.

Mutleer might also be  needed,

*/

import { Post } from "../../models/Post";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../utils/constants";


export const createPost = async (req,res) =>
{

}