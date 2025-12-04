import { Plus, Trash2, Pencil, Eye, ChevronDown, User, Mail, Send, CheckCircle2, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Owner" | "Editor" | "Viewer">("Viewer");
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleteConfirmType, setDeleteConfirmType] = useState<"member" | "invitation" | null>(null);
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [lastInvitationId, setLastInvitationId] = useState<number | null>(null);

  // Get active project ID
  const activeProjectId = user?.Projects?.find((p) => p.IsActive)?.Id || user?.Projects?.[0]?.Id;

  useEffect(() => {
    if (activeProjectId) {
      fetchMembers();
    } else {
      setLoading(false);
    }
  }, [activeProjectId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId !== null) {
        const dropdownElement = dropdownRefs.current[openDropdownId];
        const target = event.target as Node;
        if (dropdownElement && !dropdownElement.contains(target)) {
          // Check if click is on the backdrop or outside
          const isBackdrop = (target as HTMLElement).getAttribute('aria-hidden') === 'true';
          if (isBackdrop || !dropdownElement.contains(target)) {
            setOpenDropdownId(null);
            setDropdownPosition(null);
          }
        }
      }
    };

    if (openDropdownId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openDropdownId]);

  // Handle ESC key to close delete confirmation modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && deleteConfirmId !== null) {
        setDeleteConfirmId(null);
        setDeleteConfirmType(null);
      }
    };

    if (deleteConfirmId !== null) {
      document.addEventListener("keydown", handleEscKey);
      return () => document.removeEventListener("keydown", handleEscKey);
    }
  }, [deleteConfirmId]);

  const fetchMembers = async () => {
    if (!activeProjectId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // Mock data matching screenshot
      const dummyMembers: Member[] = [
        {
          Id: 1,
          FullName: "Ali",
          Email: "ali@baked.design",
          IsOwner: true,
          IsEditor: false,
          CreatedAt: "",
        },
        {
          Id: 2,
          FullName: "Nick",
          Email: "nick@baked.design",
          IsOwner: false,
          IsEditor: true,
          CreatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          Id: 3,
          FullName: "Cat",
          Email: "cat@netranks.ai",
          IsOwner: false,
          IsEditor: true,
          CreatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setMembers(dummyMembers);

      const dummyInvitations: PendingInvitation[] = [
        {
          Id: 2,
          FullName: "Nick",
          Email: "nick@baked.design",
          Role: "Viewer",
          SentAt: "Just now",
        },
        {
          Id: 3,
          FullName: "Cat",
          Email: "cat@netranks.ai",
          Role: "Viewer",
          SentAt: "2 hours ago",
        },
      ];
      setPendingInvitations(dummyInvitations);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const formatRelativeTime = (sentAt: string) => {
    if (sentAt === "Just now" || sentAt.includes("ago") || sentAt.includes("hour")) {
      return sentAt;
    }
    return formatDate(sentAt);
  };

  const handleRoleChange = (memberId: number, newRole: "Owner" | "Editor" | "Viewer") => {
    console.log('handleRoleChange:', { memberId, newRole });
    
    // Update member role using functional update
    setMembers(prevMembers => {
      const updated = prevMembers.map(member => {
        if (member.Id === memberId) {
          console.log('Updating member:', member, 'to role:', newRole);
          // Create a new object with updated role flags
          const updatedMember = {
            ...member,
            IsOwner: newRole === "Owner",
            IsEditor: newRole === "Editor",
          };
          console.log('Updated member:', updatedMember);
          return updatedMember;
        }
        return member;
      });
      console.log('All updated members:', updated);
      return updated;
    });
    
    // Close dropdown after update
    setOpenDropdownId(null);
    setDropdownPosition(null);
  };

  const handleDeleteMember = async (memberId: number) => {
    try {
      await apiClient.delete(`api/DeleteMember/${memberId}`);
      setMembers(prevMembers => prevMembers.filter(m => m.Id !== memberId));
      setDeleteConfirmId(null);
      setDeleteConfirmType(null);
    } catch (error) {
      console.error("Failed to delete member:", error);
    }
  };

  const handleDeleteInvitation = (invitationId: number) => {
    setPendingInvitations(pendingInvitations.filter((inv) => inv.Id !== invitationId));
    setDeleteConfirmId(null);
    setDeleteConfirmType(null);
  };

  const handleSendInvitation = () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      return;
    }

    const newInvitation: PendingInvitation = {
      Id: Date.now(),
      FullName: inviteName,
      Email: inviteEmail,
      Role: inviteRole,
      SentAt: "Just now",
    };

    setPendingInvitations([...pendingInvitations, newInvitation]);
    setLastInvitationId(newInvitation.Id);
    setShowInviteModal(false);
    setInviteName("");
    setInviteEmail("");
    setInviteRole("Viewer");
    setShowNotification(true);

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
      setLastInvitationId(null);
    }, 5000);
  };

  const handleUndoInvitation = () => {
    if (lastInvitationId !== null) {
      setPendingInvitations(prevInvitations => 
        prevInvitations.filter(inv => inv.Id !== lastInvitationId)
      );
      setShowNotification(false);
      setLastInvitationId(null);
    }
  };

  const handleCloseModal = () => {
    setShowInviteModal(false);
    setInviteName("");
    setInviteEmail("");
    setInviteRole("Viewer");
  };

  const getRoleBadge = (member: Member) => {
    const isOpen = openDropdownId === member.Id;
    const currentRole = member.IsOwner ? "Owner" : member.IsEditor ? "Editor" : "Viewer";

    return (
      <div 
        className="relative" 
        ref={(el) => {
          dropdownRefs.current[member.Id] = el;
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!isOpen) {
              // Calculate position for dropdown
              const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setDropdownPosition({
                top: buttonRect.bottom + 4,
                left: buttonRect.left,
              });
              setOpenDropdownId(member.Id);
            } else {
              setOpenDropdownId(null);
              setDropdownPosition(null);
            }
          }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            member.IsOwner
              ? "bg-blue-50 text-owner-blue"
              : member.IsEditor
              ? "bg-orange-50 text-editor-orange"
              : "bg-gray-100 text-gray-700"
          }`}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {member.IsOwner ? (
            <Send className="w-3.5 h-3.5 fill-current" />
          ) : member.IsEditor ? (
            <Pencil className="w-3.5 h-3.5" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
          <span>{currentRole}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && dropdownPosition && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => {
                // Close dropdown when clicking on backdrop
                setOpenDropdownId(null);
                setDropdownPosition(null);
              }}
              aria-hidden="true"
            />
            <div 
              className="fixed z-50 bg-white rounded-lg shadow-lg border border-card-border min-w-[180px] py-1"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {currentRole !== "Owner" && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Owner clicked for member:', member.Id);
                    handleRoleChange(member.Id, "Owner");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-hover-bg transition-colors text-left"
                >
                  <Send className="w-4 h-4 text-owner-blue fill-current" />
                  <span>Owner</span>
                </button>
              )}
              {currentRole !== "Editor" && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Editor clicked for member:', member.Id);
                    handleRoleChange(member.Id, "Editor");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-hover-bg transition-colors text-left"
                >
                  <Pencil className="w-4 h-4 text-editor-orange" />
                  <span>Editor</span>
                </button>
              )}
              {currentRole !== "Viewer" && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Viewer clicked for member:', member.Id);
                    handleRoleChange(member.Id, "Viewer");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-hover-bg transition-colors text-left"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                  <span>Viewer</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const getPendingRoleBadge = (role: "Owner" | "Editor" | "Viewer") => {
    if (role === "Owner") {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-owner-blue text-xs font-medium">
          <Send className="w-3.5 h-3.5 fill-current" />
          <span>Owner</span>
        </div>
      );
    } else if (role === "Editor") {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 text-editor-orange text-xs font-medium">
          <Pencil className="w-3.5 h-3.5" />
          <span>Editor</span>
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
          <Eye className="w-3.5 h-3.5" />
          <span>Viewer</span>
        </div>
      );
    }
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
                        Added
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-medium text-muted-text uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-muted-text uppercase tracking-wider">
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {members.map((member) => (
                      <tr key={member.Id} className="hover:bg-hover-bg transition-colors">
                        <td className="py-4 px-6">
                          <div className="text-base font-semibold text-gray-900">
                            {member.FullName}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-muted-text">
                          {member.Email}
                        </td>
                        <td className="py-4 px-6 text-sm text-muted-text">
                          {member.CreatedAt ? formatDate(member.CreatedAt) : "—"}
                        </td>
                        <td className="py-4 px-6">
                          {getRoleBadge(member)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {!member.IsOwner && (
                            <button
                              onClick={() => {
                                setDeleteConfirmId(member.Id);
                                setDeleteConfirmType("member");
                              }}
                              className="text-trash-red hover:text-red-700 transition-colors"
                              aria-label={`Delete ${member.FullName}`}
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
                  <div key={member.Id} className="p-4 hover:bg-hover-bg transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-base font-semibold text-gray-900 mb-1">
                          {member.FullName}
                        </div>
                        <div className="text-sm text-muted-text mb-2">
                          {member.Email}
                        </div>
                      </div>
                      {!member.IsOwner && (
                        <button
                          onClick={() => {
                            setDeleteConfirmId(member.Id);
                            setDeleteConfirmType("member");
                          }}
                          className="text-trash-red hover:text-red-700 transition-colors ml-2"
                          aria-label={`Delete ${member.FullName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-text">
                        Added: {member.CreatedAt ? formatDate(member.CreatedAt) : "—"}
                      </div>
                      <div>
                        {getRoleBadge(member)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pending Invitations Card */}
        {pendingInvitations.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-900 mb-4">
              Pending invitations
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
                        Sent
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-medium text-muted-text uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-muted-text uppercase tracking-wider">
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {pendingInvitations.map((invitation) => (
                      <tr key={invitation.Id} className="hover:bg-hover-bg transition-colors">
                        <td className="py-4 px-6">
                          <div className="text-base font-semibold text-gray-900">
                            {invitation.FullName}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-muted-text">
                          {invitation.Email}
                        </td>
                        <td className="py-4 px-6 text-sm text-muted-text">
                          {formatRelativeTime(invitation.SentAt)}
                        </td>
                        <td className="py-4 px-6">
                          {getPendingRoleBadge(invitation.Role)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => {
                              setDeleteConfirmId(invitation.Id);
                              setDeleteConfirmType("invitation");
                            }}
                            className="text-trash-red hover:text-red-700 transition-colors"
                            aria-label={`Cancel invitation for ${invitation.FullName}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-card-border">
                {pendingInvitations.map((invitation) => (
                  <div key={invitation.Id} className="p-4 hover:bg-hover-bg transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-base font-semibold text-gray-900 mb-1">
                          {invitation.FullName}
                        </div>
                        <div className="text-sm text-muted-text mb-2">
                          {invitation.Email}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setDeleteConfirmId(invitation.Id);
                          setDeleteConfirmType("invitation");
                        }}
                        className="text-trash-red hover:text-red-700 transition-colors ml-2"
                        aria-label={`Cancel invitation for ${invitation.FullName}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-text">
                        Sent: {formatRelativeTime(invitation.SentAt)}
                      </div>
                      <div>
                        {getPendingRoleBadge(invitation.Role)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Invite Team Member Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="invite-modal-title">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseModal}
              aria-hidden="true"
            />
            
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md z-10">
              <div className="p-6">
                <h2 id="invite-modal-title" className="text-lg font-semibold text-gray-900 mb-6">
                  Invite team member
                </h2>

                {/* Name Input */}
                <div className="mb-4">
                  <label htmlFor="invite-name" className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700 mb-2">
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
                      <Send className={`w-5 h-5 flex-shrink-0 fill-current ${inviteRole === "Owner" ? "text-owner-blue" : "text-gray-400"}`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium mb-0.5 ${inviteRole === "Owner" ? "text-owner-blue" : "text-gray-900"}`}>
                          Owner
                        </div>
                        <div className="text-xs text-muted-text">
                          Full access to all features, members, and billing
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
                      <Pencil className={`w-5 h-5 flex-shrink-0 ${inviteRole === "Editor" ? "text-editor-orange" : "text-gray-400"}`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium mb-0.5 ${inviteRole === "Editor" ? "text-editor-orange" : "text-gray-900"}`}>
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
                      <Eye className={`w-5 h-5 flex-shrink-0 ${inviteRole === "Viewer" ? "text-gray-600" : "text-gray-400"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium mb-0.5 text-gray-900">
                          Viewer
                        </div>
                        <div className="text-xs text-muted-text">
                          Can create and edit surveys, view all reports
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
                    disabled={!inviteName.trim() || !inviteEmail.trim()}
                    className="px-0 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send invitation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId !== null && deleteConfirmType && (() => {
          const memberToDelete = deleteConfirmType === "member" 
            ? members.find(m => m.Id === deleteConfirmId)
            : null;
          const invitationToDelete = deleteConfirmType === "invitation"
            ? pendingInvitations.find(inv => inv.Id === deleteConfirmId)
            : null;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => {
                  setDeleteConfirmId(null);
                  setDeleteConfirmType(null);
                }}
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
                    onClick={() => {
                      setDeleteConfirmId(null);
                      setDeleteConfirmType(null);
                    }}
                    className="text-muted-text hover:text-gray-900 transition-colors text-sm"
                    aria-label="Close"
                  >
                    x esc
                  </button>
                </div>

                <div className="p-6 pt-4">
                  <h2 id="delete-modal-title" className="text-lg font-semibold text-gray-900 mb-4">
                    {deleteConfirmType === "member" ? "Remove team member?" : "Cancel invitation?"}
                  </h2>
                  <p className="text-sm text-gray-700 mb-6">
                    {deleteConfirmType === "member" && memberToDelete
                      ? `You're about to remove ${memberToDelete.FullName} (${memberToDelete.Email}) from this workspace. They will immediately lose access to all projects and reports.`
                      : deleteConfirmType === "invitation" && invitationToDelete
                      ? `You're about to cancel the invitation for ${invitationToDelete.FullName} (${invitationToDelete.Email}). They will not be able to join the workspace.`
                      : "This action cannot be undone."}
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmId(null);
                        setDeleteConfirmType(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-card-border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Do not remove
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (deleteConfirmType === "member") {
                          handleDeleteMember(deleteConfirmId);
                        } else {
                          handleDeleteInvitation(deleteConfirmId);
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-trash-red rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Yes, delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Invitation Sent Notification */}
        {showNotification && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out animate-[slideUp_0.3s_ease-out]">
            <div className="flex items-center rounded-lg overflow-hidden shadow-lg">
              {/* Left portion - Black background with checkmark and text */}
              <div className="bg-gray-900 text-white px-4 py-3 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">Invitation sent</span>
              </div>
              {/* Right portion - Black button with Undo */}
              <button
                type="button"
                onClick={handleUndoInvitation}
                className="bg-gray-900 border-l border-gray-700 px-4 py-3 flex items-center gap-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Undo</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
