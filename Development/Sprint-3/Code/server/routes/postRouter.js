/*
    Filename: postRouter.js
    Author: Affan & Shahrez
*/

import express from "express";
import { createPost } from "../controllers/PostContoller/createPost.js";
import { getUserPosts, getFollowingPosts, getPostById, getAllPosts } from "../controllers/PostContoller/getPost.js";
import { updatePost, likePost } from "../controllers/PostContoller/updatePost.js";
import { deletePost } from "../controllers/PostContoller/deletePost.js";
import upload from "../middleware/multerMiddleware.js";
import { verifyToken } from "../middleware/tokenVerification.js";
import { reportPost } from "../controllers/PostContoller/reportPost.js";

const postRouter = express.Router();

// Testing routes (without middleware)
postRouter.post("/create", upload.array("media", 5), createPost);
postRouter.get("/getById", getPostById);
postRouter.get("/getUserPosts", getUserPosts);
postRouter.get("/getFollowing", getFollowingPosts);
postRouter.get("/getAll", getAllPosts);
postRouter.post("/update", updatePost);
postRouter.post("/like", likePost);
postRouter.delete("/delete", deletePost);

postRouter.post("/report", verifyToken, reportPost);

// Routes with middleware
// post_router.post("/create", verifyToken, upload.array("media",5), PostController.createPost);
// post_router.get("/getSingle", verifyToken, PostController.getSinglePost);
// post_router.get("/getUserPosts", verifyToken, PostController.getUserPosts);
// post_router.get("/getFollowing", verifyToken, PostController.getFollowingPosts);
// post_router.put("/update", verifyToken, PostController.updatePost);
// post_router.delete("/delete", verifyToken, PostController.deletePost);


export default postRouter;