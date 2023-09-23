import axios from "axios";

const BASE_URL = "http://localhost:3001";

export default axios.create({
    baseURL: `${BASE_URL}`,
    withCredentials: true, // private route
    headers: { 'Content-Type': 'application/json' }
});

export const testAxios = axios.create({
    baseURL: `${BASE_URL}/test`,
});

export const axiosPrivate = axios.create({
    baseURL: `${BASE_URL}`,
    withCredentials: true, // private route
    headers: { 'Content-Type': 'application/json' }
});

