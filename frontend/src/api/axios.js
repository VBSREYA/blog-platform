import axios from "axios";

const API = axios.create({
  baseURL: "https://blog-platform-qwcc.onrender.com/api",
});

API.interceptors.request.use(
  (config) => {
    const isAuthRequest =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register");

    if (isAuthRequest) {
      return config;
    }

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

export default API;
