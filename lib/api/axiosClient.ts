import axios from "axios";

const url = process.env.NEXT_PUBLIC_API_URL;

export const client = axios.create({
    baseURL: url + "/api",
    withCredentials: true,
    timeout: 8000
});