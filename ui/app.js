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
const bossSelect = document.getElementById("currentBoss");
const bossDisplay = document.getElementById("targetBossDisplay");
const currentLevelSelect = document.getElementById("currentLevel");
const targetLevelSelect = document.getElementById("targetLevel");
const calculateButton = document.getElementById("calculateButton");

// ==============================
// Helper Functions
// ==============================
function populateLevels(selectElement, includeZero) {
  if (includeZero) {
    const divider = document.createElement("option");
    divider.textContent = "──────── Tier 0 ────────";
    divider.disabled = true;
    selectElement.appendChild(divider);

    const zero = document.createElement("option");
    zero.value = "0";
    zero.textContent = "0";
    selectElement.appendChild(zero);
  }

  for (let tier = 1; tier <= 7; tier++) {
    const divider = document.createElement("option");
    divider.textContent = `──────── Tier ${tier} ────────`;
    divider.disabled = true;
    selectElement.appendChild(divider);

    for (let level = 1; level <= 7; level++) {
      const option = document.createElement("option");
      option.value = `${tier}-${level}`;
      option.textContent = `${tier}-${level}`;
      selectElement.appendChild(option);
    }
  }
}

function getUpgradePath(start, goal, upgrades) {

    if (start.order === goal.order) {

        return [];

    }

    return upgrades.filter(
        upgrade =>
            upgrade.order > start.order &&
            upgrade.order <= goal.order
    );

}

function calculateCost(upgradeSteps) {
  const total = {
    shards: { primary: 0, intermediate: 0, advanced: 0 },
    coins: 0,
    essence: { primary: 0, intermediate: 0, advanced: 0 },
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

function calculateRuns(needed, averageDrop) {
  if (needed <= 0) return 0;
  if (averageDrop <= 0) return 0;

  return Math.ceil(needed / averageDrop);
}

function addResource(goal, conquestList, resource) {
  const [label, amount, conquestCost] = resource;

  if (amount <= 0) return;

  goal.push(`${label}: ${amount}`);
  conquestList.push(`${label}: ${conquestCost.toLocaleString("sv-SE")}`);
}

function calculateBossFarm(missing, boss) {
  const runs = {
    shards: {
      primary: calculateRuns(
        missing.shards.primary,
        boss.drops["Primary Shard"].average
      ),
      intermediate: calculateRuns(
        missing.shards.intermediate,
        boss.drops["Intermediate Shard"].average
      ),
      advanced: calculateRuns(
        missing.shards.advanced,
        boss.drops["Advanced Shard"].average
      )
    },

    essence: {
      primary: calculateRuns(
        missing.essence.primary,
        boss.drops["Primary Essence"].average
      ),
      intermediate: calculateRuns(
        missing.essence.intermediate,
        boss.drops["Intermediate Essence"].average
      ),
      advanced: calculateRuns(
        missing.essence.advanced,
        boss.drops["Advanced Essence"]?.average ?? 0
      )
    }
  };

  const conquest = {
    shards: {},
    essence: {}
  };

  for (const type of ["primary", "intermediate", "advanced"]) {
    conquest.shards[type] = runs.shards[type] * 50;
    conquest.essence[type] = runs.essence[type] * 50;
  }

  const estimatedRuns = Math.max(
    runs.shards.primary,
    runs.shards.intermediate,
    runs.shards.advanced,
    runs.essence.primary,
    runs.essence.intermediate,
    runs.essence.advanced
  );

  const resources = [
    ["Primary Shard", runs.shards.primary, conquest.shards.primary],
    ["Intermediate Shard", runs.shards.intermediate, conquest.shards.intermediate],
    ["Advanced Shard", runs.shards.advanced, conquest.shards.advanced],
    ["Primary Essence", runs.essence.primary, conquest.essence.primary],
    ["Intermediate Essence", runs.essence.intermediate, conquest.essence.intermediate],
    ["Advanced Essence", runs.essence.advanced, conquest.essence.advanced]
  ];

  const goal = [];
  const conquestList = [];

  for (const resource of resources) {
    addResource(goal, conquestList, resource);
  }

  return {
    runs,
    conquest,
    estimatedRuns,
    goal,
    conquestList
  };
}
function getBestBossBy(bossResults, selector) {

    let bestBoss = null;

    for (const [bossName, result] of Object.entries(bossResults)) {

        const value = selector(result);

        if (
            bestBoss === null ||
            value < bestBoss.value
        ) {

            bestBoss = {
                name: bossName,
                value,
                result
            };

        }

    }

    return bestBoss;

  }
function sortBossesBy(bossResults, selector) {

    return Object.entries(bossResults)

        .map(([name, result]) => ({
            name,
            value: selector(result),
            result
        }))

        .sort((a, b) => a.value - b.value);

}    
function createBossCard(name, result) {

    const container =
        document.getElementById("bossCards");

    const card =
        document.createElement("div");

    card.className =
        "card farming-card";

    card.innerHTML = `
    <h2>${name}</h2>

    <div class="result-grid">

        <div class="result-item">
            <label>Estimated Runs</label>
            <span>${result.estimatedRuns}</span>
        </div>

        <div class="section-divider"></div>

        <div class="result-item">
            <label>Goal</label>
            <div class="resource-list">
                ${result.goal.join("<br>")}
            </div>
        </div>
          <div class="section-divider"></div>

<div class="result-item">
    <label>Conquest</label>
    <div class="resource-list">
        ${result.conquestList.join("<br>")}
    </div>
</div>

<div class="section-divider"></div>

<div class="result-item">
    <label>Maximum Conquest</label>
    <span>${(result.estimatedRuns * 50).toLocaleString("sv-SE")}</span>
</div>
    </div>
`;

    container.appendChild(card);

}
// ==============================
// Startup
// ==============================
populateLevels(currentLevelSelect, true);
populateLevels(targetLevelSelect, false);

bosses.forEach(boss => {
  const option = document.createElement("option");
  option.value = boss;
  option.textContent = boss;
  bossSelect.appendChild(option);
});

bossDisplay.innerText = bossSelect.value;

bossSelect.addEventListener("change", function () {
  bossDisplay.innerText = bossSelect.value;
});
const bossButtons =
    document.getElementById("bossButtons");

bosses.forEach(boss => {

    const button =
        document.createElement("button");

    button.textContent = boss;
    button.dataset.boss = boss;

    button.addEventListener(
        "click",
        function () {

            bossSelect.value = boss;

            bossDisplay.innerText = boss;

        }
    );

    bossButtons.appendChild(button);

});
// ==============================
// Event Listener
// ==============================
calculateButton.addEventListener("click", calculate);

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

    scrolls: Number(document.getElementById("res7").value) || 0,

    ingots: 0,

    coins: 0
  };

  Promise.all([
    fetch("../data/costs.json").then(response => response.json()),
    fetch("../data/bossDrops.json").then(response => response.json())
  ]).then(([costs, bossDrops]) => {
    const currentUpgrade = costs.find(step => step.tierLevel === currentLevel);
    const targetUpgrade = costs.find(step => step.tierLevel === targetLevel);

    const upgradePath = getUpgradePath(currentUpgrade, targetUpgrade, costs);
    const totalCost = calculateCost(upgradePath);
    const missing = calculateMissing(totalCost, inventory);

    console.log(upgradePath);

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
    const boss = bossDrops[bossSelect.value];
    const bossResults = {};
    const bossCards =
    document.getElementById("bossCards");

      bossCards.innerHTML = "";  
    for (const bossName of Object.keys(bossDrops)) {

    bossResults[bossName] = calculateBossFarm(
        missing,
        bossDrops[bossName]
    );
    
}
console.log(bossResults);
    const bestOverall = getBestBossBy(
      bossResults,
      result => result.estimatedRuns
);
console.log(Object.keys(bossResults));

const overallRanking = sortBossesBy(
    bossResults,
    result => result.estimatedRuns
);
for (const boss of overallRanking) {

    createBossCard(
        boss.name,
        boss.result
    );

}

console.table(overallRanking);

console.log(bestOverall);
const bestPrimaryEssence = getBestBossBy(
    bossResults,
    result => result.runs.essence.primary
);

console.log(bestPrimaryEssence);

const bestIntermediateEssence = getBestBossBy(
    bossResults,
    result => result.runs.essence.intermediate
);

console.log(bestIntermediateEssence);
const bossResult =
    bossResults[bossSelect.value];

    const {
    runs,
    conquest,
    estimatedRuns,
    goal,
    conquestList
} = bossResult;

    const conquestTotal = estimatedRuns * 50;

    document.getElementById("farmBoss").textContent = bossSelect.value;
    document.getElementById("farmGoal").innerHTML = goal.join("<br>");
    document.getElementById("farmConquest").innerHTML = conquestList.join("<br>");
    document.getElementById("conquestTotal").textContent =
      conquestTotal.toLocaleString("sv-SE");
  });
}
