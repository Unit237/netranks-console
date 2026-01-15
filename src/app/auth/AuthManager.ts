import Axios from "axios";
import CryptoJS from "crypto-js";
import { useState } from "react";
import Hub, { HubType, useHub } from "../utils/Hub";
import prms from "../utils/config";
import { urlParams } from "../utils/urlUtils";

class AuthService {
  // Storage keys
  private static readonly USER_TOKEN_KEY = "userToken"; // For UserSession (authenticated)
  private static readonly VISITOR_TOKEN_KEY = "visitorToken"; // For VisitorSession (anonymous)
  private static readonly LEGACY_TOKEN_KEY = "t"; // For migration

  // In-memory cache
  private static USER_TOKEN = "";
  private static VISITOR_TOKEN = "";

  private static migrationDone = false;
  private static sessionCreationPromise: Promise<void> | null = null;

  private static axios = Axios.create({
    timeout: 60000,
    validateStatus: (_) => true,
  });

  private static isValidToken(token: string | null): boolean {
    if (!token) return false;
    if (token.trim().startsWith("<!DOCTYPE") || token.trim().startsWith("<html")) {
      console.error("Invalid token detected (HTML)");
      return false;
    }
    return true;
  }

  private static setCookie(name: string, token: string) {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    document.cookie = `${name}=${token}; expires=${date.toUTCString()}; path=/`;
  }

  private static clearCookie(name: string) {
    document.cookie = `${name}=; expires=${new Date().toUTCString()}; path=/`;
  }

  private static migrateLegacyToken() {
    if (this.migrationDone) return;
    this.migrationDone = true;

    try {
      const legacyToken = localStorage.getItem(this.LEGACY_TOKEN_KEY);
      if (legacyToken && this.isValidToken(legacyToken)) {
        // Migrate legacy token to visitor token (safer default)
        if (!localStorage.getItem(this.VISITOR_TOKEN_KEY)) {
          localStorage.setItem(this.VISITOR_TOKEN_KEY, legacyToken);
          this.setCookie("visitorToken", legacyToken);
        }
        // Clear legacy storage
        localStorage.removeItem(this.LEGACY_TOKEN_KEY);
        this.clearCookie("token");
      }
    } catch (error) {
      console.error("Token migration error:", error);
    }
  }

  static getAnyToken(): string | null {
    return this.getUserToken() || this.getVisitorToken();
  }

  static getUserToken(): string | null {
    try {
      this.migrateLegacyToken();
      this.USER_TOKEN = localStorage.getItem(this.USER_TOKEN_KEY) || "";
      if (!this.USER_TOKEN) {
        this.clearCookie("userToken");
        return null;
      }
      if (!this.isValidToken(this.USER_TOKEN)) {
        this.clearUserToken();
        return null;
      }
      return this.USER_TOKEN;
    } catch (error) {
      return null;
    }
  }

  static setUserToken(token: string | null) {
    if (this.USER_TOKEN === token) return;
    this.USER_TOKEN = token || "";
    Hub.dispatch(HubType.UserTokenChanged, token);

    if (token) {
      localStorage.setItem(this.USER_TOKEN_KEY, token);
      this.setCookie("userToken", token);
    } else {
      localStorage.removeItem(this.USER_TOKEN_KEY);
      this.clearCookie("userToken");
    }
  }

  static clearUserToken() {
    this.setUserToken(null);
  }

  static getVisitorToken(): string | null {
    try {
      this.migrateLegacyToken();
      this.VISITOR_TOKEN = localStorage.getItem(this.VISITOR_TOKEN_KEY) || "";
      if (!this.VISITOR_TOKEN) {
        this.clearCookie("visitorToken");
        return null;
      }
      if (!this.isValidToken(this.VISITOR_TOKEN)) {
        this.clearVisitorToken();
        return null;
      }
      return this.VISITOR_TOKEN;
    } catch (error) {
      return null;
    }
  }

  static setVisitorToken(token: string | null) {
    if (this.VISITOR_TOKEN === token) return;
    this.VISITOR_TOKEN = token || "";
    Hub.dispatch(HubType.VisitorTokenChanged, token);

    if (token) {
      localStorage.setItem(this.VISITOR_TOKEN_KEY, token);
      this.setCookie("visitorToken", token);
    } else {
      localStorage.removeItem(this.VISITOR_TOKEN_KEY);
      this.clearCookie("visitorToken");
    }
  }

  static clearVisitorToken() {
    this.setVisitorToken(null);
  }

  static clearAllTokens() {
    this.clearUserToken();
    this.clearVisitorToken();
  }

  static isVisitorEndpoint(url: string): boolean {
    return (
      url.includes("CreateSurveyFromQuery") ||
      url.includes("CreateSurveyFromBrand") ||
      url.includes("StartSurvey") ||
      url.includes("GenerateQuestionsFromQuery") ||
      url.includes("GenerateQuestionsFromBrand")
    );
  }

  static requiresUserToken(url: string): boolean {
    return (
      url.includes("ChangeSurveySchedule") ||
      url.includes("CreateSurvey") ||
      url.includes("UpdateUser") ||
      url.includes("DeleteMember") ||
      url.includes("AddMember") ||
      url.includes("UpdateMember") ||
      url.includes("GetMembers") ||
      url.includes("GetPendingInvitations") ||
      url.includes("DeleteInvitation") ||
      url.includes("AddQuestion") ||
      url.includes("EditQuestion") ||
      url.includes("DeleteQuestion")
    );
  }

  static getTokenForUrl(url: string): string | null {
    if (this.isVisitorEndpoint(url)) {
      return this.getVisitorToken();
    }
    if (this.requiresUserToken(url)) {
      return this.getUserToken();
    }
    return this.getUserToken() || this.getVisitorToken();
  }

  static getAuthHeadersForUrl(url: string): Record<string, string> {
    const authToken = this.getTokenForUrl(url);
    if (!authToken) return {};

    const tokenStr = String(authToken).trim();
    if (tokenStr.startsWith("<!DOCTYPE") || tokenStr.startsWith("<html")) {
      console.error("Invalid token detected (HTML), skipping header");
      return {};
    }

    return {
      token: tokenStr,
      Token: tokenStr,
    };
  }

  static async ensureVisitorSession(): Promise<void> {
    const isProduction = import.meta.env.VITE_PROD === "true";
    const existingToken = this.getVisitorToken();

    if (existingToken) {
      if (import.meta.env.DEV) {
        console.log("[Onboarding] Token already exists, skipping session creation", {
          tokenPreview: existingToken.substring(0, 20) + "...",
        });
      }
      return;
    }

    if (this.sessionCreationPromise) {
      if (import.meta.env.DEV) {
        console.log("[Onboarding] Session creation already in progress, waiting for it...");
      }
      return this.sessionCreationPromise;
    }

    this.sessionCreationPromise = this.createVisitorSessionInternal(
      isProduction,
      existingToken
    );

    try {
      await this.sessionCreationPromise;
    } finally {
      this.sessionCreationPromise = null;
    }
  }

  private static async createVisitorSessionInternal(
    isProduction: boolean,
    existingToken: string | null
  ): Promise<void> {
    try {
      if (import.meta.env.DEV || isProduction) {
        console.log("[Onboarding] Starting visitor session creation", {
          backend: prms.SERVER_URL,
          isProduction,
          hasExistingToken: !!existingToken,
          existingTokenPreview: existingToken
            ? existingToken.substring(0, 20) + "..."
            : null,
        });
      }

      const ipUrl = this.buildUrl("api/CreateVisitorSession");
      const ipResponse = await this.axios.get<string>(ipUrl);

      if (ipResponse.status !== 200 && ipResponse.status !== 204) {
        console.error(
          "[Onboarding] Failed to create visitor session: API returned error status",
          { status: ipResponse.status, data: ipResponse.data }
        );
        return;
      }

      const ip = ipResponse.data;
      if (!ip || typeof ip !== "string") {
        console.error(
          "[Onboarding] Failed to create visitor session: API returned invalid data",
          { ip }
        );
        return;
      }

      const key = CryptoJS.lib.WordArray.create(
        prms.netranksSessionKey.words,
        prms.netranksSessionKey.sigBytes
      );

      const secret = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(ip), key, {
        mode: CryptoJS.mode.ECB,
      }).toString();

      const tokenUrl = this.buildUrl(
        urlParams("api/CreateVisitorSession", { secret })
      );
      const tokenResponse = await this.axios.get<string>(tokenUrl);

      if (tokenResponse.status !== 200 && tokenResponse.status !== 204) {
        console.error(
          "[Onboarding] Failed to exchange secret for token: API returned error status",
          { status: tokenResponse.status, data: tokenResponse.data }
        );
        return;
      }

      const tokenValue = tokenResponse.data;
      if (tokenValue && typeof tokenValue === "string") {
        const guidPattern =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (guidPattern.test(tokenValue.trim())) {
          this.setVisitorToken(tokenValue.trim());
          if (import.meta.env.DEV) {
            console.log("[Onboarding] Visitor session token created and stored", {
              backend: prms.SERVER_URL,
            });
          }
        } else {
          console.error("[Onboarding] Invalid token format (not a valid Guid)", {
            tokenValue: tokenValue.substring(0, 50),
          });
        }
      } else {
        if (import.meta.env.DEV) {
          console.warn(
            "[Onboarding] Received invalid token from CreateVisitorSession",
            { tokenValue }
          );
        }
      }
    } catch (error) {
      console.error(
        "[Onboarding] Unexpected error during session creation:",
        error instanceof Error ? error.message : "Unknown error",
        error
      );
    }
  }

  private static buildUrl(endpoint: string): string {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const baseURL = prms.SERVER_URL;

    if (!baseURL || typeof baseURL !== "string") {
      return `http://localhost:4000${normalizedEndpoint}`;
    }

    if (baseURL.startsWith("http")) {
      return `${baseURL}${normalizedEndpoint}`;
    }

    return `${baseURL}${normalizedEndpoint}`;
  }
}

export { AuthService };

export function useIsLoggedIn() {
  const [token, setToken] = useState(AuthService.getUserToken());
  useHub(HubType.UserTokenChanged, setToken);
  return !!token;
}

