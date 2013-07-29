var assert = require('assert');
var eo = require('../index.js');

var m = eo.parse(require('fs').readFileSync('./tests/data/folding.txt').toString('ascii'));
assert.equal(m.headers.subject, "test with whitespace! anmd more!");

m.setHeader('subject', "another subject", true);
assert.equal(m.headers.subject, "another subject");

m.setHeader('content-type', "something/something");
assert.equal(m.headers['content-type'], "something/something");

m.setHeader('content-type', "somethingborrowed/something", true);
assert.equal(m.headers['content-type'], "somethingborrowed/something");
console.log(m.data);
