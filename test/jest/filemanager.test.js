"use strict";
const fileManager = require('../../server/js/filemanager.js');
const fm = new fileManager.FileManager(true);

describe('FileManager', () => {
    test('can find image path', () => {
        const path = fm.getImagePath("kitty.jpg");
        const actual = path.substr(path.length - 33);
        const expected = "Experiments\\data\\images\\kitty.jpg";
        console.log("Expected: " + expected);
        console.log("Actual  : " + actual);
        expect(actual).toBe(expected);
    });
});