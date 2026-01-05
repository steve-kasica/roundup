/**
 * @fileoverview Custom Cypress commands.
 * @module cypress/support/commands
 *
 * Add custom commands here that can be used across all tests.
 * @see {@link https://on.cypress.io/custom-commands} for more information.
 */

// Example: cy.getByTestId('element') to select by data-testid attribute
Cypress.Commands.add("getByTestId", (testId) => {
  return cy.get(`[data-testid="${testId}"]`);
});

// Example: cy.getByClass('ClassName') to select by class
Cypress.Commands.add("getByClass", (className) => {
  return cy.get(`.${className}`);
});
