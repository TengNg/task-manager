import axios from "axios";

const BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const axiosPrivate = axios.create({
    baseURL: `${BASE_URL}`,
    withCredentials: true, // private route
    headers: { 'Content-Type': 'application/json' }
});

