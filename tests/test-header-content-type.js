var cto = require('../lib/headers/content-type.js');
var ct = new cto();
var assert = require('assert');
var header = {};

header.__defineSetter__(ct.key, ct.setter.bind(ct));
header.__defineGetter__(ct.key, ct.getter.bind(ct));
assert.equal(header['content-type'].value, "text/plain");

header['content-type'].parse("multipart/mixed; boundary=frontier");
assert.equal(header['content-type'].boundary, "frontier");
assert.equal(header['content-type'].value, "multipart/mixed");