const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

async function convert() {
    const filePath = path.join(__dirname, "..", "fixtures", "users-large.xlsx");
    const outputPath = path.join(__dirname, "..", "fixtures", "users-large.json");

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

    fs.writeFileSync(outputPath, JSON.stringify(users, null, 2));
    console.log(`Converted ${users.length} users -> ${outputPath}`);
}

convert();