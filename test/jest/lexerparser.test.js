"use strict";
const lexpar = require('../../server/js/lexerparser.js');

const lp = new lexpar.LexerParser();

test('can parse verb', () => {
    const input = 'eat an artefact of little consequence';
    const expectedResult =  {
      category: 'food_drink',
      originalVerb: 'eat',
      originalInput: 'eat an artefact of little consequence',
      action: 'eat',
      adverb: null,
      subject: 'artefact little consequence',
      object: null,
      preposition: null,
      target: null
    };
    const actualResult = lp.parseInput(input);
    console.log(actualResult);
    expect(actualResult).toStrictEqual(expectedResult);
});

test('can parse verb using alias', () => {
    const input = 'x an artefact of little consequence';
    const expectedResult =     {
      category: 'examination',
      originalVerb: 'x',
      originalInput: input,
      action: 'examine',
      adverb: null,
      subject: 'artefact little consequence',
      object: null,
      preposition: null,
      target: null
    };
    const actualResult = lp.parseInput(input);
    console.log(actualResult);
    expect(actualResult).toStrictEqual(expectedResult);
});

test('cannot parse unknown verb', () => {
    const input = 'skibidee an artefact of little consequence';
    const expectedResult = {"error": "Unknown verb: \"skibidee\""};
    const actualResult = lp.parseInput(input);
    console.log(actualResult);
    expect(actualResult).toStrictEqual(expectedResult);
});


test('can parse string into relevant multiple objects', () => {
    const input = 'pour water over the barbecue';
    const expectedResult =     {
      category: 'item_use',
      originalVerb: 'pour',
      originalInput: input,
      action: 'pour',
      adverb: null,
      subject: 'water',
      object: 'barbecue',
      preposition: 'over',
      target: null
    };
    const actualResult = lp.parseInput(input);
    console.log(actualResult);
    expect(actualResult).toStrictEqual(expectedResult);
});