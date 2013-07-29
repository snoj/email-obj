# email-obj

An API for creating and parsing emails.

# Use
```
var emailobj = require('email-obj');

var msg = new emailobj();
msg.setHeader('subject', 'Hello!');
msg.setHeader('from', 'yourmom@example.com');
msg.setHeader('to', 'you@example.com');
msg.data.push('Please remember that we going to be in town this weekend to visit. So be sure to have the spare room clean! We Love you!\r\n\r\n-Mom');
msg.compile();
```
