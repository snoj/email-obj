var genericHeader = require('./generic-headers');
var eo = require('./email-obj');
var part = module.exports = function msgpart(type, content, encoding) {
	var self = this;
	Object.defineProperty(this, "_headerHandlers", {enumerable: false, writeable: true, value: {}});
	this.headers = {};
	this.registerHeader(new (require('./generic-headers.js'))('Content-Transfer-Encoding'));
	this.registerHeader(new (require('./headers/content-type.js'))());

  this.type = type || this.headers['content-type'].value;
  Object.defineProperty(this, "encoding", {
  	enumerable: false
  	,get: function() {return self.headers['content-transfer-encoding'];}
  	,set: function(val) { self._headerHandlers['content-transfer-encoding'].reset(); self.headers['content-transfer-encoding'] = val; }
	});
  this.content = content;
};
part.prototype.compile = function() {
	var result = [];
	for(var i in this.headers) {
		var tmp = this._headerHandlers[i].compile();
		if(require('util').isArray(tmp)) {
			for(var j in tmp) {
				if(tmp[j].length > eo.LineLimitSoft) {
					for(var k = 0; k < tmp[j].length; k += (eo.LineLimitSoft-4)) {
						result.push("\r\n  " + tmp[j].substring(k, k+(eo.LineLimitSoft-4)));
					}
				} else {
					result.push(tmp[j]);
				}
			}
		} else {
			result.push(tmp);
		}
	}
	result.push(""); //seperator

	//todo: line length limiters
	result.push(this.content);
	return result.join("\r\n");
}
part.prototype.registerHeader = function(hobj) {
  var lkey = hobj.key.toLowerCase();
	this._headerHandlers[lkey] = hobj;
  this.headers.__defineGetter__(lkey, hobj.getter.bind(hobj));
  this.headers.__defineSetter__(lkey, hobj.setter.bind(hobj));
};
part.prototype.getHeader = function(key, index) {
  var lkey = key.toLowerCase();
  var r = this._headers[lkey];
  if(typeof index != 'undefined' && typeof r[index] != 'undefined') return r[index];
  return r;
};
part.prototype.setHeader = function(key, val, overwrite) {
  var lkey = key.toLowerCase();
  if(typeof this.headers[lkey] == undefined) this.registerExtension(new genericHeader(lkey));
  if(overwrite && typeof this._headerHandlers[lkey].reset == 'function') this._headerHandlers[lkey].reset();
  this.headers[lkey] = val;
  //var r = this._headers[key];
  //if(typeof index != 'undefined' && typeof r[index] != 'undefined') return r[index];
  //return r;
};
part.parseHeaders = function(rawheaders, part) {
	var headerRegex = /([\x21-\x39\x3b-\x7e]+):\x20*([\x20-\x7e]+(?:(?:\r\n)+(?:\x20+)[\x20-\x7e]+|)*)/gm;
  var ha = rawheaders.match(headerRegex);
  for(var i in ha) {
    var kv = ha[i].replace(/\s{2,}/g, " ").match(/^([\x21-\x39\x3b-\x7e]+):\x20*([\x20-\x7e]+)/);
    var k = kv[1].toLowerCase();
    if(typeof part.headers[k] == 'undefined') part.registerHeader(new genericHeader(k));

    part.headers[k] = kv[2];
  }
};
part.parse = function(raw) {
  var msgpart = new part();
  var m = raw.match(/\r\n\r\n/);
  //console.log(m);
  if(m === null) return raw;
  var partheaders = raw.substring(0, m.index);
  var partbody = raw.substring(m.index+4);
  part.parseHeaders(partheaders, msgpart);
  msgpart.content = partbody;
  return msgpart;
};
