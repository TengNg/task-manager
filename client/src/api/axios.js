import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api` || "http://localhost:3001/api";

export const axiosPrivate = axios.create({
    baseURL: `${BASE_URL}`,
    withCredentials: true, // private route -> this will send cookies to server when request is made
    headers: { "Content-Type": "application/json" },
});
