import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_API_URL || "https://nhom5-newskyenglish.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Interceptor log lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const userService = {
  // GET /users
  getAll: () => api.get("/users").then((res) => res.data),

  // GET /users/:id
  getById: (id) => api.get(`/users/${id}`).then((res) => res.data),

  // POST /users
  create: (data) => api.post("/users", data).then((res) => res.data),

  // PUT /users/:id
  update: (id, data) =>
    api.put(`/users/${id}`, data).then((res) => res.data),

  // DELETE /users/:id
  delete: (id) => api.delete(`/users/${id}`).then((res) => res.data),
};
