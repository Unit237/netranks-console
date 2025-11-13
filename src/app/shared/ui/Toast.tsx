import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";
import React from "react";

interface ToastProps {
  t: {
    visible: boolean;
  };
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

const getIcon = (type: ToastProps["type"]) => {
  switch (type) {
    case "success":
      return <CheckCircle2 className="h-8 w-8 text-green-400" />;
    case "error":
      return <AlertCircle className="h-8 w-8 text-red-400" />;
    case "warning":
      return <XCircle className="h-8 w-8 text-yellow-400" />;
    case "info":
      return <Info className="h-8 w-8 text-blue-400" />;
  }
};

const AppToast: React.FC<ToastProps> = ({ t, title, message, type }) => {
  return (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">{getIcon(type)}</div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppToast;
