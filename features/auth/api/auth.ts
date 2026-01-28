import { AxiosResponse } from "axios";
import { User } from "../types";
import { client } from "../../../lib/api/axiosClient";

export async function getUser(): Promise<User> {

    const { data } = await client.get("/auth/me");

    if (data?.role) {
        document.cookie = `role=${data.role}; path=/; samesite=lax`;
        console.log(document.cookie);
    };

    return <User>(data);

}

export async function signIn(username: string, password: string): Promise<AxiosResponse> {
    return client.post(
        "/auth/signin",
        { username, password }
    );
}

export async function logout(): Promise<AxiosResponse> {
    return client.post("/auth/logout");
}

