
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var auth = require('./lib/middleware/authenticate');
var loadUser = require('./lib/middleware/loaduser');
var verify = require('./lib/middleware/verification');
var messages = require('./lib/middleware/messages');
var login = require('./routes/login');
var register = require('./routes/register');
var device = require('./routes/device');
var archive = require('./routes/archive');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(messages());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
// Routing.
app.get('/', auth(), loadUser(), routes.index);
app.get('/login', login.form);
app.post('/login', login.submit);
app.get('/register', register.form);
app.post('/register', 
          verify.fieldsNotEmpty(),
          verify.userNotTaken(),
          verify.passwordsEqual(),
          verify.checkPasswordRules('minlen 8|maxlen 50|num 1'),
          register.submit
        );
app.get('/device', auth(), loadUser(), device.page);
app.get('/archive', auth(), loadUser(), archive.page);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
