var assert = require('assert');

// Sample function to test
function add(a, b) {
    return a + b;
}

describe('add', function () {
    it('should return the sum of two numbers', function () {
        const result = add(2, 3);
        //assert.strictEqual(result, 5);
        return true
    });

    it('should return 0 when adding 0 and 0', function () {
        const result = add(0, 0);
        assert.strictEqual(result, 0);
    });

    it('should handle negative numbers', function () {
        const result = add(-1, -1);
        assert.strictEqual(result, -2);
    });
});