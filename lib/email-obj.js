var util = require('util');
//only one of these allowed.
var preload_generic = ["subject","from","to"];
var part = function(type, content, encoding) { this.type = type;  this.content = content; this.encoding = encoding || "7bit"; };


var handlers = [];
  require('fs').readdirSync('./lib/headers/').forEach(function(v) {
  
});

var genericHeader = require('./generic-headers.js');

var eo = module.exports = function(from, to, subject) {
  this.headers = {};
  this.raw = null; //should only be not null if email was parsed.
  for(var i in handlers) {
    var t = new handlers[i](this);
    this.registerHeader(t);
  }
  for(var i in preload_generic) {
    this.registerHeader(new genericHeader(preload_generic[i]));
  }
  if(typeof from != 'undefiend') this.headers.from = from;
  if(typeof to != 'undefiend') this.headers.to = to;
  if(typeof subject != 'undefiend') this.headers.subject = subject;

  //multipart. none-multipart emails are located at 0 in the array.
  this.data = [];
}
eo.prototype.registerHeader = function(hobj) {
  this.headers.__defineGetter__(hobj.key, hobj.getter.bind(hobj));
  this.headers.__defineSetter__(hobj.key, hobj.setter.bind(hobj));
}
eo.prototype.getHeader = function(key, index) {
  var r = this._headers[key];
  if(typeof index != 'undefined' && typeof r[index] != 'undefined') return r[index];
  return r;
};

eo.parse = function(raw) {
  //if no header handler defined
  // new (require('./generic-header.js'))(precolon, postcolon);
  //Regex for getting headers. Allows for folded headers.
  //r = /([\x21-\x39\x3b-\x7e]+):\x20*([\x21-\x39\x3b-\x7e]*(?:\r\n(?:\x20+)[\x20-\x39\x3b-\x7e]+|)*)/gm
  var msg = new eo();
  msg.raw = raw;
  var headerRegex = /([\x21-\x39\x3b-\x7e]+):\x20*([\x20-\x7e]+(?:(?:\r\n)+(?:\x20+)[\x20-\x7e]+|)*)/gm;
  var m = raw.match(/\r\n\r\n(.*)/m);
  var rawheaders = raw.substring(0, m.index).match(headerRegex);

  for(var i in rawheaders) {
    var kv = rawheaders[i].replace(/\s{2,}/g, " ").match(/^([\x21-\x39\x3b-\x7e]+):\x20*([\x20-\x7e]+)/);
    var k = kv[1].toLowerCase();
    if(typeof msg.headers[k] == 'undefined') msg.registerHeader(new genericHeader(k));

    msg.headers[k] = kv[2];
  }


  var rawbody = raw.substring(m.index+4);
  return msg;
};