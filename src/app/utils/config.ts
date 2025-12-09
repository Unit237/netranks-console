const useViteProxy = false; // true: use vite proxy (localhost), false: direct URL (netranks server)

// Use demo backend URL for local development, main backend URL for production
const SERVER = import.meta.env.VITE_PROD === "true"
  ? import.meta.env.VITE_BACKEND_API_URL || "https://netranks.azurewebsites.net"
  : import.meta.env.VITE_DEMO_BACKEND_API_URL || import.meta.env.VITE_BACKEND_API_URL || "https://netranks.azurewebsites.net";
const netranksDomain = import.meta.env.VITE_NETRANKS_DOMAIN || "https://www.netranks.ai";

// Remove trailing slash if present and ensure we have a valid URL
const cleanServerUrl = SERVER && typeof SERVER === "string" 
  ? (SERVER.endsWith("/") ? SERVER.slice(0, -1) : SERVER)
  : "https://netranks.azurewebsites.net"; // Fallback to real backend if invalid

// In development, use vite proxy (empty string = relative URLs) to avoid CORS issues
// In production, use the full backend URL
const SERVER_URL = import.meta.env.VITE_PROD === "true"
  ? cleanServerUrl
  : (useViteProxy ? "" : cleanServerUrl); // Empty string means use relative URLs (vite proxy)

// Validate SERVER_URL is not undefined (but allow empty string for proxy)
const validatedServerUrl = SERVER_URL !== undefined ? SERVER_URL : "http://localhost:4000";

// Log configuration in dev mode for debugging
if (import.meta.env.DEV) {
  console.log("[Config] Backend Configuration:", {
    VITE_PROD: import.meta.env.VITE_PROD,
    VITE_BACKEND_API_URL: import.meta.env.VITE_BACKEND_API_URL,
    VITE_DEMO_BACKEND_API_URL: import.meta.env.VITE_DEMO_BACKEND_API_URL,
    cleanServerUrl,
    SERVER_URL: validatedServerUrl,
    devServerId,
  });
}

const HOMEWORK_API_BASE_URL =
  "https://qmnga6hmp3.eu-central-1.awsapprunner.com";

export default {
  SERVER_URL: validatedServerUrl,
  netranksDomain: netranksDomain,
  API_BASE_URL: HOMEWORK_API_BASE_URL,

  stripePublishableKey:
    "pk_live_51RpphHPDJ4afO8q12iGI2kehYxtGaa2FV4nAghat1ZQ7rvlXcBw9TMq92K2g3nEkLjrXFWozrxUdfCyW3qUEz9xM00uYusWOZl",

  netranksSessionKey: {
    words: [1313166418, 1095650131, 1600082757, 1129465172],
    sigBytes: 16,
  },

  Colors: {
    Blue: "#008AD0",
    Green: "#2ADB50",
    Red: "#ff5757",
  },
};
