const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const excelPath = path.join(
    __dirname,
    "..",
    "source",
    "BossDrops.xlsx"
);

const workbook = XLSX.readFile(excelPath);

const sheetName = workbook.SheetNames[0];

const sheet = workbook.Sheets[sheetName];

const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: ""
});

console.log(rows.slice(-15));

const attemptsIndex = rows.findIndex(
    row => row[0] === "Attempts"
);

console.log(attemptsIndex);