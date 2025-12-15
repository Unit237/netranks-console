import {
  Check,
  Eye,
  Mail,
  Pencil,
  Plus,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { apiClient } from "../../../app/lib/api";
import { useUser } from "../../auth/context/UserContext";

interface ProjectMembership {
  ProjectId: number;
  ProjectName: string;
  IsOwner: boolean;
  IsEditor: boolean;
  CreatedAt: string;
  MemberId: number;
}

interface Member {
  Id: number;
  UserId?: number;
  FullName: string;
  Email: string;
  IsOwner: boolean; // True if they're an owner in ANY project
  IsEditor: boolean; // True if they're an editor in ANY project
  CreatedAt: string; // Earliest creation date across all projects
  IsProjectOwner?: boolean; // True if this is the original project owner (cannot be deleted)
  Projects: ProjectMembership[]; // All projects this member belongs to
}

const Members = () => {
  const { user } = useUser();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Owner" | "Editor" | "Viewer">(
    "Viewer"
  );
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<{
    memberId: number;
    projectId: number;
  } | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get active project ID
  const activeProjectId =
    user?.Projects?.find((p) => p.IsActive)?.Id || user?.Projects?.[0]?.Id;

  // Initialize selected projects when modal opens - default to active project or first project
  useEffect(() => {
    if (showInviteModal && user?.Projects && user.Projects.length > 0) {
      const defaultProjectId = activeProjectId;
      if (defaultProjectId) {
        setSelectedProjectIds([defaultProjectId]);
      }
    } else if (!showInviteModal) {
      // Reset when modal closes
      setSelectedProjectIds([]);
    }
  }, [showInviteModal, user?.Projects, activeProjectId]);

  useEffect(() => {
    if (user?.Projects && user.Projects.length > 0) {
      fetchMembers();
    } else {
      setLoading(false);
    }
  }, [user?.Projects]);

  // Handle ESC key to close delete confirmation modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && deleteConfirmId !== null) {
        setDeleteConfirmId(null);
      }
    };

    if (deleteConfirmId !== null) {
      document.addEventListener("keydown", handleEscKey);
      return () => document.removeEventListener("keydown", handleEscKey);
    }
  }, [deleteConfirmId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const fetchMembers = async () => {
    if (!user?.Projects || user.Projects.length === 0) {
      setLoading(false);
      setMembers([]);
      return;
    }

    try {
      setLoading(true);

      // Fetch members from all projects the user has access to
      // const allMembers: Member[] = [];
      const projectPromises = user.Projects.map(async (project) => {
        try {
          const membersData = await apiClient.get<Member[]>(
            `api/GetMembers/${project.Id}`
          );
          // Add project info to each member
          const membersWithProject = (membersData || []).map((member) => ({
            ...member,
            ProjectId: project.Id,
            ProjectName: project.Name || "Untitled Project",
          }));
          return membersWithProject;
        } catch (error: any) {
          // If endpoint doesn't exist (404) or user doesn't have access, skip this project
          if (
            error?.status === 404 ||
            error?.status === 406 ||
            error?.status === 403
          ) {
            console.warn(
              `Cannot fetch members for project ${project.Id} (${error?.status})`
            );
            return [];
          } else {
            console.error(
              `Failed to fetch members for project ${project.Id}:`,
              error
            );
            return [];
          }
        }
      });

      const membersArrays = await Promise.all(projectPromises);
      // Flatten all members into a single array
      const flattenedMembers = membersArrays.flat();

      // Group members by email and consolidate projects
      const membersByEmail = new Map<string, Member>();

      flattenedMembers.forEach((member) => {
        const email = member.Email;
        const existingMember = membersByEmail.get(email);

        if (existingMember) {
          // Add this project to the existing member's projects list
          if (member.ProjectId && member.ProjectName) {
            existingMember.Projects.push({
              ProjectId: member.ProjectId,
              ProjectName: member.ProjectName,
              IsOwner: member.IsOwner,
              IsEditor: member.IsEditor,
              CreatedAt: member.CreatedAt,
              MemberId: member.Id,
            });
          }
          // Update flags - true if they're owner/editor in ANY project
          if (member.IsOwner) existingMember.IsOwner = true;
          if (member.IsEditor) existingMember.IsEditor = true;
          // Use earliest creation date
          if (
            member.CreatedAt &&
            (!existingMember.CreatedAt ||
              member.CreatedAt < existingMember.CreatedAt)
          ) {
            existingMember.CreatedAt = member.CreatedAt;
          }
        } else {
          // Create new consolidated member
          const consolidatedMember: Member = {
            Id: member.Id,
            UserId: member.UserId,
            FullName: member.FullName,
            Email: member.Email,
            IsOwner: member.IsOwner,
            IsEditor: member.IsEditor,
            CreatedAt: member.CreatedAt,
            IsProjectOwner: member.IsProjectOwner,
            Projects:
              member.ProjectId && member.ProjectName
                ? [
                    {
                      ProjectId: member.ProjectId,
                      ProjectName: member.ProjectName,
                      IsOwner: member.IsOwner,
                      IsEditor: member.IsEditor,
                      CreatedAt: member.CreatedAt,
                      MemberId: member.Id,
                    },
                  ]
                : [],
          };
          membersByEmail.set(email, consolidatedMember);
        }
      });

      const consolidatedMembers = Array.from(membersByEmail.values());

      console.log(
        `Fetched ${consolidatedMembers.length} unique members across ${user.Projects.length} projects`,
        consolidatedMembers
      );
      setMembers(consolidatedMembers);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Just now (< 1 minute)
    if (diffInSeconds < 60) {
      return "Just now";
    }

    // Minutes ago (< 1 hour)
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${
        diffInMinutes === 1 ? "minute" : "minutes"
      } ago`;
    }

    // Hours ago (< 24 hours)
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    }

    // Days ago (< 7 days)
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
    }

    // Weeks ago (< 4 weeks)
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
    }

    // Months ago (< 12 months)
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
    }

    // Years ago
    const diffInYears = Math.floor(diffInDays / 365);
    if (diffInYears >= 1) {
      return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
    }

    // Fallback to formatted date
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();
    const currentYear = now.getFullYear();

    // If same year, don't show year
    if (year === currentYear) {
      return `${day} ${month}`;
    }

    return `${day} ${month} ${year}`;
  };

  // Format full date for tooltip/hover
  const formatFullDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = days[date.getDay()];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${dayName}, ${day} ${month} ${year} at ${hours}:${minutes}`;
  };

  const handleDeleteMember = async (memberId: number) => {
    if (!deleteConfirmId) return;

    try {
      await apiClient.delete(`api/DeleteMember/${memberId}`);
      // Refresh members to update the consolidated list
      await fetchMembers();
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Failed to delete member:", error);
    }
  };

  const handleSendInvitation = async () => {
    if (
      !inviteName.trim() ||
      !inviteEmail.trim() ||
      selectedProjectIds.length === 0
    ) {
      return;
    }

    setIsInviting(true);

    try {
      const invitationIds: number[] = [];
      const errors: string[] = [];

      // Invite to each selected project one by one
      for (const projectId of selectedProjectIds) {
        try {
          console.log(`Inviting ${inviteEmail} to project ${projectId}`);
          const invitationId = await apiClient.post<number>(`api/AddMember`, {
            ProjectId: projectId,
            FullName: inviteName,
            EMail: inviteEmail,
            IsOwner: inviteRole === "Owner",
            IsEditor: inviteRole === "Editor" || inviteRole === "Owner",
          });
          console.log(
            `Successfully invited member, got invitation ID: ${invitationId}`
          );
          invitationIds.push(invitationId);
        } catch (error: any) {
          console.error(`Failed to invite to project ${projectId}:`, error);
          const projectName =
            user?.Projects?.find((p) => p.Id === projectId)?.Name ||
            `Project ${projectId}`;
          errors.push(
            `${projectName}: ${error?.message || "Failed to send invitation"}`
          );
        }
      }

      if (errors.length > 0 && invitationIds.length === 0) {
        // All invitations failed
        alert(`Failed to send invitations:\n${errors.join("\n")}`);
        setIsInviting(false);
        return;
      }

      if (errors.length > 0) {
        // Some succeeded, some failed
        alert(`Some invitations failed:\n${errors.join("\n")}`);
      }

      // Close modal first
      setShowInviteModal(false);
      setInviteName("");
      setInviteEmail("");
      setInviteRole("Viewer");
      setSelectedProjectIds([]);

      // Show notification
      setShowNotification(true);

      // Clear any existing timeout
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }

      // Auto-hide notification after 5 seconds
      notificationTimeoutRef.current = setTimeout(() => {
        setShowNotification(false);
      }, 5000);

      // Fetch updated data - refresh all members from all projects
      // This ensures new members appear regardless of which project they were added to
      await fetchMembers();
    } catch (error: any) {
      console.error("Failed to send invitation:", error);
      // Show user-friendly error message
      if (error?.status === 404 || error?.status === 406) {
        alert(
          "The invitation endpoint is not available. Please use the local mock backend for testing."
        );
      } else {
        alert("Failed to send invitation. Please try again.");
      }
    } finally {
      setIsInviting(false);
    }
  };

  const handleCloseModal = () => {
    setShowInviteModal(false);
    setInviteName("");
    setInviteEmail("");
    setInviteRole("Viewer");
    setSelectedProjectIds([]);
  };

  const handleProjectToggle = (projectId: number) => {
    setSelectedProjectIds((prev) => {
      if (prev.includes(projectId)) {
        return prev.filter((id) => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  const getRoleBadge = (member: Member) => {
    const currentRole = member.IsOwner
      ? "Owner"
      : member.IsEditor
      ? "Editor"
      : "Viewer";

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
          member.IsOwner
            ? "bg-blue-50 text-owner-blue"
            : member.IsEditor
            ? "bg-orange-50 text-editor-orange"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {member.IsOwner ? (
          <Send className="w-3.5 h-3.5 fill-current" />
        ) : member.IsEditor ? (
          <Pencil className="w-3.5 h-3.5" />
        ) : (
          <Eye className="w-3.5 h-3.5" />
        )}
        <span>{currentRole}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-text">Loading members...</div>
      </div>
    );
  }

  return (
    <div className="bg-page-bg min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-6 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Members
          </h1>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-card-border rounded-lg text-sm font-medium text-gray-700 hover:bg-hover-bg transition-colors shadow-subtle w-full sm:w-auto justify-center"
            aria-label="Invite team member"
          >
            <Plus className="w-4 h-4" />
            <span>Invite team member</span>
          </button>
        </div>

        {/* Team Members Card */}
        {members.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-900 mb-4">
              Team members
            </h2>
            <div className="bg-card-bg rounded-card-xl border border-card-border shadow-subtle">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto overflow-y-visible">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-card-border">
                      <th className="text-left py-4 px-6 text-xs font-medium text-muted-text uppercase tracking-wider">
                        Name
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-medium text-muted-text uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-medium text-muted-text uppercase tracking-wider">
                        Project
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-medium text-muted-text uppercase tracking-wider">
                        Added
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-medium text-muted-text uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-muted-text uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {members.map((member) => (
                      <tr
                        key={member.Email}
                        className="hover:bg-hover-bg transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="text-base font-semibold text-gray-900">
                            {member.FullName}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-muted-text">
                          {member.Email}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-2">
                            {member.Projects && member.Projects.length > 0 ? (
                              member.Projects.map((project, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                                >
                                  {project.ProjectName}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-muted-text">
                                No projects
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-muted-text">
                          {member.CreatedAt ? (
                            <span
                              title={formatFullDate(member.CreatedAt)}
                              className="cursor-help"
                            >
                              {formatDate(member.CreatedAt)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-4 px-6">{getRoleBadge(member)}</td>
                        <td className="py-4 px-6 text-right">
                          {/* {member.Projects && member.Projects.length > 0 && member.Projects.some(p => !member.IsProjectOwner) && (
                            <button
                              onClick={() => {
                                // Use the first project's member ID for deletion
                                const firstProject = member.Projects[0];
                                setDeleteConfirmId({ memberId: firstProject.MemberId, projectId: firstProject.ProjectId });
                              }}
                              className="text-trash-red hover:text-red-700 transition-colors"
                              aria-label={`Remove ${member.FullName}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )} */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-card-border">
                {members.map((member) => (
                  <div
                    key={member.Email}
                    className="p-4 hover:bg-hover-bg transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-base font-semibold text-gray-900 mb-1">
                          {member.FullName}
                        </div>
                        <div className="text-sm text-muted-text mb-2">
                          {member.Email}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {member.Projects && member.Projects.length > 0 ? (
                            member.Projects.map((project, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                              >
                                {project.ProjectName}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-text">
                              No projects
                            </span>
                          )}
                        </div>
                      </div>
                      {/* {member.Projects && member.Projects.length > 0 && member.Projects.some(p => !member.IsProjectOwner) && (
                        <button
                          onClick={() => {
                            // Use the first project's member ID for deletion
                            const firstProject = member.Projects[0];
                            setDeleteConfirmId({ memberId: firstProject.MemberId, projectId: firstProject.ProjectId });
                          }}
                          className="text-trash-red hover:text-red-700 transition-colors ml-2"
                          aria-label={`Remove ${member.FullName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )} */}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-text">
                        Added:{" "}
                        {member.CreatedAt ? (
                          <span
                            title={formatFullDate(member.CreatedAt)}
                            className="cursor-help"
                          >
                            {formatDate(member.CreatedAt)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </div>
                      <div>{getRoleBadge(member)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Invite Team Member Modal */}
        {showInviteModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-modal-title"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseModal}
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
                    {user?.Projects && user.Projects.length > 0 ? (
                      user.Projects.map((project) => {
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
                          inviteRole === "Viewer"
                            ? "text-gray-600"
                            : "text-gray-400"
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
                    onClick={handleCloseModal}
                    className="px-0 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendInvitation}
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
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId &&
          (() => {
            const memberToDelete = members.find(
              (m) =>
                m.Projects &&
                m.Projects.some((p) => p.MemberId === deleteConfirmId.memberId)
            );
            const projectToRemove = memberToDelete?.Projects?.find(
              (p) => p.MemberId === deleteConfirmId.memberId
            );

            return (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-modal-title"
              >
                <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setDeleteConfirmId(null)}
                  aria-hidden="true"
                />

                <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md z-10">
                  {/* Header with trash icon and close button */}
                  <div className="flex items-center justify-between p-6 pb-4 border-b border-card-border">
                    <div className="flex items-center">
                      <Trash2 className="w-5 h-5 text-trash-red" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="text-muted-text hover:text-gray-900 transition-colors text-sm"
                      aria-label="Close"
                    >
                      x esc
                    </button>
                  </div>

                  <div className="p-6 pt-4">
                    <h2
                      id="delete-modal-title"
                      className="text-lg font-semibold text-gray-900 mb-4"
                    >
                      Remove team member?
                    </h2>
                    <p className="text-sm text-gray-700 mb-6">
                      {memberToDelete
                        ? `You're about to remove ${memberToDelete.FullName} (${
                            memberToDelete.Email
                          }) from ${
                            projectToRemove?.ProjectName || "the project"
                          }. ${
                            memberToDelete.Projects &&
                            memberToDelete.Projects.length > 1
                              ? `They will still have access to ${
                                  memberToDelete.Projects.length - 1
                                } other project(s).`
                              : "They will lose access to this project."
                          }`
                        : "This action cannot be undone."}
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-card-border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Do not remove
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteMember(deleteConfirmId.memberId)
                        }
                        className="px-4 py-2 text-sm font-medium text-white bg-trash-red rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Yes, remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        {/* Invitation Sent Notification */}
        {showNotification && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-gray-900 rounded-lg shadow-lg px-4 py-3 flex items-center gap-4 min-w-[320px] animate-[slideUp_0.3s_ease-out]">
              {/* Green Checkmark Icon */}
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />

              {/* Invitation Sent Text */}
              <span className="text-white text-sm font-medium">
                Invitation sent
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
