/*
    Filename: updateReview.js
    Author: Affan
*/


import { Review } from "../../models/Review.js";
import { User } from "../../models/User.js";


const editReview = async (req, res) =>
{
    const { creatorId, reviewId, reviewContent='', rating=null } = req.body;
    
    try
    {
        const creator = await User.findById(creatorId);
        if (!creator)return res.status(404).json({ message: "User not found" });

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Review not found" });

        if (review.creatorId.toString() !== creatorId) return res.status(401).json({ message: "You are not authorized to edit this review" });

        // Update the review fields
        const updateFields = {};
        if (reviewContent) updateFields.content = reviewContent;
        if (rating !== null) updateFields.rating = rating;

        // Update the review without loading it into memory
        const updatedReview = await Review.findOneAndUpdate(
            { _id: reviewId },
            { $set: updateFields },
            { new: true }  // Return the updated document
        );

        res.status(200).json({ message: "Review updated successfully", review: updatedReview });

    } 
    catch (error)
    {
        console.log(error);
        res.status(500).json({ message: "Server error", error });
    }
}

const upvoteReview = async (req, res) =>
{
    const { reviewId, userId } = req.body;

    try
    {
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ message: "User not found" });

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Review not found" });

        // Check if the user has already upvoted the review
        if (review.upvotes.includes(userId)) {
            // Remove the upvote
            await Review.updateOne({ _id: reviewId },{$pull: { upvotes: userId },});

            return res.status(200).json({ message: "Upvote removed" });
        }
        
        // Otherwise, add the upvote and remove the downvote if the user has downvoted
        await Review.updateOne(
            { _id: reviewId },
            {
                $addToSet: { upvotes: userId },  // Add to upvotes if not already there
                $pull: { downvotes: userId },  // Remove from downvotes if the user has downvoted
            }
        );

        res.status(200).json({ message: "Upvote Added" });
    }
    catch (error)
    {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const downvoteReview = async (req, res) =>
{
    const { reviewId, userId } = req.body;

    try
    {
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ message: "User not found" });

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Review not found" });

        // Check if the user has already downvoted the review
        if (review.downvotes.includes(userId))
        {
            // Remove the downvote
            await Review.updateOne({ _id: reviewId },{$pull: { downvotes: userId },});

            return res.status(200).json({ message: "Downvote removed" });
        }

        // otherwise, add the downvote
        await Review.updateOne(
            { _id: reviewId },
            {
                $addToSet: { downvotes: userId },  // Add to downvotes if not already there
                $pull: { upvotes: userId },  // Remove from upvotes if the user has upvoted
            }
        );

        res.status(200).json({ message: "Downvote Added" });
    }
    catch (error)
    {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { editReview, upvoteReview, downvoteReview };