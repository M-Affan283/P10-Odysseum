import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../../models/User.js";
import { Report } from "../../models/Report.js";
import { Post } from "../../models/Post.js";
import { PostReport } from "../../models/PostReport.js"; // Use this for post reports

// Admin login (unchanged except for added logging)
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    console.error("Missing email or password in admin login request.");
    return res.status(400).json({
      success: false,
      message: "Missing email or password."
    });
  }
  
  try {
    console.log("Admin login attempt for:", email);
    const admin = await User.findOne({ email }).select('+password');
    if (!admin) {
      console.error("No admin found for email:", email);
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }
    if (admin.role !== "admin") {
      console.error("User is not an admin. Role:", admin.role);
      return res.status(403).json({ success: false, message: "Not an admin." });
    }
    
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.error("Password mismatch for admin with email:", email);
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }
    
    // Use your ACCESS_TOKEN_SECRET (or JWT_SECRET if you add one) for signing
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d", issuer: "odysseum-api" }  // Added issuer here
    );    
    console.log("Admin logged in successfully:", email);
    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully.",
      admin: {
        _id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role
      },
      token
    });
  } catch (error) {
    console.error("Error during admin login:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Revised getReportedReports: We now query two collections.
// 1. For reported posts, we query the PostReport collection.
// 2. For reported users, we query the Report collection.
export const getReportedReports = async (req, res) => {
  try {
    // Query post reports from PostReport collection
    const reportedPostReports = await PostReport.find()
      .populate("reportedPost")  // Ensure your PostReport model defines a field 'reportedPost'
      .populate("reportingUser", "username email")
      .sort({ createdAt: -1 });
    console.log("Number of post reports retrieved:", reportedPostReports.length);
    
    // Query user reports from Report collection
    const reportedUserReports = await Report.find()
      .populate("reportedUser", "username email")
      .populate("reportingUser", "username email")
      .sort({ createdAt: -1 });
    console.log("Number of user reports retrieved:", reportedUserReports.length);
    
    return res.json({
      success: true,
      data: { reportedPostReports, reportedUserReports }
    });
  } catch (error) {
    console.error("Error fetching reported data:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Deletion and ban functions remain similar.
export const deletePost = async (req, res) => {
  const { postId } = req.params;
  try {
    await Post.findByIdAndDelete(postId);
    // Also remove associated post reports
    await PostReport.deleteMany({ reportedPost: postId });
    return res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await User.findByIdAndDelete(userId);
    await Post.deleteMany({ creatorId: userId });
    await Report.deleteMany({ reportedUser: userId });
    return res.json({ success: true, message: "User and associated posts deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const banUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndUpdate(userId, { isDeactivated: true }, { new: true });
    return res.json({ success: true, message: "User banned successfully", user });
  } catch (error) {
    console.error("Error banning user:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const ignoreReport = async (req, res) => {
  const { reportId } = req.params;
  try {
    // First attempt: try deleting from the PostReport model (for post reports)
    let deletedReport = await PostReport.findByIdAndDelete(reportId);
    if (deletedReport) {
      return res.json({
        success: true,
        message: "Post report ignored (deleted) successfully."
      });
    }
    // Second attempt: try deleting from the Report model (for user reports)
    deletedReport = await Report.findByIdAndDelete(reportId);
    if (deletedReport) {
      return res.json({
        success: true,
        message: "User report ignored (deleted) successfully."
      });
    }
    // If not found in either collection, return a 404 error
    return res.status(404).json({
      success: false,
      message: "Report not found."
    });
  } catch (error) {
    console.error("Error ignoring report:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};