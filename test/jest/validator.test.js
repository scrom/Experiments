const validatorModule = require('../../server/js/validator');        
const validator = new validatorModule.Validator('../../data/');
        

describe('validator.js basic tests', () => {
    describe('JSON Validation', () => {
        test('Main game data files should parse as JSON', () => {
            let success = false;
            try { validator.parseJSON();
                console.debug("JSON parsing succeeded.")
                success = true;
            } 
            catch (err){
                console.error("JSON parsing failed: "+err)
                success = false;
            };

            expect(success).toBe(true);
        });
    });
});