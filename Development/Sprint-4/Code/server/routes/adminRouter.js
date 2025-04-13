import express from "express";
import { adminLogin, getReportedReports, deletePost, deleteUser, banUser } from "../controllers/AdminController/adminDash.js";
import { adminAuth } from "../middlewares/adminAuth.js";
import { ignoreReport } from "../controllers/AdminController/adminDash.js";
const router = express.Router();

// Admin login
router.post("/login", adminLogin);

// Get reported posts and user reports – protected route
router.get("/reported-posts", adminAuth, getReportedReports);

// Delete a reported post
router.delete("/delete-post/:postId", adminAuth, deletePost);

// Delete a user (and their posts)
router.delete("/delete-user/:userId", adminAuth, deleteUser);

// Ban a user (set to deactivated)
router.put("/ban-user/:userId", adminAuth, banUser);

router.delete("/ignore-report/:reportId", adminAuth, ignoreReport);

export default router;
