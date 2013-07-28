var util = require('util');
//only one of these allowed.
var onlyone = ["subject","from","to","cc","mime-version","content-type"];
var part = function(type, content, encoding) { this.type = type;  this.content = content; this.encoding = encoding || "7bit"; };


var handlers = [];
require('fs').readdirSync('./headers/').forEach(function(v) {
  
});
var eo = module.exports = function(from, to, subject) {
  
  this._headers = {
    from: [from]
    ,to: (util.isArray(to))? to : [to];
    ,subject: [subject]
  };//hide this?
  this._headerHandlers = {};

  this.headers = {};
  var self = this;
  for(var i in onlyone) {
    this.headers.__defineGetter__(onlyone[i], (function() { return self._headers[this.target][0]; }).bind({target: onlyone[i]}));
    this.headers.__defineGetter__(onlyone[i], (function(val) { self._headers[this.target][0] = val; }).bind({target: onlyone[i]}));
  }
  /* moving this functionality to header handlers
  this.__defineGetter__("mboundry", function() {
    this.headers['content-type'][0].match(/boundry=(?:"(.+)"|([^ ^#]+))/i)[0]
  });*/
  //multipart. none-multipart emails are located at 0 in the array.
  this.data = [];
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
  //r = /([\x21-\x39\x3b-\x7e]+):\x20*([\x21-\x39\x3b-\x7e]*(?:\r\n(?:\x20+)[\x20-\x39\x3b-\x7e]+|))/gm
};