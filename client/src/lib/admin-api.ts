import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";

const baseURL = import.meta.env.VITE_API_URL;
console.log("Admin API Base URL:", baseURL);

const adminApi = axios.create({
  baseURL: baseURL,
});

adminApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  console.log("Admin API Request:", {
    method: config.method,
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
  });
  
  const token = localStorage.getItem("elorie_admin_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: { response?: { status?: number } }) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("elorie_admin_token");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default adminApi;
