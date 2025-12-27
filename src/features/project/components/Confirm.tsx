import { forwardRef, useImperativeHandle, useState } from "react";
import { useLanguage } from "../../../app/localization/language";

export type ConfirmHandle = {
  show: (title: string, body: string, onConfirmed?: () => void) => void;
};

export const Confirm = forwardRef<ConfirmHandle>((_, ref) => {
  const l = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [onConfirmed, setOnConfirmed] = useState<(() => void) | undefined>();

  useImperativeHandle(ref, () => ({
    show: (title, body, onConfirmed) => {
      setTitle(title);
      setBody(body);
      setOnConfirmed(() => onConfirmed);
      setIsOpen(true);
    },
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-lg">
        {/* Title */}
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 text-sm text-gray-700">{body}</div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            {l.general.no}
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onConfirmed?.();
            }}
            autoFocus
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            {l.general.yes}
          </button>
        </div>
      </div>
    </div>
  );
});

Confirm.displayName = "Confirm";
