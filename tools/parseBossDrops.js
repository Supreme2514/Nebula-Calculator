const XLSX = require("xlsx");
const path = require("path");

const file = path.join(__dirname, "..", "source", "BossDrops.xlsx");
const rows = XLSX.utils.sheet_to_json(XLSX.readFile(file).Sheets["Average"], { header: 1, defval: "" });

function parseBosses(rows) {
    if (!rows.length) return {};
    
    const bosses = rows[0].map((name, col) => ({ name: String(name).trim(), col })).filter(b => b.col > 0 && b.name);
    const result = Object.fromEntries(bosses.map(b => [b.name, { attempts: 0, drops: {} }]));
    
    let lastItem = "";

    for (let r = 1; r < rows.length; r++) {
        const label = String(rows[r][0]).trim();
        if (!label) continue;

        if (label.toLowerCase() === "attempts") {
            bosses.forEach(b => result[b.name].attempts = Number(rows[r][b.col]) || 0);
        } else if (label.toLowerCase() === "average") {
            if (lastItem) bosses.forEach(b => {
                const val = rows[r][b.col];
                result[b.name].drops[lastItem].average = typeof val === "number" ? val : parseFloat(String(val).replace(",", ".")) || 0;
            });
        } else {
            lastItem = label;
            bosses.forEach(b => result[b.name].drops[lastItem] = { total: Number(rows[r][b.col]) || 0, average: 0 });
        }
    }
    return result;
}

console.log(JSON.stringify(parseBosses(rows), null, 2));