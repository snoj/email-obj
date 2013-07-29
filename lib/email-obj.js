var util = require('util');
//only one of these allowed.
var preload_generic = ["subject","from","to"];


var handlers = [];
require('fs').readdirSync(__dirname + '/headers/').forEach(function(v) {
  handlers.push(require('./headers/' + v));
});

var msgpart = require('./msg-part.js');
var genericHeader = require('./generic-headers.js');

var eo = module.exports = function emailobj(from, to, subject) {
  var self = this;
  Object.defineProperty(this, "raw", {enumerable: false, writeable: true, value: null});
  Object.defineProperty(this, "_headerHandlers", {enumerable: false, writeable: true, value: {}});
  Object.defineProperty(this, "isMultipart", {enumerable: false, writeable: false, get: function(){
    r = typeof self.headers["mime-version"] != 'undefined';
    r &= self.headers["mime-version"]  == '1.0';
    r &= typeof self.headers['content-type'] != 'undefined';
    r &= self.headers['content-type'].boundary.length > 0;
    return r;
  }});
  this.headers = {};

  for(var i in handlers) {
    var t = new handlers[i](this);
    this.registerHeader(t);
  }
  for(var i in preload_generic) {
    this.registerHeader(new genericHeader(preload_generic[i]));
  }
  this.data = [];
}
//line limites, without CRLF.
eo.msgpart = msgpart;
eo.LineLimitHard = 998;
eo.LineLimitSoft = 78;

eo.prototype.registerHeader = function(hobj) {
  var lkey = hobj.key.toLowerCase();
  this._headerHandlers[lkey] = hobj;
  if(typeof this._headerHandlers[lkey].fromRaw == 'undefined') this._headerHandlers[lkey].fromRaw = false;
  this.headers.__defineGetter__(lkey, hobj.getter.bind(hobj));
  this.headers.__defineSetter__(lkey, hobj.setter.bind(hobj));
  return this;
}
eo.prototype.getHeader = function(key, index) {
  var lkey = key.toLowerCase();
  var r = this._headers[lkey];
  if(typeof index != 'undefined' && typeof r[index] != 'undefined') return r[index];
  return r;
};
eo.prototype.setHeader = function(key, val, overwrite) {
  var lkey = key.toLowerCase();
  if(typeof this._headerHandlers[lkey] == 'undefined') this.registerHeader(new genericHeader(lkey));
  if(overwrite && typeof this._headerHandlers[lkey].reset == 'function') this._headerHandlers[lkey].reset();
  this.headers[lkey] = val;
  return this;
};
eo.prototype.compile = function(asString) {
  var result = [];
	for(var i in this._headerHandlers) {
		var tmp = this._headerHandlers[i].compile();
		if(require('util').isArray(tmp) && !this._headerHandlers[i].fromRaw) {
			for(var j in tmp) {
				if(tmp[j].length > eo.LineLimitSoft) {
          var tstr = "", tarr = tmp[j].split(/\x20/);
          if(tarr[0] == "") { tarr.shift(); }
          //var prefix = ["", "  "];
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
  if(this.isMultipart) {
    for(var i = 0; i < this.data.length; i++) {
      if(this.data[i].compile) result = result.concat(this.data[i].compile());
      else if(typeof this.data[i] == 'string') result.push(this.data[i]);
      result.push("--" + this.headers['content-type'].boundary + ((i==this.data.length-1) ? '--' : ''));
    }
  } else if(this.data[0].content) {
    result.push(this.data[0].content);
  } else if(typeof this.data[0] == 'string') {
    result.push(this.data[0]);
  }
	return (asString) ? result.join("\r\n") : result;
};
eo.parseHeaders = function(rawheaders, msg) {
  var headerRegex = /([\x21-\x39\x3b-\x7e]+):\x20*([\x00-\x09\x0b\x0c\x0e-\xff]+(?:(?:\r\n)+(?:[\x20\x09]+)[\x00-\x09\x0b\x0c\x0e-\xff]+|)*)/gm;
  var ha = rawheaders.match(headerRegex);
  for(var i in ha) {
    //var kv = ha[i].replace(/\s{2,}/g, " ").match(/^([\x21-\x39\x3b-\x7e]+):\x20*([\x20-\x7e]+)/);
    var kv = ha[i].match(/^([\x21-\x39\x3b-\x7e]+):\x20*([\x00-\x09\x0b\x0c\x0e-\xff]+(?:(?:\r\n)+(?:[\x20\x09]+)[\x00-\x09\x0b\x0c\x0e-\xff]+|)*)/m);
    var k = kv[1].toLowerCase();
    if(typeof msg.headers[k] == 'undefined') msg.registerHeader(new genericHeader(k));
    msg._headerHandlers[k].fromRaw = true;
    msg.headers[k] = kv[2];
  }
}
eo.parse = function(raw) {
  var msg = new eo();
  var m = raw.match(/\r\n\r\n/m);
  var rawheaders = raw.substring(0, m.index);
  eo.parseHeaders(rawheaders, msg);

  var rawbody = raw.substring(m.index+4);
  msg.raw = {header: rawheaders, body: rawbody};

  //MULTIPART
  if(msg.isMultipart) {
    var rawparts = rawbody.split(util.format("\r\n--%s\r\n", msg.headers['content-type'].boundary));
    for(var i in rawparts) {
      var pd = msgpart.parse(rawparts[i]);
      if(typeof pd != 'undefined') msg.data.push(pd);
    }
  } else {
    msg.data.push(new msgpart(msg.headers['content-type'].value, rawbody));
  }
  return msg;
};
