var bcrypt = require('bcrypt'),
    crypto = require('crypto'),
    shasum = crypto.createHash('sha256');

shasum.write('password');
shasum.end();
console.log(shasum.read());