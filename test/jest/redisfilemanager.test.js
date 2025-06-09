"use strict";
const fileManager = require('../../server/js/filemanager.js');
const fs = require('fs');
const path = require('path');
const jf = require('jsonfile');

const testDataDir = '../../test/testdata/';
const testImageDir = '../../test/testdata/images/';

const fm = new fileManager.FileManager(false, testDataDir, testImageDir); // keep file paths as backup for when redis is not installed

const testFileName = 'testfile.json';
const testImageName = 'testimage.jpg';


describe('REDISFileManager', () => {
    test('testRedisConnection returns true if Redis is available', done => {
        jest.setTimeout(10000);
        (async () => {
            try {
            const isConnected = await fm.testRedisConnection();
            expect(isConnected).toBe(true);
            done();
            } catch (err) {
            expect(err).toBeNull();
            done();
            }
        })();
    });
  
    test('readGameData reads dummy game data from REDIS', async() => {
        jest.setTimeout(10000);
        const data = ["{\"foo\":\"bar\"}", "{\"baz\":\"qux\"}", "{\"quux\":\"corge\"}", "{\"grault\":\"garply\"}", "{\"waldo\":\"fred\"}", "{\"plugh\":\"xyzzy\"}", "{\"thud\":\"foo\"}"];
        await fm.writeGameDataAsync(testFileName, data, true);
        expect (await fm.gameDataExistsAsync(testFileName)).toBe(true);
        var readData = await fm.readGameDataAsync(testFileName);
        expect (JSON.stringify(readData[6])).toBe(data[6]); //confirm final block matches
    }); 

    test('writeGameData writes to REDIS with no errors - using async', async () => {
        jest.setTimeout(10000);
        const data = ["{\"foo\":\"bar\"}", "{\"baz\":\"qux\"}", "{\"quux\":\"corge\"}", "{\"grault\":\"garply\"}", "{\"waldo\":\"fred\"}", "{\"plugh\":\"xyzzy\"}", "{\"thud\":\"foo\"}"];
        try {
            const success = await fm.writeGameDataAsync(testFileName, data, true);
            expect(success).toBe(true);
            expect(await fm.gameDataExistsAsync(testFileName)).toBe(true);
        } catch (err) {
            console.error("Error writing game data:", err);
            expect(err).toBeNull();
        }
    });

    test('removeGameData removes data from REDIS', async () => {
        jest.setTimeout(10000);
        const data = { foo: "bar" };
        await fm.writeGameDataAsync(testFileName, data, true);
        await fm.removeGameDataAsync(testFileName);
        const readData = await fm.readGameDataAsync(testFileName);
        expect(readData).toBeNull();
    });
    
});