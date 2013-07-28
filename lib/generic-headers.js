var g = module.exports = function(key, val) {
	Object.defineProperty(this, "key", {value: key});
	this.value = (typeof val != 'undefined') ? [val] : [];
}

g.prototype.setter = function(val) { this.value.push(val); };
g.prototype.getter = function() { 
	var r = (this.value.length == 1) ? this.value[0] : this.value;
	/*r.toString = function genToString() {
		if(require('util').isArray(this)) return this.join(",");
		else return this;
	}*/
	return r;
};
g.prototype.compile = function() {
	var c = [];
	this.value.forEach(function(v) {
		c.push(require('util').format("%s: %s", this.key, this.value));
	});
	return c.join("\r\n");
};
/*
archival
g.prototype.add = function(key, val, overwrite);) {
	if(overwrite) this.items[key] = [];

	if(typeof this.items[key] == 'undefined') this.items[key] = [];
  if(util.isArray(value)) {
    this.items[key] = this.items[key].concat(value);
  } else {
    this.items[key].push(value);
  }
  return this;
}

g.prototype.remove = function(key, value) {
	if(typeof this._headers[key] == 'undefined') throw util.format("[Header '%s' does not exist, cannot remove.]", key);
  if(typeof value != 'undefined') {
    try {
    	var ind = this._headers[key].indexOf(value);
    	if(int == -1) throw "something meaningless";
      this._headers[key].splice(ind, 1);
    } catch(e) {
      throw util.format("[Header '%s' does not contain the value '%s']", key, value);
    }
  } else {
    delete this._headers[key];
  }
  return this;
}
*/