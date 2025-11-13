import React from "react";
import { Toaster } from "react-hot-toast";

import toast from "react-hot-toast";
import AppToast from "../shared/ui/Toast";

interface ToastOptions {
  title: string;
  message: string;
}

export const useToast = () => {
  const showToast = {
    success: ({ title, message }: ToastOptions) => {
      toast.custom((t: any) => (
        <AppToast t={t} type="success" title={title} message={message} />
      ));
    },
    error: ({ title, message }: ToastOptions) => {
      toast.custom((t: any) => (
        <AppToast t={t} type="error" title={title} message={message} />
      ));
    },
    warning: ({ title, message }: ToastOptions) => {
      toast.custom((t: any) => (
        <AppToast t={t} type="warning" title={title} message={message} />
      ));
    },
    info: ({ title, message }: ToastOptions) => {
      toast.custom((t: any) => (
        <AppToast t={t} type="info" title={title} message={message} />
      ));
    },
  };

  return showToast;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          className: "animate-enter-custom",
        }}
      />
    </>
  );
};
