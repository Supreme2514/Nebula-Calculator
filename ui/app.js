// ==============================
// Bosses
// ==============================
const bosses = [
    "Dubhe",
    "Merak",
    "Phecda",
    "Megrez",
    "Alioth",
    "Mizar",
    "Alkaid"
];


// ==============================
// DOM Elements
// ==============================
const bossSelect =
    document.getElementById("currentBoss");

const bossDisplay =
    document.getElementById("targetBossDisplay");

const currentLevelSelect =
    document.getElementById("currentLevel");

const targetLevelSelect =
    document.getElementById("targetLevel");

const calculateButton =
    document.getElementById("calculateButton");


// ==============================
// Helper Functions
// ==============================
function populateLevels(selectElement, includeZero) {

    for (let tier = 1; tier <= 7; tier++) {

        const divider = document.createElement("option");

        divider.textContent =
            `──────── Tier ${tier} ────────`;

        divider.disabled = true;

        selectElement.appendChild(divider);

        const startLevel =
            tier === 1 && includeZero ? 0 : 1;

        for (let level = startLevel; level <= 7; level++) {

            const option =
                document.createElement("option");

            option.value = `${tier}-${level}`;
            option.textContent = `${tier}-${level}`;

            selectElement.appendChild(option);
        }
    }

}

function getUpgradePath(start, goal, upgrades) {

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

function calculateMissing(totalCost, inventory) {

    return {

        shards: {

            primary:
                Math.max(
                    0,
                    totalCost.shards.primary -
                    inventory.shards.primary
                ),

            intermediate:
                Math.max(
                    0,
                    totalCost.shards.intermediate -
                    inventory.shards.intermediate
                ),

            advanced:
                Math.max(
                    0,
                    totalCost.shards.advanced -
                    inventory.shards.advanced
                )

        },

        coins:
            Math.max(
                0,
                totalCost.coins -
                inventory.coins
            ),

        essence: {

            primary:
                Math.max(
                    0,
                    totalCost.essence.primary -
                    inventory.essence.primary
                ),

            intermediate:
                Math.max(
                    0,
                    totalCost.essence.intermediate -
                    inventory.essence.intermediate
                ),

            advanced:
                Math.max(
                    0,
                    totalCost.essence.advanced -
                    inventory.essence.advanced
                )

        },

        scrolls:
            Math.max(
                0,
                totalCost.scrolls -
                inventory.scrolls
            ),

        ingots:
            Math.max(
                0,
                totalCost.ingots -
                inventory.ingots
            )

    };

}

function calculateRuns(needed, averageDrop) {

    if (needed <= 0)
        return 0;

    if (averageDrop <= 0)
        return 0;

    return Math.ceil(
        needed / averageDrop
    );

}


// ==============================
// Startup
// ==============================

populateLevels(currentLevelSelect, true);
populateLevels(targetLevelSelect, false);

bosses.forEach(boss => {

    const option =
        document.createElement("option");

    option.value = boss;
    option.textContent = boss;

    bossSelect.appendChild(option);

});

bossDisplay.innerText =
    bossSelect.value;

bossSelect.addEventListener(
    "change",
    function () {

        bossDisplay.innerText =
            bossSelect.value;

    }
);


// ==============================
// Event Listener
// ==============================

calculateButton.addEventListener(
    "click",
    calculate
);


// ==============================
// Calculate
// ==============================

function calculate() {

    const currentLevel = currentLevelSelect.value;
    const targetLevel = targetLevelSelect.value;

    const inventory = {

        shards: {
            primary: Number(document.getElementById("res1").value) || 0,
            intermediate: Number(document.getElementById("res2").value) || 0,
            advanced: Number(document.getElementById("res3").value) || 0
        },

        essence: {
            primary: Number(document.getElementById("res4").value) || 0,
            intermediate: Number(document.getElementById("res5").value) || 0,
            advanced: Number(document.getElementById("res6").value) || 0
        },

        scrolls:
            Number(document.getElementById("res7").value) || 0,

        ingots: 0,

        coins: 0

    };

    Promise.all([

        fetch("../data/costs.json")
            .then(response => response.json()),

        fetch("../data/bossDrops.json")
            .then(response => response.json())

    ])

    .then(([costs, bossDrops]) => {

        const currentUpgrade = costs.find(
            step => step.tierLevel === currentLevel
        );

        const targetUpgrade = costs.find(
            step => step.tierLevel === targetLevel
        );

        const upgradePath = getUpgradePath(
            currentUpgrade,
            targetUpgrade,
            costs
        );

        const totalCost =
            calculateCost(upgradePath);

        const missing =
            calculateMissing(
                totalCost,
                inventory
            );

        // ==========================
        // Update Result Card
        // ==========================

        document.getElementById("resultPrimaryShard").textContent =
            missing.shards.primary.toLocaleString("sv-SE");

        document.getElementById("resultIntermediateShard").textContent =
            missing.shards.intermediate.toLocaleString("sv-SE");

        document.getElementById("resultAdvancedShard").textContent =
            missing.shards.advanced.toLocaleString("sv-SE");

        document.getElementById("resultPrimaryEssence").textContent =
            missing.essence.primary.toLocaleString("sv-SE");

        document.getElementById("resultIntermediateEssence").textContent =
            missing.essence.intermediate.toLocaleString("sv-SE");

        document.getElementById("resultAdvancedEssence").textContent =
            missing.essence.advanced.toLocaleString("sv-SE");

        document.getElementById("resultScrolls").textContent =
            missing.scrolls.toLocaleString("sv-SE");

        document.getElementById("resultIngots").textContent =
            missing.ingots.toLocaleString("sv-SE");

        document.getElementById("resultCoins").textContent =
            missing.coins.toLocaleString("sv-SE");


        // ==========================
        // Boss Runs
        // ==========================

        const selectedBoss = bossDrops[bossSelect.value];

        const runs = {

    shards: {

        primary: calculateRuns(
            missing.shards.primary,
            selectedBoss.drops["Primary Shard"].average
        ),

        intermediate: calculateRuns(
            missing.shards.intermediate,
            selectedBoss.drops["Intermediate Shard"].average
        ),

        advanced: calculateRuns(
            missing.shards.advanced,
            selectedBoss.drops["Advanced Shard"].average
        )

    },

    essence: {

        primary: calculateRuns(
            missing.essence.primary,
            selectedBoss.drops["Primary Essence"].average
        ),

        intermediate: calculateRuns(
            missing.essence.intermediate,
            selectedBoss.drops["Intermediate Essence"].average
        ),

        advanced: calculateRuns(
            missing.essence.advanced,
            (selectedBoss.drops["Advanced Essence"]?.average ?? 0)
        )

    }

};
const conquest = {

    shards: {

        primary: runs.shards.primary * 50,
        intermediate: runs.shards.intermediate * 50,
        advanced: runs.shards.advanced * 50

    },

    essence: {

        primary: runs.essence.primary * 50,
        intermediate: runs.essence.intermediate * 50,
        advanced: runs.essence.advanced * 50

    }

};

        const estimatedRuns = Math.max(

    runs.shards.primary,
    runs.shards.intermediate,
    runs.shards.advanced,

    runs.essence.primary,
    runs.essence.intermediate,
    runs.essence.advanced

);
const conquestTotal = estimatedRuns * 50;
const goal = [];
const conquestList = [];

if (runs.shards.primary > 0) {

    goal.push(`Primary Shards: ${runs.shards.primary}`);

    conquestList.push(
        `Primary Shards: ${conquest.shards.primary.toLocaleString("sv-SE")}`
    );

}

if (runs.shards.intermediate > 0) {
    goal.push(`Intermediate Shards: ${runs.shards.intermediate}`);
    conquestList.push(
        `Intermediate Shards: ${conquest.shards.intermediate.toLocaleString("sv-SE")}`
    );
}
if (runs.shards.advanced > 0) {
    goal.push(`Advanced Shards: ${runs.shards.advanced}`);
    conquestList.push(
        `Advanced Shards: ${conquest.shards.advanced.toLocaleString("sv-SE")}`
    );
}

if (runs.essence.primary > 0) {
    goal.push(`Primary Essence: ${runs.essence.primary}`);
    conquestList.push(
        `Primary Essence: ${conquest.essence.primary.toLocaleString("sv-SE")}`
    );
}

if (runs.essence.intermediate > 0) {
    goal.push(`Intermediate Essence: ${runs.essence.intermediate}`);
    conquestList.push(
        `Intermediate Essence: ${conquest.essence.intermediate.toLocaleString("sv-SE")}`
    );
}

if (runs.essence.advanced > 0) {
    goal.push(`Advanced Essence: ${runs.essence.advanced}`);
    conquestList.push(
        `Advanced Essence: ${conquest.essence.advanced.toLocaleString("sv-SE")}`
    );
}
console.log(goal);

console.log(estimatedRuns);

console.log(conquest);

document.getElementById("farmBoss").textContent =
    bossSelect.value;

document.getElementById("farmGoal").innerHTML =
    goal.join("<br>");

document.getElementById("farmConquest").innerHTML =
    conquestList.join("<br>");

document.getElementById("conquestTotal").textContent =
    conquestTotal.toLocaleString("sv-SE");

});

}