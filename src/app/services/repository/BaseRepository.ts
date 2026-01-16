import { ApiError, apiClient, type ApiRequestConfig } from "../../lib/api";
import type { IRepository } from "./IRepository";

export class BaseRepository<T> implements IRepository<T> {
  async get<R = T>(endpoint: string, options?: ApiRequestConfig): Promise<R> {
    try {
      const response = await apiClient.get<R>(endpoint, options);
      return this.normalizeResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<R = T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestConfig
  ): Promise<R> {
    try {
      const response = await apiClient.post<R>(endpoint, data, options);
      return this.normalizeResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<R = T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestConfig
  ): Promise<R> {
    try {
      const response = await apiClient.put<R>(endpoint, data, options);
      return this.normalizeResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<R = T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestConfig
  ): Promise<R> {
    try {
      const response = await apiClient.patch<R>(endpoint, data, options);
      return this.normalizeResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<R = T>(
    endpoint: string,
    options?: ApiRequestConfig
  ): Promise<R> {
    try {
      const response = await apiClient.delete<R>(endpoint, options);
      return this.normalizeResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof Error) {
      return new ApiError(error.message);
    }

    return new ApiError("An unexpected error occurred");
  }

  protected normalizeResponse<R>(response: R): R {
    return response;
  }
}

