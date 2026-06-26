describe('Dropdown', () => {
    it('selects an option by value and verifies the selection', () => {
        cy.visit('/dropdown');
        cy.get('#dropdown').select('1');
        cy.get('#dropdown').should('have.value', '1');
    });
});