export type ApiSuccess<T> = { ok: true; data: T };
export type ApiError = { ok: false; error: string };
export type ApiResult<T> = ApiSuccess<T> | ApiError;

export function normalizeResponse<T>(res: any): ApiResult<T> {
    if (res && typeof res.message === "string") {
        
        return { ok: false, error: res.message };
    }
    return { ok: true, data: res as T };
}