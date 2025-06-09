const tools = require('../../server/js/tools');

describe('tools.js basic unit tests', () => {
    describe('Time handling', () => {
        test('hoursAsTicks returns correct ticks', () => {
            expect(tools.hoursAsTicks(1)).toBe(200);
            expect(tools.hoursAsTicks(0)).toBe(0);
            expect(tools.hoursAsTicks()).toBe(0);
        });

        test('minutesAsTicks returns correct ticks', () => {
            expect(tools.minutesAsTicks(60)).toBe(200);
            expect(tools.minutesAsTicks(30)).toBe(100);
            expect(tools.minutesAsTicks(0)).toBe(0);
            expect(tools.minutesAsTicks()).toBe(0);
        });

        test('time returns correct formatted time', () => {
            expect(tools.time(1, 0, 200)).toBe('02:00');
            expect(tools.time(0, 0, 100)).toBe('00:30');
            expect(tools.time(0, 10, 50)).toBe('00:25');
            expect(tools.time(2, 10, 50)).toBe('02:25');
            expect(tools.time()).toBe('00:00');
        });
    });

    describe('String handling', () => {
        test('stringIsEmpty detects empty strings', () => {
            expect(tools.stringIsEmpty("")).toBe(true);
            expect(tools.stringIsEmpty(undefined)).toBe(true);
            expect(tools.stringIsEmpty(null)).toBe(true);
            expect(tools.stringIsEmpty("hello")).toBe(false);
        });

        test('isProperNoun detects proper nouns', () => {
            expect(tools.isProperNoun("Hello")).toBe(true);
            expect(tools.isProperNoun("Hello World")).toBe(true);
            //expect(tools.isProperNoun("Hello world")).toBe(false); // Uncomment if you want to test multiple word support (currently not supported)

            expect(tools.isProperNoun("hello")).toBe(false);
            expect(tools.isProperNoun("")).toBe(false);
            expect(tools.isProperNoun()).toBe(false);
        });

        test('initCap capitalizes first letter of first word in a string and nothing else', () => {
            expect(tools.initCap("hello")).toBe("Hello");
            expect(tools.initCap("Hello")).toBe("Hello");
            expect(tools.initCap("hello world")).toBe("Hello world");
            expect(tools.initCap("Hello World")).toBe("Hello World");
            expect(tools.initCap("hELLO")).toBe("HELLO");
            expect(tools.initCap("hELLO wORLD")).toBe("HELLO wORLD");
            expect(tools.initCap("")).toBe("");
            expect(tools.initCap()).toBe("");
        });

        test('literalToString converts object to string', () => {
            expect(tools.literalToString({a: 1, b: "test"})).toBe('{"a":1, "b":"test"}');
            expect(tools.literalToString("string")).toBe("string");
        });

        test('pluraliseDescription pluralises correctly', () => {
            // Regular plurals
            expect(tools.pluraliseDescription("box", 2)).toBe("2 boxes");
            expect(tools.pluraliseDescription("bus", 2)).toBe("2 buses");
            expect(tools.pluraliseDescription("thing", 2)).toBe("2 things");
            expect(tools.pluraliseDescription("apple", 1)).toBe("apple");
            expect(tools.pluraliseDescription("apple", 3)).toBe("3 apples");
            expect(tools.pluraliseDescription("dish", 2)).toBe("2 dishes");
            expect(tools.pluraliseDescription("church", 2)).toBe("2 churches");
            expect(tools.pluraliseDescription("leaf", 2)).toBe("2 leaves"); 
            expect(tools.pluraliseDescription("knife", 2)).toBe("2 knives"); 
            expect(tools.pluraliseDescription("baby", 2)).toBe("2 babies"); 
            expect(tools.pluraliseDescription("cat", 2)).toBe("2 cats");
            expect(tools.pluraliseDescription("dog", 2)).toBe("2 dogs");
            expect(tools.pluraliseDescription("fox", 2)).toBe("2 foxes");
            expect(tools.pluraliseDescription("bus", 2)).toBe("2 buses");

            //with a count of 1 - don't pluralise
            expect(tools.pluraliseDescription("dish", 1)).toBe("dish");

            // Irregular plurals
            expect(tools.pluraliseDescription("child", 2)).toBe("2 children");
            expect(tools.pluraliseDescription("foot", 2)).toBe("2 feet");
            expect(tools.pluraliseDescription("tooth", 2)).toBe("2 teeth");
            expect(tools.pluraliseDescription("mouse", 2)).toBe("2 mice");
            expect(tools.pluraliseDescription("person", 2)).toBe("2 people");

            // Words ending with 'us' that become 'i'
            expect(tools.pluraliseDescription("cactus", 2)).toBe("2 cacti");
            expect(tools.pluraliseDescription("fungus", 2)).toBe("2 fungi");
            expect(tools.pluraliseDescription("nucleus", 2)).toBe("2 nuclei");
            expect(tools.pluraliseDescription("focus", 2)).toBe("2 foci");
            expect(tools.pluraliseDescription("radius", 2)).toBe("2 radii");
            expect(tools.pluraliseDescription("stimulus", 2)).toBe("2 stimuli");
            expect(tools.pluraliseDescription("virus", 2)).toBe("2 viri");

            // Irregular nouns that do not change in plural
            expect(tools.pluraliseDescription("sheep", 2)).toBe("2 sheep");
            expect(tools.pluraliseDescription("deer", 2)).toBe("2 deer");
            expect(tools.pluraliseDescription("fish", 2)).toBe("2 fish");
            expect(tools.pluraliseDescription("species", 2)).toBe("2 species");

            // "x of y" pattern
            expect(tools.pluraliseDescription("box of apples", 2)).toBe("2 boxes of apples");
            expect(tools.pluraliseDescription("child of light", 2)).toBe("2 children of light");

            // No count (should not pluralize)
            expect(tools.pluraliseDescription("apple")).toBe("apple");
            expect(tools.pluraliseDescription("bus")).toBe("bus");

            //multiword
            expect(tools.pluraliseDescription("ice cream", 5)).toBe("5 ice creams");

            // Edge cases
            expect(tools.pluraliseDescription("", 2)).toBe("");
            expect(tools.pluraliseDescription(null, 2)).toBe("");
            expect(tools.pluraliseDescription(undefined, 2)).toBe("");
        });
    });

    test('unpluraliseDescription unpluralises correctly', () => {
            // Regular plurals
            expect(tools.unpluraliseDescription("boxes")).toBe("box");
            expect(tools.unpluraliseDescription("buses")).toBe("bus");
            expect(tools.unpluraliseDescription("things")).toBe("thing");
            expect(tools.unpluraliseDescription("apple")).toBe("apple");
            expect(tools.unpluraliseDescription("apples")).toBe("apple");
            expect(tools.unpluraliseDescription("dishes")).toBe("dish");
            expect(tools.unpluraliseDescription("churches")).toBe("church");
            expect(tools.unpluraliseDescription("leaves")).toBe("leaf");
            expect(tools.unpluraliseDescription("knives")).toBe("knife");
            expect(tools.unpluraliseDescription("babies")).toBe("baby"); 
            expect(tools.unpluraliseDescription("cats")).toBe("cat");
            expect(tools.unpluraliseDescription("dogs")).toBe("dog");
            expect(tools.unpluraliseDescription("foxes")).toBe("fox");
            //expect(tools.unpluraliseDescription("bus")).toBe("bus"); // won't handle this  - it's also not a plural
            expect(tools.unpluraliseDescription("dish")).toBe("dish");

            // Irregular plurals
            expect(tools.unpluraliseDescription("children")).toBe("child");
            expect(tools.unpluraliseDescription("feet")).toBe("foot");
            expect(tools.unpluraliseDescription("teeth")).toBe("tooth");
            expect(tools.unpluraliseDescription("mice")).toBe("mouse");
            expect(tools.unpluraliseDescription("people")).toBe("person");

            // Words ending with 'us' that become 'i'
            expect(tools.unpluraliseDescription("cacti")).toBe("cactus");
            expect(tools.unpluraliseDescription("fungi")).toBe("fungus");
            expect(tools.unpluraliseDescription("nuclei")).toBe("nucleus");
            expect(tools.unpluraliseDescription("foci")).toBe("focus");
            expect(tools.pluraliseDescription("radius", 2)).toBe("2 radii");
            expect(tools.pluraliseDescription("stimulus", 2)).toBe("2 stimuli");
            expect(tools.pluraliseDescription("virus", 2)).toBe("2 viri");

            // Irregular nouns that do not change in plural
            expect(tools.pluraliseDescription("sheep", 2)).toBe("2 sheep");
            expect(tools.pluraliseDescription("deer", 2)).toBe("2 deer");
            expect(tools.pluraliseDescription("fish", 2)).toBe("2 fish");
            expect(tools.pluraliseDescription("species", 2)).toBe("2 species");

            // "x of y" pattern
            expect(tools.pluraliseDescription("box of apples", 2)).toBe("2 boxes of apples");
            expect(tools.pluraliseDescription("child of light", 2)).toBe("2 children of light");

            // No count (should not pluralize)
            expect(tools.pluraliseDescription("apple")).toBe("apple");
            expect(tools.pluraliseDescription("bus")).toBe("bus");

            // Edge cases
            expect(tools.pluraliseDescription("", 2)).toBe("");
            expect(tools.pluraliseDescription(null, 2)).toBe("");
            expect(tools.pluraliseDescription(undefined, 2)).toBe("");
    });

    describe('Array handling', () => {
        test('listSeparator returns correct separator', () => {
            expect(tools.listSeparator(0, 3)).toBe("");
            expect(tools.listSeparator(1, 3)).toBe(", ");
            expect(tools.listSeparator(2, 3)).toBe(", and ");
            expect(tools.listSeparator(1, 2)).toBe(" and ");
        });

        test('sortByProperty sorts array by property', () => {
            const arr = [{v: 2}, {v: 1}, {v: 3}];
            arr.sort(tools.sortByProperty('v'));
            expect(arr).toEqual([{v: 1}, {v: 2}, {v: 3}]);
        });

        test('shuffle randomizes array', () => {
            const arr = [1, 2, 3, 4, 5];
            const shuffled = tools.shuffle([...arr]);
            expect(shuffled.sort()).toEqual(arr);
        });
    });

    describe('Direction tools', () => {
        test('oppositeOf returns correct opposite direction', () => {
            expect(tools.oppositeOf('n')).toBe('s');
            expect(tools.oppositeOf('s')).toBe('n');
            expect(tools.oppositeOf('e')).toBe('w');
            expect(tools.oppositeOf('w')).toBe('e');
            expect(tools.oppositeOf('u')).toBe('d');
            expect(tools.oppositeOf('d')).toBe('u');
            expect(tools.oppositeOf('i')).toBe('o');
            expect(tools.oppositeOf('o')).toBe('i');
            expect(tools.oppositeOf('l')).toBe('r');
            expect(tools.oppositeOf('r')).toBe('l');
            expect(tools.oppositeOf('c')).toBe('c');
            expect(tools.oppositeOf('unknown')).toBe('');
        });

        test('compassSort sorts by compass order', () => {
            const arr = [
                { getDirection: () => 'e' },
                { getDirection: () => 'n' },
                { getDirection: () => 's' }
            ];
            arr.sort(tools.compassSort);
            expect(arr.map(d => d.getDirection())).toEqual(['n', 's', 'e']);
        });
    });
});