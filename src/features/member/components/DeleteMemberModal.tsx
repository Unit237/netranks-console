import { Trash2, Trash2Icon } from "lucide-react";
import { useEffect } from "react";
import type { Member } from "../@types";

interface DeleteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (memberId: number) => Promise<void>;
  memberToDelete: Member | undefined;
  projectToRemove:
    | {
        ProjectId: number;
        ProjectName: string;
        MemberId: number;
      }
    | undefined;
}

const DeleteMemberModal = ({
  isOpen,
  onClose,
  onConfirm,
  memberToDelete,
  projectToRemove,
}: DeleteMemberModalProps) => {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      return () => document.removeEventListener("keydown", handleEscKey);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !memberToDelete || !projectToRemove) return null;

  const handleDelete = async () => {
    await onConfirm(projectToRemove.MemberId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-gray-100 rounded-[30px] shadow-xl w-full max-w-md z-10">
        {/* Header with trash icon and close button */}
        <div className="rounded-[30px] bg-white">
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center bg-red-100 rounded-lg p-2">
              <Trash2Icon className="w-4 h-4 text-trash-red" />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-text hover:text-gray-900 transition-colors text-sm border border-gray-200 rounded-full px-2 py-0"
              aria-label="Close"
            >
              x esc
            </button>
          </div>

          <div className="p-6 pt-4">
            <h2
              id="delete-modal-title"
              className="text-md font-semibold text-gray-900 mb-4"
            >
              Remove team member?
            </h2>
            <p className="text-[13px] text-gray-700 mb-6">
              {memberToDelete
                ? `You're about to remove ${memberToDelete.FullName} (${
                    memberToDelete.Email
                  }) from ${projectToRemove?.ProjectName || "the project"}. ${
                    memberToDelete.Projects &&
                    memberToDelete.Projects.length > 1
                      ? `They will still have access to ${
                          memberToDelete.Projects.length - 1
                        } other project(s).`
                      : "They will lose access to this project."
                  }`
                : "This action cannot be undone."}
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center gap-3 p-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 text-[13px] font-medium text-gray-700 bg-white border border-card-border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Do not remove
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-1 text-[13px] font-medium text-white bg-trash-red rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Yes, remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMemberModal;
