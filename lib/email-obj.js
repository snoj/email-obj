var util = require('util');
//only one of these allowed.
var onlyone = ["subject","from","to","cc","mime-version","content-type"];
var part = function(type, content, encoding) { this.type = type;  this.content = content; this.encoding = encoding || "7bit"; };

var handlers = [
  
]
s
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

eo.prototype.addHeader = function(key, value, overwrite) {
  if(overwrite) this._headers[key] = [];

  if(util.isArray(value)) {
    this._headers[key] = this._headers[key].concat(value);
  } else {
    this._headers[key].push(value);
  }
  return this;
}

eo.prototype.removeHeader = function(key, value) {
  if(typeof this._headers[key] == 'undefined') throw util.format("[Header '%s' does not exist, cannot remove.]", key);
  if(typeof value != 'undefined') {
    try {
      this._headers[key].splice(this._headers[key].indexOf(value), 1);
    } catch(e) {
      throw util.format("[Header '%s' does not contain the value '%s']", key, value);
    }
  } else {
    delete this._headers[key];
  }
  return this;
};

eo.parse = function(raw) {
  
};