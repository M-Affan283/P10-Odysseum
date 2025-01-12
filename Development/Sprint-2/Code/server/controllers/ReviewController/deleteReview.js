/*
    Filename: deleteReview.js
    Author: Affan
*/

import { Review } from "../../models/Review.js";
import { User } from "../../models/User.js";

const deleteReviewById = async (req, res) =>
{
    const { reviewerId,reviewId } = req.query;

    if (!reviewId) return res.status(400).json({ message: "Review ID is required" });

    try
    {
        const reviewer = await User.findById(reviewerId);

        if(!reviewer) return res.status(404).json({ message: "User not found" });

        
        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Review not found" });
        
        if(reviewer.role !== "admin" || reviewer._id !== review.creatorId) return res.status(403).json({ message: "Unauthorized" });

        await review.remove();

        res.status(200).json({ message: "Review deleted successfully" });
    }
    catch (error)
    {
        res.status(500).json({ message: error.message });
    }
}

const deleteUserReviews = async (req, res) =>
{
    
}