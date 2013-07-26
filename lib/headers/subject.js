var sub = module.exports = function() {
  var self = this;
  this.value = "";
}

sub.prototype.setter = function(val) {
  this.value = val;
}
sub.prototype.getter = function() {
  return this.value;
}
sub.prototype.compile = function() {
	return require('util').format("Subject: %s");
};
Object.defineProperty(sub.prototype, "key", {
  value: "subject"
});
