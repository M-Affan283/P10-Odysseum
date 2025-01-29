/*
    Filename: deleteReview.js
    Author: Affan
*/

import { Review } from "../../models/Review.js";
import { User } from "../../models/User.js";
import { deleteFiles } from "../../services/firebaseService.js";

const deleteReviewById = async (req, res) =>
{
    const { reviewerId,reviewId } = req.query;

    if (!reviewId) return res.status(400).json({ message: "Review ID is required" });

    try
    {
        const reviewer = await User.findById(reviewerId);

        if(!reviewer) return res.status(404).json({ message: "User not found" });
        if(reviewer.role !== "admin" || reviewer._id !== review.creatorId) return res.status(403).json({ message: "Unauthorized" });
        
        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Review not found" });
        
        if(review.imageUrls.length > 0)
        {
            await deleteFiles(review.imageUrls);
        }

        await review.deleteOne();

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