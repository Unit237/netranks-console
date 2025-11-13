import { v4 as uuid } from "uuid";
import token from "../utils/token";

export interface ApiRequestOptions extends RequestInit {
  cancelTokenKey?: string;
  componentId?: string;
  setLoading?: (loading: boolean) => void;
}

const STR_CANCEL_TOKEN_MSG = "Request canceled with cancel token";
const cancelControllers = new Map<string, AbortController>();
const screenCancelTokenKeys = new Map<string, string[]>();

function setLoadingState(
  fn?: ((loading: boolean) => void) | null,
  isLoading?: boolean
): void {
  if (!fn) return;

  try {
    fn(!!isLoading);
  } catch (error) {
    console.log(`ApiClient.setLoading=${isLoading} failed`, error);
  }
}

function clearJsonIds(value: unknown): void {
  if (!value || typeof value !== "object") return;

  if (Array.isArray(value)) {
    value.forEach(clearJsonIds);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = value as Record<string, any>;
  delete obj.$id;
  Object.values(obj).forEach(clearJsonIds);
}

function prepareBody(data: unknown): BodyInit | undefined {
  if (data == null) return undefined;

  if (typeof data === "number") {
    return `"${data}"`;
  }

  if (typeof data === "string") {
    return JSON.stringify(data);
  }

  if (
    (typeof FormData !== "undefined" && data instanceof FormData) ||
    (typeof Blob !== "undefined" && data instanceof Blob) ||
    (typeof URLSearchParams !== "undefined" && data instanceof URLSearchParams)
  ) {
    return data;
  }

  clearJsonIds(data);
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.warn("ApiClient.prepareBody JSON stringify failed", error);
    return undefined;
  }
}

function normalizeHeaders(headersInit?: HeadersInit): Record<string, string> {
  const headers: Record<string, string> = {};

  if (!headersInit) {
    return headers;
  }

  if (headersInit instanceof Headers) {
    headersInit.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }

  if (Array.isArray(headersInit)) {
    headersInit.forEach(([key, value]) => {
      headers[key] = value;
    });
    return headers;
  }

  Object.entries(headersInit).forEach(([key, value]) => {
    if (typeof value === "string") {
      headers[key] = value;
    }
  });

  return headers;
}

function removeKeyFromAllComponents(cancelTokenKey: string): void {
  for (const [componentId, keys] of screenCancelTokenKeys.entries()) {
    const filtered = keys.filter((key) => key !== cancelTokenKey);
    if (filtered.length) {
      screenCancelTokenKeys.set(componentId, filtered);
    } else {
      screenCancelTokenKeys.delete(componentId);
    }
  }
}

export function cancelRequest(cancelTokenKey: string): boolean {
  if (!cancelTokenKey) return false;

  const controller = cancelControllers.get(cancelTokenKey);
  if (!controller) {
    removeKeyFromAllComponents(cancelTokenKey);
    return false;
  }

  cancelControllers.delete(cancelTokenKey);
  removeKeyFromAllComponents(cancelTokenKey);
  controller.abort(STR_CANCEL_TOKEN_MSG);
  return true;
}

export function cancelScreenRequests(componentId: string): boolean {
  const keys = screenCancelTokenKeys.get(componentId) || [];

  const cancelledAny = keys.map(cancelRequest).some(Boolean);
  screenCancelTokenKeys.delete(componentId);

  return cancelledAny;
}

function registerController(
  cancelTokenKey: string | undefined,
  componentId: string | undefined,
  controller: AbortController
): string | null {
  const key = cancelTokenKey || (componentId ? uuid() : undefined);
  if (!key) return null;

  cancelRequest(key);

  cancelControllers.set(key, controller);

  if (componentId) {
    const keys = screenCancelTokenKeys.get(componentId) || [];
    keys.push(key);
    screenCancelTokenKeys.set(componentId, keys);
  }

  return key;
}

function cleanupKey(cancelTokenKey: string | null): void {
  if (!cancelTokenKey) return;
  cancelControllers.delete(cancelTokenKey);
  removeKeyFromAllComponents(cancelTokenKey);
}

function linkSignals(
  externalSignal: AbortSignal | null | undefined,
  controller: AbortController
): void {
  if (!externalSignal) return;

  if (externalSignal.aborted) {
    controller.abort(externalSignal.reason ?? STR_CANCEL_TOKEN_MSG);
    return;
  }

  externalSignal.addEventListener(
    "abort",
    () => controller.abort(externalSignal.reason ?? STR_CANCEL_TOKEN_MSG),
    { once: true }
  );
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: prepareBody(data),
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: prepareBody(data),
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: prepareBody(data),
    });
  }

  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  private async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const { cancelTokenKey, componentId, setLoading, signal, ...rest } =
      options;
    const fetchOptions: RequestInit = { ...rest };
    const headers = normalizeHeaders(rest.headers);
    const method = (fetchOptions.method || "GET").toUpperCase();

    const controller = new AbortController();
    const cancelKey = registerController(
      cancelTokenKey,
      componentId,
      controller
    );

    linkSignals(signal, controller);
    fetchOptions.signal = controller.signal;

    const authToken = token.get();
    if (authToken) {
      headers.token = authToken;
    }

    const hasContentType = Object.keys(headers).some(
      (key) => key.toLowerCase() === "content-type"
    );

    if (
      !hasContentType &&
      ["POST", "PUT", "PATCH"].includes(method) &&
      typeof fetchOptions.body === "string"
    ) {
      headers["Content-Type"] = "application/json";
    }

    fetchOptions.headers = headers;

    setLoadingState(setLoading, true);

    let response: Response | null = null;
    try {
      // console.log(method, url);
      response = await fetch(url, fetchOptions);

      if (controller.signal.aborted) {
        if (controller.signal.reason === STR_CANCEL_TOKEN_MSG) {
          console.log(STR_CANCEL_TOKEN_MSG, url);
          throw new DOMException(STR_CANCEL_TOKEN_MSG, "AbortError");
        }
      }

      if (response.status === 401) {
        token.clear();
        window.location.href = "/";
        throw new Error("Unauthorized");
      }

      let responseBody: string | null = null;
      let data: unknown = null;

      if (response.status !== 204) {
        responseBody = await response.text();
        if (responseBody) {
          try {
            data = JSON.parse(responseBody);
          } catch {
            data = responseBody;
          }
        }
      }

      if (response.status === 403) {
        alert((data as string) || "Unauthorized");
        window.location.href = "/";
        throw new Error("Forbidden");
      }

      if (response.status === 500) {
        console.error(response);
        alert("TODO: Unexpected Error");
        throw new Error("Internal Server Error");
      }

      if (response.status !== 200 && response.status !== 204) {
        const error = new Error(
          `HTTP Error: ${response.status} ${response.statusText}`
        );
        (error as Error & { response?: Response; data?: unknown }).response =
          response;
        (error as Error & { response?: Response; data?: unknown }).data = data;
        throw error;
      }

      console.log(response.status, url);

      if (response.status === 204) {
        return {} as T;
      }

      return (data as T) ?? ({} as T);
    } catch (error) {
      if (
        (error instanceof DOMException && error.name === "AbortError") ||
        (error instanceof Error && error.name === "AbortError")
      ) {
        if (
          controller.signal.reason === STR_CANCEL_TOKEN_MSG ||
          (error instanceof Error && error.message === STR_CANCEL_TOKEN_MSG)
        ) {
          console.log(STR_CANCEL_TOKEN_MSG, url);
          throw error;
        }
        throw error;
      }

      if ((error as Error).name === "AbortError") throw error;

      console.error("API Request failed:", error);
      throw new Error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      cleanupKey(cancelKey);
      setLoadingState(setLoading, false);
      if (response && response.status >= 400) {
        console.log(response.status, url);
      }
    }
  }
}

// ✅ BrandFetch API (public)
export const brandFetchApi = new ApiClient("https://api.brandfetch.io/v2");

// ✅ Your server config
const devServerId = 1; // 0: localhost, 1: production
const SERVER = "https://netranks.azurewebsites.net/";
export const SERVER_URL = import.meta.env.VITE_API_BASE_URL
  ? SERVER
  : ["/", SERVER][devServerId];

// ✅ Authenticated API client
export const fetchApi = new ApiClient(SERVER_URL);

export default ApiClient;
