/*
* Beacon
* beaconBeta.com
*/
// require('newrelic');
'use strict';
var
  http    = require('http'),
  connect = require('connect'),
  express = require('express'),
  app     = express(),
  port    = process.env.PORT || 9001,
  server  = app.listen(port),
  io      = require('socket.io').listen(server),
  handler = require('./app/server/socketHandler.js'),
  redis   = require('redis'),
  redisStore = require('connect-redis')(express),
  passport = require('passport'),
  FacebookStrategy = require('passport-facebook').Strategy,
  FacebookTokenStrategy = require('passport-facebook-token').Strategy,
  passportSocketIo = require("passport.socketio"),
  config    = require('./config.json'),
  colors  = require('colors'),
  rtg  = require("url").parse(config.DB.REDISTOGO_URL),
  pub = redis.createClient(rtg.port, rtg.hostname),
  sub = redis.createClient(rtg.port, rtg.hostname),
  store = redis.createClient(rtg.port, rtg.hostname);

var users = require('./app/server/Users.js');
pub.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});
sub.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});
store.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});

var sessionStore = new redisStore({client: store}); // socket.io sessions
require.main.exports.io = io;

passport.serializeUser(function(user, done) { done(null, user); });
passport.deserializeUser(function(obj, done) { done(null, obj); });
var ppOptions = {
  clientID: config.FB.FACEBOOK_APP_ID,
  clientSecret: config.FB.FACEBOOK_APP_SECRET,
  callbackURL: config.HOST+"auth/facebook/callback"
}
function passportSuccess(accessToken, refreshToken, profile, done) {
  var sessionData;
  process.nextTick(function () {
    // console.log(profile);
    users.getOrAdd(profile, accessToken, function(err, user) {
      return done(null, user);
    });
  });
}
passport.use(new FacebookStrategy(ppOptions, passportSuccess));
passport.use(new FacebookTokenStrategy(ppOptions, passportSuccess));

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
  io.enable('browser client minification');  // send minified client
  io.enable('browser client etag');          // apply etag caching logic based on version number
  io.enable('browser client gzip');          // gzip the file
  io.set('log level', 1);                    // reduce logging
  io.set('store', new ioRedisStore({redis: redis, redisPub:pub, redisSub:sub, redisClient:store}));
});

io.set('authorization', passportSocketIo.authorize({
  cookieParser: express.cookieParser,
  key:         'connect.sid',       // the name of the cookie where express/connect stores its session_id
  secret:      config.SECRET.cookieParser,    // the session_secret to parse the cookie
  store:       sessionStore,        // we NEED to use a sessionstore. no memorystore please
}));


// Bind socket handlers.
io.sockets.on('connection',   function(socket) {
  handler.login(socket);
  socket.on('joinEvent',      function(data){ handler.joinEvent  (data, socket) });
  socket.on('leaveEvent',     function(data){ handler.leaveEvent (data, socket) });
  socket.on('newEvent',       function(data){ handler.newEvent   (data, socket) });
  socket.on('newMessage',     function(data){ handler.newMessage (data, socket) });
  socket.on('newFriend',      function(data){ handler.newFriend  (data, socket) });

  socket.on('getFriendList',  function(data){ handler.getFriendList(socket) });
  socket.on('newUserLocation',function(data){ handler.newUserLocation(data, socket)});
  socket.on('disconnect',     function()    { handler.disconnect(socket) });
  socket.on('benchMark',      function()    { handler.benchMark(socket) });
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
'▔▔╰━╯╰━╯▔▔▔▔╰━╯╰━╯▔▔▔▔╰━╯╰━╯▔▔▔▔╰━╯╰━╯▔▔\n'+
'#########################################';
console.log(domo.rainbow);
console.log('Port:', (''+port).bold);

process.argv.forEach(function (val, index) {
  if (index > 1) {
  switch(val) {
    case 'test':
      require('./utilities/serverTests.js')
      break;
    default:
      console.log('Invalid command "%s" Run "node app test" to run in test mode',val)
    }
  }
  // console.log(index + ': ' + val);
});

