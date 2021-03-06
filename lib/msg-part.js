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
part.prototype.compile = function(asString) {
	var result = [];
	for(var i in this.headers) {
		var tmp = this._headerHandlers[i].compile();
		if(require('util').isArray(tmp) && !this._headerHandlers[i].fromRaw) {
			for(var j in tmp) {
				if(tmp[j].length > eo.LineLimitSoft) {
          var tstr = "", tarr = tmp[j].split(/\x20/);
          if(tarr[0] == "") { tarr.shift(); }
          for(var k in tarr) {
            if(tstr.length + tarr[k].length < (eo.LineLimitSoft-3)) {
              tstr += (tarr[k] + " ");
            } else {
              result.push(tstr);
              tstr = "  " + tarr[k];
            }
          }
          result.push(tstr);
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
	return (asString) ? result.join("\r\n") : result; 
}
part.prototype.registerHeader = function(hobj) {
  var lkey = hobj.key.toLowerCase();
	this._headerHandlers[lkey] = hobj;
  this.headers.__defineGetter__(lkey, hobj.getter.bind(hobj));
  this.headers.__defineSetter__(lkey, hobj.setter.bind(hobj));
};
part.prototype.getHeader = function(key, index) {
  var lkey = key.toLowerCase();
  var r = this.headers[lkey];
  if(typeof index != 'undefined' && typeof r[index] != 'undefined') return r[index];
  return r;
};
part.prototype.setHeader = function(key, val, overwrite) {
  var lkey = key.toLowerCase();
  if(typeof this.headers[lkey] == undefined) this.registerExtension(new genericHeader(lkey));
  if(overwrite && typeof this._headerHandlers[lkey].reset == 'function') this._headerHandlers[lkey].reset();
  this.headers[lkey] = val;
};
part.parseHeaders = function(rawheaders, part) {
	var headerRegex = /([\x21-\x39\x3b-\x7e]+):\x20*([\x00-\x09\x0b\x0c\x0e-\xff]+(?:(?:\r\n)+(?:[\x20\x09]+)[\x00-\x09\x0b\x0c\x0e-\xff]+|)*)/gm;
  var headerValueRegex = /^([\x21-\x39\x3b-\x7e]+):\x20*([\x00-\x09\x0b\x0c\x0e-\xff]+(?:(?:\r\n)+(?:[\x20\x09]+)[\x00-\x09\x0b\x0c\x0e-\xff]+|)*)/m;
  var ha = rawheaders.match(headerRegex);
  for(var i in ha) {
    var kv = ha[i].replace(/\s{2,}/g, " ").match(headerValueRegex);
    var k = kv[1].toLowerCase();
    if(typeof part.headers[k] == 'undefined') part.registerHeader(new genericHeader(k));

    part.headers[k] = kv[2];
  }
};
part.parse = function(raw) {
  var msgpart = new part();
  var m = raw.match(/\r\n\r\n/);
  if(m === null) return raw;
  var partheaders = raw.substring(0, m.index);
  var partbody = raw.substring(m.index+4);
  part.parseHeaders(partheaders, msgpart);
  msgpart.content = partbody;
  return msgpart;
};
