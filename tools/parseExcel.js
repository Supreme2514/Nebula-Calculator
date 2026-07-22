const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const config = require("./config");

const excelPath = path.join(
    __dirname,
    "..",
    config.sourceFolder,
    config.sourceFile
);

const workbook = XLSX.readFile(excelPath);
function toNumber(value) {
    return Number(String(value).replace(/\s/g, "")) || 0;
}
function parseUpgradeRow(row, index) {
    return {
        tierLevel: row[columns.shards.tier],
        order: index,
        shards: {
            primary: toNumber(row[columns.shards.primary]),
            intermediate: toNumber(row[columns.shards.intermediate]),
            advanced: toNumber(row[columns.shards.advanced])
        },

        coins: toNumber(row[columns.shards.coins]),

        essence: {
            primary: toNumber(row[columns.essence.primary]),
            intermediate: toNumber(row[columns.essence.intermediate]),
            advanced: toNumber(row[columns.essence.advanced])
        },

        scrolls: toNumber(row[columns.essence.scroll]),
        ingots: toNumber(row[columns.essence.ingot])
    };
}
const sheetName = workbook.SheetNames[0];

const sheet = workbook.Sheets[sheetName];

const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: ""
});

const headers = rows[1];

const columns = {
    shards: {
        tier: 0,
        primary: 1,
        intermediate: 2,
        advanced: 3,
        coins: 4
    },

    essence: {
        tier: 6,
        scroll: 7,
        ingot: 8,
        primary: 9,
        intermediate: 10,
        advanced: 11
    }
};

const upgradeRows = rows
    .slice(2)
    .filter(row => /^\d-\d$/.test(row[columns.shards.tier]));

const upgrades = upgradeRows.map(parseUpgradeRow);

const outputPath = path.join(
    __dirname,
    "..",
    "data",
    "costs.json"
);

fs.writeFileSync(
    outputPath,
    JSON.stringify(upgrades, null, 2),
    "utf8"
);

console.log("");

console.log("==============================");
console.log("      Nebula Parser");
console.log("==============================");
console.log("");

console.log(`Upgrades : ${upgrades.length}`);
console.log(`First    : ${upgrades[0].tierLevel}`);
console.log(`Last     : ${upgrades[upgrades.length - 1].tierLevel}`);

console.log("");
console.log("✓ costs.json updated");