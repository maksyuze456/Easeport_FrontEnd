import axios from "axios";


export const client = axios.create({
    baseURL: process.env.NEXT_PRIVATE_API_URL,
    withCredentials: true,
    timeout: 8000
});