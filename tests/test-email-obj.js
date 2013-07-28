var assert = require('assert');
var eo = require('../index.js');

var m = eo.parse(require('fs').readFileSync('./tests/data/folding.txt').toString('ascii'));
assert.equal(m.headers.subject, "test with whitespace! anmd more!");