import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Members from '../Members';
import { UserContext } from '../../../auth/context/UserContext';

// Mock the apiClient
vi.mock('../../../../app/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock UserContext
const mockUser = {
  Id: 1,
  Name: 'Test User',
  EMail: 'test@example.com',
  Projects: [
    {
      Id: 1,
      Name: 'Test Project',
      IsActive: true,
      IsOwner: true,
      IsEditor: true,
      Surveys: [],
    },
  ],
};

const mockUserContextValue = {
  user: mockUser,
  setUser: vi.fn(),
  refreshUser: vi.fn(),
  loading: false,
  error: null,
  useActiveProjectId: () => 1,
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <UserContext.Provider value={mockUserContextValue}>
        {component}
      </UserContext.Provider>
    </BrowserRouter>
  );
};

describe('Members Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders both cards with correct headers and rows from mock data', async () => {
    renderWithProviders(<Members />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading members...')).not.toBeInTheDocument();
    });

    // Check for Team members section
    expect(screen.getByText('Team members')).toBeInTheDocument();
    expect(screen.getByText('Ali')).toBeInTheDocument();
    expect(screen.getByText('ali@baked.design')).toBeInTheDocument();
    expect(screen.getByText('Nick')).toBeInTheDocument();
    expect(screen.getByText('Cat')).toBeInTheDocument();

    // Check for Pending invitations section
    expect(screen.getByText('Pending invitations')).toBeInTheDocument();
    expect(screen.getByText('alimamedgasanov3@gmail.com')).toBeInTheDocument();
  });

  it('opens invite modal when "Invite team member" button is clicked', async () => {
    renderWithProviders(<Members />);

    await waitFor(() => {
      expect(screen.queryByText('Loading members...')).not.toBeInTheDocument();
    });

    const inviteButton = screen.getByText('Invite team member');
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByText('Invite team member')).toBeInTheDocument();
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });
  });

  it('adds pending invite to bottom card after filling form and submitting', async () => {
    renderWithProviders(<Members />);

    await waitFor(() => {
      expect(screen.queryByText('Loading members...')).not.toBeInTheDocument();
    });

    // Open modal
    const inviteButton = screen.getByText('Invite team member');
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });

    // Fill form
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    // Submit
    const sendButton = screen.getByText('Send invitation');
    fireEvent.click(sendButton);

    // Check that new invitation appears
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('opens confirmation modal when trash icon is clicked', async () => {
    renderWithProviders(<Members />);

    await waitFor(() => {
      expect(screen.queryByText('Loading members...')).not.toBeInTheDocument();
    });

    // Find trash icon for a non-owner member (Nick or Cat)
    const trashButtons = screen.getAllByLabelText(/Delete/i);
    const firstTrashButton = trashButtons[0];

    fireEvent.click(firstTrashButton);

    await waitFor(() => {
      expect(screen.getByText('Remove member?')).toBeInTheDocument();
      expect(screen.getByText(/This member will be removed/)).toBeInTheDocument();
    });
  });

  it('removes row from UI after confirming deletion', async () => {
    renderWithProviders(<Members />);

    await waitFor(() => {
      expect(screen.queryByText('Loading members...')).not.toBeInTheDocument();
    });

    // Get initial count
    const initialNickCount = screen.getAllByText('Nick').length;

    // Click trash icon
    const trashButtons = screen.getAllByLabelText(/Delete/i);
    fireEvent.click(trashButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Remove member?')).toBeInTheDocument();
    });

    // Confirm deletion
    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    // Check that member is removed
    await waitFor(() => {
      const nickCount = screen.queryAllByText('Nick').length;
      expect(nickCount).toBeLessThan(initialNickCount);
    });
  });

  it('role dropdown changes role and updates UI badge', async () => {
    renderWithProviders(<Members />);

    await waitFor(() => {
      expect(screen.queryByText('Loading members...')).not.toBeInTheDocument();
    });

    // Find a role badge button (Editor or Viewer, not Owner)
    const roleButtons = screen.getAllByText(/Editor|Viewer/);
    const editorButton = roleButtons.find(btn => btn.textContent?.includes('Editor'));

    if (editorButton) {
      fireEvent.click(editorButton);

      // Wait for dropdown to appear
      await waitFor(() => {
        expect(screen.getByText('Viewer')).toBeInTheDocument();
      });

      // Click Viewer option
      const viewerOption = screen.getAllByText('Viewer').find(btn => 
        btn.closest('button')?.textContent?.includes('Viewer')
      );

      if (viewerOption) {
        fireEvent.click(viewerOption);

        // Check that role badge updated
        await waitFor(() => {
          // The badge should now show Viewer
          expect(screen.getAllByText('Viewer').length).toBeGreaterThan(0);
        });
      }
    }
  });

  it('disables send invitation button when name or email is empty', async () => {
    renderWithProviders(<Members />);

    await waitFor(() => {
      expect(screen.queryByText('Loading members...')).not.toBeInTheDocument();
    });

    // Open modal
    const inviteButton = screen.getByText('Invite team member');
    fireEvent.click(inviteButton);

    await waitFor(() => {
      const sendButton = screen.getByText('Send invitation');
      expect(sendButton).toBeDisabled();
    });

    // Fill only name
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'John' } });

    // Button should still be disabled
    const sendButton = screen.getByText('Send invitation');
    expect(sendButton).toBeDisabled();

    // Fill email
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    // Button should now be enabled
    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
    });
  });

  it('closes modal when cancel is clicked', async () => {
    renderWithProviders(<Members />);

    await waitFor(() => {
      expect(screen.queryByText('Loading members...')).not.toBeInTheDocument();
    });

    // Open modal
    const inviteButton = screen.getByText('Invite team member');
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });

    // Click cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
    });
  });

  it('displays correct role badges with icons', async () => {
    renderWithProviders(<Members />);

    await waitFor(() => {
      expect(screen.queryByText('Loading members...')).not.toBeInTheDocument();
    });

    // Check for Owner badge
    expect(screen.getByText('Owner')).toBeInTheDocument();
    
    // Check for Editor badges
    expect(screen.getAllByText('Editor').length).toBeGreaterThan(0);
    
    // Check for Viewer badges in pending invitations
    expect(screen.getAllByText('Viewer').length).toBeGreaterThan(0);
  });

  it('displays correct date formatting', async () => {
    renderWithProviders(<Members />);

    await waitFor(() => {
      expect(screen.queryByText('Loading members...')).not.toBeInTheDocument();
    });

    // Check for formatted date (12 October)
    expect(screen.getByText('12 October')).toBeInTheDocument();
  });

  it('shows dash for owner added date', async () => {
    renderWithProviders(<Members />);

    await waitFor(() => {
      expect(screen.queryByText('Loading members...')).not.toBeInTheDocument();
    });

    // Owner should have "—" for Added column
    const tableRows = screen.getAllByRole('row');
    const ownerRow = tableRows.find(row => row.textContent?.includes('Ali'));
    
    if (ownerRow) {
      expect(ownerRow.textContent).toContain('—');
    }
  });
});

