import { User, LoggedInUser } from "../../_types/users";
import { client } from "../client";
import { normalizeResponse, ApiResult } from "../utils/response";

export async function getUser(): Promise<ApiResult<User>> {
  try {
    const { data } = await client.get("/auth/me");
    return { ok: true, data };
  } catch (err: any) {
    return {
      ok: false,
      error: err.response?.data?.message 
          || err.response?.data?.error 
          || "Request failed"
    };
  }
}
