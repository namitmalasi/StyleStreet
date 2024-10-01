import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.mode === "development" ? "http://localhost:600/api" : "/api",
  withCredentials: true,
});

export default axiosInstance;
