Cypress.Commands.add('login', (username, password) => {
    cy.visit('/login');
    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').click();
});

Cypress.Commands.add("loginAndNavigateTo", (path) => {
    cy.login("tomsmith", "SuperSecretPassword!");
    cy.url().should("include", path);
});
