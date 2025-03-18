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
import { verifyAdminToken } from "../middleware/adminTokenVerification.js";

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

export default adminRouter;