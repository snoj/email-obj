var g = module.exports = function(key, val) {
	Object.defineProperty(this, "key", {value: key.toLowerCase()});
	this.value = (typeof val != 'undefined') ? [val] : [];
  this.fromRaw = false;
}
g.prototype.reset = function() {this.value = []; };
g.prototype.setter = function(val) { this.value.push(val); };
g.prototype.getter = function() { 
	var r = (this.value.length == 1) ? this.value[0] : this.value;
	return r;
};
g.prototype.compile = function(asString) {
	var self = this;
	var c = [];
	this.value.forEach(function(v) {
		c.push(require('util').format("%s: %s", self.key, v));
	});
	return (asString) ? c.join("\r\n") : c;
};
