const { sumWithLogging } = require('./math-helpers.js');

function add(a, b) {
  return sumWithLogging(a, b);
}

module.exports = { add };
