import axios from "axios";
import { auth } from "@config/firebase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to all requests
apiService.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth and network errors globally
apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === "ERR_NETWORK") {
      console.error("Network error - backend server may be down");
      throw new Error("Backend server is not available. Please try again later.");
    }
    if (error.response?.status === 401) {
      console.warn("Authentication error, signing out...");
      await auth.signOut();
    }
    return Promise.reject(error);
  }
);

export default apiService;
