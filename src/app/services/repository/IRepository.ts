import type { ApiRequestConfig } from "../../lib/api";
import { ApiError } from "../../lib/api";

export interface IRepository<T> {
  get<R = T>(endpoint: string, options?: ApiRequestConfig): Promise<R>;
  post<R = T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestConfig
  ): Promise<R>;
  put<R = T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestConfig
  ): Promise<R>;
  patch<R = T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestConfig
  ): Promise<R>;
  delete<R = T>(endpoint: string, options?: ApiRequestConfig): Promise<R>;

  // Error handling contract for consistent repository errors.
  handleError(error: unknown): ApiError;
}

