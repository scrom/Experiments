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
        expect(actualResult).toBe(expectedResult);
    });

    test('hide exit returns sensible message', () => {
        const exitDestination = 'i';
        const sourceName = 'source';
        const destinationName = 'location';
        const e0 = new exit.Exit(exitDestination, sourceName, destinationName);
        const expectedResult = "You close the exit: 'in'.";
        const actualResult = e0.hide();
        expect(actualResult).toBe(expectedResult);
    });

    // Additional tests

    test('description is set and retrieved correctly', () => {
        const exitDestination = 'e';
        const sourceName = 'room1';
        const destinationName = 'room2';
        const description = 'A wooden door leads east.';
        const e0 = new exit.Exit(exitDestination, sourceName, destinationName, description);
        expect(e0.getDescription()).toBe(description);
    });

    test('setDescription updates the description', () => {
        const e0 = new exit.Exit('w', 'room1', 'room2', 'Old desc');
        e0.setDescription('New desc');
        expect(e0.getDescription()).toBe('New desc');
    });

    test('setDestinationName updates the destination name', () => {
        const e0 = new exit.Exit('s', 'room1', 'room2');
        e0.setDestinationName('room3');
        expect(e0.getDestinationName()).toBe('room3');
    });

    test('requiredAction returns true if no action required', () => {
        const e0 = new exit.Exit('n', 'room1', 'room2');
        expect(e0.requiredAction()).toBe(true);
    });

    test('requiredAction returns true for correct action', () => {
        const e0 = new exit.Exit('n', 'room1', 'room2', '', false, 'climb');
        expect(e0.requiredAction('climb')).toBe(true);
    });

    test('requiredAction returns false for incorrect action', () => {
        const e0 = new exit.Exit('n', 'room1', 'room2', '', false, 'jump');
        expect(e0.requiredAction('run')).toBe(false);
    });

    test('getRequiredAction returns the required action', () => {
        const e0 = new exit.Exit('n', 'room1', 'room2', '', false, 'crawl');
        expect(e0.getRequiredAction()).toBe('crawl');
    });

    test('setRequiredAction updates the required action', () => {
        const e0 = new exit.Exit('n', 'room1', 'room2', '', false, 'run');
        e0.setRequiredAction('jump');
        expect(e0.getRequiredAction()).toBe('jump');
    });

    test('throws error for invalid required action', () => {
        expect(() => {
            new exit.Exit('n', 'room1', 'room2', '', false, 'abseil');
        }).toThrow("'abseil' is not a valid action.");
    });

    test('exit is hidden if isHidden is true', () => {
        const e0 = new exit.Exit('n', 'room1', 'room2', '', true);
        expect(e0.isVisible()).toBe(false);
    });

    test('exit is hidden if isHidden is "true" string', () => {
        const e0 = new exit.Exit('n', 'room1', 'room2', '', "true");
        expect(e0.isVisible()).toBe(false);
    });

    test('toString includes description, hidden, and requiredAction if set', () => {
        const e0 = new exit.Exit('n', 'room1', 'room2', 'desc', true, 'run');
        const result = e0.toString();
        expect(result).toContain('"description":"desc"');
        expect(result).toContain('"hidden":true');
        expect(result).toContain('"requiredAction":"run"');
    });
});