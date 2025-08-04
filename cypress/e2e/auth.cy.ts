describe('Authentication E2E Tests', () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit('/login');
  });

  it('should display login form', () => {
    // Check if login page loads successfully
    cy.url().should('include', '/login');

    // Check for form elements (adjust selectors based on your actual form)
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show validation errors for invalid credentials', () => {
    // Fill out the form with invalid credentials
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Check for the Portuguese error message for invalid credentials
    cy.contains('Email ou senha inválidos').should('be.visible');
  });

  it('should prevent form submission with empty required fields', () => {
    // Try to submit without filling the form - HTML5 validation should prevent submission
    cy.get('button[type="submit"]').click();

    // The form should not submit and URL should remain on login page
    cy.url().should('include', '/login');

    // Check that required fields are indeed required
    cy.get('input[type="email"]').should('have.attr', 'required');
    cy.get('input[type="password"]').should('have.attr', 'required');
  });

  it('should navigate to register page from login', () => {
    // Test navigation between auth pages
    cy.contains('Criar minha conta').click();
    cy.url().should('include', '/register');
  });

  it('should attempt login with test credentials', () => {
    // Fill out the login form
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('testpassword123');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // This will likely show an error since these are test credentials
    // Adjust expectations based on your authentication flow
  });
});
