describe('Homepage E2E Tests', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/');
  });

  it('should display the homepage', () => {
    // Check if the page loads successfully
    cy.url().should('include', 'localhost:3000');

    // You can add more specific assertions based on your homepage content
    // For example:
    // cy.contains('Welcome').should('be.visible')
    // cy.get('[data-testid="main-heading"]').should('exist')
  });

  it('should navigate to login page', () => {
    // Test navigation to login page
    cy.visit('/login');
    cy.url().should('include', '/login');

    // You can add assertions for login form elements
    // For example:
    // cy.get('input[type="email"]').should('be.visible')
    // cy.get('input[type="password"]').should('be.visible')
  });

  it('should navigate to register page', () => {
    // Test navigation to register page
    cy.visit('/register');
    cy.url().should('include', '/register');

    // You can add assertions for register form elements
  });
});
