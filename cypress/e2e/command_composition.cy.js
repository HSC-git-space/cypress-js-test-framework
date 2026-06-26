describe("Command composition - loginAndNavigateTo", () => {
    it("logs in and lands on the secure area", () => {
        cy.loginAndNavigateTo("/secure");
        cy.get("h2").should("contain", "Secure Area");
    });

    it("composed command resolves to authenticated session", () => {
        cy.loginAndNavigateTo("/secure");
        cy.url().should("include", "/secure");
    });
});