// engine.js
const lpModule = require('./lexerparser.js');
const actions = require('./actions.js');
lp = new lpModule.LexerParser();

function createEngine(player, map) {
  return function handle(input) {

    const parsedObject = lp.parseInput(input);
    if (parsedObject.error) return parsedObject.error;

    const {action} = parsedObject;
    const handler = actions[action];

    if (!handler) {
      return `Nothing happens. (No logic for "${action}")`;
    }

    return handler(action, player, map, parsedObject);
  };
}

module.exports = createEngine;