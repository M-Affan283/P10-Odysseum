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
    const { reviewId, userId } = req.body;

    try
    {
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ message: "User not found" });

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Review not found" });

        // Check if the user has already upvoted the review
        if (review.upvotes.includes(userId)) return res.status(400).json({ message: "You have already upvoted this review" });

        review.upvotes.push(userId);

        const downvoteIndex = review.downvotes.indexOf(userId);
        if (downvoteIndex !== -1) review.downvotes.splice(downvoteIndex, 1);

        await review.save();

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
    const { reviewId, userId } = req.body;

    try
    {
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ message: "User not found" });

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Review not found" });

        // Check if the user has already downvoted the review
        if (review.downvotes.includes(userId)) return res.status(400).json({ message: "You have already downvoted this review" });

        review.downvotes.push(userId);

        const upvoteIndex = review.upvotes.indexOf(userId);
        if (upvoteIndex !== -1) review.upvotes.splice(upvoteIndex, 1);
        

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