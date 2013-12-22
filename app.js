/*
* Beacon
* beaconBeta.com
*/
var http    = require('http'),
    connect = require('connect'),
    express = require('express'),
    app     = express(),
    port    = process.env.PORT || 9001,
    server  = app.listen(port),
    io      = require('socket.io').listen(server),
    db      = require('./app/server/database.js'),
    redis   = require('redis'),
    Beacon  = require('./app/server/server-beacon.js'),
    keeper  = require('./app/server/beaconKeeper.js'),
    handler = require('./app/server/socketHandler.js').set(io),
    config    = require('./config.json'),
    colors  = require('colors'),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    passportSocketIo = require("passport.socketio"),
    redisStore = require('connect-redis')(express);

// Create pub/sub channels for sockets using redis. 
var rtg  = require("url").parse(config.DB.REDISTOGO_URL);
var pub = redis.createClient(rtg.port, rtg.hostname);
var sub = redis.createClient(rtg.port, rtg.hostname);
var store = redis.createClient(rtg.port, rtg.hostname);
pub.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});
sub.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});
store.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});

var sessionStore = new redisStore({client: store}); // socket.io sessions
var beacons = new keeper(store); // Object to manage beacons. 
 

passport.serializeUser(function(user, done) { done(null, user); });
passport.deserializeUser(function(obj, done) { done(null, obj); });
passport.use(new FacebookStrategy({
    clientID: config.FB.FACEBOOK_APP_ID,
    clientSecret: config.FB.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:9001/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      var sessionData = { 'id':profile.id, 'name':profile.displayName, 'token':accessToken };
      return done(null, sessionData);
    });
  }
));


// Configure express app.
app.configure('development',function(){
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
  fail:        onAuthorizeFail,     // *optional* callback on fail/error - read more below
}));

function onAuthorizeFail(data, message, error, accept){
  // console.log('failed connection to socket.io:', message);
  // We use this callback to log all of our failed connections.
  accept(null, false);
}

// Bind socket handlers. 
io.sockets.on('connection', function(socket) {
  handler.login(socket, beacons);
  socket.on('joinBeacon',   function(data){ handler.joinBeacon  (data, socket, beacons) });
  socket.on('deleteBeacon', function(data){ handler.deleteBeacon(data, socket, beacons) });
  socket.on('leaveBeacon',  function(data){ handler.leaveBeacon (data, socket, beacons) });
  socket.on('newBeacon',    function(data){ handler.newBeacon   (data, socket, beacons) });
  socket.on('newComment',   function(data){ handler.newComment  (data, socket, beacons) });
  socket.on('moveBeacon',   function(data){ handler.moveBeacon  (data, socket, beacons) });
});

// Route all routes. 
require('./app/server/router')(app, passport);

var domo =  ''+
"#####################################\n"+
'DOMOS HOSTS THE BEACON INTO THE CLOUD \n'+
'╲╲╭━━━━╮╲╲╲╲╭━━━━╮╲╲╲╲╭━━━━╮╲╲\n'+
'╭╮┃▆┈┈▆┃╭╮╭╮┃▆┈┈▆┃╭╮╭╮┃▆┈┈▆┃╭╮\n'+
'┃╰┫▽▽▽▽┣╯┃┃╰┫▽▽▽▽┣╯┃┃╰┫▽▽▽▽┣╯┃\n'+
'╰━┫△△△△┣━╯╰━┫△△△△┣━╯╰━┫△△△△┣━╯\n'+
'╲╲┃┈┈┈┈┃╲╲╲╲┃┈┈┈┈┃╲╲╲╲┃┈┈┈┈┃╲╲\n'+
'╲╲┃┈┏┓┈┃╲╲╲╲┃┈┏┓┈┃╲╲╲╲┃┈┏┓┈┃╲╲\n'+
'▔▔╰━╯╰━╯▔▔▔▔╰━╯╰━╯▔▔▔▔╰━╯╰━╯▔▔\n'+
'#####################################';
console.log(domo.rainbow);
console.log('Port:', (''+port).bold);

