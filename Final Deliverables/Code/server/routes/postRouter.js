import express from "express";
import { createPost } from "../controllers/PostContoller/createPost.js";
import { getUserPosts, getFollowingPosts, getPostById, getAllPosts, getPostsByLocation } from "../controllers/PostContoller/getPost.js";
import { updatePost, likePost } from "../controllers/PostContoller/updatePost.js";
import { deletePost } from "../controllers/PostContoller/deletePost.js";
import upload from "../middlewares/multerMiddleware.js";
import { verifyToken } from "../middlewares/tokenVerification.js";
import { reportPost } from "../controllers/PostContoller/reportPost.js";

const postRouter = express.Router();

postRouter.post("/create", upload.array("media", 5), createPost);
postRouter.get("/getById", getPostById);
postRouter.get("/getUserPosts", getUserPosts);
postRouter.get("/getFollowing", getFollowingPosts);
postRouter.get("/getAll", getAllPosts);
// New endpoint that filters posts by location and by followed users.
postRouter.get("/getByLocation", getPostsByLocation);

postRouter.post("/update", updatePost);
postRouter.post("/like", likePost);
postRouter.delete("/delete", deletePost);
postRouter.post("/report", reportPost);

export default postRouter;
