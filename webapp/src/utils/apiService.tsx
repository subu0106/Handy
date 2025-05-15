import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Adjust if needed
});

const apiService = {
  get: api.get,
  post: api.post,
  put: api.put,
  delete: api.delete,
};

export default apiService;
