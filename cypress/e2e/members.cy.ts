/// <reference types="cypress" />

/**
 * End-to-end tests for Members page
 * 
 * These tests verify:
 * - Responsive behavior (table to card stacking)
 * - Invite flow (open modal, fill form, submit)
 * - Delete flow (click trash, confirm, verify removal)
 * - Role dropdown functionality
 * - Accessibility features
 */

describe('Members Page E2E Tests', () => {
  beforeEach(() => {
    // Mock authentication and user context
    cy.visit('/console/members');
    // Wait for page to load
    cy.contains('Members').should('be.visible');
  });

  describe('Responsive Behavior', () => {
    it('displays table layout on desktop (>=768px)', () => {
      cy.viewport(1024, 768);
      cy.get('table').should('be.visible');
      cy.get('[class*="md:hidden"]').should('not.be.visible');
    });

    it('displays card layout on mobile (<768px)', () => {
      cy.viewport(375, 667);
      cy.get('[class*="md:hidden"]').should('be.visible');
      cy.get('table').should('not.be.visible');
    });

    it('preserves role and trash controls in mobile view', () => {
      cy.viewport(375, 667);
      cy.contains('Nick').should('be.visible');
      // Check that role badge is visible
      cy.contains('Editor').should('be.visible');
      // Check that trash icon is visible
      cy.get('[aria-label*="Delete"]').should('exist');
    });
  });

  describe('Invite Team Member Flow', () => {
    it('opens invite modal when button is clicked', () => {
      cy.contains('Invite team member').click();
      cy.contains('Invite team member').should('be.visible'); // Modal title
      cy.get('input[type="text"]').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
    });

    it('validates form fields before enabling submit', () => {
      cy.contains('Invite team member').click();
      cy.contains('Send invitation').should('be.disabled');
      
      cy.get('input[type="text"]').type('John Doe');
      cy.contains('Send invitation').should('still.be.disabled');
      
      cy.get('input[type="email"]').type('john@example.com');
      cy.contains('Send invitation').should('not.be.disabled');
    });

    it('adds new invitation to pending list after submission', () => {
      const initialCount = cy.get('tbody tr').its('length');
      
      cy.contains('Invite team member').click();
      cy.get('input[type="text"]').type('Test User');
      cy.get('input[type="email"]').type('test@example.com');
      cy.contains('Send invitation').click();
      
      // Verify new invitation appears
      cy.contains('Test User').should('be.visible');
      cy.contains('test@example.com').should('be.visible');
    });

    it('closes modal when cancel is clicked', () => {
      cy.contains('Invite team member').click();
      cy.contains('Cancel').click();
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  describe('Delete Member Flow', () => {
    it('opens confirmation modal when trash icon is clicked', () => {
      cy.get('[aria-label*="Delete"]').first().click();
      cy.contains('Remove member?').should('be.visible');
      cy.contains('This member will be removed').should('be.visible');
    });

    it('removes member from list after confirmation', () => {
      // Get initial member count
      cy.get('tbody tr').then(($rows) => {
        const initialCount = $rows.length;
        
        cy.get('[aria-label*="Delete"]').first().click();
        cy.contains('Remove').click();
        
        // Verify member is removed
        cy.get('tbody tr').should('have.length', initialCount - 1);
      });
    });

    it('cancels deletion when cancel button is clicked', () => {
      cy.get('[aria-label*="Delete"]').first().click();
      cy.contains('Cancel').click();
      cy.contains('Remove member?').should('not.exist');
    });
  });

  describe('Delete Invitation Flow', () => {
    it('opens confirmation modal for pending invitations', () => {
      // Navigate to pending invitations section
      cy.contains('Pending invitations').scrollIntoView();
      cy.get('[aria-label*="Cancel invitation"]').first().click();
      cy.contains('Cancel invitation?').should('be.visible');
    });

    it('removes invitation after confirmation', () => {
      cy.contains('Pending invitations').scrollIntoView();
      cy.get('[aria-label*="Cancel invitation"]').then(($buttons) => {
        const initialCount = $buttons.length;
        
        cy.get('[aria-label*="Cancel invitation"]').first().click();
        cy.contains('Cancel invitation').click(); // Confirm button
        
        // Verify invitation is removed
        cy.get('[aria-label*="Cancel invitation"]').should('have.length', initialCount - 1);
      });
    });
  });

  describe('Role Dropdown Functionality', () => {
    it('opens dropdown when role badge is clicked', () => {
      cy.contains('Editor').first().click();
      cy.contains('Viewer').should('be.visible'); // Option in dropdown
      cy.contains('Owner').should('be.visible'); // Option in dropdown
    });

    it('changes role when option is selected', () => {
      cy.contains('Editor').first().click();
      cy.contains('Viewer').click(); // Select Viewer option
      
      // Verify role badge updated (may need to wait for state update)
      cy.wait(100);
      cy.contains('Viewer').should('be.visible');
    });

    it('closes dropdown when clicking outside', () => {
      cy.contains('Editor').first().click();
      cy.contains('Viewer').should('be.visible');
      cy.get('body').click(0, 0); // Click outside
      cy.contains('Viewer').should('not.exist'); // Dropdown closed
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for interactive elements', () => {
      cy.get('[aria-label*="Invite team member"]').should('exist');
      cy.get('[aria-label*="Delete"]').should('exist');
      cy.get('[role="dialog"]').should('not.exist'); // Initially no modal
    });

    it('supports keyboard navigation', () => {
      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('exist');
    });

    it('has proper modal accessibility attributes', () => {
      cy.contains('Invite team member').click();
      cy.get('[role="dialog"]').should('have.attr', 'aria-modal', 'true');
      cy.get('[role="dialog"]').should('have.attr', 'aria-labelledby');
    });
  });

  describe('Data Display', () => {
    it('displays correct date formatting', () => {
      cy.contains('12 October').should('be.visible');
    });

    it('shows dash for owner added date', () => {
      cy.contains('Ali').parent().parent().contains('—').should('be.visible');
    });

    it('displays correct role badges with icons', () => {
      cy.contains('Owner').should('be.visible');
      cy.contains('Editor').should('be.visible');
      cy.contains('Viewer').should('be.visible');
    });
  });
});

