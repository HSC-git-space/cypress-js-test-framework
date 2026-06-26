describe('JSONPlaceholder API', () => {
    it('fetches a single user and verifies key fields', () => {
        cy.request('https://jsonplaceholder.typicode.com/users/1').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('name');
            expect(response.body).to.have.property('email');
            expect(response.body.id).to.eq(1);
        });
    });
});