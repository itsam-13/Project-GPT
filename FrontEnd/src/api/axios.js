import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://project-gpt-csdk.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauthorized automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear local auth
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
