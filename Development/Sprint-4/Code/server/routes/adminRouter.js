/*
    Filename: adminRouter.js
    Author: Shahrez
    Description: Router for admin-specific API endpoints
*/
import express from "express";
import { adminLogin } from "../controllers/AdminController/adminLogin.js";
import { adminRefreshToken } from "../controllers/AdminController/adminRefreshToken.js";
import { adminLogout } from "../controllers/AdminController/adminLogout.js";
import { getDashboardStats } from "../controllers/AdminController/getDashboardStats.js";
import { getUserReports } from "../controllers/AdminController/getUserReports.js";
import { getUserReportDetails } from "../controllers/AdminController/getUserReportDetails.js";
import { getPostReports } from "../controllers/AdminController/getPostReports.js";
import { getPostReportDetails } from "../controllers/AdminController/getPostReportDetails.js";
import { updateReportStatus } from "../controllers/AdminController/updateReportStatus.js";
import { deleteReportedUser } from "../controllers/AdminController/deleteReportedUser.js";
import { deleteReportedPost } from "../controllers/AdminController/deleteReportedPost.js";
import { getUsers } from "../controllers/AdminController/getUsers.js";
import { getUserDetails } from "../controllers/AdminController/getUserDetails.js";
import { deleteUserPost } from "../controllers/AdminController/deleteUserPost.js";
import { deleteUserComment } from "../controllers/AdminController/deleteUserComment.js";
import { updateUserRole } from "../controllers/AdminController/updateUserRole.js";
import { banUser } from "../controllers/AdminController/banUser.js";
import { getLocations } from "../controllers/AdminController/getLocations.js";
import { getLocationDetails } from "../controllers/AdminController/getLocationDetails.js";
import { createLocation } from "../controllers/AdminController/createLocation.js";
import { updateLocation } from "../controllers/AdminController/updateLocation.js";
import { deleteLocation } from "../controllers/AdminController/deleteLocation.js";
import { getPosts } from "../controllers/AdminController/getPosts.js";
import { getPostDetails } from "../controllers/AdminController/getPostDetails.js";
import { deletePost } from "../controllers/AdminController/deletePost.js";
import { deleteComment } from "../controllers/AdminController/deleteComment.js";
import { getApprovedBusinesses } from "../controllers/AdminController/getApprovedBusinesses.js";
import { getPendingBusinesses } from "../controllers/AdminController/getPendingBusinesses.js";
import { getBusinessDetails } from "../controllers/AdminController/getBusinessDetails.js";
import { updateBusinessStatus } from "../controllers/AdminController/updateBusinessStatus.js";
import { verifyAdminToken } from "../middlewares/adminTokenVerification.js";


const adminRouter = express.Router();

// Public admin routes (no auth required)
adminRouter.post("/auth/login", adminLogin);
adminRouter.post("/auth/refresh-token", adminRefreshToken);

// Protected admin routes (require admin authentication)
adminRouter.use(verifyAdminToken);  // Apply admin verification middleware to all routes below

adminRouter.post("/auth/logout", adminLogout);
adminRouter.get("/dashboard/stats", getDashboardStats);

// Report management routes
adminRouter.get("/reports/users", getUserReports);
adminRouter.get("/reports/users/:reportId", getUserReportDetails);
adminRouter.get("/reports/posts", getPostReports);
adminRouter.get("/reports/posts/:reportId", getPostReportDetails);
adminRouter.post("/reports/update-status", updateReportStatus);
adminRouter.post("/reports/delete-user", deleteReportedUser);
adminRouter.post("/reports/delete-post", deleteReportedPost);

// Business management routes - consolidated directly in adminRouter
adminRouter.get("/businesses/approved", getApprovedBusinesses);
adminRouter.get("/businesses/pending", getPendingBusinesses);
adminRouter.get("/businesses/:businessId", getBusinessDetails);
adminRouter.post("/businesses/update-status", updateBusinessStatus);

// User management routes
adminRouter.get("/users", getUsers);
adminRouter.get("/users/:userId", getUserDetails);
adminRouter.delete("/users/posts/:postId", deleteUserPost);
adminRouter.delete("/users/comments/:commentId", deleteUserComment);
adminRouter.post("/users/:userId/ban", banUser);
adminRouter.post("/users/:userId/role", updateUserRole);

// Location management routes
adminRouter.get("/locations", getLocations);
adminRouter.get("/locations/:locationId", getLocationDetails);
adminRouter.post("/locations", createLocation);
adminRouter.put("/locations/:locationId", updateLocation);
adminRouter.delete("/locations/:locationId", deleteLocation);

// Post management routes
adminRouter.get("/posts", getPosts);
adminRouter.get("/posts/:postId", getPostDetails);
adminRouter.delete("/posts/:postId", deletePost);
adminRouter.delete("/comments/:commentId", deleteComment);

adminRouter.get("/business-list/approved", verifyAdminToken, getApprovedBusinesses);


export default adminRouter;