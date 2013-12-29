
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var login = require('./routes/login');
var register = require('./routes/register');
var device = require('./routes/device');
var archive = require('./routes/archive');
var account = require('./routes/account');
var auth = require('./lib/middleware/authenticate');
var loadUser = require('./lib/middleware/loaduser');
var verify = require('./lib/middleware/verification');
var messages = require('./lib/middleware/messages');
var http = require('http');
var path = require('path');
var sio = require('socket.io');
var connect = require('connect');
var MemoryStore = express.session.MemoryStore;
var cookie = require('cookie');
var User = require('./models/user');

// Create Express app, HTTP server, Socket.io, and session store.
var app = express();
var server = http.createServer(app);
var io = sio.listen(server);
var sessionStore = new MemoryStore();

// Configure Socket.io
io.configure(function () {
  // Attempt to load session on authorization.
  io.set('authorization', function (handshakeData, cb) {
    var parsedCookie, sessionID;
    if (handshakeData.headers.cookie) {
      parsedCookie = cookie.parse(handshakeData.headers.cookie);
      sessionID = connect.utils.
                        parseSignedCookie(parsedCookie['connect.sid'], 
                          'your secret here'
      );
      if (!sessionID) {
        return cb('Cookie is invalid', false);
      }
    } else {
      return cb('No cookie', false);
    }
    sessionStore.get(sessionID, function (err, session) {
      if (err) return cb('500 Internal Server Error', false);
      if (session) {
        User.findById(session.uid, function (err, doc) {
          if (err) if (err) return cb('500 Internal Server Error', false);
          if (doc) {
            handshakeData.sid = sessionID;
            handshakeData.uid = doc.id;
            return cb(null, true);
          } else {
            cb('Unauthorized', false);
          }
        });
      } else {
        cb('Unauthorized', false);
      }
    });
  });
});

// Express configuration - all environments.
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
  store: sessionStore,
  secret: 'your secret here',
  cookie: { maxAge: 60 * 60 * 1000 }
}));
app.use(messages());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Express configuration - development only.
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Routing.
app.get('/', auth(true), routes.index);
app.get('/login', auth(false), login.form);
app.post('/login', login.submit);
app.get('/register', register.form);
app.post('/register', 
  verify.fieldsNotEmpty(),
  verify.userNotTaken(),
  verify.passwordsEqual(),
  verify.checkPasswordRules('minlen 8|maxlen 50'),
  register.submit
);
app.get('/device', auth(true), device.page);
app.get('/archive', auth(true), archive.page);
app.get('/account', auth(true), account.edit);
app.post('/account/username', auth(true), account.changeUsername);
app.post('/account/password', auth(true), account.changePassword);
app.get('/logout', login.logout);

// Socket.io connection handling.
io.on('connection', function (socket) {
  // Subscribe to rooms. Two are available: alerts and all
  // The alerts room receives server alerts (i.e., experiment start)
  // The all room receives everything the alerts room does, plus Arduino data.
  socket.on('subscribe', function (room) {
    socket.join(room);
  });
});

// Arduino services.


// All setup, time to listen!
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
