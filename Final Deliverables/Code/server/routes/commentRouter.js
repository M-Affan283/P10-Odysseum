/*
Filenmame: commentRouter.js
Author: Affan
*/

import express from "express";
import {addReplyComment, addTopComment} from "../controllers/CommentController/addComment.js";
import {getCommentById, getCommentsByPostId} from "../controllers/CommentController/getComment.js";
import { deleteSingleComment } from "../controllers/CommentController/deleteComment.js";
import { verifyToken } from "../middlewares/tokenVerification.js";

const commentRouter = express.Router();

// Testing routes (without middleware)
commentRouter.post("/addTopComment", addTopComment);
commentRouter.post("/addReplyComment", addReplyComment);
commentRouter.get("/getByPostId", getCommentsByPostId);
commentRouter.get("/getById", getCommentById);
commentRouter.delete("/delete", deleteSingleComment);

// Routes with middleware
// commentRouter.post("/addTopComment", verifyToken, CommentController.addTopComment);
// commentRouter.post("/addReplyComment", verifyToken, CommentController.addReplyComment);
// commentRouter.get("/getByPostId", verifyToken, CommentController.getCommentsByPostId);
// commentRouter.get("/getById", verifyToken, CommentController.getCommentById);
// commentRouter.delete("/delete", verifyToken, CommentController.deleteSingleComment);

export default commentRouter;