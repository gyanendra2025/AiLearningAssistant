import axios from "axios";
import { BASE_URL } from "./apiPath";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  headers: {
    Accept: "application/json",
  },
});

// request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Only set Content-Type to JSON for non-FormData requests
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
        window.location.href = "/login";
      }
    } else if (error.response?.status === 403 && error.response?.data?.code === "API_KEY_REQUIRED") {
      // No API key configured — redirect to settings
      const toast = (await import("react-hot-toast")).default;
      toast.error("Please add your API key in Settings first!", { duration: 5000 });
      if (!window.location.pathname.includes("/settings")) {
        window.location.href = "/settings";
      }
    } else if (error.response?.status === 500) {
      console.error("Internal server error, Please try again later");
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout, Please try again later");
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
