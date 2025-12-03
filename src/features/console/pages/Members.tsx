import { Plus, Trash2, Flag, Pencil, Eye, ChevronDown, User, Users, Percent, UserCog } from "lucide-react";
import { useState, useEffect } from "react";
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

const Members = () => {
  const { user } = useUser();
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Get active project ID
  const activeProjectId = user?.Projects?.find((p) => p.IsActive)?.Id || user?.Projects?.[0]?.Id;

  useEffect(() => {
    if (activeProjectId) {
      fetchMembers();
    } else {
      setLoading(false);
    }
  }, [activeProjectId]);

  const fetchMembers = async () => {
    if (!activeProjectId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data: Member[] = await apiClient.get(`api/GetMembers/${activeProjectId}`);
      setMembers(data || []);
      // Don't set mock invitations - let empty state show
      setPendingInvitations([]);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      setMembers([]);
      setPendingInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${date.getDate()} ${months[date.getMonth()]}`;
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

  const handleDeleteInvitation = (invitationId: number) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return;
    setPendingInvitations(pendingInvitations.filter((inv) => inv.Id !== invitationId));
  };

  // Generate user initial and color
  const getUserInitial = () => {
    if (!user?.Name) return "N";
    const name = user.Name.trim();
    return name.charAt(0).toUpperCase();
  };

  const generateColorFromString = (str: string): string => {
    // Generate a consistent color from a string
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate a vibrant color (avoid too dark or too light)
    const hue = Math.abs(hash) % 360;
    const saturation = 60 + (Math.abs(hash) % 20); // 60-80%
    const lightness = 45 + (Math.abs(hash) % 15); // 45-60%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const userInitial = getUserInitial();
  const userColor = user?.Name 
    ? generateColorFromString(user.Name) 
    : user?.EMail 
    ? generateColorFromString(user.EMail)
    : "#2ADB50"; // Fallback to green

  // Empty state - show when no members beyond owner, or no pending invitations
  const hasOnlyOwner = members.length === 1 && members[0]?.IsOwner;
  const hasNoMembers = members.length === 0;
  const hasNoInvitations = pendingInvitations.length === 0;
  const isEmpty = !loading && ((hasNoMembers || hasOnlyOwner) && hasNoInvitations);
  
  // Show loading state briefly
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600 dark:text-gray-400">Loading members...</div>
      </div>
    );
  }
  
  // Show empty state as the first thing when there are no members/invitations
  if (isEmpty) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[600px] text-center">
          {/* Graphic - Stylized initial with surrounding icons matching reference exactly */}
          <div className="relative mb-8 w-32 h-32 mx-auto">
            {/* Main colored square with user initial - container sized to square */}
            <div 
              className="absolute inset-0 w-32 h-32 rounded-2xl flex items-center justify-center transform rotate-12 shadow-md z-10"
              style={{ 
                backgroundColor: userColor,
              }}
            >
              <span className="text-white text-7xl font-bold">{userInitial}</span>
            </div>
            {/* Mini-icons positioned at corners of the square container */}
            {/* Top-left: Single person */}
            <div 
              className="absolute w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center z-20"
              style={{
                top: '-20px',
                left: '-20px',
              }}
            >
              <User className="w-5 h-5 text-gray-600" />
            </div>
            {/* Top-right: Two people */}
            <div 
              className="absolute w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center z-20"
              style={{
                top: '-20px',
                right: '-20px',
              }}
            >
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            {/* Bottom-right: Person with percentage */}
            <div 
              className="absolute w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center z-20"
              style={{
                bottom: '-20px',
                right: '-20px',
              }}
            >
              <div className="flex items-center gap-0.5">
                <User className="w-4 h-4 text-gray-600" />
                <Percent className="w-3 h-3 text-gray-600" />
              </div>
            </div>
            {/* Bottom-left: Person with gear */}
            <div 
              className="absolute w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center z-20"
              style={{
                bottom: '-20px',
                left: '-20px',
              }}
            >
              <div className="flex items-center gap-0.5">
                <User className="w-4 h-4 text-gray-600" />
                <UserCog className="w-3 h-3 text-gray-600" />
              </div>
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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Members
      </h1>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
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
        </div>
      )}

      {/* Pending Invitations Table */}
      {pendingInvitations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Pending invitations
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
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
        </div>
      )}
    </div>
  );
};

export default Members;

