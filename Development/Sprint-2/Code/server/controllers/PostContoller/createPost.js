/*
    Filename: createPost.js
    Author: Affan
*/

import { Post } from "../../models/Post.js";
import { User } from "../../models/User.js";
import { Location } from "../../models/Location.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../utils/constants.js";
import { uploadFile } from "../../services/firebaseService.js";
import { entityMetricUpdator, InteractionTypes } from "../../utils/scoringUtility.js";

/**
 * Create a new post
 */
export const createPost = async (req,res) =>
{
    const { creatorId, caption, locationId } = req.body; //uncomment locationId later
    const files = req.files;
    console.log("Body: ", req.body)
    if(!creatorId) return res.status(400).json({error: ERROR_MESSAGES.NO_USER_ID});
    // if(!locationId) return res.status(400).json({error: ERROR_MESSAGES.NO_LOCATION_ID}); //uncomment later
    // if(!files || files.length === 0) return res.status(400).json({error: ERROR_MESSAGES.NO_FILES});

    try
    {
        const user = await User.findById(creatorId);
        if(!user) return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});
        
        const location = await Location.findById(locationId);
        if(!location) return res.status(404).json({error: ERROR_MESSAGES.LOCATION_NOT_FOUND});

        const fileURLS = await uploadFile(files, creatorId);

        if(fileURLS.status !== 200) return res.status(500).json({error: fileURLS.message});

        const post = new Post({
            creatorId: creatorId,
            caption: caption,
            mediaUrls: fileURLS.urls,
            locationId: locationId
        });

        await post.save();

        // Update entity metrics and get heatmap score
        const updatedEntity = await entityMetricUpdator("Location", locationId, InteractionTypes.POST);

        return res.status(201).json({
            message: SUCCESS_MESSAGES.POST_CREATED,
            post: post,
            entityMetrics: {
                activityCount: updatedEntity.activityCount,
                avgRating: updatedEntity.avgRating,
                heatmapScore: updatedEntity.heatmapScore
            }
        });

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: error.message});
    }

}