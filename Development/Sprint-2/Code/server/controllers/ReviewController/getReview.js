/*
    Filename: getReview.js
    Author: Affan
*/

import { Review } from "../../models/Review.js";
import { User } from "../../models/User.js";

const getReviewById = async (req, res) => 
{

    const { reviewId } = req.query;

    try 
    {
        //get review by id along with creator details and the type of entity being reviewed (Location or Business)
        const review = await Review.findById(reviewId).populate('creatorId').populate({ path: 'entityId' });

        if (!review) return res.status(404).json({ message: "Review not found" });

        res.status(200).json({ 
            message: "Review found",
            review: review
        });
    }
    catch (error)
    {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getReviewsByEntity = async (req, res) =>
{
    const { entityType, entityId, page=1 } = req.query;

    let limit = 10;

    try
    {
        const skip = (page - 1) * limit;
        //get all reviews for a specific entity
        const reviews = await Review.find({ entityType, entityId }).populate('creatorId').sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

        const totalReviews = await Review.countDocuments({ entityType, entityId });


        res.status(200).json({ 
            message: "Reviews found",
            reviews: reviews,
            currentPage: Number(page),
            totalPages: Math.ceil(totalReviews / limit)
        });
    }
    catch (error)
    {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { getReviewById, getReviewsByEntity };