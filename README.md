# email-obj

Email-obj attempts to make parsing and crafting email's easier.

# Email Headers

As there a multitude of headers out there, we can't really know them all. Email-obj however can handle arbitrary headers using a generic handler or you can write your own!

##generic headers
```
var msg = new emailobj();
var generic = new emailobj.genericHeader('x-header-name'); //keep in mind that all headers are converted to lowercase.
msg.registerHeader(generic);
msg.setHeader('x-header-name', 'I see skies of Viagra blue, white lists too, and warm CPUs and think to myself what a wonderful tube.');
//or
msg.headers['x-header-name'] = 'I flew head first into the light / Weightless, crisscrossing, precise / In a dream or was it life?';
```

Keep in mind though that using the msg.headers['my-header'] method of setting headers is additive. So now the message was compiled, you'd have two 'x-header-namee' fields.

##known headers
Some headers are known and can be a pain to work with. Custom header handlers can be included to deal with known codes. For instance the Content-Type header which has a handler already.

```
var msg = new emailobj();
msg.
```
# API

## emailobj.constructor()

## emailobj.handlers
An array of header handlers. Preloaded with items in the /lib/headers folder.

## emailobj.genericHeader
The header handler that is used for headers that aren't in /lib/headers. 

## emailobj.lineLimitSoft
The suggested line length for email messages, 78 characters not including the ending CRLF.

## emailobj.lineLimitHard
The hard limit for email message line length, 998 characters not including the ending CRLF.

## emailobj.prototype.registerHeader(HeaderObject)
Registers a header object to handle. Automatically called when using emailobj.prototype.setHeader (uses genericHeader if none else exist).

## emailobj.prototype.getHeader(HeaderKey)
Retrieve the value of the header. See specific header handler for how it returns data. If more than one entry exists, usually an array should be returned.

## emailobj.prototype.setHeader(HeaderKey, value, [overwrite = false])
Sets a header value. See specific header handler for details of how values are handled as well as whether overwrite is honored. For genericHeader's, the value is added to a list unless overwrite is true.

## emailobj.prototype.compile(opts)

### opts (and default values)
```
{
	asString: false
	,lineLimit: emailobj.lineLimitSoft
}
```
Compiles the message into an array of strings. opts.asString forces a return of a complete string instead of an array.

## emailobj.prototype.headers
A collection of getter/setters to handle the headers. It is recommended to use emailobj.prototype.setHeader for genericHeader but specially craft headers may require this to get/set specifics.

```
msg.setHeader('content-type', "multipart/mixed") // initialize
msg.headers['content-type'].boundary = "==w2gjaj9arwvawrbgaerwhapnaspga";

//in this specific case, you could also do this.
msg.setHeader('content-type', 'multipart/mixed; boundary===w2gjaj9arwvawrbgaerwhapnaspga');
msg.headers['content-type'].boundary = "==somethingelsewedecidedtouseinstead";
```

## emailobj.parse(rawEmail)
Parses a raw email message and returns an emailobj.

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
# License
(The MIT License)

Copyright (c) 2013 Josh Erickson &lt;josh@snoj.us&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.