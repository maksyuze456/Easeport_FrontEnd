import { useQuery } from "@tanstack/react-query";
import { User } from "../../_types/users";
import { client } from "../client";


export async function getUser(): Promise<User> {

  const { data } = await client.get("/auth/me");

  if (data?.role) {
    document.cookie = `role=${data.role}; path=/; samesite=lax`;
    console.log(document.cookie);
  };

  return <User>(data);

}

export function useAuth() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: getUser,
    retry: false,
  });
}
