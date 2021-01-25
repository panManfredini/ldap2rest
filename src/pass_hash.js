/* copied from https://github.com/jmarca/openldap_ssha  (with a little change)
(The MIT License)

Copyright (c) 2012 James E. Marca

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
*/

import crypto from 'crypto';

export function ssha_pass(passwd) {
    function _ssha (passwd,salt){
        var ctx = crypto.createHash('sha1');
        ctx.update(passwd, 'utf-8');
        ctx.update(salt, 'binary');
        var digest = ctx.digest('binary');
        var ssha = '{SSHA}' + Buffer.from(digest+salt,'binary').toString('base64');
        return ssha;
    }
    let buf = crypto.randomBytes(32);
    return _ssha(passwd,buf.toString('base64'));
}

