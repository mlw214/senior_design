
/**
 * Module dependencies.
 */
// Base modules.
var express = require('express'),
    http = require('http'),
    path = require('path'),
    sio = require('socket.io'),
    connect = require('connect'),
    cookie = require('cookie'),
    mongoose = require('mongoose'),
// Routing modules.
    routes = require('./routes'),
    login = require('./routes/login'),
    register = require('./routes/register'),
    device = require('./routes/device'),
    archive = require('./routes/archive'),
    account = require('./routes/account'),
    experiment = require('./routes/experiment'),
// Middleware modules.
    auth = require('./lib/middleware/authenticate'),
    loadUser = require('./lib/middleware/loaduser'),
    verify = require('./lib/middleware/verification'),
// Other.
    spawn = require('child_process').spawn,
    User = require('./models/user'),
    MemoryStore = express.session.MemoryStore,
    proc;

// Create Express app, HTTP server, Socket.io, and session store.
var app = express(),
    server = http.createServer(app),
    io = sio.listen(server),
    sessionStore = new MemoryStore();
mongoose.connect('mongodb://localhost/lab');

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
  verify.checkAgainstRules('minlen 8'),
  register.submit);
//app.get('/device', auth(true), device.page);
app.get('/archive', auth(true), archive.page);
app.get('/account', auth(true), loadUser(), account.edit);
app.post('/account/update/contact', 
  auth(true),
  verify.isValidEmail(),
  verify.checkCellInfo(),
  account.updateContactInfo);
app.post('/account/update/password', auth(true), account.changePassword);
app.post('/account/update/delete', auth(true), account.deleteAccount);
app.get('/logout', login.logout);

// RESTful services.
app.get('/experiment', auth(true), experiment.readAll);
app.get('/experiment/:id', auth(true), experiment.read);
app.post('/experiment', auth(true), experiment.create);
app.put('/experiment/:id', auth(true), experiment.update);
app.delete('/experiment/:id', auth(true), experiment.delete);
app.get('/experiment/:id/download', auth(true), experiment.download);

// Socket.io connection handling.
io.on('connection', function (socket) {
  socket.on('subscribe', function (room) {
    socket.join(room);
  });
});

// Arduino services.
proc = spawn(__dirname + '/lib/c++/arduino');
proc.stdout.on('data', function (data) {
  var values = data.toString().trim().split(' ');
  io.sockets.in('data').emit('data', { 
    sensor1: values[0],
    sensor2: values[1]
  });
});


// All setup, time to listen!
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});