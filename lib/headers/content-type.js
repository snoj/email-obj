var ct = module.exports = function() {
  var self = this;
  this.h = {boundary: "", value: "text/plain"};
  this.h.parse = function(rawval) {
    var r = /((?:[a-z0-9]+)\/(?:[a-z0-9]+))(?:.*\sboundary=(?:"(.+)"|([^ "]+))|)/i;
    var v = rawval.match(r);
    self.h.value = v[1];
    self.h.boundary = v[2] || v[3] || "";
  };
  this.h.toString = function contentTypeToString() {
    return self.h.value;
  };
};
//todo: should look up the default mimetype
var bo = {boundary: "", value: "text/plain"};
bo.parse = function(rawval) {
	var r = /((?:[a-z0-9]+)\/(?:[a-z0-9]+))(?:.*\sboundary=(?:"(.+)"|([^ "]+))|)/i;
	var v = rawval.match(r);
	bo.value = v[1];
	bo.boundary = v[2] || v[3];
};

bo.toString = function contentTypeToString() {
	return bo.value;
};

Object.defineProperty(ct.prototype, "key", {
  value: "content-type"
});

ct.prototype.setter = function(val) {
	this.h.value = val;
};
ct.prototype.getter = function() {
	return this.h;
};
ct.prototype.compile = function() {
	return require('util').format("Content-Type: %s" + ((this.h.boundary.length > 0) ? "boundary=" + this.h.boundary : ""));
};
/*
email.headers.content-type = "some/mimetype";
email.headers.content-type.boundary = "somerandomestring";
*/