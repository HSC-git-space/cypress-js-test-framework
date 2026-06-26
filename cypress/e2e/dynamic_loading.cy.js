describe('Dynamic Loading', () => {
    it('waits automatically for the hidden element to appear', () => {
        cy.visit('/dynamic_loading/1');
        cy.get('#start button').click();
        cy.get('#finish h4', { timeout: 10000 }).should('be.visible').and('contain', 'Hello World!');
    });
});