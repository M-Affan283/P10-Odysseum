/*
    Filename: createPost.js
    Author: Affan
*/

import { Post } from "../../models/Post.js";
import { User } from "../../models/User.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../utils/constants.js";
import { uploadFile } from "../../services/firebaseService.js";

/**
 * Create a new post
 * @param {Object} req - request object. Must contain creatorId, caption, locationId and files.
 * @param {Object} res - response object
 * @returns {Object} - response object
 *
 */
export const createPost = async (req,res) =>
{
    const { creatorId, caption /*,locationId*/ } = req.body; //uncomment locationId later
    const files = req.files;
    console.log(req.body)
    console.log(req.files)
    if(!creatorId) return res.status(400).json({error: ERROR_MESSAGES.NO_USER_ID});
    // if(!locationId) return res.status(400).json({error: ERROR_MESSAGES.NO_LOCATION_ID}); //uncomment later
    // if(!files || files.length === 0) return res.status(400).json({error: ERROR_MESSAGES.NO_FILES});

    try
    {
        const user = await User.findById(creatorId);
        // const location = await Location.findById(locationId); //uncomment later

        if(!user){
            console.log("User not found")
            return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});
        }
        // if(!location) return res.status(404).json({error: ERROR_MESSAGES.LOCATION_NOT_FOUND}); // uncomment later

        const fileURLS = await uploadFile(files, creatorId);

        if(fileURLS.status !== 200) return res.status(500).json({error: fileURLS.message});

        const post = new Post({
            creatorId: creatorId,
            caption: caption,
            mediaUrls: fileURLS.urls,
            // location: location //uncomment later
        });

        await post.save();

        return res.status(201).json({message: SUCCESS_MESSAGES.POST_CREATED, post: post});

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: error.message});
    }

}