import axios from "axios";

const apiClient = axios.create({
  // baseURL: process.env.REACT_APP_API_URL + "/api",
  baseURL: "http://127.0.0.1:8000/api/",
});

// Add a request interceptor to include the token in the headers
apiClient.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo?.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
