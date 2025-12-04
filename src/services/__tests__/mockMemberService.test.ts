import { describe, it, expect, beforeEach } from 'vitest';
import { mockMemberService, type InviteMemberPayload } from '../mockMemberService';

describe('MockMemberService', () => {
  beforeEach(() => {
    // Reset service state before each test
    // In a real implementation, you'd reset the internal state
  });

  it('getMembers returns all members', async () => {
    const members = await mockMemberService.getMembers();
    expect(members).toBeDefined();
    expect(Array.isArray(members)).toBe(true);
    expect(members.length).toBeGreaterThan(0);
  });

  it('getInvites returns all pending invitations', async () => {
    const invites = await mockMemberService.getInvites();
    expect(invites).toBeDefined();
    expect(Array.isArray(invites)).toBe(true);
  });

  it('inviteMember adds new invitation', async () => {
    const payload: InviteMemberPayload = {
      FullName: 'Test User',
      Email: 'test@example.com',
      Role: 'Viewer',
    };

    const newInvitation = await mockMemberService.inviteMember(payload);
    
    expect(newInvitation).toBeDefined();
    expect(newInvitation.FullName).toBe(payload.FullName);
    expect(newInvitation.Email).toBe(payload.Email);
    expect(newInvitation.Role).toBe(payload.Role);
    expect(newInvitation.SentAt).toBe('Just now');
  });

  it('deleteMember removes member from list', async () => {
    const membersBefore = await mockMemberService.getMembers();
    const memberToDelete = membersBefore[0];

    await mockMemberService.deleteMember(memberToDelete.Id);

    const membersAfter = await mockMemberService.getMembers();
    const deletedMember = membersAfter.find(m => m.Id === memberToDelete.Id);
    expect(deletedMember).toBeUndefined();
  });

  it('deleteInvitation removes invitation from list', async () => {
    const invitesBefore = await mockMemberService.getInvites();
    const inviteToDelete = invitesBefore[0];

    await mockMemberService.deleteInvitation(inviteToDelete.Id);

    const invitesAfter = await mockMemberService.getInvites();
    const deletedInvite = invitesAfter.find(inv => inv.Id === inviteToDelete.Id);
    expect(deletedInvite).toBeUndefined();
  });

  it('resendInvite updates SentAt timestamp', async () => {
    const invites = await mockMemberService.getInvites();
    const inviteToResend = invites[0];

    const updatedInvite = await mockMemberService.resendInvite(inviteToResend.Id);

    expect(updatedInvite.SentAt).toBe('Just now');
    expect(updatedInvite.Id).toBe(inviteToResend.Id);
  });
});

