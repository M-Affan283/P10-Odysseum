/*
    Filename: reviewRouter.js
    Author: Affan
*/

import express from "express";
import { addReview } from "../controllers/ReviewController/addReview.js";
import { editReview, upvoteReview, downvoteReview } from "../controllers/ReviewController/updateReview.js";
import { getReviewById, getReviewsByEntity, getReviewsByUser } from "../controllers/ReviewController/getReview.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", addReview);
reviewRouter.post("/edit", editReview);
reviewRouter.post("/upvote", upvoteReview);
reviewRouter.post("/downvote", downvoteReview);
reviewRouter.get("/getById", getReviewById);
reviewRouter.get("/getByEntity", getReviewsByEntity);
reviewRouter.get("/getByUser", getReviewsByUser);


export default reviewRouter;