var assert = require('assert');
var emailobj = require('../');
var msg = new emailobj();
msg.setHeader('subject', 'Hello!');
msg.setHeader('from', 'yourmom@example.com');
msg.setHeader('to', 'you@example.com');
msg.data.push('Please remember that we going to be in town this weekend to visit. So be sure to have the spare room clean! We Love you!\r\n\r\n-Mom');
assert.equal(msg.getHeader('subject'), 'Hello!');