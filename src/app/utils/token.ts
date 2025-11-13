import { useState } from "react";
import Hub, { HubType, useHub } from "./Hub";

let TOKEN = "";
const TOKEN_STR = "t";

// Get token from localStorage
const get = (): string | null => {
  try {
    const stored = localStorage.getItem(TOKEN_STR);
    if (!stored) {
      clearCookie();
    }
    TOKEN = stored || "";
    return stored;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

// Set token and update storage + cookies
const set = (token: string | null): void => {
  if (TOKEN === token) {
    console.log("skip token set");
    return;
  }

  TOKEN = token || "";
  Hub.dispatch(HubType.AuthTokenChanged, token);

  if (token) {
    localStorage.setItem(TOKEN_STR, token);
    setCookie(token);
  } else {
    localStorage.removeItem(TOKEN_STR);
    clearCookie();
  }
};

// Set cookie for token (1-year expiry)
const setCookie = (token: string): void => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  document.cookie = `token=${token}; expires=${date.toUTCString()}; path=/`;
};

// Clear token cookie
const clearCookie = (): void => {
  document.cookie = `token=; expires=${new Date().toUTCString()}; path=/`;
};

// Clear token entirely
const clear = (): void => {
  set(null);
};

export default {
  get,
  set,
  clear,
};

// React hook to track login status
export function useIsLoggedIn(): boolean {
  const [token, setToken] = useState<string | null>(get());
  useHub(HubType.AuthTokenChanged, setToken);
  return !!token;
}
