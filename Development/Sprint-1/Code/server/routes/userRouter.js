/*

Filename: userRouter.js

This file contains the routes for the user-related API endpoints. It defines the routes for creating, updating, deleting, and fetching users.

Author: Affan

*/

import express from "express";
import { registerUser } from "../controllers/UserController/registerUser.js";
import { loginUser, oAuthLoginUser } from "../controllers/UserController/loginUser.js";
import { followUser } from "../controllers/UserController/followUser.js";
import { getAllUsers, getAllLocations, getUserById, getUserByUsername, getUserBySearchParams } from "../controllers/UserController/getUser.js";
import { updateUserBio } from "../controllers/UserController/updateUser.js";
import { verifyToken } from "../middleware/tokenVerification.js";


// Bookmark CRUD
import { addBookmark } from "../controllers/BookmarkController/addBookmark.js";
import { deleteBookmark } from "../controllers/BookmarkController/deleteBookmark.js";
import { readBookmark } from "../controllers/BookmarkController/readBookmark.js";

const userRouter = express.Router();

// Testing routes (without middleware)
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/login/oauth", oAuthLoginUser);
userRouter.post("/follow", followUser);
userRouter.get("/getAll", getAllUsers);
userRouter.get("/getAllLocs", getAllLocations);
userRouter.get("/getById", getUserById);
userRouter.get("/getByUsername", getUserByUsername);
userRouter.get("/search", getUserBySearchParams);
userRouter.post("/updateUserBio", updateUserBio);

// Bookmarking routes
userRouter.post("/addBookmark", addBookmark);

// user_router.post("/update", updateUser);
// Routes with middleware (login and register do not require jwt middleware)
// user_router.post("/register", UserController.registerUser);
// user_router.post("/login", UserController.loginUser);
// user_router.post("/follow", verifyToken, UserController.followUser);
// user_router.get("/getAll", verifyToken, UserController.getAllUsers);
// user_router.get("/getById", verifyToken, UserController.getUserById);
// user_router.get("/getByUsername", verifyToken, UserController.getUserByUsername);
// user_router.get("/search", verifyToken, UserController.getUserBySearchParams);
// user_router.post("/update", verifyToken, UserController.updateUser);

export default userRouter;