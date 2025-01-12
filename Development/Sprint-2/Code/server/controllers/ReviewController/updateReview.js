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

        if (reviewContent) review.content = reviewContent;

        if (rating !== null) review.rating = rating;

        await review.save();

        res.status(200).json({ message: "Review updated successfully", review });
    } 
    catch (error)
    {
        console.log(error);
        res.status(500).json({ message: "Server error", error });
    }
}

const upvoteReview = async (req, res) =>
{
    const { reviewId } = req.body;

    try
    {
        const review = await Review.findByIdAndUpdate(
            reviewId,
            { $inc: { upvotes: 1 } },
            { new: true } // Return the updated document
        );

        if (!review) return res.status(404).json({ message: "Review not found" });

        res.status(200).json({ message: "Review upvoted successfully", review });
    }
    catch (error)
    {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const downvoteReview = async (req, res) =>
{
    const { reviewId } = req.body;

    try
    {
        const review = await Review.findByIdAndUpdate(
            reviewId,
            { $inc: { downvotes: 1 } },
            { new: true } // Return the updated document
        );

        if (!review) return res.status(404).json({ message: "Review not found" });

        review.downvotes += 1;
        await review.save();

        res.status(200).json({ message: "Review downvoted successfully", review });
    }
    catch (error)
    {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { editReview, upvoteReview, downvoteReview };