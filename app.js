require('coffee-script/register')
var
  args    = require('./app/server/args.js'), //read in command line args.
  express = require('express'),
  app     = express(),
  port    = args.port || process.env.PORT || 9001,
  server  = app.listen(port),
  io      = require('socket.io').listen(server),
  utils   = require('./app/server/utilities.js'),
  redis   = require('redis'),
  redisStore = require('connect-redis')(express),
  redisConns = require('./app/server/adapters/redisStore.js'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  passportSocketIo = require("./lib/passport.socketio"),
  models = require('./app/server/models')
  sanitizer = require('sanitizer');

var config = ((args.dev) ? require('./configDev.json') : require('./config.json'));
var store = redisConns.store;
var sessionStore = new redisStore({client: store});

passport.use(new LocalStrategy({
    usernameField: 'pn',
    passwordField: 'password'
  }, function(pn, password, done) {
    pn = utils.formatPn(pn)
    models.users.getFull({pn:pn}, function(err, user, data) {
      if (err) {
        utils.log('Err in login:', err);
        return done(err);
      }
      if (!user) {
        utils.log('Err in login: no user found');
        return done(null, false);
      }
      if (data.password !== password ) {
        utils.log('Err in login: passwords do not match. Given ='+password, 'Expected='+data.password);
        return done(null, false);
      }
      utils.log('login successful!');
      return done(null, user);
      // models.users.verify({uid:user.uid}, function(err) {
      //   if (err) return done(err);
      //   return done(null, user);
      // });
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
  app.use(function(req, res, next){
    var bstring = JSON.stringify(req.body || {});
    var rstring = JSON.stringify(req.params || {});
    if (bstring !== sanitizer.sanitize(bstring)){
      console.log(bstring, sanitizer.sanitize(bstring));
      return res.send(400);
    }
    if (rstring !== sanitizer.sanitize(rstring)){
      console.log(rstring, sanitizer.sanitize(rstring));
      return res.send(400);
    }
    next()
  });
  app.use(express.methodOverride());
  app.use(express.session({ secret: config.SECRET.cookieParser, store: sessionStore }));
  app.use(passport.initialize());
  app.use(passport.session());
  // app.use(require('stylus').middleware({ src: __dirname + '/app/client' }));
  app.use(express.static(__dirname + '/app/client'));
  app.use(express.errorHandler());
});

io.set('log level', 1);
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
  utils.log('socket auth accepted')
  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
  utils.log('socket auth failed', {data:data}, {message:message}, {error:error})
  accept(null, false);
}


// Bind socket handlers.
// Route all routes.
require('./app/server/socketBinder')(io)
require('./app/server/router')(app, io, passport);

utils.log('Server Started', args);

if (args.init) {
  var init = require('./scripts/init')
  init(function(err, results) {
    if (err) {
      console.log('Error in init', err);
      process.exit(1);
    } else {
      utils.log('DataBase has been initialized.')
      if (args.testing) require('./scripts/testScript')
    }
  });
}