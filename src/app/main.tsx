import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "../assets/styling/index.css";
import App from "./App";
import { ToastProvider } from "./providers/ToastProvider";

// Catch unhandled promise rejections (common cause of white screens)
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  console.error("Promise:", event.promise);
  
  // Log to debug arrays
  if (typeof window !== "undefined") {
    (window as any).__unhandledRejections = (window as any).__unhandledRejections || [];
    (window as any).__unhandledRejections.push({
      timestamp: new Date().toISOString(),
      reason: event.reason,
      promise: event.promise
    });
  }
  
  // Don't prevent default in dev - we want to see the error
  if (import.meta.env.PROD) {
    event.preventDefault();
  }
});

// Catch global errors
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
  console.error("Message:", event.message);
  console.error("Source:", event.filename, event.lineno, event.colno);
  
  // Log to debug arrays
  if (typeof window !== "undefined") {
    (window as any).__globalErrors = (window as any).__globalErrors || [];
    (window as any).__globalErrors.push({
      timestamp: new Date().toISOString(),
      message: event.message,
      error: event.error,
      source: `${event.filename}:${event.lineno}:${event.colno}`
    });
  }
});

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  // </StrictMode>
);
