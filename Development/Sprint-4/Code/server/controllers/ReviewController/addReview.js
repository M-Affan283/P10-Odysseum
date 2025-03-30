/* 
    Filename: addReview.js
    Author: Affan
*/

import { Review } from "../../models/Review.js";
import { User } from "../../models/User.js";
import { Location } from "../../models/Location.js";
import { Business } from "../../models/Business.js";
import { entityMetricUpdator, InteractionTypes } from "../../utils/scoringUtility.js";
import { uploadFile } from "../../services/firebaseService.js";

/**
 * Add a new review
 */
export const addReview = async (req, res) =>
{
    const { creatorId, entityType, entityId, rating, title, reviewContent } = req.body;
    const files = req.files || [];
    
    if (!creatorId) return res.status(400).json({ message: "Creator ID is required" });
    if (!entityType) return res.status(400).json({ message: "Entity type is required" });
    if (!entityId) return res.status(400).json({ message: "Entity ID is required" });
    if (!rating) return res.status(400).json({ message: "Rating is required" });
    if (!title) return res.status(400).json({ message: "Review title is required" });
    if (!reviewContent) return res.status(400).json({ message: "Review content is required" });

    try
    {
        const creator = await User.findById(creatorId);
        if (!creator) return res.status(404).json({ message: "User not found" });

        const entityModel = entityType === "Location" ? Location : Business;
        const entity = await entityModel.findById(entityId);
        if(!entity) return res.status(404).json({ message:  `${entityType} not found` });

        // Upload files to firebase
        const fileURLS = await uploadFile(files, creatorId);

        if (fileURLS.status !== 200) return res.status(500).json({ message: fileURLS.message });
        

        const review = new Review({
            title,
            creatorId,
            entityType,
            entityId,
            rating,
            reviewContent,
            imageUrls: fileURLS.urls
        });

        await review.save();

        // UPdate entity metrics and get heatmap score
        const updatedEntity = await entityMetricUpdator(entityType, entityId, InteractionTypes.REVIEW, rating);
        

        return res.status(201).json({ 
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
        return res.status(500).json({ message: "Internal server error" });
    }
}