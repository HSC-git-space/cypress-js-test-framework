describe('Login Page', () => {
    it('logs in successfully with valid credentials', () => {
        cy.fixture('users').then((users) => {
            cy.login(users.validUser.username, users.validUser.password);
            cy.contains('You logged into a secure area!').should('be.visible');
        });
    });

    it('shows an error with invalid credentials', () => {
        cy.fixture('users').then((users) => {
            cy.login(users.invalidUser.username, users.invalidUser.password);
            cy.contains('Your username is invalid!').should('be.visible');
        });
    });
});
