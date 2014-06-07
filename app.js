/*
* Fizz
*/
// require('newrelic');
'use strict';
require('coffee-script');
var
  args    = require('./app/server/args.js'), //read in command line args.
  http    = require('http'),
  connect = require('connect'),
  express = require('express'),
  app     = express(),
  port    = args.port || process.env.PORT || 9001,
  server  = app.listen(port),
  io      = require('socket.io').listen(server),
  d       = require('domain').create(),  // create domain for error routing.
  colors  = require('colors'),
  utils   = require('./app/server/utilities.js'),
  redis   = require('redis'),
  redisStore = require('connect-redis')(express),
  redisConns = require('./app/server/redisStore.js'),
  passport = require('passport'),
  FacebookStrategy = require('passport-facebook').Strategy,
  FacebookTokenStrategy = require('./lib/passport-facebook-token').Strategy,
  // smsStrategy = require('passport-sms').Strategy,
  passportSocketIo = require("passport.socketio");

require('coffee-script/register')
var config = ((args.dev) ? require('./configDev.json') : require('./config.json'));

var store = redisConns.store,
    pub = redisConns.pub,
    sub = redisConns.sub;

var sessionStore = new redisStore({client: store}); // socket.io sessions
require.main.exports.io = io;

passport.serializeUser(function(user, done) { done(null, user); });
passport.deserializeUser(function(obj, done) { done(null, obj); });

var users = require('./app/server/users.js');
var fb        = require('./app/server/fb.js');


// passport.use(new smsStrategy(
//   function(key, done) {
//     console.log(key);
//     users.getFromKey(key, function(err, user) {
//       if (err) {
//         console.log('Err on auth', err);
//         done(err);
//       } else if (!user) {
//         console.log('No user found');
//         done(null, false);
//       } else {
//         console.log('User found', user);
//         done(null, user);
//       }
//     });
//   }
// ));


/*
  ios Login Flow.
*/

passport.use(new FacebookTokenStrategy({
    clientID: config.FB.FACEBOOK_APP_ID,
    clientSecret: config.FB.FACEBOOK_APP_SECRET,
    callbackURL: config.HOST+"auth/facebook/callback"
  },
  function(fbToken, refreshToken, profile, pn, iosToken, androidToken, done) {
    console.log('Recieved tokens, attempting to verify user.');
    pn = utils.formatPn(pn);
    if (iosToken) {
      console.log('iosToken:', iosToken)
    } else if (androidToken) {
      console.log('androidToken:', androidToken)
    } else {
      console.log('No token!');
    }
  
    if (!utils.isPn(pn)) {
      console.log('Bad phone number:', pn);
      return done('Bad phone number')
    }

    // console.log(pn);

    process.nextTick(function () {
      (require('./app/server/socketHandlers/onAuth'))(profile, pn, fbToken, iosToken, function(err, user) {
        if (err) console.log('Error in onAuth:', err);
        else done(null, user);  
      });
    });
  }));

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
  app.use(express.static(__dirname + '/app/client'));
  app.use(express.errorHandler());
});

var ioRedisStore = require('socket.io/lib/stores/redis');
// Configure socketio.
io.configure( function(){
  // io.set('transports', ['xhr-polling']); 
  // io.set('polling duration', 10);

  // io.enable('browser client minification');  // send minified client
  // io.enable('browser client etag');          // apply etag caching logic based on version number
  // io.enable('browser client gzip');          // gzip the file
  io.set('log level', 1);                    // reduce logging
  io.set('store', new ioRedisStore({redis: redis, redisPub:pub, redisSub:sub, redisClient:store}));
});

io.set('authorization', passportSocketIo.authorize({
  cookieParser: express.cookieParser,
  key:         'connect.sid',       // the name of the cookie where express/connect stores its session_id
  secret:      config.SECRET.cookieParser,    // the session_secret to parse the cookie
  store:       sessionStore,        // we NEED to use a sessionstore. no memorystore please
  success:     onAuthorizeSuccess,  // *optional* callback on success - read more below
  fail:        onAuthorizeFail     // *optional* callback on fail/error - read more below
}));

function onAuthorizeSuccess(data, accept){
  // console.log('successful connection to socket.io');
  // console.log(data);
  // The accept-callback still allows us to decide whether to
  // accept the connection or not.
  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept){

  if(error)
    throw new Error(message);
  // console.log('failed connection to socket.io:', message);
  // console.log(data);
  // We use this callback to log all of our failed connections.
  accept(null, false);
}


// Bind socket handlers.
//d.run
(function() {
  io.sockets.on('connection',   (function(socket) {
    require('./app/server/socketHandlers/connect')(socket);
    socket.on('newEvent',       (function(data){ require('./app/server/socketHandlers/newEvent')(data, socket) }));
    socket.on('joinEvent',      (function(data){ require('./app/server/socketHandlers/joinEvent ')(data, socket) }));
    socket.on('leaveEvent',     (function(data){ require('./app/server/socketHandlers/leaveEvent')(data, socket) }));
    socket.on('newInvites',     (function(data){ require('./app/server/socketHandlers/newInvites')(data, socket) }));
    socket.on('suggestInvitedList',(function(data){ require('./app/server/socketHandlers/suggestInvitedList')(data, socket) }));
    socket.on('newMessage',     (function(data){ require('./app/server/socketHandlers/newMessage')(data, socket) }));
    socket.on('getMoreMessages',(function(data){ new require('./app/server/socketHandlers/getMoreMessages ')(data, socket) }));
    socket.on('newMarker',      (function(data){ require('./app/server/socketHandlers/newMarker ')(data, socket) }));
    socket.on('locationChange', (function(data){ require('./app/server/socketHandlers/locationChange')(data, socket) }));
    socket.on('disconnect',     (function()    { require('./app/server/socketHandlers/disconnect')(socket) }));

  }));
})();

var utils     = require('./app/server/utilities.js'),
logError  = utils.logError;
d.on('error', function(err) {
  logError('d caught error',err);
});

// Route all routes.
require('./app/server/router')(app, passport);

var domo =  ''+
"#########################################\n"+
'    DOMOS POP SOME FIZZY DRINKS\n'+
'╲╲╭━━━━╮╲╲╲╲╭━━━━╮╲╲╲╲╭━━━━╮╲╲╲╲╭━━━━╮╲╲\n'+
'╭╮┃▆┈┈▆┃╭╮╭╮┃▆┈┈▆┃╭╮╭╮┃▆┈┈▆┃╭╮╭╮┃▆┈┈▆┃╭╮\n'+
'┃╰┫▽▽▽▽┣╯┃┃╰┫▽▽▽▽┣╯┃┃╰┫▽▽▽▽┣╯┃┃╰┫▽▽▽▽┣╯┃\n'+
'╰━┫△△△△┣━╯╰━┫△△△△┣━╯╰━┫△△△△┣━╯╰━┫△△△△┣━╯\n'+
'╲╲┃┈┈┈┈┃╲╲╲╲┃┈┈┈┈┃╲╲╲╲┃┈┈┈┈┃╲╲╲╲┃┈┈┈┈┃╲╲\n'+
'╲╲┃┈┏┓┈┃╲╲╲╲┃┈┏┓┈┃╲╲╲╲┃┈┏┓┈┃╲╲╲╲┃┈┏┓┈┃╲╲\n'+
'▔▔╰━╯╰━╯▔▔▔▔╰━╯╰━╯▔▔▔▔╰━╯╰━╯▔▔▔▔╰━╯╰━╯▔▔';
console.log(domo.rainbow);
console.log('Port:', (''+port).bold);
console.log('sendSms:', (''+args.sendSms).bold);
console.log('pushIos:', (''+args.pushIos).bold);
console.log('#########################################'.rainbow);


// if (args.testing) require('./utilities/serverTests.js');

if (args.testing) require('./app/server/serverInit');
