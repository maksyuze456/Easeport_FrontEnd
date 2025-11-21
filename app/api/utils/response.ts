export type ApiSuccess<T> = { ok: true; data: T };
export type ApiError = { ok: false; error: string };
export type ApiResult<T> = ApiSuccess<T> | ApiError;

export function normalizeResponse<T>(res: any, status?: number): ApiResult<T> {
  if (status && status >= 400) {
    return {
      ok: false,
      error: res?.message || "Request failed"
    };
  }
    return { ok: true, data: res as T };
}