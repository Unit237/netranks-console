import { useState } from "react";
import Hub, { HubType, useHub } from "./Hub";

// Storage keys
const USER_TOKEN_KEY = "userToken";       // For UserSession (authenticated)
const VISITOR_TOKEN_KEY = "visitorToken"; // For VisitorSession (anonymous)
const LEGACY_TOKEN_KEY = "t";             // For migration

 // In-memory cache
 let USER_TOKEN = "";
 let VISITOR_TOKEN = "";

 const isValidToken = (token: string | null): boolean => {
  if (!token) return false;
  if (token.trim().startsWith("<!DOCTYPE") || token.trim().startsWith("<html")) {
    console.error("Invalid token detected (HTML)");
    return false;
  }
  return true;
};

// Backwards compatibility
const get = (): string | null => {
  return getUser() || getVisitor();
};

const set = (token: string | null) => {
  setVisitor(token);  // Default to visitor for safety
};

const clear = () => {
  clearUser();
  clearVisitor();
};

// User token (for authenticated UserSession)
const getUser = (): string | null => {
  try {
    migrateLegacyToken();
    USER_TOKEN = localStorage.getItem(USER_TOKEN_KEY) || "";
    if (!USER_TOKEN) {
      clearCookie("userToken");
      return null;
    }
    if (!isValidToken(USER_TOKEN)) {
      clearUser();
      return null;
    }
    return USER_TOKEN;
  } catch (error) {
    return null;
  }
};

const setUser = (token: string | null) => {
  if (USER_TOKEN === token) return;
  USER_TOKEN = token || "";
  Hub.dispatch(HubType.UserTokenChanged, token);

  if (token) {
    localStorage.setItem(USER_TOKEN_KEY, token);
    setCookie("userToken", token);
  } else {
    localStorage.removeItem(USER_TOKEN_KEY);
    clearCookie("userToken");
  }
};

const clearUser = () => {
  setUser(null);
};

// Visitor token (for anonymous VisitorSession)
const getVisitor = (): string | null => {
  try {
    migrateLegacyToken();
    VISITOR_TOKEN = localStorage.getItem(VISITOR_TOKEN_KEY) || "";
    if (!VISITOR_TOKEN) {
      clearCookie("visitorToken");
      return null;
    }
    if (!isValidToken(VISITOR_TOKEN)) {
      clearVisitor();
      return null;
    }
    return VISITOR_TOKEN;
  } catch (error) {
    return null;
  }
};

const setVisitor = (token: string | null) => {
  if (VISITOR_TOKEN === token) return;
  VISITOR_TOKEN = token || "";
  Hub.dispatch(HubType.VisitorTokenChanged, token);

  if (token) {
    localStorage.setItem(VISITOR_TOKEN_KEY, token);
    setCookie("visitorToken", token);
  } else {
    localStorage.removeItem(VISITOR_TOKEN_KEY);
    clearCookie("visitorToken");
  }
};

const clearVisitor = () => {
  setVisitor(null);
};



const setCookie = (name: string, token: string) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  document.cookie = `${name}=${token}; expires=${date.toUTCString()}; path=/`;
};

const clearCookie = (name: string) => {
  document.cookie = `${name}=; expires=${new Date().toUTCString()}; path=/`;
};

let migrationDone = false;
const migrateLegacyToken = () => {
  if (migrationDone) return;
  migrationDone = true;

  try {
    const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
    if (legacyToken && isValidToken(legacyToken)) {
      // Migrate legacy token to visitor token (safer default)
      if (!localStorage.getItem(VISITOR_TOKEN_KEY)) {
        localStorage.setItem(VISITOR_TOKEN_KEY, legacyToken);
        setCookie("visitorToken", legacyToken);
      }
      // Clear legacy storage
      localStorage.removeItem(LEGACY_TOKEN_KEY);
      clearCookie("token");
    }
  } catch (error) {
    console.error("Token migration error:", error);
  }
};



export default {
  get,
  set,
  clear,
  getUser,
  setUser,
  clearUser,
  getVisitor,
  setVisitor,
  clearVisitor,
};

export function useIsLoggedIn() {
  const [token, setToken] = useState(getUser());
  useHub(HubType.UserTokenChanged, setToken);
  return !!token;
}

/* DEPRECATED, USER LOGIN STATUS IS ONLY ABOUT USER TOKEN
// export function useIsLoggedIn() {
//   const [token, setToken] = useState(get());
//   useHub(HubType.AuthTokenChanged, setToken);
//   return !!token;
// }
*/

/* DEPRECATED, WE NOW USE SEPARATE METHODS FOR MANAGING USER AND VISITOR TOKENS
// const get = (): string | null => {
//   try {
//     TOKEN = localStorage.getItem(TOKEN_STR) || "";
//     if (!TOKEN) {
//       clearCookie();
//       return null;
//     }
//     // Safety check: if token looks like HTML, it's invalid - clear it
//     if (TOKEN.trim().startsWith("<!DOCTYPE") || TOKEN.trim().startsWith("<html")) {
//       console.error("Invalid token detected (HTML), clearing...");
//       clear();
//       return null;
//     }
//     return TOKEN;
//   } catch (error) {
//     return null;
//   }
// };

// const set = (token: string | null) => {
//   if (TOKEN === token) {
//     return;
//   }
//   TOKEN = token || "";
//   Hub.dispatch(HubType.AuthTokenChanged, token);

//   if (token) {
//     localStorage.setItem(TOKEN_STR, token);
//     setCookie(token);
//   } else {
//     localStorage.removeItem(TOKEN_STR);
//     clearCookie();
//   }
// };

// const clear = () => {
//   set(null);
// };
*/
