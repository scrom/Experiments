"use strict";
const exit = require('../../server/js/exit.js');

describe('Exit', () => {
    test('can create exit object', () => {
        const exitDestination = 'n';
        const sourceName = 'source';
        const destinationName = 'location';
        const e0 = new exit.Exit(exitDestination, sourceName, destinationName);
        const expectedResult = '{"object":"exit","longname":"North","direction":"n","source":"source","destination":"location"}';
        const actualResult = e0.toString();
        console.log("Expected: " + expectedResult);
        console.log("Actual  : " + actualResult);
        expect(actualResult).toBe(expectedResult);
    });

    test('long name should match name', () => {
        const exitDestination = 'n';
        const longName = 'North';
        const destinationName = 'location';
        const e0 = new exit.Exit(exitDestination, destinationName);
        expect(e0.getLongName()).toBe(longName);
    });

    test('direction should match direction from constructor', () => {
        const direction = 'n';
        const sourceName = 'source';
        const destinationName = 'location';
        const e0 = new exit.Exit(direction, sourceName, destinationName);
        expect(e0.getDirection()).toBe(direction);
    });

    test('destination name should match name from constructor', () => {
        const exitDestination = 'n';
        const sourceName = 'source';
        const destinationName = 'location';
        const e0 = new exit.Exit(exitDestination, sourceName, destinationName);
        expect(e0.getDestinationName()).toBe(destinationName);
    });

    test('new exit should be visible', () => {
        const exitDestination = 'n';
        const sourceName = 'source';
        const destinationName = 'location';
        const e0 = new exit.Exit(exitDestination, sourceName, destinationName);
        expect(e0.isVisible()).toBe(true);
    });

    test('can hide exit', () => {
        const exitDestination = 'n';
        const sourceName = 'source';
        const destinationName = 'location';
        const e0 = new exit.Exit(exitDestination, sourceName, destinationName);
        e0.hide();
        expect(e0.isVisible()).toBe(false);
    });

    test('can show hidden exit', () => {
        const exitDestination = 'n';
        const sourceName = 'source';
        const destinationName = 'location';
        const e0 = new exit.Exit(exitDestination, sourceName, destinationName);
        e0.hide();
        e0.show();
        expect(e0.isVisible()).toBe(true);
    });

    test('show hidden exit returns sensible message', () => {
        const exitDestination = 'n';
        const sourceName = 'source';
        const destinationName = 'location';
        const e0 = new exit.Exit(exitDestination, sourceName, destinationName);
        e0.hide();
        const expectedResult = "You reveal a new exit to the North.";
        const actualResult = e0.show();
        console.log("Expected: " + expectedResult);
        console.log("Actual  : " + actualResult);
        expect(actualResult).toBe(expectedResult);
    });

    test('hide exit returns sensible message', () => {
        const exitDestination = 'i';
        const sourceName = 'source';
        const destinationName = 'location';
        const e0 = new exit.Exit(exitDestination, sourceName, destinationName);
        const expectedResult = "You close the exit: 'in'.";
        const actualResult = e0.hide();
        console.log("Expected: " + expectedResult);
        console.log("Actual  : " + actualResult);
        expect(actualResult).toBe(expectedResult);
    });
});