import axios from "axios";

const url = process.env.NEXT_PUBLIC_URL

export const client = axios.create({
    baseURL: url,
    withCredentials: true,
    timeout: 8000
});