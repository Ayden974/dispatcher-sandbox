const { add } = require('./calculator.js');

test('add(2, 3) returns 5', () => {
  expect(add(2, 3)).toBe(5);
});
