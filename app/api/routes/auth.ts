import { useQuery } from "@tanstack/react-query";
import { User, LoggedInUser } from "../../_types/users";
import { client } from "../client";
import { normalizeResponse, ApiResult } from "../utils/response";

export async function getUser(): Promise<User | null> {
  try {
    const { data } = await client.get("/auth/me");
    return data as User;
  } catch (err) {
    return null; 
  }
}

export function useAuth() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: getUser,
    retry: false,
  });
}
