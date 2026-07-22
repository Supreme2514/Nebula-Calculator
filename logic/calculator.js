const fs = require("fs");
const path = require("path");

const costsPath = path.join(
    __dirname,
    "..",
    "data",
    "costs.json"
);

const upgrades = JSON.parse(
    fs.readFileSync(costsPath, "utf8")
);
function findUpgrade(tierLevel) {
    return upgrades.find(
        upgrade => upgrade.tierLevel === tierLevel
    );
}
function getUpgradePath(start, goal) {
    return upgrades.filter(
        upgrade =>
            upgrade.order >= start.order &&
            upgrade.order <= goal.order
    );
}
function calculateCost(upgradeSteps) {

    const total = {

        shards: {
            primary: 0,
            intermediate: 0,
            advanced: 0
        },

        coins: 0,

        essence: {
            primary: 0,
            intermediate: 0,
            advanced: 0
        },

        scrolls: 0,

        ingots: 0
    };

    for (const step of upgradeSteps) {

        total.coins += step.coins;
        total.scrolls += step.scrolls;
        total.ingots += step.ingots;

        total.shards.primary += step.shards.primary;
        total.shards.intermediate += step.shards.intermediate;
        total.shards.advanced += step.shards.advanced;

        total.essence.primary += step.essence.primary;
        total.essence.intermediate += step.essence.intermediate;
        total.essence.advanced += step.essence.advanced;
    }

    return total;
}
function calculateTotalCost(startTierLevel, goalTierLevel) {

    const start = findUpgrade(startTierLevel);
    const goal = findUpgrade(goalTierLevel);

    const upgradeSteps = getUpgradePath(start, goal);

    return calculateCost(upgradeSteps);
}
function calculateMissing(totalCost, inventory) {

    return {

        shards: {
            primary: Math.max(0, totalCost.shards.primary - inventory.shards.primary),
            intermediate: Math.max(0, totalCost.shards.intermediate - inventory.shards.intermediate),
            advanced: Math.max(0, totalCost.shards.advanced - inventory.shards.advanced)
        },

        coins: Math.max(0, totalCost.coins - inventory.coins),

        essence: {
            primary: Math.max(0, totalCost.essence.primary - inventory.essence.primary),
            intermediate: Math.max(0, totalCost.essence.intermediate - inventory.essence.intermediate),
            advanced: Math.max(0, totalCost.essence.advanced - inventory.essence.advanced)
        },

        scrolls: Math.max(0, totalCost.scrolls - inventory.scrolls),

        ingots: Math.max(0, totalCost.ingots - inventory.ingots)
    };
}
module.exports = {
    calculateTotalCost,
    calculateMissing
};