import { Check, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LoadingSpinner from "../../../app/components/LoadingSpinner";
import { apiClient } from "../../../app/lib/api";
import { useUser } from "../../auth/context/UserContext";
import type { Member } from "../@types";
import DeleteMemberModal from "../components/DeleteMemberModal";
import InviteMemberModal from "../components/InviteMemberModal";
import MemberCard from "../components/MemberCard";
import RoleBadge from "../components/RoleBadge";
import { fetchAllMembers } from "../services/memberService";
import { formatDate, formatFullDate } from "../utils/utils";

const MembersPage = () => {
  const { user } = useUser();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
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

  useEffect(() => {
    if (user?.Projects && user.Projects.length > 0) {
      fetchMembers();
    } else {
      setLoading(false);
    }
  }, [user?.Projects]);

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
      const projectPromises = user.Projects.map(async (project) => {
        try {
          const membersData = await fetchAllMembers(project.Id);
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

  const handleSendInvitation = async (data: {
    name: string;
    email: string;
    role: "Owner" | "Editor" | "Viewer";
    projectIds: number[];
  }) => {
    setIsInviting(true);

    try {
      const invitationIds: number[] = [];
      const errors: string[] = [];

      // Invite to each selected project one by one
      for (const projectId of data.projectIds) {
        try {
          console.log(`Inviting ${data.email} to project ${projectId}`);
          const invitationId = await apiClient.post<number>(`api/AddMember`, {
            ProjectId: projectId,
            FullName: data.name,
            EMail: data.email,
            IsOwner: data.role === "Owner",
            IsEditor: data.role === "Editor" || data.role === "Owner",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner message="Loading" />
      </div>
    );
  }

  return (
    <div className="bg-page-bg min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-6 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Page
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
                        <td className="py-4 px-6">
                          <RoleBadge member={member} />
                        </td>
                        <td className="py-4 px-6 text-right">
                          {member.Projects &&
                            member.Projects.length > 0 &&
                            member.Projects.some(
                              () => !member.IsProjectOwner
                            ) && (
                              <button
                                onClick={() => {
                                  // Use the first project's member ID for deletion
                                  const firstProject = member.Projects[0];
                                  setDeleteConfirmId({
                                    memberId: firstProject.MemberId,
                                    projectId: firstProject.ProjectId,
                                  });
                                }}
                                className="text-trash-red hover:text-red-700 transition-colors"
                                aria-label={`Remove ${member.FullName}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-card-border">
                {members.map((member) => (
                  <MemberCard
                    key={member.Email}
                    member={member}
                    setDeleteConfirmId={setDeleteConfirmId}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Invite Team Member Modal */}
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSendInvitation={handleSendInvitation}
          projects={user?.Projects || []}
          activeProjectId={activeProjectId}
          isInviting={isInviting}
        />

        {/* Delete Confirmation Modal */}
        <DeleteMemberModal
          isOpen={deleteConfirmId !== null}
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={handleDeleteMember}
          memberToDelete={
            deleteConfirmId
              ? members.find(
                  (m) =>
                    m.Projects &&
                    m.Projects.some(
                      (p) => p.MemberId === deleteConfirmId.memberId
                    )
                )
              : undefined
          }
          projectToRemove={
            deleteConfirmId
              ? members
                  .find(
                    (m) =>
                      m.Projects &&
                      m.Projects.some(
                        (p) => p.MemberId === deleteConfirmId.memberId
                      )
                  )
                  ?.Projects?.find(
                    (p) => p.MemberId === deleteConfirmId.memberId
                  )
              : undefined
          }
        />

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

export default MembersPage;
