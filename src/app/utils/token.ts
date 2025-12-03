import { useState } from "react";
import Hub, { HubType, useHub } from "./Hub";

let TOKEN = "";
const TOKEN_STR = "t";

const get = (): string | null => {
  try {
    TOKEN = localStorage.getItem(TOKEN_STR) || "";
    if (!TOKEN) {
      clearCookie();
      return null;
    }
    return TOKEN;
  } catch (error) {
    return null;
  }
};

const set = (token: string | null) => {
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

const setCookie = (token: string) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  document.cookie = `token=${token}; expires=${date.toUTCString()}; path=/`;
};

const clearCookie = () => {
  document.cookie = `token=; expires=${new Date().toUTCString()}; path=/`;
};

const clear = () => {
  set(null);
};

export default {
  get,
  set,
  clear,
};

export function useIsLoggedIn() {
  const [token, setToken] = useState(get());
  useHub(HubType.AuthTokenChanged, setToken);
  return !!token;
}
