var ct = module.exports = {};
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

ct.name = "content-type";
ct.setter = function(val) {
	bo.value = val;
};
ct.getter = function() {
	return bo;
};
ct.compile = function() {
	return require('util').format("Content-Type: %s" + ((bo.boundary.length > 0) ? "boundary=" + bo.boundary : ""));
};
/*
email.headers.content-type = "some/mimetype";
email.headers.content-type.boundary = "somerandomestring";
*/