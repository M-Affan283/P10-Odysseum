/*

Filename: postRouter.js

This file contains the routes for the post-related API endpoints. It defines the routes for creating, updating, deleting, and fetching posts.

Author: Affan

*/

import express from "express";
import { createPost } from "../controllers/PostContoller/createPost.js";
import { getUserPosts, getFollowingPosts, getSinglePost } from "../controllers/PostContoller/getPost.js";
import { updatePost } from "../controllers/PostContoller/updatePost.js";
import { deletePost } from "../controllers/PostContoller/deletePost.js";
import upload from "../middleware/multerMiddleware.js";
import { verifyToken } from "../middleware/tokenVerification.js";

const post_router = express.Router();

// Testing routes (without middleware)
post_router.post("/create", upload.array("media", 5), createPost);
post_router.get("/getSingle", getSinglePost);
post_router.get("/getUserPosts", getUserPosts);
post_router.get("/getFollowingPosts", getFollowingPosts);
post_router.post("/update", updatePost);
post_router.delete("/delete", deletePost);

// Routes with middleware
// post_router.post("/create", verifyToken, upload.array("media",5), PostController.createPost);
// post_router.get("/getSingle", verifyToken, PostController.getSinglePost);
// post_router.get("/getUserPosts", verifyToken, PostController.getUserPosts);
// post_router.get("/getFollowingPosts", verifyToken, PostController.getFollowingPosts);
// post_router.put("/update", verifyToken, PostController.updatePost);
// post_router.delete("/delete", verifyToken, PostController.deletePost);


export default post_router;