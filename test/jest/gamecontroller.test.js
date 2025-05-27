const { GameController } = require('../../server/js/gamecontroller');

// Mock dependencies
const mockMap = {
    getStartLocation: jest.fn(() => ({
        getName: jest.fn(() => 'startRoom')
    })),
    getLocationsJSON: jest.fn(() => '{"locations": []}')
};
const mockMapBuilder = {
    buildMap: jest.fn(() => mockMap)
};
const mockFileManager = {
    readGameDataAsync: jest.fn(async (key) => {
        if (key === "mvta.savedGames") return [];
        if (key === "testfile") return [{ username: "user", startLocation: "startRoom", currentLocation: "startRoom" }];
        return null;
    }),
    writeGameDataAsync: jest.fn(async () => null)
};
const mockGame = function(playerAttributes, id, map, mapBuilder, filename, fm) {
    this.getTimeStamp = jest.fn(() => Date.now());
    this.getNameAndId = jest.fn(() => `{"id":${id},"username":"${playerAttributes.username}"}`);
    this.getUsername = jest.fn(() => playerAttributes.username);
    this.getId = jest.fn(() => id);
    this.getFilename = jest.fn(() => filename || "testfile");
    this.saveAsync = jest.fn(async () => JSON.stringify({ description: "Game saved", username: playerAttributes.username, id, saveid: "testfile" }));
    this.checkUser = jest.fn((username, gameId) => username === playerAttributes.username && gameId === id);
    this.state = jest.fn(() => '{"state":"ok"}');
    this.userAction = jest.fn((action) => `{"result":"${action}"}`);
};
jest.mock('../../server/js/game', () => ({
    Game: jest.fn().mockImplementation(mockGame)
}));

describe('GameController', () => {
    let controller;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new GameController(mockMapBuilder, mockFileManager);
    });

    test('addGame adds a new game and returns its id', () => {
        const id = controller.addGame('user1', 5);
        expect(typeof id).toBe('number');
        expect(id).toBeGreaterThanOrEqual(0);
    });

    test('addGame returns -1 if session limit reached', () => {
        for (let i = 0; i < 5; i++) controller.addGame('user' + i, 5);
        expect(controller.addGame('user6', 5)).toBe(-1);
    });

    test('addPreMadeGame adds a game object', () => {
        const gameObj = new mockGame({ username: 'user2' }, 99, mockMap, mockMapBuilder, null, mockFileManager);
        expect(controller.addPreMadeGame(gameObj)).toBe(99);
    });

    test('addPreMadeGame returns -1 if session limit reached', () => {
        for (let i = 0; i < 10; i++) {
            const gameObj = new mockGame({ username: 'user' + i }, i, mockMap, mockMapBuilder, null, mockFileManager);
            controller.addPreMadeGame(gameObj);
        }
        const gameObj = new mockGame({ username: 'user11' }, 11, mockMap, mockMapBuilder, null, mockFileManager);
        expect(controller.addPreMadeGame(gameObj)).toBe(-1);
    });

    test('getInactiveGames returns array', () => {
        expect(Array.isArray(controller.getInactiveGames())).toBe(true);
    });

    test('getRootMap returns locations JSON', () => {
        expect(controller.getRootMap()).toBe('{"locations": []}');
    });

    test('findSavedGame returns correct message for missing file', () => {
        const result = controller.findSavedGame('userX', 123);
        expect(result).toContain('Sorry, your game has timed out');
    });

    test('getUsernameForGameID returns username if game exists', () => {
        const id = controller.addGame('user3', 5);
        expect(controller.getUsernameForGameID(id)).toBe('user3');
    });

    test('getUsernameForGameID returns null if game does not exist', () => {
        expect(controller.getUsernameForGameID(999)).toBeNull();
    });

    test('getGameState returns state for valid game', () => {
        const id = controller.addGame('user4', 5);
        expect(controller.getGameState('user4', id)).toBe('{"state":"ok"}');
    });

    test('getGameState returns error for invalid game', () => {
        expect(controller.getGameState('userX', 999)).toContain('Sorry, this game is no longer active');
    });

    test('removeGame removes game and returns quit message', () => {
        const id = controller.addGame('user5', 5);
        const result = controller.removeGame('user5', id);
        expect(result).toContain('Thanks for playing!');
    });

    test('removeGame returns error for invalid game', () => {
        expect(controller.removeGame('userX', 999)).toContain('Sorry, this game is no longer active');
    });

    test('userAction returns result for valid action', () => {
        const id = controller.addGame('user6', 5);
        expect(controller.userAction('user6', id, 'look')).toContain('look');
    });

    test('userAction returns saved game message for invalid gameId', () => {
        expect(controller.userAction('userX', 999, 'look')).toContain('Sorry, your game has timed out');
    });

    test('userAction returns error for wrong user', () => {
        const id = controller.addGame('user7', 5);
        expect(controller.userAction('wronguser', id, 'look')).toContain('Sorry, it looks like you\'re trying to play a game');
    });

    test('listGames returns JSON string', () => {
        controller.addGame('user8', 5);
        const result = controller.listGames();
        expect(result).toContain('"games":[');
    });

    test('loadGameAsync loads a game from file', async () => {
        const id = await controller.loadGameAsync(-1, 'testfile', 'user');
        expect(typeof id).toBe('number');
    });

    test('loadGameAsync returns null if file not found', async () => {
        const id = await controller.loadGameAsync(-1, 'notfound', 'user');
        expect(id).toBeNull();
    });

    test('monitor sets up interval', () => {
        jest.useFakeTimers();
        controller.checkForExpiredGames = jest.fn();
        controller.monitor(0.5, 1); // 0.5 minute poll, 1 minute game expiration
        jest.advanceTimersByTime(60000); // 1 minute
        expect(controller.checkForExpiredGames).toHaveBeenCalledTimes(2);
        jest.useRealTimers();
    });


    test('FAIL UNTIL WRITTEN: CheckForExpiredGames actually works', () => {
        jest.useFakeTimers();
        controller.checkForExpiredGames = jest.fn();
        controller.monitor(0.5, 1); // 0.5 minute poll, 1 minute game expiration
        jest.advanceTimersByTime(60000); // 1 minute
        expect(controller.checkForExpiredGames).toHaveBeenCalledTimes(9999999);
        // check expired games are removed and saved as needed - check game list etc
        jest.useRealTimers();
    });
});