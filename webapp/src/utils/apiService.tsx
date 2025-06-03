import axios from "axios";
import { auth } from "../firebase"; // adjust path if needed

const api = axios.create({
  baseURL: "http://localhost:5001/api/v1",
});

// Add a request interceptor to attach the Firebase ID token
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const apiService = {
  get: api.get,
  post: api.post,
  put: api.put,
  delete: api.delete,
};

export default apiService;
