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
const bossDisplay = document.getElementById("targetBossDisplay");
const currentLevelSelect = document.getElementById("currentLevel");
const targetLevelSelect = document.getElementById("targetLevel");
const calculateButton = document.getElementById("calculateButton");

let selectedBosses = [];
let bossLevelRanges = {};
let activeBoss = null;

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
        upgrade.order >= start.order &&
        upgrade.order < goal.order
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

function calculateMissing(totalCost, inventory, bossName) {
    return {
        shards: {
            primary: Math.max(
                0,
                totalCost.shards.primary - inventory.shards.primary
            ),

            intermediate: Math.max(
                0,
                totalCost.shards.intermediate - inventory.shards.intermediate
            ),

            advanced: Math.max(
                0,
                totalCost.shards.advanced - inventory.shards.advanced
            )
        },

        coins: Math.max(
            0,
            totalCost.coins - inventory.coins
        ),

        essence: {
            primary: Math.max(
                0,
                totalCost.essence.primary - inventory.essence.primary
            ),

            intermediate: Math.max(
                0,
                totalCost.essence.intermediate - inventory.essence.intermediate
            ),

            advanced: Math.max(
                0,
                totalCost.essence.advanced - inventory.essence.advanced
            )
        },

        scrolls: Math.max(
            0,
            totalCost.scrolls - inventory.scrolls
        ),

        ingots: Math.max(
            0,
            totalCost.ingots - inventory.ingots
        )
    };
}

function calculateRuns(needed, averageDrop) {
  if (needed <= 0) return 0;
  if (averageDrop <= 0) return 0;

  return Math.ceil(needed / averageDrop);
}

function calculateBossFarm(missing, bossName, boss) {

    const essenceNeeded = missing.essence ?? {
    primary: 0,
    intermediate: 0,
    advanced: 0
};

    const essenceRuns = {
        primary: calculateRuns(
            essenceNeeded.primary,
            boss.drops["Primary Essence"].average
        ),

        intermediate: calculateRuns(
            essenceNeeded.intermediate,
            boss.drops["Intermediate Essence"].average
        ),

        advanced: calculateRuns(
            essenceNeeded.advanced,
            boss.drops["Advanced Essence"]?.average ?? 0
        )
    };

    // Essence determines how many runs this boss needs.
    const estimatedRuns = Math.max(
        essenceRuns.primary,
        essenceRuns.intermediate,
        essenceRuns.advanced
    );

    return {

        estimatedRuns,

        gained: {

            shards: {

                primary:
                    estimatedRuns *
                    boss.drops["Primary Shard"].average,

                intermediate:
                    estimatedRuns *
                    boss.drops["Intermediate Shard"].average,

                advanced:
                    estimatedRuns *
                    boss.drops["Advanced Shard"].average

            },

            essence: {

                primary:
                    estimatedRuns *
                    boss.drops["Primary Essence"].average,

                intermediate:
                    estimatedRuns *
                    boss.drops["Intermediate Essence"].average,

                advanced:
                    estimatedRuns *
                    (boss.drops["Advanced Essence"]?.average ?? 0)

            }

        },

        conquest: estimatedRuns * 50

    };
}
function calculateEssenceFarm(essenceNeeded, boss) {
  console.trace("CALCULATE ESSENCE FARM CALLED", essenceNeeded, boss);

    const primaryRuns = calculateRuns(
    essenceNeeded.primary,
    boss.drops["Primary Essence"].average
);

const intermediateRuns = calculateRuns(
    essenceNeeded.intermediate,
    boss.drops["Intermediate Essence"].average
);

    const estimatedRuns = Math.max(
        primaryRuns,
        intermediateRuns
    );
    console.log("ESSENCE FARM DEBUG", {
    needed: essenceNeeded,
    primaryDrop: boss.drops["Primary Essence"]?.average,
    intermediateDrop: boss.drops["Intermediate Essence"]?.average,
    primaryRuns,
    intermediateRuns,
    estimatedRuns
});

    return {
        estimatedRuns,

        gained: {
            shards: {
                primary:
                    estimatedRuns *
                    boss.drops["Primary Shard"].average,

                intermediate:
                    estimatedRuns *
                    boss.drops["Intermediate Shard"].average,

                advanced:
                    estimatedRuns *
                    boss.drops["Advanced Shard"].average
            }
        }
    };

}

function calculateShardFarm(missing, boss) {

    const primaryRuns = calculateRuns(
        missing.shards.primary,
        boss.drops["Primary Shard"].average
    );

    const intermediateRuns = calculateRuns(
        missing.shards.intermediate,
        boss.drops["Intermediate Shard"].average
    );

    const advancedRuns = calculateRuns(
        missing.shards.advanced,
        boss.drops["Advanced Shard"].average
    );

    const estimatedRuns = Math.max(
        primaryRuns,
        intermediateRuns,
        advancedRuns
    );

    return {

        estimatedRuns,

        gained: {
    shards: {
        primary:
            estimatedRuns *
            boss.drops["Primary Shard"].average,

        intermediate:
            estimatedRuns *
            boss.drops["Intermediate Shard"].average,

        advanced:
            estimatedRuns *
            boss.drops["Advanced Shard"].average
    },

    essence: {
        primary:
            estimatedRuns *
            boss.drops["Primary Essence"].average,

        intermediate:
            estimatedRuns *
            boss.drops["Intermediate Essence"].average,

        advanced:
            estimatedRuns *
            (boss.drops["Advanced Essence"]?.average ?? 0)
    }
}

    };

}

function getBestBossBy(bossResults, selector) {
  let bestBoss = null;

  for (const [bossName, result] of Object.entries(bossResults)) {
    const value = selector(result);

    if (bestBoss === null || value < bestBoss.value) {
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
  const container = document.getElementById("bossCards");

  const card = document.createElement("div");
  card.className = "card farming-card";

  const gained = result.gained;

  card.innerHTML = `
    <h2>${name}</h2>

    <div class="result-grid">

      <div class="result-item">
        <label>Estimated Runs</label>
        <span>${result.estimatedRuns.toLocaleString("sv-SE")}</span>
      </div>

      <div class="section-divider"></div>

      <div class="result-item">
  <label>Average Loot</label>
  <div class="resource-list">

    Primary Shards:
    ${Math.round(gained.shards.primary).toLocaleString("sv-SE")}
    <br>

    Intermediate Shards:
    ${Math.round(gained.shards.intermediate).toLocaleString("sv-SE")}
    <br>

    Advanced Shards:
    ${Math.round(gained.shards.advanced).toLocaleString("sv-SE")}
    <br>

    Primary Essence:
    ${Math.round(gained.essence.primary).toLocaleString("sv-SE")}
    <br>

    Intermediate Essence:
    ${Math.round(gained.essence.intermediate).toLocaleString("sv-SE")}
    <br>

    Advanced Essence:
    ${Math.round(gained.essence.advanced).toLocaleString("sv-SE")}

  </div>
</div>

      <div class="section-divider"></div>

      <div class="result-item">
        <label>Maximum Conquest</label>
        <span>
          ${(result.estimatedRuns * 50).toLocaleString("sv-SE")}
        </span>
      </div>

    </div>
  `;

  container.appendChild(card);
}

function renderBossCards(bossResults) {
  const bossCards = document.getElementById("bossCards");
  bossCards.innerHTML = "";

  const ranking = sortBossesBy(bossResults, result => result.estimatedRuns);

  const bossesToShow =
    selectedBosses.length === 0
      ? ranking
      : ranking.filter(entry => selectedBosses.includes(entry.name));

  bossesToShow.forEach(entry => {
    createBossCard(entry.name, entry.result);
  });
}

function generateFarmPath(
    missing,
    bossResults,
    bossDrops
) {
  
  const steps = [];
  const remaining = structuredClone(missing);

  const selectedEntries = Object.entries(bossResults)
    .filter(([bossName]) => selectedBosses.includes(bossName))
    .map(([name, result]) => ({ name, result }));

// ==========================
// Essence Phase
// ==========================

for (const entry of selectedEntries) {

    const essenceNeeded =
        remaining.essence[entry.name];

    if (
        !essenceNeeded ||
        (
            essenceNeeded.primary <= 0 &&
            essenceNeeded.intermediate <= 0 &&
            essenceNeeded.advanced <= 0
        )
    ) {
        continue;
    }

    const result = calculateEssenceFarm(
        essenceNeeded,
        bossDrops[entry.name]
    );

    steps.push({
        boss: entry.name,
        runs: result.estimatedRuns,
        phase: "Essence",
        gained: result.gained
    });

    // Essence for this boss is now complete
    remaining.essence[entry.name].primary = 0;
    remaining.essence[entry.name].intermediate = 0;
    remaining.essence[entry.name].advanced = 0;

    // Shards gained during the Essence farming
    // also count toward the shard goal
    remaining.shards.primary = Math.max(
        0,
        remaining.shards.primary -
        result.gained.shards.primary
    );

    remaining.shards.intermediate = Math.max(
        0,
        remaining.shards.intermediate -
        result.gained.shards.intermediate
    );

    remaining.shards.advanced = Math.max(
        0,
        remaining.shards.advanced -
        result.gained.shards.advanced
    );
}
// ==========================
// Shard Phase
// ==========================

if (
    remaining.shards.primary > 0 ||
    remaining.shards.intermediate > 0 ||
    remaining.shards.advanced > 0
) {

    const result = calculateShardFarm(
    remaining,
    bossDrops["Alkaid"]
);

    steps.push({
    boss: "Alkaid",
    runs: result.estimatedRuns,
    phase: "Shards",
    gained: result.gained
});

}
  return steps;
}

function renderFarmPath(steps) {
  const farmPath = document.getElementById("farmPath");
  farmPath.innerHTML = "";

  steps.forEach(step => {
    const row = document.createElement("div");
    row.className = "farm-step";

    const completed = [];

if (step.completed?.primaryEssence)
    completed.push("✓ Primary Essence");

if (step.completed?.intermediateEssence)
    completed.push("✓ Intermediate Essence");

if (step.completed?.advancedEssence)
    completed.push("✓ Advanced Essence");

if (step.completed?.primaryShard)
    completed.push("✓ Primary Shard");

if (step.completed?.intermediateShard)
    completed.push("✓ Intermediate Shard");

if (step.completed?.advancedShard)
    completed.push("✓ Advanced Shard");

row.innerHTML = `
    <strong>${step.runs} × ${step.boss}</strong><br>

    <small>${step.phase}</small>

    <br><br>

    <small>
        +${Math.round(step.gained.shards.primary)} Primary Shards<br>
        +${Math.round(step.gained.shards.intermediate)} Intermediate Shards<br>
        +${Math.round(step.gained.shards.advanced)} Advanced Shards
    </small>

    <br><br>

    <small>
        ${completed.join("<br>")}
    </small>
`;

    farmPath.appendChild(row);
  });
}

function setActiveBoss() {
    const buttons = document.querySelectorAll("#bossButtons button");

    buttons.forEach(button => {
        const boss = button.dataset.boss;

        button.classList.remove("selected", "active");

        if (selectedBosses.includes(boss)) {
            button.classList.add("selected");
        }

        if (activeBoss === boss) {
            button.classList.remove("selected");
            button.classList.add("active");
        }
    });
}

function saveActiveBossLevels() {
    if (!activeBoss) return;

    bossLevelRanges[activeBoss] = {
        current: currentLevelSelect.value,
        target: targetLevelSelect.value
    };
}
function loadActiveBossLevels() {
    if (!activeBoss) {
        currentLevelSelect.value = "0";
        targetLevelSelect.value = "1-1";
        return;
    }

    const saved = bossLevelRanges[activeBoss];

    if (saved) {
        currentLevelSelect.value = saved.current;
        targetLevelSelect.value = saved.target;
    } else {
        currentLevelSelect.value = "0";
        targetLevelSelect.value = "1-1";
    }
}
currentLevelSelect.addEventListener("change", saveActiveBossLevels);
targetLevelSelect.addEventListener("change", saveActiveBossLevels);
function updateResourceLabels(boss = null) {
  const name = boss ?? "Boss";

  document.getElementById("labelRes4").textContent = `Primary ${name} Essence`;
  document.getElementById("labelRes5").textContent = `Intermediate ${name} Essence`;
  document.getElementById("labelRes6").textContent = `Advanced ${name} Essence`;
  document.getElementById("labelRes7").textContent = `${name} Scroll`;
}

function selectBoss(boss) {

    // Save the levels of the boss we're currently leaving
    saveActiveBossLevels();

    // Boss is already selected
    if (selectedBosses.includes(boss)) {

        // Clicking the active boss again = deselect it
        if (activeBoss === boss) {

            selectedBosses = selectedBosses.filter(
                b => b !== boss
            );

            // Activate the last remaining selected boss
            activeBoss = selectedBosses.at(-1) || null;

        } else {

            // Boss is selected but not active:
            // just make it active.
            activeBoss = boss;
        }

    } else {

        // New boss:
        // select it and make it active.
        selectedBosses.push(boss);
        activeBoss = boss;
    }

    // Load saved levels for the new active boss
    loadActiveBossLevels();

    setActiveBoss();

    if (activeBoss) {

        updateResourceLabels(activeBoss);

        bossDisplay.innerText = activeBoss;

        document.getElementById("farmBoss").textContent =
            activeBoss;

    } else {

        updateResourceLabels(null);

        bossDisplay.innerText = "-";

        document.getElementById("farmBoss").textContent = "-";
    }
}
// ==============================
// Startup
// ==============================
populateLevels(currentLevelSelect, true);
populateLevels(targetLevelSelect, false);

bossDisplay.innerText = "Select a boss";

const bossButtons = document.getElementById("bossButtons");

bosses.forEach(boss => {
  const button = document.createElement("button");
  button.textContent = boss;
  button.dataset.boss = boss;

  button.addEventListener("click", function () {
    selectBoss(boss);
  });

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
if (selectedBosses.length === 0) {
    alert("Please select one or more bosses.");
    return;
}

const activeBoss = selectedBosses.at(-1);

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
    
    const bossMissing = {};

for (const bossName of selectedBosses) {

    const range = bossLevelRanges[bossName];

    if (!range) continue;

    const currentUpgrade = costs.find(
        step => step.tierLevel === range.current
    );

    const targetUpgrade = costs.find(
        step => step.tierLevel === range.target
    );

    const upgradePath = getUpgradePath(
        currentUpgrade,
        targetUpgrade,
        costs
    );

    const totalCost = calculateCost(upgradePath);

    bossMissing[bossName] = calculateMissing(
        totalCost,
        inventory,
        bossName
    );
    console.log(
    "BOSS MISSING",
    bossName,
    bossMissing[bossName]
);
}
   // ==========================
// Update Result Card
// ==========================

const totalMissing = {
    shards: {
        primary: 0,
        intermediate: 0,
        advanced: 0
    },

    essence: {
        primary: 0,
        intermediate: 0,
        advanced: 0
    },

    scrolls: 0,
    ingots: 0,
    coins: 0
};

for (const bossName of selectedBosses) {

    const missing = bossMissing[bossName];

    if (!missing) continue;

    totalMissing.shards.primary += missing.shards.primary;
    totalMissing.shards.intermediate += missing.shards.intermediate;
    totalMissing.shards.advanced += missing.shards.advanced;

    totalMissing.essence.primary += missing.essence.primary;
    totalMissing.essence.intermediate += missing.essence.intermediate;
    totalMissing.essence.advanced += missing.essence.advanced;

    totalMissing.scrolls += missing.scrolls;
    totalMissing.ingots += missing.ingots;
    totalMissing.coins += missing.coins;
}

document.getElementById("resultPrimaryShard").textContent =
    totalMissing.shards.primary.toLocaleString("sv-SE");

document.getElementById("resultIntermediateShard").textContent =
    totalMissing.shards.intermediate.toLocaleString("sv-SE");

document.getElementById("resultAdvancedShard").textContent =
    totalMissing.shards.advanced.toLocaleString("sv-SE");

document.getElementById("resultPrimaryEssence").textContent =
    totalMissing.essence.primary.toLocaleString("sv-SE");

document.getElementById("resultIntermediateEssence").textContent =
    totalMissing.essence.intermediate.toLocaleString("sv-SE");

document.getElementById("resultAdvancedEssence").textContent =
    totalMissing.essence.advanced.toLocaleString("sv-SE");

document.getElementById("resultScrolls").textContent =
    totalMissing.scrolls.toLocaleString("sv-SE");

document.getElementById("resultIngots").textContent =
    totalMissing.ingots.toLocaleString("sv-SE");

document.getElementById("resultCoins").textContent =
    totalMissing.coins.toLocaleString("sv-SE");

    // ==========================
    // Boss Runs
    // ==========================
    const bossResults = {};

    const bossCards = document.getElementById("bossCards");
    bossCards.innerHTML = "";

for (const bossName of selectedBosses) {

    const missingForBoss = bossMissing[bossName];

    if (!missingForBoss) continue;

    bossResults[bossName] = calculateBossFarm(
        missingForBoss,
        bossName,
        bossDrops[bossName]
    );
}

    const bestOverall = getBestBossBy(
      bossResults,
      result => result.estimatedRuns
    );
    /*
    const farmPath = generateFarmPath(
    bossMissing,
    bossResults,
    bossDrops
);
    
    renderFarmPath(farmPath);
*/
    renderBossCards(bossResults);
  });
}
