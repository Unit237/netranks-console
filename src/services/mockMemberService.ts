export interface Member {
  Id: number;
  FullName: string;
  Email: string;
  IsOwner: boolean;
  IsEditor: boolean;
  CreatedAt: string;
}

export interface PendingInvitation {
  Id: number;
  FullName: string;
  Email: string;
  Role: "Owner" | "Editor" | "Viewer";
  SentAt: string;
}

export interface InviteMemberPayload {
  FullName: string;
  Email: string;
  Role: "Owner" | "Editor" | "Viewer";
}

// Default mock data matching screenshot
const defaultMembers: Member[] = [
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
    CreatedAt: "2024-10-12T00:00:00.000Z",
  },
  {
    Id: 3,
    FullName: "Cat",
    Email: "cat@netranks.ai",
    IsOwner: false,
    IsEditor: true,
    CreatedAt: "2024-10-12T00:00:00.000Z",
  },
];

const defaultInvitations: PendingInvitation[] = [
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

class MockMemberService {
  private members: Member[] = [...defaultMembers];
  private invitations: PendingInvitation[] = [...defaultInvitations];

  async getMembers(): Promise<Member[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...this.members];
  }

  async getInvites(): Promise<PendingInvitation[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...this.invitations];
  }

  async inviteMember(payload: InviteMemberPayload): Promise<PendingInvitation> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newInvitation: PendingInvitation = {
      Id: Date.now(),
      FullName: payload.FullName,
      Email: payload.Email,
      Role: payload.Role,
      SentAt: "Just now",
    };

    this.invitations.push(newInvitation);
    return newInvitation;
  }

  async deleteMember(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    this.members = this.members.filter(m => m.Id !== id);
  }

  async resendInvite(id: number): Promise<PendingInvitation> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const invitation = this.invitations.find(inv => inv.Id === id);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    const updatedInvitation: PendingInvitation = {
      ...invitation,
      SentAt: "Just now",
    };

    this.invitations = this.invitations.map(inv => 
      inv.Id === id ? updatedInvitation : inv
    );

    return updatedInvitation;
  }

  async deleteInvitation(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    this.invitations = this.invitations.filter(inv => inv.Id !== id);
  }
}

export const mockMemberService = new MockMemberService();

