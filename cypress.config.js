const { defineConfig } = require("cypress");
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

function getEnvConfig(environment) {
    const envConfigPath = path.join(
        __dirname,
        "cypress/config",
        `${environment}.json`
    );
    if (!fs.existsSync(envConfigPath)) {
        throw new Error(`No config file found for environment: ${environment}`);
    }
    return JSON.parse(fs.readFileSync(envConfigPath, "utf8"));
}

module.exports = defineConfig({
    e2e: {
        retries: {
            runMode: 2,
            openMode: 0,
        },
        setupNodeEvents(on, config) {
            const environment = config.env.environment || "qa";
            const envConfig = getEnvConfig(environment);

            config.baseUrl = envConfig.baseUrl;
            config.env.apiUrl = envConfig.apiUrl;
            config.env.testUser = envConfig.testUser;

            on("task", {
                async readExcelUsers() {
                    const filePath = path.join(
                        __dirname,
                        "cypress",
                        "fixtures",
                        "users-large.xlsx"
                    );
                    const workbook = new ExcelJS.Workbook();
                    await workbook.xlsx.readFile(filePath);

                    const worksheet = workbook.getWorksheet("Users");
                    const users = [];

                    worksheet.eachRow((row, rowNumber) => {
                        if (rowNumber === 1) return;
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

            return config;
        },
    },
});