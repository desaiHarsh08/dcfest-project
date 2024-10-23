import axios from "axios";

// Create an axios instance
export const API = axios.create({
    baseURL: import.meta.env.VITE_APP_BACKEND_URL,
    withCredentials: true
});