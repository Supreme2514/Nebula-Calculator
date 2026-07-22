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
    // Boss UI + Button
    // ==============================
    const bossSelect = document.getElementById('currentBoss');
    const bossDisplay = document.getElementById('targetBossDisplay');
    
    const calculateButton = document.getElementById("calculateButton");
    bossSelect.addEventListener('change', function() { 
        bossDisplay.innerText = this.value; 
    });
    
    // ==============================
    // Level dropdowns
    // ==============================
    function populateLevels(selectElement, includeZero) {
        for (let tier = 1; tier <= 7; tier++) {
            const divider = document.createElement("option");
            divider.textContent = `──────── Tier ${tier} ────────`;
            divider.disabled = true;
            selectElement.appendChild(divider);

            const startLevel = (tier === 1 && includeZero) ? 0 : 1;
            for (let level = startLevel; level <= 7; level++) {
                const option = document.createElement("option");
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
function calculateRuns(needed, averageDrop) {

    if (needed <= 0)
        return 0;

    if (averageDrop <= 0)
        return 0;

    return Math.ceil(needed / averageDrop);

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
    // ==============================
    // Start up
    // ==============================
    populateLevels(
        document.getElementById("currentLevel"),
        true
    );

    populateLevels(
        document.getElementById("targetLevel"),
        false
    );


    bosses.forEach(boss => {
        const option = document.createElement('option');
        option.value = boss;
        option.textContent = boss;
        bossSelect.appendChild(option);
    });

    bossDisplay.innerText = bossSelect.value;
   
 calculateButton.addEventListener(
    "click",
    calculate
);

function calculate() {

    fetch("../data/costs.json")
        .then(response => response.json())
        .then(data => {

            console.log(data);

            const currentLevel =
                document.getElementById("currentLevel").value;

            const targetLevel =
                document.getElementById("targetLevel").value;

        });

}

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

    scrolls: Number(document.getElementById("res7").value) || 0,

    ingots: 0,

    coins: 0

};
            const currentUpgrade = data.find(
                step => step.tierLevel === currentLevel
);

            const targetUpgrade = data.find(
                step => step.tierLevel === targetLevel
);

const upgradePath = getUpgradePath(
    currentUpgrade,
    targetUpgrade,
    data
);

const totalCost = calculateCost(upgradePath);
const missing = calculateMissing(
    totalCost,
    inventory
);

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
        fetch("../data/bossDrops.json")
    .then(response => response.json())
    .then(bossData => {

        const selectedBoss = bossData.find(
    boss => boss.boss === bossSelect.value
);

console.log(selectedBoss);
const primaryShardRuns = calculateRuns(
    missing.shards.primary,
    selectedBoss.shards.primary
);

const intermediateShardRuns = calculateRuns(
    missing.shards.intermediate,
    selectedBoss.shards.intermediate
);

const advancedShardRuns = calculateRuns(
    missing.shards.advanced,
    selectedBoss.shards.advanced
);
const primaryEssenceRuns = calculateRuns(
    missing.essence.primary,
    selectedBoss.essence.primary
);
const intermediateEssenceRuns = calculateRuns(
    missing.essence.intermediate,
    selectedBoss.essence.intermediate
);
const advancedEssenceRuns = calculateRuns(
    missing.essence.advanced,
    selectedBoss.essence.advanced
);
console.log({
    primaryShardRuns,
    intermediateShardRuns,
    advancedShardRuns,
    
    primaryEssenceRuns,
    intermediateEssenceRuns,
    advancedEssenceRuns
});
});