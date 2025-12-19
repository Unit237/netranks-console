import { Plus, Trash2, Flag, Pencil, Eye, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import LoadingSpinner from "../../../app/components/LoadingSpinner";
import { useUser } from "../../auth/context/UserContext";
import { apiClient } from "../../../app/lib/api";

interface Member {
  Id: number;
  FullName: string;
  Email: string;
  IsOwner: boolean;
  IsEditor: boolean;
  CreatedAt: string;
}

interface PendingInvitation {
  Id: number;
  FullName: string;
  Email: string;
  Role: "Owner" | "Editor" | "Viewer";
  SentAt: string;
}

const MembersTab = () => {
  const { user } = useUser();
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [_showInviteModal, setShowInviteModal] = useState(false);

  // Get active project ID
  const activeProjectId = user?.Projects?.find((p) => p.IsActive)?.Id || user?.Projects?.[0]?.Id;

  useEffect(() => {
    if (activeProjectId) {
      fetchMembers();
    }
  }, [activeProjectId]);

  const fetchMembers = async () => {
    if (!activeProjectId) return;
    
    try {
      setLoading(true);
      
      // Fetch members
      const membersData = await apiClient.get<Member[]>(`api/GetMembers/${activeProjectId}`);
      setMembers(membersData || []);
      
      // Fetch pending invitations
      const invitationsData = await apiClient.get<Array<{
        Id: number;
        FullName: string;
        Email: string;
        Role: "Owner" | "Editor" | "Viewer";
        SentAt: string;
      }>>(`api/GetPendingInvitations/${activeProjectId}`);
      
      // Convert to relative time format
      const formattedInvitations: PendingInvitation[] = (invitationsData || []).map(inv => ({
        Id: inv.Id,
        FullName: inv.FullName,
        Email: inv.Email,
        Role: inv.Role,
        SentAt: formatRelativeTimeFromISO(inv.SentAt),
      }));
      setPendingInvitations(formattedInvitations);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTimeFromISO = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) {
      return "Just now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return formatDate(isoString);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  };

  const getRoleBadge = (member: Member) => {
    if (member.IsOwner) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium">
          <Flag className="w-3.5 h-3.5" />
          <span>Owner</span>
          <ChevronDown className="w-3 h-3" />
        </div>
      );
    } else if (member.IsEditor) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs font-medium">
          <Pencil className="w-3.5 h-3.5" />
          <span>Editor</span>
          <ChevronDown className="w-3 h-3" />
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium">
          <Eye className="w-3.5 h-3.5" />
          <span>Viewer</span>
          <ChevronDown className="w-3 h-3" />
        </div>
      );
    }
  };

  const getPendingRoleBadge = (role: "Owner" | "Editor" | "Viewer") => {
    if (role === "Owner") {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium">
          <Flag className="w-3.5 h-3.5" />
          <span>Owner</span>
        </div>
      );
    } else if (role === "Editor") {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs font-medium">
          <Pencil className="w-3.5 h-3.5" />
          <span>Editor</span>
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium">
          <Eye className="w-3.5 h-3.5" />
          <span>Viewer</span>
        </div>
      );
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    
    try {
      await apiClient.delete(`api/DeleteMember/${memberId}`);
      fetchMembers();
    } catch (error) {
      console.error("Failed to delete member:", error);
    }
  };

  const handleDeleteInvitation = async (invitationId: number) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return;
    
    try {
      await apiClient.delete(`api/DeleteInvitation/${invitationId}`);
      setPendingInvitations(prevInvitations => prevInvitations.filter((inv) => inv.Id !== invitationId));
    } catch (error) {
      console.error("Failed to delete invitation:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner message="Loading" />
      </div>
    );
  }

  // Empty state - show when no members (except owner)
  const hasOnlyOwner = members.length === 1 && members[0]?.IsOwner;
  
  if (hasOnlyOwner && pendingInvitations.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
          {/* Graphic */}
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-green-500 rounded-3xl flex items-center justify-center transform rotate-12">
              <span className="text-white text-4xl font-bold">N</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
              <span className="text-xs">👤</span>
            </div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
              <span className="text-xs">👥</span>
            </div>
            <div className="absolute top-1/2 -right-6 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
              <span className="text-xs">%</span>
            </div>
            <div className="absolute bottom-1/2 -left-6 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
              <span className="text-xs">⚙️</span>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Great insights are better when shared
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            Invite your colleagues to analyze reports, assign roles to control who can manage billing, and collaborate on surveys in real-time
          </p>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Invite your first teammate</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Members
        </h2>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Invite team member</span>
        </button>
      </div>

      {/* Team Members Table */}
      {members.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Team members
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {members.map((member) => (
                  <tr key={member.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {member.FullName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {member.Email}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(member.CreatedAt)}
                    </td>
                    <td className="py-3 px-4">
                      {getRoleBadge(member)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!member.IsOwner && (
                        <button
                          onClick={() => handleDeleteMember(member.Id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                          title="Remove member"
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
        </div>
      )}

      {/* Pending Invitations Table */}
      {pendingInvitations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Pending invitations
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sent
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {pendingInvitations.map((invitation) => (
                  <tr key={invitation.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {invitation.FullName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {invitation.Email}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {invitation.SentAt}
                    </td>
                    <td className="py-3 px-4">
                      {getPendingRoleBadge(invitation.Role)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteInvitation(invitation.Id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        title="Cancel invitation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersTab;

