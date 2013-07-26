var ct = require('../lib/headers/content-type.js');
var assert = require('assert');
var header = {};

header.__defineSetter__(ct.name, ct.setter);
header.__defineGetter__(ct.name, ct.getter);
assert.equal(header['content-type'].value, "text/plain");

header['content-type'].parse("multipart/mixed; boundary=frontier");
assert.equal(header['content-type'].boundary, "frontier");
assert.equal(header['content-type'].value, "multipart/mixed");