/*

Filename: userRouter.js

This file contains the routes for the user-related API endpoints. It defines the routes for creating, updating, deleting, and fetching users.

Author: Affan & Shahrez

*/

import express from "express";
import { registerUser } from "../controllers/UserController/registerUser.js";
import { loginUser, oAuthLoginUser } from "../controllers/UserController/loginUser.js";
import { followUser } from "../controllers/UserController/followUser.js";
import { getAllUsers, getUserById, getUserByUsername, searchUser, getFollowingUsers } from "../controllers/UserController/getUser.js";
import { updateUserBio } from "../controllers/UserController/updateUser.js";
import { reportUser } from "../controllers/UserController/reportUser.js";
import { updateUserUsername } from "../controllers/UserController/updateUser.js";
import { updateUserPassword } from "../controllers/UserController/updateUser.js";

// Bookmark CRUD
import { bookmarkLocation } from "../controllers/BookmarkController/addBookmark.js";
import { getUserLocationBookmarks,getUserBusinessBookmarks } from "../controllers/BookmarkController/getBookmark.js";

import { verifyToken } from "../middleware/tokenVerification.js";
import { refreshToken } from "../controllers/UserController/refreshToken.js";

const userRouter = express.Router();

// Auth routes 
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/login/oauth", oAuthLoginUser);
userRouter.post("/refresh-token", refreshToken); 

// Testing routes (without middleware)
userRouter.post("/follow", followUser);
userRouter.get("/getAll", getAllUsers);
userRouter.get("/getById", getUserById);
userRouter.get("/getByUsername", getUserByUsername);
userRouter.get("/search", searchUser);
userRouter.get("/getFollowing", getFollowingUsers);
userRouter.post("/updateUserBio", updateUserBio);
userRouter.post("/updateUserUsername", updateUserUsername);
userRouter.post("/updateUserPassword", updateUserPassword);
userRouter.post("/report", reportUser);

// Bookmarking routes
userRouter.post("/addBookmark", bookmarkLocation);
userRouter.get("/getLocationBookmarks", getUserLocationBookmarks);
userRouter.get("/getBusinessBookmarks", getUserBusinessBookmarks);

// Routes with middleware (commented for reference)
// user_router.post("/follow", verifyToken, UserController.followUser);
// user_router.get("/getAll", verifyToken, UserController.getAllUsers);
// user_router.get("/getById", verifyToken, UserController.getUserById);
// user_router.get("/getByUsername", verifyToken, UserController.getUserByUsername);
// user_router.get("/search", verifyToken, UserController.getUserBySearchParams);
// user_router.post("/update", verifyToken, UserController.updateUser);

export default userRouter;