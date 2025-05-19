// Jest test file
const { describe, it, expect } = require('@jest/globals');

describe('test-jest', () => {
  it('should return the expected result', () => {
    const input = 'sample input';
    const expectedOutput = 'sample input'; // Replace with actual expected output
      expect(input).toBe(expectedOutput);
  });
});
