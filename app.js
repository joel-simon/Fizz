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

var url = process.env.REDISTOGO_URL;//'redis://redistogo:7771d0cc39827f1664b16523d1b92768@crestfish.redistogo.com:10325/';
console.log('HAVE REDIS URL:', !!url);

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
var beacons = new BeaconKeeper(store);
// beacons.clearPublic();
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

io.sockets.on('connection', function(socket) {

	socket.on('login', function (data) {
		console.log(data.admin);
		if (data.id) login(data.id, socket);
		else if (data.admin) adminLogin(data.admin, socket);
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
		if (B.pub)
			io.sockets.emit('newBeacon', {"beacon" : B});
		else
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

function adminLogin (pass, socket) {
	console.log("Admin has logged in!");
	socket.join('admins');
	beacons.getAll(function(err, allBeacons){
		if (err) return console.log('ERROR:', err);
		console.log('all beacons', allBeacons);
		socket.emit('newBeacons', allBeacons);
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
	beacons.getVisible(friends, id, function(err, allBeacons){
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
	io.sockets.in(userId).emit(eventName, data);
	io.sockets.in('admins').emit(eventName, data);
}



