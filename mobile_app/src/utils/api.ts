import { BASE_URL } from "@/src/constants/auth/auth";
import axios from "axios";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
});

// Helper for POST
export const post = (url: string, data?: any, config?: any) =>
    api.post(url, data, config).then(res => res.data);

// Helper for GET with optional auth
export const get = (url: string, config?: any) =>
    api.get(url, config).then(res => res.data);

export default api;