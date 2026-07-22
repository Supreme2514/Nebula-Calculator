const {
    calculateTotalCost,
    calculateMissing
} = require("./calculator");

const inventory = {

    shards: {
        primary: 1000,
        intermediate: 100,
        advanced: 0
    },

    coins: 5000000,

    essence: {
        primary: 10,
        intermediate: 0,
        advanced: 0
    },

    scrolls: 1,

    ingots: 300
};

const totalCost = calculateTotalCost("2-5", "3-2");

const missing = calculateMissing(totalCost, inventory);

console.log(missing);