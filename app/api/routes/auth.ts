import { useQuery } from "@tanstack/react-query";
import { User } from "../../_types/users";
import { client } from "../client";


export async function getUser(): Promise<User | null> {
  try {
    const { data } = await client.get("/auth/me");
    console.log(data);
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
