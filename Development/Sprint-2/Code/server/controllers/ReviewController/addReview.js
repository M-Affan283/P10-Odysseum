/* 
    Filename: addReview.js
    Author: Affan
*/

import { Review } from "../../models/Review.js";
import { User } from "../../models/User.js";
import { Location } from "../../models/Location.js";
import { Business } from "../../models/Business.js";
import { entityMetricUpdator, InteractionTypes } from "../../utils/scoringUtility.js";

/**
 * Add a new review
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
export const addReview = async (req, res) =>
{
    const { creatorId, entityType, entityId, rating, reviewContent, imageUrls } = req.body;

    try
    {
        const creator = await User.findById(creatorId);
        if (!creator) return res.status(404).json({ message: "User not found" });

        const entityModel = entityType === "Location" ? Location : Business;
        const entity = await entityModel.findById(entityId);
        if(!entity) return res.status(404).json({ message:  `${entityType} not found` });


        const review = new Review({
            creatorId,
            entityType,
            entityId,
            rating,
            reviewContent,
            // imageUrls
        });

        await review.save();

        // UPdate entity metrics and get heatmap score
        const updatedEntity = await entityMetricUpdator(entityType, entityId, InteractionTypes.REVIEW, rating);
        

        res.status(201).json({ 
            message: "Review added successfully",
            review: review,
            entityMetrics: {
                activityCount: updatedEntity.activityCount,
                avgRating: updatedEntity.avgRating,
                heatmapScore: updatedEntity.heatmapScore
            }
        });

    }
    catch (error)
    {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}