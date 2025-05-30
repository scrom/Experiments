const fs = require('fs');
const path = require('path');

const allowed = [
    "affinityModifier",
    "antibodies",
    "attackStrength",
    "autoLock",
    "burnRate",
    "canCollect",
    "canDrawOn",
    "canOpen",
    "carryWeight",
    "charges",
    "chargesDescription",
    "chargeUnit",
    "combinesDescription",
    "combinesWith",
    "componentOf",
    "customAction",
    "defaultAction",
    "defaultResult",
    "extendedInventoryDescription",
    "flammable",
    "hasLinkedDoor",
    "health",
    "hideDeliveryDescription",
    "holdsLiquid",
    "hidden",
    "imageName",
    "isBreakable",
    "isBroken",
    "isDamaged",
    "isEdible",
    "isLiquid",
    "isOn",
    "isPowder",
    "key",
    "lockable",
    "locked",
    "nutrition",
    "plural",
    "position",
    "price",
    "requiredComponentCount",
    "requiredContainer",
    "requiresContainer",
    "saleUnit",
    "smell",
    "sound",
    "subType",
    "switched",
    "taste",
    "type",
    "unlocks",
    "weight"
];

const dataDir = path.join(__dirname, '../../../../data');
console.log(`Processing files in: ${dataDir}`);
if (!fs.existsSync(dataDir)) {  
    console.error(`Directory does not exist: ${dataDir}`);
    process.exit(1);
};

fs.readdirSync(dataDir).forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(dataDir, file);
    const json = require(filePath);
    if (json.object === 'artefact' && json.attributes) {
      const keys = Object.keys(json.attributes);
      const extras = keys.filter(k => !allowed.includes(k));
      if (extras.length) {
        console.log(`${file}: Extra attributes: ${extras.join(', ')}`);
      }
    }
  }
});