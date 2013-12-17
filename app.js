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
    io      = require('socket.io').listen(server)
    db      = require('./app/server/database.js'),
    redis   = require('redis'),
    Beacon  = require('./app/server/server-beacon.js'),
    keeper  = require('./app/server/beaconKeeper.js'),
    handler = require('./app/server/socketHandler.js').set(io),
    pwds    = require('./pwds.json'),
    colors  = require('colors'),
    url = pwds.REDISTOGO_URL;

// console.log(pwds);

// Create pub/sub channels for sockets using redis. 
var rtg  = require("url").parse(url);
var pub = redis.createClient(rtg.port, rtg.hostname);
var sub = redis.createClient(rtg.port, rtg.hostname);
var store = redis.createClient(rtg.port, rtg.hostname);
pub.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});
sub.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});
store.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});

// Object to manage beacons. 
var beacons = new keeper(store);

// Configure socketio.
io.configure( function(){
  io.enable('browser client minification');  // send minified client
  io.enable('browser client etag');          // apply etag caching logic based on version number
  io.enable('browser client gzip');          // gzip the file
  io.set('log level', 1);                    // reduce logging
  var RedisStore = require('socket.io/lib/stores/redis');
  io.set('store', new RedisStore({redis: redis, redisPub:pub, redisSub:sub, redisClient:store}));
});

// Configure express app.
app.configure('development',function(){
  app.set('views', __dirname + '/app/server/views');
  app.set('view engine', 'jade');
  app.locals.pretty = true;
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/app/client' }));
  app.use(express.static(__dirname + '/app/client'));
  app.use(express.errorHandler());
});

// Bind socket handlers. 
io.sockets.on('connection', function(socket) {
  socket.on('login',        function(data){ handler.login       (data, socket, beacons) });
  socket.on('joinBeacon',   function(data){ handler.joinBeacon  (data, socket, beacons) });
  socket.on('deleteBeacon', function(data){ handler.deleteBeacon(data, socket, beacons) });
  socket.on('leaveBeacon',  function(data){ handler.leaveBeacon (data, socket, beacons) });
  socket.on('newBeacon',    function(data){ handler.newBeacon   (data, socket, beacons) });
});

// Route all routes. 
require('./app/server/router')(app);

colors.setTheme({
  info: 'rainbow',
  debug: 'blue',
  error: 'red'
});

var domo =  ''+
"################################################################################\n"+
" . _  .    .__  .  .  __,-- \n "+
"         ' /__\\ __,-- \n "+
"  .  ' . '|  o |    \n "+
"          [IIII]`--._ \n"+
"           |  |       `--._ \n"+
"           | :|             `--._ \n"+
"           |  |                   `--._ \n"+
"._,,.-,.__.'__`.___.,.,.-..,_.,.,.,-._..`--..-.,._.,,._,-,..,._..,.,_,,\n"+
'DOMOS HOSTS THE BEACON INTO THE CLOUD \n'+
'╲╲╭━━━━╮╲╲╲╲╭━━━━╮╲╲╲╲╭━━━━╮╲╲\n'+
'╭╮┃▆┈┈▆┃╭╮╭╮┃▆┈┈▆┃╭╮╭╮┃▆┈┈▆┃╭╮\n'+
'┃╰┫▽▽▽▽┣╯┃┃╰┫▽▽▽▽┣╯┃┃╰┫▽▽▽▽┣╯┃\n'+
'╰━┫△△△△┣━╯╰━┫△△△△┣━╯╰━┫△△△△┣━╯\n'+
'╲╲┃┈┈┈┈┃╲╲╲╲┃┈┈┈┈┃╲╲╲╲┃┈┈┈┈┃╲╲\n'+
'╲╲┃┈┏┓┈┃╲╲╲╲┃┈┏┓┈┃╲╲╲╲┃┈┏┓┈┃╲╲\n'+
'▔▔╰━╯╰━╯▔▔▔▔╰━╯╰━╯▔▔▔▔╰━╯╰━╯▔▔'

console.log(domo.info);
console.log('Port:', (''+port).bold);
console.log("################################################################################".info);



