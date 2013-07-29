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
  //this.raw = null; //should only be not null if email was parsed. if parse {header: headers, body: body}
  Object.defineProperty(this, "raw", {enumerable: false, writeable: true, value: null});
  Object.defineProperty(this, "_headerHandlers", {enumerable: false, writeable: true, value: {}});
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
eo.LineLimitHard = 998;
eo.LineLimitSoft = 78;

eo.prototype.registerHeader = function(hobj) {
  var lkey = hobj.key.toLowerCase();
  this._headerHandlers[lkey] = hobj;
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
  if(typeof this.headers[lkey] == undefined) this.registerExtension(new genericHeader(lkey));
  if(overwrite && typeof this._headerHandlers[lkey].reset == 'function') this._headerHandlers[lkey].reset();
  this.headers[lkey] = val;
  return this;
};
eo.parseHeaders = function(rawheaders, msg) {
  var headerRegex = /([\x21-\x39\x3b-\x7e]+):\x20*([\x20-\x7e]+(?:(?:\r\n)+(?:\x20+)[\x20-\x7e]+|)*)/gm;
  var ha = rawheaders.match(headerRegex);
  for(var i in ha) {
    var kv = ha[i].replace(/\s{2,}/g, " ").match(/^([\x21-\x39\x3b-\x7e]+):\x20*([\x20-\x7e]+)/);
    var k = kv[1].toLowerCase();
    if(typeof msg.headers[k] == 'undefined') msg.registerHeader(new genericHeader(k));

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
  if(typeof msg.headers["mime-version"] != 'undefined' 
         && msg.headers["mime-version"]  == '1.0'
         && typeof msg.headers['content-type'] != 'undefined'
         && msg.headers['content-type'].boundary.length > 0) {
    var rawparts = rawbody.split(util.format("\r\n--%s\r\n", msg.headers['content-type'].boundary));
    for(var i in rawparts) {
      var pd = msgpart.parse(rawparts[i]);
      if(typeof pd != 'undefined') msg.data.push(pd);
    }
  } else {
    msg.data.push(new part(msg.headers['content-type'].value, rawbody));
  }
  return msg;
};
