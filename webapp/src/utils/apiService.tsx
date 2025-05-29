import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api/v1", 
});

const apiService = {
  get: api.get,
  post: api.post,
  put: api.put,
  delete: api.delete,
};

export default apiService;
