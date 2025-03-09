/**
 * File: scoringUtility.js
 * Author: Affan
 */


import { Location } from "../models/Location.js";
import { Review } from "../models/Review.js";
import { Business } from "../models/Business.js";
import mongoose from "mongoose";

/**
 * Calculate decay factor based on time elapsed
 * @param {Date} lastInteraction - Date of last interaction
 * @returns {number} - Decay factor between 0 and 1
 */
const calculateTimeDecay = (lastInteraction) => {
    if (!lastInteraction) return 0;
    
    const now = new Date();
    const hoursElapsed = (now - lastInteraction) / (1000 * 60 * 60);
    
    // Exponential decay: score halves every 24 hours
    const decayFactor = Math.exp(-hoursElapsed / 24);
    return Math.max(0, Math.min(1, decayFactor));
};

/**
 * Calculate heatmap score based on various factors
 * @param {Object} params - Parameters for score calculation
 * @param {number} params.activityCount - Total number of reviews/interactions
 * @param {number} params.avgRating - Average rating (1-5)
 * @param {Date} params.lastInteraction - Time of last interaction
 * @returns {number} - Heatmap score between 0 and 100
 */
const calculateHeatmapScore = (activityCount, avgRating, lastInteraction) => {
    // Weight factors (adjust these based on importance)
    const ACTIVITY_WEIGHT = 0.4;
    const RATING_WEIGHT = 0.3;
    const RECENCY_WEIGHT = 0.3;
    
    // Activity score (logarithmic scale to prevent domination by very active locations)
    const normalizedActivity = Math.log10(activityCount /*+ 1*/) / Math.log10(100); // Assumes 100 is a high activity count
    const activityScore = Math.min(1, normalizedActivity);
    
    // Rating score (normalized to 0-1 range)
    const ratingScore = (avgRating - 1) / 4; // Convert 1-5 range to 0-1
    
    // Recency score
    const recencyScore = calculateTimeDecay(lastInteraction);
    
    // Calculate weighted average
    const totalScore = (
        activityScore * ACTIVITY_WEIGHT +
        ratingScore * RATING_WEIGHT +
        recencyScore * RECENCY_WEIGHT
    );
    
    // Convert to 0-100 scale and round to nearest integer
    return Math.round(totalScore * 100);
};



/**
 * Types of interactions that affect heatmap scores
 */
export const InteractionTypes = {
    REVIEW: 'review',
    VIEW: 'view',
    BOOKMARK: 'bookmark',
    SHARE: 'share',
    POST: 'post',
    CHAT_MENTION: 'chat_mention'
};


/**
 * Weight configurations for different interaction types
 * Weights determine how much each interaction type affects the activity count
 */
const InteractionWeights = {
    [InteractionTypes.REVIEW]: 1.0,      // Full weight for reviews
    [InteractionTypes.SHARE]: 0.8,       // High impact for shares
    [InteractionTypes.POST]: 0.6, // Medium-high impact for photos
    [InteractionTypes.BOOKMARK]: 0.2,     // Medium impact for bookmarks
    [InteractionTypes.CHAT_MENTION]: 0.15,  // Low-medium impact for mentions
    [InteractionTypes.VIEW]: 0.1,        // Minimal impact for views
};


/**
 * Update entity metrics based on interaction
 * @param {string} entityType - 'Location' or 'Business'
 * @param {string} entityId - ID of the entity
 * @param {string} interactionType - Type of interaction
 * @param {number} [rating] - Optional rating value for reviews
 * @returns {Promise<object>} - Updated entity object
 */

// Use transaction here only if REMOTE DB is used
// If LOCAL DB is used, transactions are not supported. Some weird replicaset problem becuase i dont know how to set up a replicaset
export const entityMetricUpdator = async (entityType, entityId, interactionType, rating=null) => 
{
    // Validate interaction type
    if (!InteractionWeights[interactionType])
        throw new Error(`Invalid interaction type: ${interactionType}`);

    // Use transaction here only if REMOTE DB is used
    // const session = await mongoose.startSession();
    // session.startTransaction();

    try
    {
        const now = new Date();
        const entityModel = entityType === "Location" ? Location : Business;
        const entity = await entityModel.findById(entityId)//.session(session);
    
        if (!entity) throw new Error(`${entityType} not found`);
    
        let newAvgRating = entity.avgRating;
    
        // Update average rating if a rating is provided and interaction type is "review"
        if(interactionType === InteractionTypes.REVIEW && rating !== null)
        {
            const entityReviews = await Review.find({ entityId: entityId });
            const avgRating = entityReviews.reduce((acc, review) => acc + review.rating, 0) / entityReviews.length;
            newAvgRating = avgRating;
        }
    
        // Calculate new heatmap score
        const newHeatmapScore = calculateHeatmapScore(entity.activityCount + InteractionWeights[interactionType], newAvgRating, now);
    
    
        const updatedEntity = await entityModel.findByIdAndUpdate(entityId, {
            $inc: { activityCount: InteractionWeights[interactionType] },
            $set: { lastInteraction: now, avgRating: newAvgRating, heatmapScore: newHeatmapScore }
        }, { new: true, runValidators: true});
        // }, { new: true, runValidators: true, session });
    
        //If entity is business update parent location metrics
        if (entityType === "Business")
        {
            const location = await Location.findById(entity.locationId);
    
            if (!location) throw new Error("Location not found");
    
            const newLocationHeatmapScore = calculateHeatmapScore(location.activityCount + InteractionWeights[interactionType] * 0.5, location.avgRating, now);
    
            await Location.findByIdAndUpdate(entity.locationId, {
                $inc: { activityCount: InteractionWeights[interactionType] * 0.5 },
                $set: { lastInteraction: now, heatmapScore: newLocationHeatmapScore }
            }, { new: true, runValidators: true});
            // }, { new: true, runValidators: true, session });
        }

        // await session.commitTransaction();
        
        return updatedEntity;
    }
    catch(error)
    {
        // await session.abortTransaction();
        throw error;
    }
    // finally
    // {
    //     session.endSession();
    // }

};