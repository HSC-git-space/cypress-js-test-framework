const usersData = require('../fixtures/users.json');

describe('Login - Data Driven', () => {
    usersData.loginScenarios.forEach((scenario) => {
        it(`should handle: ${scenario.scenario}`, () => {
            cy.visit('/login');

            if (scenario.username) {
                cy.get('#username').type(scenario.username);
            }
            if (scenario.password) {
                cy.get('#password').type(scenario.password);
            }

            cy.get('button[type="submit"]').click();

            if (scenario.expectedOutcome === 'success') {
                cy.get('.flash.success').should('be.visible');
                cy.url().should('include', '/secure');
            } else {
                cy.get('.flash.error').should('be.visible');
            }
        });
    });
});