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

    /*
    test('readGameData reads dummy game data from REDIS', done => {
        jest.setTimeout(10000);
        const data = { foo: "bar" };
        fm.writeGameData(testFileName, data, true, () => {
            fm.readGameData(testFileName, (err, readData) => {
                expect(err).toBeNull();
                expect(readData).toEqual(data);
                done();
            });
        });
    });

    test('deleteGameData removes data from REDIS', done => {
        jest.setTimeout(10000);
        const data = { foo: "bar" };
        fm.writeGameData(testFileName, data, true, () => {
            fm.deleteGameData(testFileName, (err) => {
                expect(err).toBeNull();
                fm.readGameData(testFileName, (err, readData) => {
                    expect(readData).toBeNull();
                    done();
                });
            });
        });
    });

    */

    
        test('writeGameData writes to REDIS with no errors - using async', done => {
        jest.setTimeout(10000);
        const data = ["{ foo: \"bar\" }", "{ baz: \"qux\" }", "{ quux: \"corge\" }", "{ grault: \"garply\" }", "{ waldo: \"fred\" }", "{ plugh: \"xyzzy\" }", "{ thud: \"foo\" }"];
        (async () => {
            try {
                const success = await fm.writeGameData(testFileName, data, true);
                expect(success).toBe(true);
                done();
            } catch (err) {
                expect(err).toBeNull();
                done();
            }
        })();
        });


/*    test('readGameData reads dummy game data from REDIS', done => {
        jest.setTimeout(10000);
        const data = { foo: "bar" };
        const callback = (err, result) => {
            if (err) {
                console.error("Error reading game data from Redis:", err);
            } else {
                console.log("Game data read from Redis:", result);
                expect(result).toEqual(data);
            }
            done();
        };
        
        fm.writeGameData(testFileName, data, true, () => {
            console.log("game data written to redis");
            
            fm.readGameData(testFileName, (err, readData) => {
                if (err) {
                    console.error("Error reading game data from Redis:", err);
                } else {
                    expect(readData).toEqual(data);
                }
                done();
            });
        });

    });
*/
});