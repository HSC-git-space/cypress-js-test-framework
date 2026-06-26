const { defineConfig } = require("cypress");
const ExcelJS = require("exceljs");
const path = require("path");

module.exports = defineConfig({
    e2e: {
        baseUrl: "https://the-internet.herokuapp.com",
        setupNodeEvents(on, config) {
            on("task", {
                async readExcelUsers() {
                    const filePath = path.join(__dirname, "cypress", "fixtures", "users-large.xlsx");
                    const workbook = new ExcelJS.Workbook();
                    await workbook.xlsx.readFile(filePath);

                    const worksheet = workbook.getWorksheet("Users");
                    const users = [];

                    worksheet.eachRow((row, rowNumber) => {
                        if (rowNumber === 1) return; // skip header row

                        users.push({
                            id: row.getCell(1).value,
                            username: row.getCell(2).value,
                            email: row.getCell(3).value,
                            password: row.getCell(4).value,
                            category: row.getCell(5).value,
                            expectedOutcome: row.getCell(6).value,
                        });
                    });

                    return users;
                },
            });
        },
    },
});