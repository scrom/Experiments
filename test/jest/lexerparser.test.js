"use strict";
const lexpar = require('../../server/js/lexerparser.js');

const lp = new lexpar.LexerParser();

test('can parse verb', () => {
    const input = 'eat an artefact of little consequence';
    const expectedResult = {"action": "eat", "category": "food_drink", "target": "an artefact of little consequence"};
    const actualResult = lp.parseInput(input);
    expect(actualResult).toStrictEqual(expectedResult);
});


test('can parse verb using alias', () => {
    const input = 'x an artefact of little consequence';
    const expectedResult = {"action": "examine", "category": "examination", "target": "an artefact of little consequence"};
    const actualResult = lp.parseInput(input);
    expect(actualResult).toStrictEqual(expectedResult);
});

test('cannot parse unknown verb', () => {
    const input = 'skibidee an artefact of little consequence';
    const expectedResult = {"error": "Unknown verb: \"skibidee\""};
    const actualResult = lp.parseInput(input);
    expect(actualResult).toStrictEqual(expectedResult);
});