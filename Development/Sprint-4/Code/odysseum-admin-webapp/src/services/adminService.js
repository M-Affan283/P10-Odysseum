import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";
const API_URL = `${BASE_URL}/admin`;

const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};

const getReportedReports = async () => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    throw new Error("No admin token found in local storage.");
  }
  const response = await axios.get(`${API_URL}/reported-posts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deletePost = async (postId) => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    throw new Error("No admin token found in local storage.");
  }
  const response = await axios.delete(`${API_URL}/delete-post/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteUser = async (userId) => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    throw new Error("No admin token found in local storage.");
  }
  const response = await axios.delete(`${API_URL}/delete-user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const banUser = async (userId) => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    throw new Error("No admin token found in local storage.");
  }
  const response = await axios.put(
    `${API_URL}/ban-user/${userId}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const ignoreReport = async (reportId) => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    throw new Error("No admin token found in local storage.");
  }
  const response = await axios.delete(`${API_URL}/ignore-report/${reportId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const adminService = { login, getReportedReports, deletePost, deleteUser, banUser, ignoreReport };

export default adminService;
