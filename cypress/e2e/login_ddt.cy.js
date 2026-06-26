const excelUsers = require("../fixtures/users-large.json");

describe("Excel-driven DDT - 50 records, registration-time generated", () => {
    excelUsers.forEach((user) => {
        it(`Excel record #${user.id}: ${user.username} (${user.category})`, () => {
            expect(user.id).to.be.a("number");
            expect(user.username).to.be.a("string").and.not.empty;
            expect(user.category).to.be.oneOf([
                "valid",
                "malformed_email",
                "weak_password",
                "empty_password",
                "whitespace_username",
            ]);

            if (user.category === "malformed_email") {
                expect(user.email).to.not.include("@");
            }
            if (user.category === "empty_password") {
                expect(user.password).to.equal("");
            }
            if (user.category === "whitespace_username") {
                expect(user.username).to.match(/^\s|\s$/);
            }
        });
    });
});

describe("Excel cy.task bridge - independent proof", () => {
    it("reads the same 50 records via the Node-side task", () => {
        cy.task("readExcelUsers").then((tasksUsers) => {
            expect(tasksUsers).to.have.length(50);
            expect(tasksUsers[0]).to.have.all.keys(
                "id",
                "username",
                "email",
                "password",
                "category",
                "expectedOutcome"
            );
        });
    });
});