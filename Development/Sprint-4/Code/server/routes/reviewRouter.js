/*
    Filename: reviewRouter.js
    Author: Affan
*/

import express from "express";
import { addReview } from "../controllers/ReviewController/addReview.js";
import { editReview, upvoteReview, downvoteReview } from "../controllers/ReviewController/updateReview.js";
import { getReviewById, getReviewsByEntity, getReviewsByUser } from "../controllers/ReviewController/getReview.js";
import { deleteReviewById } from "../controllers/ReviewController/deleteReview.js";
import upload from "../middleware/multerMiddleware.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", upload.array("media", 5), addReview);
reviewRouter.post("/edit", editReview);
reviewRouter.post("/upvote", upvoteReview);
reviewRouter.post("/downvote", downvoteReview);
reviewRouter.get("/getById", getReviewById);
reviewRouter.get("/getByEntity", getReviewsByEntity);
reviewRouter.get("/getByUser", getReviewsByUser);
reviewRouter.delete("/delete", deleteReviewById);


export default reviewRouter;