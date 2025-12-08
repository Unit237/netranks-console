import Axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type CancelTokenSource,
} from "axios";
import { Component } from "react";
import { v4 as uuid } from "uuid";
import prms from "../utils/config";
import token from "../utils/token";

export interface ConnectionConfig extends AxiosRequestConfig {
  /**
   * cancel request by cancelTokenKey
   */
  cancelTokenKey?: string;

  /**
   * screen componentId, if this is filled, requests on that screen are automatically canceled when that screen is pop
   */
  componentId?: string;
}

export interface ApiRequestConfig extends ConnectionConfig {
  setLoading?: (loading: boolean) => void;
  skipErrorToast?: boolean;
}

/**
 * Custom API Error class for better error handling
 */
export class ApiError extends Error {
  public readonly status?: number;
  public readonly response?: unknown;
  public readonly isCanceled: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    status?: number,
    response?: unknown,
    isCanceled = false,
    code?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.response = response;
    this.isCanceled = isCanceled;
    this.code = code;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, ApiError);
    }
  }
}

const axios = Axios.create({
  timeout: 60000,
  validateStatus: (_) => true,
  // Don't set responseType - let axios auto-detect so we can handle both JSON and HTML
});

axios.interceptors.request.use(async (config) => {
  if (!config.headers) {
    config.headers = {} as any;
  }

  if (!config.headers.post) {
    config.headers.post = {} as any;
  }
  if (!config.headers.put) {
    config.headers.put = {} as any;
  }
  if (!config.headers.patch) {
    config.headers.patch = {} as any;
  }
  if (!config.headers.common) {
    config.headers.common = {} as any;
  }

  config.headers.post["Content-Type"] = "application/json";
  config.headers.put["Content-Type"] = "application/json";
  config.headers.patch["Content-Type"] = "application/json";

  // Always retrieve token fresh from storage on each request
  // This ensures we have the latest token value
  const authToken = token.get();
  if (authToken) {
    // Safety check: ensure token is not HTML or invalid
    const tokenStr = String(authToken);
    if (tokenStr.trim().startsWith("<!DOCTYPE") || tokenStr.trim().startsWith("<html")) {
      console.error("Invalid token detected (HTML), skipping header");
      return config;
    }
    // Add token to common headers so it's included in all requests
    config.headers.common["token"] = authToken;
    // Also explicitly set it on the request headers as a fallback
    config.headers["token"] = authToken;
  }


  return config;
});

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only log errors in development
    if (import.meta.env.DEV) {
      const isCorsError = !error.response && (error.code === "ERR_NETWORK" || error.message?.includes("CORS"));
      if (isCorsError) {
        console.error("CORS Error:", error.message);
      }
    }
    return Promise.reject(error);
  }
);

const loading = (f?: (x: boolean) => void, isLoading?: boolean) => {
  if (!f) return;

  try {
    f(!!isLoading);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`Connection.SetLoading=${isLoading} failed`, error);
    }
  }
};

const STR_CANCEL_TOKEN_MSG = "Request canceled with cancel token";
const cancelTokens = new Map<string, CancelTokenSource>();
const screenCancelTokenKeys = new Map<string, string[]>();

function handleCancelTokens(config?: ConnectionConfig): string | null {
  const key =
    config?.cancelTokenKey || (config?.componentId ? uuid() : undefined);
  if (!key || !config) return null;

  cancelConnection(key);

  const cts = Axios.CancelToken.source();
  cancelTokens.set(key, cts);

  if (config.componentId) {
    const existingKeys = screenCancelTokenKeys.get(config.componentId) || [];
    existingKeys.push(key);
    screenCancelTokenKeys.set(config.componentId, existingKeys);
  }

  config.cancelToken = cts.token;
  return key;
}

export function cancelConnection(cancelTokenKey: string): boolean {
  const key = cancelTokenKey;
  if (!key || !cancelTokens.has(key)) return false;
  cancelTokens.get(key)?.cancel(STR_CANCEL_TOKEN_MSG);
  cancelTokens.delete(key);
  return true;
}

export function cancelScreenConnections(componentId: string): boolean {
  const hasCanceledAny =
    (screenCancelTokenKeys.get(componentId) || [])
      .map(cancelConnection)
      .filter((x) => x).length > 0;
  screenCancelTokenKeys.delete(componentId);
  return hasCanceledAny;
}

function clearJsonIds(obj: any) {
  if (obj && typeof obj === "object") {
    delete obj.$id;
    Object.values(obj).forEach(clearJsonIds);
  }
}

async function myFetch<T>(
  setLoading?: (x: boolean) => void,
  config?: ConnectionConfig
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      loading(setLoading, true);

      const cancelKey = handleCancelTokens(config);
      clearJsonIds(config?.data);

      const response = await axios.request(config || {});

      if (cancelKey) {
        cancelTokens.delete(cancelKey);
      }

      // Unauthorized
      // Note: We don't clear the token automatically on 401 errors
      // to prevent accidental token deletion. Token management should be
      // handled by the calling code or authentication flow.
      if (response.status === 401) {
        loading(setLoading, false);
        reject(new ApiError("Unauthorized", 401, response.data));
        return;
      }

      // Forbidden
      if (response.status === 403) {
        loading(setLoading, false);
        const errorMessage = response.data || "Unauthorized";
        reject(new ApiError(errorMessage, 403, response.data));
        return;
      }

      // Internal Server Error
      if (response.status === 500) {
        if (import.meta.env.DEV) {
          console.error("Internal Server Error:", response);
        }
        loading(setLoading, false);
        reject(new ApiError("Internal Server Error", 500, response.data));
        return;
      }

      if (response.status !== 200 && response.status !== 204) {
        loading(setLoading, false);
        reject(
          new ApiError(
            `HTTP Error: ${response.status} ${response.statusText}`,
            response.status,
            response.data
          )
        );
        return;
      }

      // Check if response is HTML (error page) even with 200 status
      // This can happen with production backends that return error pages
      const contentType = response.headers?.["content-type"] || response.headers?.["Content-Type"] || "";
      const responseDataStr = typeof response.data === "string" ? response.data : String(response.data || "");
      const isHtmlResponse = 
        contentType.includes("text/html") ||
        (responseDataStr.trim().startsWith("<!DOCTYPE") || 
         responseDataStr.trim().startsWith("<html"));

      if (isHtmlResponse) {
        loading(setLoading, false);
        reject(
          new ApiError(
            "Server returned an HTML error page instead of JSON data. Check browser console for details. This may indicate:\n" +
            "1. CORS issue - backend not allowing requests from this domain\n" +
            "2. Server error - backend returned error page\n" +
            "3. Wrong endpoint - URL might be incorrect",
            200, // Status is 200 but content is wrong
            response.data
          )
        );
        return;
      }

      // If response.data is a string, try to parse as JSON
      // This handles cases where axios didn't auto-parse JSON
      if (typeof response.data === "string" && responseDataStr.trim().length > 0) {
        // Skip if it looks like HTML
        if (!isHtmlResponse && (responseDataStr.trim().startsWith("{") || responseDataStr.trim().startsWith("["))) {
          try {
            const parsed = JSON.parse(responseDataStr);
            loading(setLoading, false);
            resolve(parsed as T);
            return;
          } catch (parseError) {
            if (import.meta.env.DEV) {
              console.error("Failed to parse response as JSON:", parseError);
            }
            loading(setLoading, false);
            reject(
              new ApiError(
                "Server returned invalid JSON response",
                200,
                response.data
              )
            );
            return;
          }
        }
      }

      loading(setLoading, false);
      resolve(response.data as T);
    } catch (error) {
      // Handle Axios cancel errors
      if (Axios.isCancel(error)) {
        loading(setLoading, false);
        reject(new ApiError(STR_CANCEL_TOKEN_MSG, undefined, undefined, true));
        return;
      }

      // Handle Axios errors
      if (Axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        loading(setLoading, false);

        if (axiosError.code === "ECONNABORTED") {
          reject(
            new ApiError(
              "Request timeout. Please try again.",
              undefined,
              undefined,
              false,
              axiosError.code
            )
          );
        } else if (
          axiosError.code === "ERR_NETWORK" ||
          axiosError.code === "ECONNREFUSED"
        ) {
          reject(
            new ApiError(
              "No connection. Please check your internet connection.",
              undefined,
              undefined,
              false,
              axiosError.code
            )
          );
        } else {
          reject(
            new ApiError(
              axiosError.message || "An unexpected error occurred",
              axiosError.response?.status,
              axiosError.response?.data,
              false,
              axiosError.code
            )
          );
        }
        return;
      }

      // Handle unknown errors

      loading(setLoading, false);
      reject(
        new ApiError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
          undefined,
          error
        )
      );
    }
  });
}

/**
 * Legacy connection function for backward compatibility
 */
export default function connection(
  setLoading?: (x: boolean) => {} | Component | undefined,
  config?: ConnectionConfig
) {
  const baseUrl = prms.SERVER_URL;

  return {
    get: (url: string): any => {
      return myFetch(setLoading as (x: boolean) => void, {
        ...config,
        url: baseUrl + url,
        method: "GET",
      });
    },

    post: (url: string, data: object | number | string): any => {
      // fix: public IHttpActionResult Patch(int id, [FromBody] int data) { /* ... */ }
      if (typeof data == "number") {
        data = '"' + data + '"';
      } else if (typeof data == "string") {
        data = JSON.stringify(data);
      }

      return myFetch(setLoading as (x: boolean) => void, {
        ...config,
        url: baseUrl + url,
        method: "POST",
        data,
      });
    },

    put: (id: number, url: string, data: object): any => {
      if (url.startsWith("odata")) {
        url += "(" + id + ")";
      } else {
        url += "/" + id;
      }
      return myFetch(setLoading as (x: boolean) => void, {
        ...config,
        url: baseUrl + url,
        method: "PUT",
        data,
      });
    },

    patch: (id: number, url: string, data: object | number | string): any => {
      if (url.startsWith("odata")) {
        url += "(" + id + ")";
      } else {
        url += "/" + id;
      }

      // fix: public IHttpActionResult Patch(int id, [FromBody] int data) { /* ... */ }
      if (typeof data == "number") {
        data = '"' + data + '"';
      } else if (typeof data == "string") {
        data = JSON.stringify(data);
      }

      return myFetch(setLoading as (x: boolean) => void, {
        ...config,
        url: baseUrl + url,
        method: "PATCH",
        data,
      });
    },

    delete: (id: number, url: string): any => {
      if (id != null) {
        url += "/" + id;
      }
      return myFetch(setLoading as (x: boolean) => void, {
        ...config,
        url: baseUrl + url,
        method: "DELETE",
      });
    },
  };
}

/**
 * Modern API Client class that matches the expected interface
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string | undefined) {
    // Ensure we always have a valid baseURL
    if (!baseURL || typeof baseURL !== "string") {
      if (import.meta.env.DEV) {
        console.error("Invalid baseURL provided to ApiClient, using default:", baseURL);
      }
      this.baseURL = "http://localhost:4000";
    } else {
      this.baseURL = baseURL;
    }
  }

  async get<T>(endpoint: string, options?: ApiRequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      data: this.prepareData(data),
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      data: this.prepareData(data),
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      data: this.prepareData(data),
    });
  }

  async delete<T>(endpoint: string, options?: ApiRequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  private prepareData(data?: unknown): unknown {
    if (data == null) return undefined;
    if (typeof data === "number") {
      return `"${data}"`;
    }
    if (typeof data === "string") {
      return JSON.stringify(data);
    }
    return data;
  }

  private async request<T>(
    endpoint: string,
    options: ApiRequestConfig = {}
  ): Promise<T> {
    const { setLoading, skipErrorToast, ...config } = options;
    
    // Ensure endpoint starts with / if baseURL is absolute
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    let url: string;
    
    if (this.baseURL.startsWith("http")) {
      // Absolute URL - ensure proper joining
      url = `${this.baseURL}${normalizedEndpoint}`;
    } else {
      // Relative URL for proxy - use as is
      url = `${this.baseURL}${endpoint}`;
    }
    
    // Validate URL is not invalid
    if (!url || url === "undefined" || url.includes("undefined")) {
      if (import.meta.env.DEV) {
        console.error("Invalid URL constructed:", { baseURL: this.baseURL, endpoint, url });
      }
      throw new ApiError(`Invalid API URL configuration. baseURL: ${this.baseURL}, endpoint: ${endpoint}`);
    }

    return myFetch<T>(setLoading, {
      ...config,
      url,
    });
  }
}

// Export apiClient instance for the main API
const serverUrl = prms.SERVER_URL;
if (!serverUrl && import.meta.env.DEV) {
  console.error("SERVER_URL is undefined! Using fallback localhost:4000");
}
export const apiClient = new ApiClient(serverUrl || "http://localhost:4000");

// Export brandFetchApi instance for BrandFetch API
export const brandFetchApi = new ApiClient("https://api.brandfetch.io/v2");
