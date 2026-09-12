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
const starNodeMap = {
    Dubhe: "n1",
    Merak: "n2",
    Phecda: "n3",
    Megrez: "n4",
    Alioth: "n5",
    Mizar: "n6",
    Alkaid: "n7"
};
// ==============================
// Resource Icons
// ==============================
const resourceIcons = {
    primaryShard: "../assets/resources/primary_shard.png",
    intermediateShard: "../assets/resources/intermediate_shard.png",
    advancedShard: "../assets/resources/advanced_shard.png",
    primaryEssence: (boss) => `../assets/resources/primary_${boss.toLowerCase()}.png`,
    intermediateEssence: (boss) => `../assets/resources/intermediate_${boss.toLowerCase()}.png`,
    advancedEssence: (boss) => `../assets/resources/advanced_${boss.toLowerCase()}.png`,
    scroll: (boss) => `../assets/resources/scroll_${boss.toLowerCase()}.png`,
    coin: "../assets/resources/coin.png",
    ingot: "../assets/resources/ingot.png",
    conquest: "../assets/resources/conquest.png"
};
// ==============================
// Characters
// ==============================
const classIcons = {
    archer: "../assets/classes/archer.png",
    assassin: "../assets/classes/assassin.png",
    mage: "../assets/classes/mage.png",
    taoist: "../assets/classes/taoist.png",
    warrior: "../assets/classes/warrior.png"
};

const CHARACTERS_STORAGE_KEY = "nebulaCalculatorCharacters";

let characters = {};
let activeCharacterId = null;
let selectedNewCharacterClass = null;
let deleteModeCharacterId = null;

function loadCharactersFromStorage() {
    try {
        const raw = localStorage.getItem(CHARACTERS_STORAGE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw);
        characters = parsed.characters || {};
        activeCharacterId = parsed.activeCharacterId || null;
    } catch (err) {
        console.error("Failed to load characters:", err);
    }
}

function saveCharactersToStorage() {
    try {
        localStorage.setItem(
            CHARACTERS_STORAGE_KEY,
            JSON.stringify({ characters, activeCharacterId })
        );
    } catch (err) {
        console.error("Failed to save characters:", err);
    }
}

function levelToAbsolute(levelStr) {
    if (!levelStr || levelStr === "0") return 0;
    const [tier, level] = levelStr.split("-").map(Number);
    return (tier - 1) * 7 + level;
}

function calculateCharacterLevelTotal(charBossLevels) {
    return bosses.reduce((sum, bossName) => {
        const current = charBossLevels?.[bossName]?.current ?? "0";
        return sum + levelToAbsolute(current);
    }, 0);
}

function getActiveCharacter() {
    return activeCharacterId ? characters[activeCharacterId] : null;
}
function saveCurrentStateToActiveCharacter() {
    const character = getActiveCharacter();
    if (!character) return;

    character.bossLevelRanges = bossLevelRanges;
    character.bossEssenceInventory = bossEssenceInventory;
    character.inventory = {
        res1: document.getElementById("res1").value,
        res2: document.getElementById("res2").value,
        res3: document.getElementById("res3").value, 
    };

    saveCharactersToStorage();
    renderCharacterList();
}

function applyCharacterStateToForm(character) {
    bossLevelRanges = character.bossLevelRanges || {};
    bossEssenceInventory = character.bossEssenceInventory || {};

const inv = character.inventory || {};
    document.getElementById("res1").value = inv.res1 ?? "";
    document.getElementById("res2").value = inv.res2 ?? "";
    document.getElementById("res3").value = inv.res3 ?? "";

    if (activeBoss) {
        loadActiveBossLevels();
        loadActiveBossEssence();
    }
}

function switchCharacter(id) {
    saveCurrentStateToActiveCharacter();

    activeCharacterId = id;
    applyCharacterStateToForm(characters[id]);

    saveCharactersToStorage();
    renderCharacterList();
    closeCreatePopover();
}

function createCharacter(name, className) {
    const id = `char_${Date.now()}`;

    characters[id] = {
        id,
        name,
        class: className,
        bossLevelRanges: {},
        inventory: {}
    };

    switchCharacter(id);
}

function renderCharacterList() {
    const list = document.getElementById("characterList");
    list.innerHTML = "";

    Object.values(characters).forEach(character => {
        const total = calculateCharacterLevelTotal(character.bossLevelRanges);

        const item = document.createElement("div");
        item.className = "character-list-item" + (character.id === activeCharacterId ? " active" : "");
        item.innerHTML = `
            <img src="${classIcons[character.class]}" alt="${character.class}">
            <span class="character-name">${character.name}</span>
            <span class="character-total">${total.toLocaleString("sv-SE")}</span>
            ${character.id === deleteModeCharacterId
                ? `<span class="character-delete-badge">✕</span>`
                : ""}
        `;

        item.addEventListener("click", () => {
            if (character.id === activeCharacterId) {
                deleteModeCharacterId = deleteModeCharacterId === character.id ? null : character.id;
                renderCharacterList();
            } else {
                deleteModeCharacterId = null;
                switchCharacter(character.id);
            }
        });

        const badge = item.querySelector(".character-delete-badge");
        if (badge) {
            badge.addEventListener("click", (e) => {
                e.stopPropagation();
                openDeleteConfirm(character.id);
            });
        }

        list.appendChild(item);
    });
}

function toggleCreatePopover() {
    document.getElementById("characterCreatePopover").classList.toggle("open");
}

function closeCreatePopover() {
    document.getElementById("characterCreatePopover").classList.remove("open");
}
function openDeleteConfirm(id) {
    const character = characters[id];
    document.getElementById("deleteConfirmName").textContent = character.name;
    document.getElementById("deleteConfirmOverlay").dataset.characterId = id;
    document.getElementById("deleteConfirmOverlay").classList.add("open");
}

function closeDeleteConfirm() {
    document.getElementById("deleteConfirmOverlay").classList.remove("open");
}

function deleteCharacter(id) {
    delete characters[id];

    if (activeCharacterId === id) {
        activeCharacterId = null;
        applyCharacterStateToForm({ bossLevelRanges: {}, bossEssenceInventory: {}, inventory: {} });
    }

    deleteModeCharacterId = null;
    saveCharactersToStorage();
    renderCharacterList();
    closeDeleteConfirm();
}
(function enableDragScroll(el) {
    let isDown = false;
    let startX = 0;
    let scrollLeftStart = 0;
    let dragDistance = 0;

    el.addEventListener("mousedown", (e) => {
        isDown = true;
        dragDistance = 0;
        el.classList.add("dragging");
        startX = e.pageX;
        scrollLeftStart = el.scrollLeft;
    });

    window.addEventListener("mouseup", () => {
        isDown = false;
        el.classList.remove("dragging");
    });

    el.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        const walk = e.pageX - startX;
        dragDistance = Math.abs(walk);
        el.scrollLeft = scrollLeftStart - walk;
    });

    el.addEventListener("click", (e) => {
        if (dragDistance > 5) {
            e.stopPropagation();
            e.preventDefault();
        }
    }, true);
})(document.getElementById("characterList"));
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
let bossEssenceInventory = {};
let cachedBossDrops = null;
let cachedRemainingShards = null;

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

function updateStarNodeImage(bossName) {
    const image = document.getElementById("starNodeImage");

    if (!image) return;

    const node = starNodeMap[bossName];

    if (!node) {
        image.src = "../assets/star-nodes/n8.png";
        image.alt = "Star Node";
        return;
    }

    image.src = `../assets/star-nodes/${node}.png`;
    image.alt = `Star Node ${node}`;
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
        },

        essence: {
            primary:
                estimatedRuns *
                boss.drops["Primary Essence"].average,

            intermediate:
                estimatedRuns *
                boss.drops["Intermediate Essence"].average,

            advanced: 0
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

card.style.setProperty(
    "--boss-image",
    `url("../assets/bosses/${name.toLowerCase()}.png")`
);

  const gained = result.gained;

  card.innerHTML = `
    <h2>${name}</h2>

    <div class="result-grid">

      <div class="result-item">
        <label>Kills</label>
        <span>${result.estimatedRuns.toLocaleString("sv-SE")}</span>
      </div>

      <div class="section-divider"></div>

      <div class="result-item">
  <label>Average Loot</label>
  <div class="resource-list">

    <div class="resource-list-row">
        <span class="resource-icon-slot"><img src="../assets/resources/primary_shard.png" alt=""></span>
        Primary Shards:
        ${Math.round(gained.shards.primary).toLocaleString("sv-SE")}
    </div>

    <div class="resource-list-row">
        <span class="resource-icon-slot"><img src="../assets/resources/intermediate_shard.png" alt=""></span>
        Intermediate Shards:
        ${Math.round(gained.shards.intermediate).toLocaleString("sv-SE")}
    </div>

    <div class="resource-list-row">
        <span class="resource-icon-slot"><img src="../assets/resources/advanced_shard.png" alt=""></span>
        Advanced Shards:
        ${Math.round(gained.shards.advanced).toLocaleString("sv-SE")}
    </div>

    <div class="resource-list-row">
        <span class="resource-icon-slot"><img src="${resourceIcons.primaryEssence(name)}" alt=""></span>
        Primary Essence:
        ${Math.round(gained.essence.primary).toLocaleString("sv-SE")}
    </div>

    <div class="resource-list-row">
        <span class="resource-icon-slot"><img src="${resourceIcons.intermediateEssence(name)}" alt=""></span>
        Intermediate Essence:
        ${Math.round(gained.essence.intermediate).toLocaleString("sv-SE")}
    </div>

</div>

      <div class="section-divider"></div>

      <div class="result-item">
        <label>Conquest</label>
        <span>
          <span class="resource-icon-slot"><img src="../assets/resources/conquest.png" alt=""></span>
          ${(result.estimatedRuns * 50).toLocaleString("sv-SE")}
        </span>
      </div>

    </div>
  `;

  container.appendChild(card);
}

function combineFarmPathByBoss(farmPath) {
    const combinedBosses = {};

    for (const step of farmPath) {

        if (!combinedBosses[step.boss]) {
            combinedBosses[step.boss] = {
                estimatedRuns: 0,

                gained: {
                    shards: {
                        primary: 0,
                        intermediate: 0,
                        advanced: 0
                    },

                    essence: {
                        primary: 0,
                        intermediate: 0,
                        advanced: 0
                    }
                }
            };
        }

        const boss = combinedBosses[step.boss];

        boss.estimatedRuns += step.runs || 0;

        if (step.gained?.shards) {
            boss.gained.shards.primary +=
                step.gained.shards.primary || 0;

            boss.gained.shards.intermediate +=
                step.gained.shards.intermediate || 0;

            boss.gained.shards.advanced +=
                step.gained.shards.advanced || 0;
        }

        if (step.gained?.essence) {
            boss.gained.essence.primary +=
                step.gained.essence.primary || 0;

            boss.gained.essence.intermediate +=
                step.gained.essence.intermediate || 0;

            boss.gained.essence.advanced +=
                step.gained.essence.advanced || 0;
        }
    }

    return combinedBosses;
}

function renderBossCards(farmPath) {
    const bossCards = document.getElementById("bossCards");
    bossCards.innerHTML = "";

    const combinedBosses = combineFarmPathByBoss(farmPath);

    // Valda bossar
for (const bossName of bosses) {

    const result = combinedBosses[bossName];

    if (!result) continue;

    createBossCard(
        bossName,
        result
    );
}
}

function renderSweep(bossDrops, remainingShards) {

    const sweepResult = document.getElementById("sweepResult");

    const sweepBosses = ["Alkaid"];

    if (document.getElementById("sweepMizar").checked) {
        sweepBosses.push("Mizar");
    }

    if (document.getElementById("sweepAlioth").checked) {
        sweepBosses.push("Alioth");
    }

    const shardsPerSweep = {
        primary: 0,
        intermediate: 0,
        advanced: 0
    };

    for (const bossName of sweepBosses) {

        const drops = bossDrops[bossName];

        if (!drops) continue;

        shardsPerSweep.primary +=
            drops.drops["Primary Shard"].average;

        shardsPerSweep.intermediate +=
            drops.drops["Intermediate Shard"].average;

        shardsPerSweep.advanced +=
            drops.drops["Advanced Shard"].average;
    }

    const primarySweeps = calculateRuns(
        remainingShards.primary,
        shardsPerSweep.primary
    );

    const intermediateSweeps = calculateRuns(
        remainingShards.intermediate,
        shardsPerSweep.intermediate
    );

    const advancedSweeps = calculateRuns(
        remainingShards.advanced,
        shardsPerSweep.advanced
    );

    const sweepsRequired = Math.max(
        primarySweeps,
        intermediateSweeps,
        advancedSweeps
    );

    const totalConquest =
        sweepsRequired *
        sweepBosses.length *
        50;

    sweepResult.innerHTML = `
    <div class="sweep-shards">
        <div class="sweep-result-item">
            <label>
                <span class="resource-icon-slot"><img src="../assets/resources/primary_shard.png" alt=""></span>
                Primary Shards
            </label>
            <strong>
                +${Math.round(
                    sweepsRequired * shardsPerSweep.primary
                ).toLocaleString("sv-SE")}
            </strong>
        </div>

        <div class="sweep-result-item">
            <label>
                <span class="resource-icon-slot"><img src="../assets/resources/intermediate_shard.png" alt=""></span>
                Intermediate Shards
            </label>
            <strong>
                +${Math.round(
                    sweepsRequired * shardsPerSweep.intermediate
                ).toLocaleString("sv-SE")}
            </strong>
        </div>

        <div class="sweep-result-item">
            <label>
                <span class="resource-icon-slot"><img src="../assets/resources/advanced_shard.png" alt=""></span>
                Advanced Shards
            </label>
            <strong>
                +${Math.round(
                    sweepsRequired * shardsPerSweep.advanced
                ).toLocaleString("sv-SE")}
            </strong>
        </div>
    </div>

    <div class="sweep-summary">
        <div class="sweep-result-item">
            <label>Sweeps Required</label>
            <strong>
                ${sweepsRequired.toLocaleString("sv-SE")}
            </strong>
        </div>

        <div class="sweep-result-item">
            <label>
                <span class="resource-icon-slot"><img src="../assets/resources/conquest.png" alt=""></span>
                Total Conquest
            </label>
            <strong>
                ${totalConquest.toLocaleString("sv-SE")}
            </strong>
        </div>
    </div>
`;
}

function generateFarmPath(bossMissing, bossDrops, inventory) {

    const steps = [];

    const remainingShards = {
        primary: 0,
        intermediate: 0,
        advanced: 0
    };

    for (const bossName of selectedBosses) {
        const missing = bossMissing[bossName];
        if (!missing) continue;

        remainingShards.primary += missing.shards.primary;
        remainingShards.intermediate += missing.shards.intermediate;
        remainingShards.advanced += missing.shards.advanced;
    }

    // Subtract real shard inventory ONCE from the combined total —
    // same approach totalMissing.shards already uses correctly.
    remainingShards.primary = Math.max(0, remainingShards.primary - inventory.shards.primary);
    remainingShards.intermediate = Math.max(0, remainingShards.intermediate - inventory.shards.intermediate);
    remainingShards.advanced = Math.max(0, remainingShards.advanced - inventory.shards.advanced);

    // ==========================
    // Essence Phase
    // Lowest -> highest
    // ==========================

    const orderedBosses = [...selectedBosses].sort(
        (a, b) => bosses.indexOf(a) - bosses.indexOf(b)
    );

    for (const bossName of orderedBosses) {

        const missing = bossMissing[bossName];

        if (!missing) continue;

        const essenceNeeded = missing.essence;
    
        const needsEssence =
            essenceNeeded.primary > 0 ||
            essenceNeeded.intermediate > 0;
           
        // No essence needed
        if (!needsEssence) {
            steps.push({
                boss: bossName,
                runs: 0,
                phase: "Essence",
                status: "Complete",
                advancedEssenceRemaining: essenceNeeded.advanced,
                gained: {
                    shards: {
                        primary: 0,
                        intermediate: 0,
                        advanced: 0
                    }
                }
            });

            continue;
        }

        // Farm this boss for its essence.
        const result = calculateEssenceFarm(
            essenceNeeded,
            bossDrops[bossName]
        );

        steps.push({
            boss: bossName,
            runs: result.estimatedRuns,
            phase: "Essence",
            gained: result.gained
        });

        // Shards obtained during essence farming
        // count toward the shared shard requirement.
        remainingShards.primary = Math.max(
            0,
            remainingShards.primary -
            result.gained.shards.primary
        );

        remainingShards.intermediate = Math.max(
            0,
            remainingShards.intermediate -
            result.gained.shards.intermediate
        );

        remainingShards.advanced = Math.max(
            0,
            remainingShards.advanced -
            result.gained.shards.advanced
        );
    }

    // ==========================
    // Shard Phase
    // ==========================

    if (
        remainingShards.primary > 0 ||
        remainingShards.intermediate > 0 ||
        remainingShards.advanced > 0
    ) {

        const result = calculateShardFarm(
            {
                shards: remainingShards
            },
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

    let currentPhase = null;

    steps.forEach((step, index) => {

        // Add a divider when we move from Essence farming to Shard farming
        if (step.phase !== currentPhase) {

            if (step.phase === "Shards") {
                const divider = document.createElement("div");
                divider.className = "farm-phase-divider";
                divider.innerHTML = `
                    <span>Shard Farming</span>
                `;

                farmPath.appendChild(divider);
            }

            currentPhase = step.phase;
        }

        const row = document.createElement("div");
        row.className = "farm-step";

        // --------------------------------
        // Complete step
        // --------------------------------

        if (step.status === "Complete") {

            row.className = "farm-step farm-step-complete";

            row.innerHTML = `
                <div class="farm-step-number">
                    ${String(index + 1).padStart(2, "0")}
                </div>

                <div class="farm-step-content">

                    <div class="farm-step-title">
                        ${step.boss}
                    </div>

                    <div class="farm-step-phase">
                        Essence complete
                    </div>

                   <div class="farm-step-complete-message">
                    <span class="farm-step-complete-highlight">✓</span> Inventory already covers required essence
                    ${step.advancedEssenceRemaining > 0
                    ? ` (<span class="farm-step-complete-highlight">${step.advancedEssenceRemaining.toLocaleString("sv-SE")}</span> Advanced Essence still needed — not farmable)`
                    : ""}
                   </div>

                </div>
            `;

            farmPath.appendChild(row);
            return;
        }

        // --------------------------------
        // Normal farming step
        // --------------------------------

        const phaseLabel =
            step.phase === "Essence"
                ? "Essence farming"
                : "Remaining shards";

        row.innerHTML = `
            <div class="farm-step-number">
                ${String(index + 1).padStart(2, "0")}
            </div>

            <div class="farm-step-content">

                <div class="farm-step-title">
                    ${step.boss}
                </div>

                <div class="farm-step-phase">
                    ${phaseLabel}
                </div>

                <div class="farm-step-divider"></div>

                <div class="farm-step-runs">
                    <span class="farm-step-label">Kills</span>
                    <strong>
                        ${step.runs.toLocaleString("sv-SE")}
                    </strong>
                </div>

                <div class="farm-step-loot-title">
                    Shards gained
                </div>

                <div class="farm-step-loot">

    <div>
        <span>
            <span class="resource-icon-slot"><img src="../assets/resources/primary_shard.png" alt=""></span>
            Primary Shard
        </span>
        <strong>
            +${Math.round(
                step.gained.shards.primary
            ).toLocaleString("sv-SE")}
        </strong>
    </div>

    <div>
        <span>
            <span class="resource-icon-slot"><img src="../assets/resources/intermediate_shard.png" alt=""></span>
            Intermediate Shard
        </span>
        <strong>
            +${Math.round(
                step.gained.shards.intermediate
            ).toLocaleString("sv-SE")}
        </strong>
    </div>

    <div>
        <span>
            <span class="resource-icon-slot"><img src="../assets/resources/advanced_shard.png" alt=""></span>
            Advanced Shard
        </span>
        <strong>
            +${Math.round(
                step.gained.shards.advanced
            ).toLocaleString("sv-SE")}
        </strong>
    </div>

</div>

            </div>
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

function saveActiveBossEssence() {
    if (!activeBoss) return;

    bossEssenceInventory[activeBoss] = {
        primary: Number(document.getElementById("res4").value) || 0,
        intermediate: Number(document.getElementById("res5").value) || 0,
        advanced: Number(document.getElementById("res6").value) || 0,
        scrolls: Number(document.getElementById("res7").value) || 0
    };
}

function loadActiveBossEssence() {
    if (!activeBoss) {
        document.getElementById("res4").value = 0;
        document.getElementById("res5").value = 0;
        document.getElementById("res6").value = 0;
        document.getElementById("res7").value = 0;
        return;
    }

    const saved = bossEssenceInventory[activeBoss];

    if (saved) {
        document.getElementById("res4").value = saved.primary;
        document.getElementById("res5").value = saved.intermediate;
        document.getElementById("res6").value = saved.advanced;
        document.getElementById("res7").value = saved.scrolls ?? 0;
    } else {
        document.getElementById("res4").value = 0;
        document.getElementById("res5").value = 0;
        document.getElementById("res6").value = 0;
        document.getElementById("res7").value = 0;
    }
}
function updateBossImage(bossName) {
    const bossImage = document.getElementById("bossImage");

    if (!bossImage) return;

    if (!bossName) {
        bossImage.src = "../assets/bosses/default.png";
        bossImage.alt = "Default Boss";
        return;
    }

    const filename = `../assets/bosses/lord_${bossName.toLowerCase()}.png`;

    bossImage.src = filename;
    bossImage.alt = `Lord ${bossName}`;
}

// Event listeners
currentLevelSelect.addEventListener("change", () => {
    saveActiveBossLevels();
    saveCurrentStateToActiveCharacter();
});
targetLevelSelect.addEventListener("change", () => {
    saveActiveBossLevels();
    saveCurrentStateToActiveCharacter();
});

document.getElementById("res4").addEventListener(
    "change",
    saveActiveBossEssence
);

document.getElementById("res5").addEventListener(
    "change",
    saveActiveBossEssence
);

document.getElementById("res6").addEventListener(
    "change",
    saveActiveBossEssence
);
document.getElementById("res7").addEventListener(
    "change",
    saveActiveBossEssence
);

document.getElementById("addCharacterButton").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleCreatePopover();
});

document.addEventListener("click", (e) => {
    const popover = document.getElementById("characterCreatePopover");
    const button = document.getElementById("addCharacterButton");
    if (!popover.contains(e.target) && !button.contains(e.target)) {
        closeCreatePopover();
    }
});

document.querySelectorAll(".character-class-option").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".character-class-option").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedNewCharacterClass = btn.dataset.class;
    });
});

document.getElementById("createCharacterButton").addEventListener("click", () => {
    const nameInput = document.getElementById("newCharacterName");
    const name = nameInput.value.trim();

    if (!name || !selectedNewCharacterClass) {
        alert("Enter a name and pick a class.");
        return;
    }

    createCharacter(name, selectedNewCharacterClass);
    nameInput.value = "";
    document.querySelectorAll(".character-class-option").forEach(b => b.classList.remove("selected"));
    selectedNewCharacterClass = null;
});

["res1", "res2", "res3", "res4", "res5", "res6", "res7"].forEach(id => {
    document.getElementById(id).addEventListener("input", saveCurrentStateToActiveCharacter);
});
document.getElementById("sweepMizar").addEventListener("change", () => {
    if (cachedBossDrops && cachedRemainingShards) {
        renderSweep(cachedBossDrops, cachedRemainingShards);
    }
});

document.getElementById("sweepAlioth").addEventListener("change", () => {
    if (cachedBossDrops && cachedRemainingShards) {
        renderSweep(cachedBossDrops, cachedRemainingShards);
    }
});

const fallbackBoss = bosses[0]; // e.g. "Dubhe" — used only for the placeholder shape

function setResourceIcon(imgId, resolver, boss) {
  const img = document.getElementById(imgId);
  img.src = resolver(boss ?? fallbackBoss);
  img.classList.toggle("placeholder", !boss);
}

function updateResourceLabels(boss = null) {
  const name = boss ?? "Boss";

  document.getElementById("labelRes4Text").textContent = `Primary ${name} Essence`;
  document.getElementById("labelRes5Text").textContent = `Intermediate ${name} Essence`;
  document.getElementById("labelRes6Text").textContent = `Advanced ${name} Essence`;
  document.getElementById("labelRes7Text").textContent = `${name} Scroll`;

  setResourceIcon("iconRes4", resourceIcons.primaryEssence, boss);
  setResourceIcon("iconRes5", resourceIcons.intermediateEssence, boss);
  setResourceIcon("iconRes6", resourceIcons.advancedEssence, boss);
  setResourceIcon("iconRes7", resourceIcons.scroll, boss);
}

// ==============================
// Boss Drop Table Popup
// ==============================

let cachedBossDropsData = null;

async function loadBossDropsData() {
    if (cachedBossDropsData) return cachedBossDropsData;
    const response = await fetch("../data/bossDrops.json");
    cachedBossDropsData = await response.json();
    return cachedBossDropsData;
}

function renderBossDropTable(bossName) {
    const content = document.getElementById("bossDropPopupContent");
    const title = document.getElementById("bossDropPopupTitle");

    if (!bossName) {
        title.textContent = "Average Drops";
        content.innerHTML = `<p>Select a boss first.</p>`;
        return;
    }

    title.textContent = `${bossName} — Average Drops`;

    const boss = cachedBossDropsData?.[bossName];
    if (!boss) {
        content.innerHTML = `<p>No drop data found.</p>`;
        return;
    }

    const dropTypes = [
        { key: "Primary Shard", icon: resourceIcons.primaryShard },
        { key: "Intermediate Shard", icon: resourceIcons.intermediateShard },
        { key: "Advanced Shard", icon: resourceIcons.advancedShard },
        { key: "Primary Essence", icon: resourceIcons.primaryEssence(bossName) },
        { key: "Intermediate Essence", icon: resourceIcons.intermediateEssence(bossName) },
        { key: "Advanced Essence", icon: resourceIcons.advancedEssence(bossName) }
    ];

    content.innerHTML = dropTypes.map(({ key, icon }) => {
        const average = boss.drops?.[key]?.average;
        if (average === undefined) return "";
        return `
            <div class="boss-drop-row">
                <span><span class="resource-icon-slot"><img src="${icon}" alt=""></span>${key}</span>
                <strong>${average.toLocaleString("sv-SE")}</strong>
            </div>
        `;
    }).join("");
}

async function refreshBossDropPopupIfOpen() {
    const popup = document.getElementById("bossDropPopup");
    if (!popup.classList.contains("open")) return;

    await loadBossDropsData();
    renderBossDropTable(activeBoss);
}

function selectBoss(boss) {

    // Save the levels of the boss we're currently leaving
    saveActiveBossLevels();
    saveCurrentStateToActiveCharacter();

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

        // Give newly selected bosses their default level range
        if (!bossLevelRanges[boss]) {
            bossLevelRanges[boss] = {
                current: "0",
                target: "1-1"
            };
        }

        // Give newly selected bosses a separate essence inventory
        if (!bossEssenceInventory[boss]) {
            bossEssenceInventory[boss] = {
                primary: 0,
                intermediate: 0,
                advanced: 0
            };
        }
    }

    // Load data for the new active boss
    loadActiveBossLevels();
    loadActiveBossEssence();

    setActiveBoss();
    updateBossImage(activeBoss);
    updateStarNodeImage(activeBoss);

    if (activeBoss) {
        updateResourceLabels(activeBoss);
    } else {
        updateResourceLabels(null);
    }

    refreshBossDropPopupIfOpen();
}

// ==============================
// Startup
// ==============================
populateLevels(currentLevelSelect, true);
populateLevels(targetLevelSelect, false);

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

updateResourceLabels();
loadCharactersFromStorage();
activeCharacterId = null;

renderCharacterList();
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
    
const bossCosts = {};
const bossMissing = {};

const totalCost = {
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

    const cost = calculateCost(upgradePath);

    bossCosts[bossName] = cost;

    const essenceInventory = bossEssenceInventory[bossName] || {
    primary: 0,
    intermediate: 0,
    advanced: 0
};

bossMissing[bossName] = calculateMissing(
    cost,
    {
        shards: { primary: 0, intermediate: 0, advanced: 0 },
        essence: essenceInventory,
        scrolls: essenceInventory.scrolls || 0,
        ingots: 0,
        coins: 0
    },
    bossName
);

    // Combine total cost
    totalCost.shards.primary += cost.shards.primary;
    totalCost.shards.intermediate += cost.shards.intermediate;
    totalCost.shards.advanced += cost.shards.advanced;

    totalCost.coins += cost.coins;

    totalCost.essence.primary += cost.essence.primary;
    totalCost.essence.intermediate += cost.essence.intermediate;
    totalCost.essence.advanced += cost.essence.advanced;

    totalCost.scrolls += cost.scrolls;
    totalCost.ingots += cost.ingots;
}

// ==========================
// Update Result Card
// ==========================

const totalMissing = {
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

    essence: {
        primary: 0,
        intermediate: 0,
        advanced: 0
    },

    scrolls: Math.max(
        0,
        totalCost.scrolls - inventory.scrolls
    ),

    ingots: Math.max(
        0,
        totalCost.ingots - inventory.ingots
    ),

    coins: Math.max(
        0,
        totalCost.coins - inventory.coins
    )
};
for (const bossName of selectedBosses) {

    const cost = bossCosts[bossName];

    if (!cost) continue;

    const essenceInventory =
        bossEssenceInventory[bossName] || {
            primary: 0,
            intermediate: 0,
            advanced: 0
        };

    totalMissing.essence.primary += Math.max(
        0,
        cost.essence.primary - essenceInventory.primary
    );

    totalMissing.essence.intermediate += Math.max(
        0,
        cost.essence.intermediate - essenceInventory.intermediate
    );

    totalMissing.essence.advanced += Math.max(
        0,
        cost.essence.advanced - essenceInventory.advanced
    );
}

const farmPath = generateFarmPath(
    bossMissing,
    bossDrops,
    inventory
);

const combinedBosses = combineFarmPathByBoss(farmPath);

const gainedShardsTotal = { primary: 0, intermediate: 0, advanced: 0 };
for (const bossName of Object.keys(combinedBosses)) {
    gainedShardsTotal.primary += combinedBosses[bossName].gained.shards.primary || 0;
    gainedShardsTotal.intermediate += combinedBosses[bossName].gained.shards.intermediate || 0;
    gainedShardsTotal.advanced += combinedBosses[bossName].gained.shards.advanced || 0;
}

document.getElementById("resultPrimaryShard").innerHTML = `
    <small>Gained / Needed</small>
    ${Math.round(gainedShardsTotal.primary).toLocaleString("sv-SE")}/${totalCost.shards.primary.toLocaleString("sv-SE")}
    ${inventory.shards.primary > 0
        ? `<small class="essence-covered-note">✓ +${inventory.shards.primary.toLocaleString("sv-SE")} from inventory</small>`
        : ""}
`;

document.getElementById("resultIntermediateShard").innerHTML = `
    <small>Gained / Needed</small>
    ${Math.round(gainedShardsTotal.intermediate).toLocaleString("sv-SE")}/${totalCost.shards.intermediate.toLocaleString("sv-SE")}
    ${inventory.shards.intermediate > 0
        ? `<small class="essence-covered-note">✓ +${inventory.shards.intermediate.toLocaleString("sv-SE")} from inventory</small>`
        : ""}
`;

document.getElementById("resultAdvancedShard").innerHTML = `
    <small>Gained / Needed</small>
    ${Math.round(gainedShardsTotal.advanced).toLocaleString("sv-SE")}/${totalCost.shards.advanced.toLocaleString("sv-SE")}
    ${inventory.shards.advanced > 0
        ? `<small class="essence-covered-note">✓ +${inventory.shards.advanced.toLocaleString("sv-SE")} from inventory</small>`
        : ""}
`;

document.getElementById("resultIngots").textContent =
    totalMissing.ingots.toLocaleString("sv-SE");

const totalConquestCost = Object.keys(combinedBosses).reduce(
    (sum, bossName) => sum + ((combinedBosses[bossName]?.estimatedRuns || 0) * 50),
    0
);

document.getElementById("resultTotalConquest").textContent =
    totalConquestCost.toLocaleString("sv-SE");

const bossResourceSections =
    document.getElementById("bossResourceSections");
bossResourceSections.innerHTML = "";

for (const bossName of bosses) {

    const cost = bossCosts[bossName];
    const missing = bossMissing[bossName];

    if (!cost || !missing) continue;

    const section = document.createElement("div");
    section.className = "boss-resource-section";

const gainedPrimary = combinedBosses[bossName]?.gained?.essence?.primary || 0;
const gainedIntermediate = combinedBosses[bossName]?.gained?.essence?.intermediate || 0;

const essenceInventory = bossEssenceInventory[bossName] || {
    primary: 0,
    intermediate: 0,
    advanced: 0,
    scrolls: 0
};

    section.innerHTML = `
<h3>
    ${bossName}
    <span class="token-cost-inline">
    <span class="dash"></span>
    <span class="resource-icon-slot"><img src="${resourceIcons.conquest}" alt=""></span>
    <span class="token-cost-value">${((combinedBosses[bossName]?.estimatedRuns || 0) * 50).toLocaleString("sv-SE")}</span>
</span>
</h3>

<div class="boss-resource-table">

  <div class="boss-image-cell">
        <img class="boss-image-placeholder" src="../assets/bosses/${bossName.toLowerCase()}_frame.png" alt="${bossName}">
    </div>

    <div class="boss-resource-row">
        <div class="resource-cell">
    <label>
        <span class="resource-icon-slot"><img src="${resourceIcons.primaryEssence(bossName)}" alt=""></span>
        Primary Essence
    </label>
    <p>
        ${Math.round(gainedPrimary).toLocaleString("sv-SE")}/${cost.essence.primary.toLocaleString("sv-SE")}
    </p>
    <small class="${essenceInventory.primary > 0 ? "essence-covered-note" : ""}">
        ${essenceInventory.primary > 0 ? "✓ Essence covered by inventory" : "Gained / Needed"}
    </small>
</div>

<div class="resource-cell">
    <label>
        <span class="resource-icon-slot"><img src="${resourceIcons.intermediateEssence(bossName)}" alt=""></span>
        Intermediate Essence
    </label>
    <p>
        ${Math.round(gainedIntermediate).toLocaleString("sv-SE")}/${cost.essence.intermediate.toLocaleString("sv-SE")}
    </p>
    <small class="${essenceInventory.intermediate > 0 ? "essence-covered-note" : ""}">
        ${essenceInventory.intermediate > 0 ? "✓ Essence covered by inventory" : "Gained / Needed"}
    </small>
</div>

        <div class="resource-cell non-farmable">
            <label>
                <span class="resource-icon-slot"><img src="${resourceIcons.advancedEssence(bossName)}" alt=""></span>
                Advanced Essence
            </label>
            <p>
                ${essenceInventory.advanced.toLocaleString("sv-SE")}/${cost.essence.advanced.toLocaleString("sv-SE")}
            </p>
            <small>Inventory / Needed</small>
        </div>
    </div>

    <div class="boss-resource-row">
        <div class="resource-cell non-farmable">
            <label>
                <span class="resource-icon-slot"><img src="${resourceIcons.scroll(bossName)}" alt=""></span>
                Scrolls
            </label>
            <p>
                ${(essenceInventory.scrolls || 0).toLocaleString("sv-SE")}/${cost.scrolls.toLocaleString("sv-SE")}
            </p>
            <small>Inventory / Needed</small>
        </div>

        <div class="resource-cell">
            <label>
                <span class="resource-icon-slot"><img src="${resourceIcons.ingot}" alt=""></span>
                Ingots
            </label>
            <p>
                ${cost.ingots.toLocaleString("sv-SE")}
            </p>
        </div>

        <div class="resource-cell">
            <label>
                <span class="resource-icon-slot"><img src="${resourceIcons.coin}" alt=""></span>
                Coins
            </label>
            <p>
                ${cost.coins.toLocaleString("sv-SE")}
            </p>
        </div>
    </div>

</div>
`;

    bossResourceSections.appendChild(section);
}

// ==========================
// Boss Runs
// ==========================

renderFarmPath(farmPath);
renderBossCards(farmPath);
cachedBossDrops = bossDrops;
cachedRemainingShards = totalMissing.shards;
renderSweep(cachedBossDrops, cachedRemainingShards);

});
}
const farmViewButton = document.getElementById("farmViewButton");
const resourcesViewButton = document.getElementById("resourcesViewButton");

const farmView = document.getElementById("farmView");
const resourcesView = document.getElementById("resourcesView");

farmViewButton.addEventListener("click", () => {
    farmView.style.display = "block";
    resourcesView.style.display = "none";

    farmViewButton.classList.add("active");
    resourcesViewButton.classList.remove("active");
});

resourcesViewButton.addEventListener("click", () => {
    farmView.style.display = "none";
    resourcesView.style.display = "block";

    farmViewButton.classList.remove("active");
    resourcesViewButton.classList.add("active");
});
document.querySelectorAll(
    '#res1, #res2, #res3, #res4, #res5, #res6, #res7'
).forEach(input => {

    input.addEventListener("focus", () => {
        if (input.value === "0") {
            input.select();
        }
    });

});
// ==============================
// Info Modal
// ==============================
document.getElementById("infoButton").addEventListener("click", () => {
    document.getElementById("infoModalOverlay").classList.add("open");
});

document.getElementById("closeInfoModal").addEventListener("click", () => {
    document.getElementById("infoModalOverlay").classList.remove("open");
});

document.getElementById("infoModalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "infoModalOverlay") {
        document.getElementById("infoModalOverlay").classList.remove("open");
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        document.getElementById("infoModalOverlay").classList.remove("open");
    }
});
// ==============================
// Boss Drop Table Popup
// ==============================
document.getElementById("bossInfoButton").addEventListener("click", async () => {
    await loadBossDropsData();
    renderBossDropTable(activeBoss);
    document.getElementById("bossDropPopup").classList.add("open");
});

document.getElementById("closeBossDropPopup").addEventListener("click", () => {
    document.getElementById("bossDropPopup").classList.remove("open");
});
// ==============================
// Delete Character Confirmation
// ==============================
document.getElementById("deleteConfirmCancel").addEventListener("click", closeDeleteConfirm);

document.getElementById("deleteConfirmAccept").addEventListener("click", () => {
    const id = document.getElementById("deleteConfirmOverlay").dataset.characterId;
    deleteCharacter(id);
});
document.addEventListener("click", (e) => {
    const list = document.getElementById("characterList");
    const path = e.composedPath();
    if (!path.includes(list) && deleteModeCharacterId !== null) {
        deleteModeCharacterId = null;
        renderCharacterList();
    }
});