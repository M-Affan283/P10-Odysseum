import React, { useEffect, useState } from "react";
import adminService from "../services/adminService";
import ReportedPostsList from "../components/ReportedPostsList";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [reportedPosts, setReportedPosts] = useState([]);
  const [reportedUsers, setReportedUsers] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      console.error("No admin token found. Redirecting to login.");
      navigate("/login");
    } else {
      fetchReports();
    }
  }, [navigate]);

  const fetchReports = async () => {
    try {
      const response = await adminService.getReportedReports();
      console.log("Fetched reports response:", response);
      if (response.success) {
        const { reportedPostReports, reportedUserReports } = response.data;
        console.log("Reported posts count:", reportedPostReports.length);
        console.log("Reported users count:", reportedUserReports.length);
        setReportedPosts(reportedPostReports || []);
        setReportedUsers(reportedUserReports || []);
      } else {
        console.error("API error:", response.message);
        setError("Failed to fetch reported data from server.");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Error fetching reported data: " + err.message);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const res = await adminService.deletePost(postId);
      if (res.success) {
        fetchReports();
      } else {
        console.error("Delete post failed:", res.message);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleIgnoreReport = async (reportId) => {
    try {
      const res = await adminService.ignoreReport(reportId);
      if (res.success) {
        fetchReports();
      } else {
        console.error("Ignore report failed:", res.message);
      }
    } catch (error) {
      console.error("Error ignoring report:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const res = await adminService.deleteUser(userId);
      if (res.success) {
        fetchReports();
      } else {
        console.error("Delete user failed:", res.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      const res = await adminService.banUser(userId);
      if (res.success) {
        fetchReports();
      } else {
        console.error("Ban user failed:", res.message);
      }
    } catch (error) {
      console.error("Error banning user:", error);
    }
  };

  // Handler specifically for ignoring a reported user (if needed, you can combine it with ignoreReport)
  const handleIgnoreUserReport = async (reportId) => {
    try {
      const res = await adminService.ignoreReport(reportId);
      if (res.success) {
        fetchReports();
      } else {
        console.error("Ignore user report failed:", res.message);
      }
    } catch (error) {
      console.error("Error ignoring user report:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}
      
      <h2>Reported Posts</h2>
      {reportedPosts && reportedPosts.length > 0 ? (
        <ReportedPostsList
          reports={reportedPosts}
          onDeletePost={handleDeletePost}
          onIgnoreReport={handleIgnoreReport}
        />
      ) : (
        <p>No reported posts found. (Check console logs for details.)</p>
      )}
      
      <h2>Reported Users</h2>
      {reportedUsers && reportedUsers.length > 0 ? (
        reportedUsers.map((report) => (
          <div
            key={report._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <p>
              <strong>User:</strong>{" "}
              {report.reportedUser ? report.reportedUser.username : "Unknown"}
            </p>
            <p>
              <strong>Email:</strong>{" "}
              {report.reportedUser ? report.reportedUser.email : "Unknown"}
            </p>
            <p>
              <strong>Reason:</strong> {report.reason}
            </p>
            <div>
              <button onClick={() => handleDeleteUser(report.reportedUser._id)}>
                Delete User
              </button>
              <button onClick={() => handleBanUser(report.reportedUser._id)} style={{ marginLeft: "10px" }}>
                Ban User
              </button>
              <button onClick={() => handleIgnoreUserReport(report._id)} style={{ marginLeft: "10px" }}>
                Ignore Report
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No reported users found. (Check console logs for details.)</p>
      )}
    </div>
  );
};

export default AdminDashboard;
