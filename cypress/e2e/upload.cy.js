describe('File Upload', () => {
    it('uploads a file and verifies the filename is displayed', () => {
        cy.visit('/upload');
        cy.get('#file-upload').selectFile('cypress/fixtures/example-upload.txt');
        cy.get('#file-submit').click();
        cy.get('#uploaded-files').should('contain', 'example-upload.txt');
    });
});