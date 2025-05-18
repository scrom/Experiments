"use strict";
const fileManager = require('../../server/js/filemanager.js');
const fs = require('fs');
const path = require('path');
const jf = require('jsonfile');

const testDataDir = '../../test/testdata/';
const testImageDir = '../../test/testdata/images/';

const fm = new fileManager.FileManager(true, testDataDir, testImageDir);

const testFileName = 'testfile.json';
const testImageName = 'testimage.jpg';

const testFilePath = path.join(__dirname, testDataDir, testFileName); // Full path to test file
const testImagePath = path.join(__dirname, testImageDir, testImageName); // Full path to test image

console.log("Test file path: " + testFilePath);
console.log("Test image path: " + testImagePath);

describe('FileManager', () => {
    afterEach(() => {
        // Clean up test files if they exist
        if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
        if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
    });

    test('can find image path', () => {
        const imgPath = fm.getImagePath("kitty.jpg");
        const actual = imgPath.substr(imgPath.length - 30);
        const expected = "test\\testdata\\images\\kitty.jpg";
        expect(actual).toBe(expected);
    });

    test('writeFile and readFile should write and read JSON data', () => {
        const data = { foo: "bar", num: 42 };
        fm.writeFile(testFileName, data, true);
        const readData = fm.readFile(testFileName);
        expect(readData).toEqual(data);
    });

    test('fileExists returns true for existing file', () => {
        jf.writeFileSync(testFilePath, { test: 1 });
        expect(fm.fileExists(testFileName)).toBe(true);
    });

    test('fileExists returns false for non-existing file', () => {
        if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
        expect(fm.fileExists(testFileName)).toBe(false);
    });

    test('deleteFile removes the file', () => {
        jf.writeFileSync(testFilePath, { test: 1 });
        expect(fs.existsSync(testFilePath)).toBe(true);
        fm.deleteFile(testFileName);
        expect(fs.existsSync(testFilePath)).toBe(false);
    });

    test('imageExists returns true for existing image', () => {
        fs.writeFileSync(testImagePath, "dummy");
        expect(fm.imageExists(testImageName)).toBe(true);
    });

    test('imageExists returns false for non-existing image', () => {
        if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
        expect(fm.imageExists(testImageName)).toBe(false);
    });

    test('writeFile does not overwrite existing file if overwrite is false', () => {
        const data1 = { a: 1 };
        const data2 = { b: 2 };
        fm.writeFile(testFileName, data1, true);
        fm.writeFile(testFileName, data2, false);
        const readData = fm.readFile(testFileName);
        expect(readData).toEqual(data1);
    });

    test('writeFile overwrites existing file if overwrite is true', () => {
        const data1 = { a: 1 };
        const data2 = { b: 2 };
        fm.writeFile(testFileName, data1, true);
        fm.writeFile(testFileName, data2, true);
        const readData = fm.readFile(testFileName);
        expect(readData).toEqual(data2);
    });

    test('gameDataExists returns true for existing game data', done => {
        fm.writeFile(testFileName, { test: 123 }, true);
        fm.gameDataExists('testfile', exists => {
            expect(exists).toBe(true);
            done();
        });
    });

    test('gameDataExists returns false for non-existing game data', done => {
        if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
        fm.gameDataExists('testfile', exists => {
            expect(exists).toBe(false);
            done();
        });
    });

    test('removeGameData deletes game data file', done => {
        fm.writeFile(testFileName, { test: 123 }, true);
        expect(fs.existsSync(testFilePath)).toBe(true);
        fm.removeGameData('testfile', () => {
            expect(fs.existsSync(testFilePath)).toBe(false);
            done();
        });
    });

    test('readGameData reads dummy game data file', done => {
        const data = { foo: "bar" };
        fm.writeFile(testFileName, data, true);
        fm.readGameData('testfile', readData => {
            expect(readData).toEqual(data);
            done();
        });
    });

    test('writeGameData writes dummy game data file', done => {
        const data = [JSON.stringify({ foo: 1 }), JSON.stringify({ bar: 2 })];
        fm.writeGameData('testfile', data, true, () => {
            const readData = fm.readFile(testFileName);
            expect(readData).toEqual([{ foo: 1 }, { bar: 2 }]);
            done();
        });
    });

    test('readGameData reads real game data file', done => {
        fm.readGameData('savegame-0', readData => {
            expect(readData[0].username).toEqual("brian"); // confirm user data object is returned
            expect(readData[5].name).toEqual("camelids-a"); // check a location on the map exists
            expect(readData.length).toEqual(137); // check we got the full file back based on number of objects expected
            done();
        });
    });
});