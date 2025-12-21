import { Eye, Mail, Pencil, Send, User } from "lucide-react";
import { useEffect, useState } from "react";
import type { Project } from "../../auth/@types";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendInvitation: (data: {
    name: string;
    email: string;
    role: "Owner" | "Editor" | "Viewer";
    projectIds: number[];
  }) => Promise<void>;
  projects: Project[];
  activeProjectId?: number;
  isInviting?: boolean;
}

const InviteMemberModal = ({
  isOpen,
  onClose,
  onSendInvitation,
  projects,
  activeProjectId,
  isInviting = false,
}: InviteMemberModalProps) => {
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Owner" | "Editor" | "Viewer">(
    "Viewer"
  );
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);

  // Initialize selected projects when modal opens - default to active project or first project
  useEffect(() => {
    if (isOpen && projects && projects.length > 0) {
      const defaultProjectId = activeProjectId || projects[0]?.Id;
      if (defaultProjectId) {
        setSelectedProjectIds([defaultProjectId]);
      }
    } else if (!isOpen) {
      // Reset when modal closes
      setSelectedProjectIds([]);
      setInviteName("");
      setInviteEmail("");
      setInviteRole("Viewer");
    }
  }, [isOpen, projects, activeProjectId]);

  const handleProjectToggle = (projectId: number) => {
    setSelectedProjectIds((prev) => {
      if (prev.includes(projectId)) {
        return prev.filter((id) => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  const handleSend = async () => {
    if (
      !inviteName.trim() ||
      !inviteEmail.trim() ||
      selectedProjectIds.length === 0
    ) {
      return;
    }

    await onSendInvitation({
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      projectIds: selectedProjectIds,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md z-10 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2
            id="invite-modal-title"
            className="text-lg font-semibold text-gray-900 mb-6"
          >
            Invite team member
          </h2>

          {/* Name Input */}
          <div className="mb-4">
            <label
              htmlFor="invite-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="invite-name"
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-card-border rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-owner-blue focus:border-owner-blue"
                placeholder="John"
                required
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="mb-6">
            <label
              htmlFor="invite-email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-card-border rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-owner-blue focus:border-owner-blue"
                placeholder="name@example.com"
              />
            </div>
          </div>

          {/* Project Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select projects
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-card-border rounded-md p-3">
              {projects && projects.length > 0 ? (
                projects.map((project) => {
                  const projectName =
                    project.Name && project.Name.trim() !== ""
                      ? project.Name
                      : "Untitled Project";
                  return (
                    <label
                      key={project.Id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProjectIds.includes(project.Id)}
                        onChange={() => handleProjectToggle(project.Id)}
                        className="w-4 h-4 text-owner-blue border-gray-300 rounded focus:ring-owner-blue focus:ring-2"
                      />
                      <span className="text-sm text-gray-900 flex-1">
                        {projectName}
                      </span>
                    </label>
                  );
                })
              ) : (
                <div className="text-sm text-muted-text p-2">
                  No projects available
                </div>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose a role
            </label>
            <div className="space-y-2">
              {/* Owner Option */}
              <button
                type="button"
                onClick={() => setInviteRole("Owner")}
                className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-colors text-left ${
                  inviteRole === "Owner"
                    ? "border-owner-blue bg-blue-50"
                    : "border-card-border hover:border-gray-300"
                }`}
                aria-pressed={inviteRole === "Owner"}
              >
                <Send
                  className={`w-5 h-5 flex-shrink-0 ${
                    inviteRole === "Owner"
                      ? "text-owner-blue fill-owner-blue"
                      : "text-gray-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-medium mb-0.5 ${
                      inviteRole === "Owner"
                        ? "text-owner-blue"
                        : "text-gray-900"
                    }`}
                  >
                    Owner
                  </div>
                  <div className="text-xs text-muted-text">
                    Full access to all projects and settings
                  </div>
                </div>
              </button>

              {/* Editor Option */}
              <button
                type="button"
                onClick={() => setInviteRole("Editor")}
                className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-colors text-left ${
                  inviteRole === "Editor"
                    ? "border-editor-orange bg-orange-50"
                    : "border-card-border hover:border-gray-300"
                }`}
                aria-pressed={inviteRole === "Editor"}
              >
                <Pencil
                  className={`w-5 h-5 flex-shrink-0 ${
                    inviteRole === "Editor"
                      ? "text-editor-orange"
                      : "text-gray-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-medium mb-0.5 ${
                      inviteRole === "Editor"
                        ? "text-editor-orange"
                        : "text-gray-900"
                    }`}
                  >
                    Editor
                  </div>
                  <div className="text-xs text-muted-text">
                    Can create and edit surveys, view all reports
                  </div>
                </div>
              </button>

              {/* Viewer Option */}
              <button
                type="button"
                onClick={() => setInviteRole("Viewer")}
                className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-colors text-left ${
                  inviteRole === "Viewer"
                    ? "border-gray-400 bg-gray-50"
                    : "border-card-border hover:border-gray-300"
                }`}
                aria-pressed={inviteRole === "Viewer"}
              >
                <Eye
                  className={`w-5 h-5 flex-shrink-0 ${
                    inviteRole === "Viewer" ? "text-gray-600" : "text-gray-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium mb-0.5 text-gray-900">
                    Viewer
                  </div>
                  <div className="text-xs text-muted-text">
                    Can view surveys and reports
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-card-border">
            <button
              type="button"
              onClick={onClose}
              className="px-0 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={
                !inviteName.trim() ||
                !inviteEmail.trim() ||
                selectedProjectIds.length === 0 ||
                isInviting
              }
              className="px-0 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInviting ? "Sending..." : "Send invitation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;
