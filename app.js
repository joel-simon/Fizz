Error.stackTraceLimit = Infinity;
'use strict';
require('coffee-script/register')
var
  args    = require('./app/server/args.js'), //read in command line args.
  express = require('express'),
  app     = express(),
  port    = args.port || process.env.PORT || 9001,
  server  = app.listen(port),
  io      = require('socket.io').listen(server),
  utils   = require('./app/server/utilities.js'),
  log     = utils.log,
  logError= utils.logError,
  redis   = require('redis'),
  redisStore = require('connect-redis')(express),
  redisConns = require('./app/server/adapters/redisStore.js'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  passportSocketIo = require("./lib/passport.socketio"),
  models = require('./app/server/models');

var config = ((args.dev) ? require('./configDev.json') : require('./config.json'));

var store = redisConns.store;
var sessionStore = new redisStore({client: store});

require.main.exports.io = io;

passport.use(new LocalStrategy({
    usernameField: 'pn',
    passwordField: 'password'
  }, function(pn, password, done) {
    models.users.getFromPn(pn, function(err, user){
      if (err) {
        log('Err in login:', err);
        return done(err);
      }
      if (!user) {
        log('Err in login: no user found');
        return done(null, false);
      }
      if (user.password !== password ) {
        log('Err in login: passwords do not match. Given =', password, 'Expected=', user.password);
        return done(null, false);
      }
      log('login successful!');
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) { done(null, user); });
passport.deserializeUser(function(obj, done) { done(null, obj); });

//Middleware: Allows cross-domain requests (CORS)
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

// Configure express app.
app.configure(function() {
  app.use(allowCrossDomain);
  app.set('views', __dirname + '/app/server/views');
  app.set('view engine', 'jade');
  app.locals.pretty = true;
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: config.SECRET.cookieParser, store: sessionStore }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(require('stylus').middleware({ src: __dirname + '/app/client' }));
  app.use(express.static(__dirname + '/app/public'));
  app.use(express.errorHandler());
});

io.set('log level', 2);
io.set('authorization', passportSocketIo.authorize({
  passport: passport,
  cookieParser: express.cookieParser,
  key:         'connect.sid',       // the name of the cookie where express/connect stores its session_id
  secret:      config.SECRET.cookieParser,    // the session_secret to parse the cookie
  store:       sessionStore,        // we NEED to use a sessionstore. no memorystore please
  success:     onAuthorizeSuccess,  // *optional* callback on success - read more below
  fail:        onAuthorizeFail     // *optional* callback on fail/error - read more below
 }));


function onAuthorizeSuccess(data, accept) {
  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept){
  if(error)
    throw new Error(message);
  accept(null, false);
}


// Bind socket handlers.
// Route all routes.
require('./app/server/socketBinder')(io)
require('./app/server/router')(app, passport);

log('Server Started', args);

if (args.init) require('./tests/serverInit');
if (args.testing) require('./tests/serverTest');
