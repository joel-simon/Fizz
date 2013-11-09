/*
* Beacon
* beaconBeta.com
*/
var http = require('http')
		connect = require('connect')
		express = require('express')
		app = express()
		port = process.env.PORT || 9001
		server = app.listen(port)
		io = require('socket.io').listen(server)
		db = require('./app/server/database.js')
		redis = require('redis')
		Beacon = require('./app/server/server-beacon.js'),
		BeaconKeeper = require('./app/server/beaconKeeper.js');

var url = 'redis://redistogo:7771d0cc39827f1664b16523d1b92768@crestfish.redistogo.com:10325/';

var rtg  = require("url").parse(url);
var pub = redis.createClient(rtg.port, rtg.hostname);
var sub = redis.createClient(rtg.port, rtg.hostname);
var store = redis.createClient(rtg.port, rtg.hostname);
pub.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});
sub.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});
store.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});

io.configure( function(){
  io.enable('browser client minification');  // send minified client
  io.enable('browser client etag');          // apply etag caching logic based on version number
  io.enable('browser client gzip');          // gzip the file
  io.set('log level', 1);                    // reduce logging

  var RedisStore = require('socket.io/lib/stores/redis');
  io.set('store', new RedisStore({redis: redis, redisPub:pub, redisSub:sub, redisClient:store}));
});

// stores a single beacon 
var beacons = new BeaconKeeper(store);

console.log('Starting Beacon Server on ', port);

app.configure(function(){
	app.set('views', __dirname + '/app/server/views');
	app.set('view engine', 'jade');
	app.locals.pretty = true;

	app.use(express.bodyParser());
	app.use(express.methodOverride());

	app.use(require('stylus').middleware({ src: __dirname + '/app/client' }));
	app.use(express.static(__dirname + '/app/client'));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

require('./app/server/router')(app);
io.set('log level', 1);

// var B = new Beacon('me', '1','2', 'hi');
// beacons.insert(B);
// beacons.get('me', function(err, vals) {
// 	console.log(err, vals);
// 	beacons.del_guest('me', '123');
// });

// beacons.get('me', function(err, vals) {
// 	console.log(err, vals);
// });
// beacons.get('you', function(err, vals) {
// 	console.log(err, vals);
// });

io.sockets.on('connection', function(socket) {
  socket.on('login', function (data) {
  	login(data.id, socket);
  });

  socket.on('joinBeacon', function (data) {
  	console.log('joining socket:',socket.id);
	  joinBeacon(data);
  });

  socket.on('deleteBeacon', function (data) {
  	console.log('deleteBeacon:',data);
  	beacons.remove( data.host );
	  emit(data.host, 'deleteBeacon', {host: data.host});
  });

  socket.on('leaveBeacon', function (data) {
  	var host = data.host,
  			guest = data.guest;
  	beacons.del_guest( host, guest, function() {
  		beacons.get(host, function(err, b){
  			emit(data.host, 'newBeacon', {'beacon': b});
  		});
  	});
  });

	socket.on('newBeacon', function (B) {
		beacons.insert(B); 
		// db.newBeacon(B);
		emit(B.host, 'newBeacon', {"beacon" : B});
	});
});


function login (id, socket) {
	console.log(id, "has logged in!");
  db.getFriends(id, function(err, friends) {
  	if (err) console.log(err);
  	else if (!friends) newUser(id, socket);
  	else existingUser(id, friends, socket);
  });
}

function newUser (id, socket) {
	console.log('New user registration', id);
	socket.emit('getFriends', {});
	socket.on('friendsList', function (friends) {
		db.addPlayer (id, friends);
		existingUser(id, friends, socket);
	});
}

function existingUser(id, friends, socket) {
	console.log('existing user', id, 'has', friends.length,'friends');
	beacons.getAllFriends(friends, id, function(err, allBeacons){
		console.log('all beacons', allBeacons);
		socket.emit('newBeacons', allBeacons);
		joinRooms(socket, friends, id);
	});	
}

function joinBeacon(data) {
	var host = data.host;
	var userId = data.userId;
	if ( host == userId ) return;
	// adds guest to global beacon keeper. 
  beacons.add_guest( host, userId, function(err){
  	beacons.get(host, function(err, b){
  		emit(host, 'newBeacon', {'beacon': b});  
	  });
  }); 
}

function joinRooms(socket, friends, id) {
	friends.forEach(function(friend){
		socket.join(friend);
	});
	socket.join(id);
}
	


function emit(userId, eventName, data) {
	console.log('PUSHING DATA', data);
	// console.log(io.sockets.clients(userId).map(function(a){return a.id})); //[0].map(function(a))
	io.sockets.in(userId).emit(eventName, data);
}



