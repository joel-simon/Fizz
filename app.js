var http = require('http')
  , connect = require('connect')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 9001
  , server = app.listen(port)
  , io = require('socket.io').listen(server)
  , db = require('./app/server/database.js')
  , beacon = require('./app/server/server-beacon.js');
  // stores a single beacon 
  var beacons = new beacon.Beacon_keeper();

// var B = new beacon.Beacon(100000157939878, 42.36152477429757, -71.11566066741943, "Bored, anyone want to hang?");
// var C = new beacon.Beacon(564952156, 42.36152477420757, -71.11566066741945, "Game of Go anyone?");
// beacons.insert(B); // insert into database class sends push notification, or do I? 
// beacons.insert(C);
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

io.sockets.on('connection', function (socket) {
  socket.emit('news', { data: ' hello world.' });

  // setTimeout(function(){
  // 	joinBeacon({hostId: '100000157939878', guestId: '1380180579'});
  // }, 2000);
  

  socket.on('login', function (data) {
    console.log(data.id, "has logged in!");

    db.getFriends(data.id, function(id, friends) {
    	if (true) {
    		newUser(data.id, socket);
    	} else {
    		existingUser(data.id, friends, socket);
    	}
    });
  });

  // function to add new guest to event
  // adds guest to the attendees list on global, adds beacon to your list, and adds you as an
  // attendee to all attendee's lists
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

  	beacons.del_guest( host, guest );
	  emit(data.host, 'newBeacon', {'beacon': beacons.get(host)});
  });

  function joinBeacon(data) {
  	var host = data.host;
  	var userId = data.userId;
  	if ( host == userId ) return;
  	// adds guest to global beacon keeper. 
	  beacons.add_guest( host, userId ); 
	  console.log('host, userid',host, userId);
	  console.log('full table', beacons.table);
    var B = beacons.get(host);
    if (B != 'undefined') {
      // socket.emit('newBeacon', B);
      // console.log()
	    // tells all guests to add new guest
	    emit(host, 'newBeacon', {'beacon': B});  
	    // add new guest to room
	  } else {
      console.log("user event not found: join failed\n");
		}
  }

  // when a guest leaves an event
  socket.on('leaveBeacon', function (data) {
    beacons.rem_guest
    socket.emit('remBeacon', data.hostId);
    emit(socket, data.hostId, 'remBeacon', data.hostId);      
  });


	socket.on('newBeacon', function (data) {
		beacons.insert(data); // insert into database class sends push notification, or do I? 
		emit(data.host, 'newBeacon', {"beacon" : data});
	});

});


function newUser (id, socket) {
	// console.log('New user registration', id);
	socket.emit('getFriends', {});
	socket.on('friendsList', function (friends) {
		// db.addPlayer (id, friends);
		existingUser(id, friends, socket);
	});
}


function existingUser(id, friends, socket) {
	// console.log('existing user', id, 'has', friends.length,'friends');
	var allBeacons = getAllBeacons(friends, id);

	console.log('all beacons', allBeacons);
	socket.emit('newBeacons', allBeacons);
	joinRooms(socket, friends, id);
}

function joinRooms(socket, friends, id) {
	friends.forEach(function(friend){
		socket.join(friend);
	});
	socket.join(id);
}
	

function getAllBeacons(friends, id) {
	var b;
	var friendsBeacons = [];
	//check for our own event. 
	b = beacons.get(id);
	if (b) {
		friendsBeacons.push(b);
	}
	/// check every one of our friends. 
	friends.forEach(function(friend) {
		b = beacons.get(friend);
		if (b) {
			friendsBeacons.push(b);
		}
	});
	return friendsBeacons;
}


function emit(userId, eventName, data) {
	console.log('PUSHING DATA', data);
	// console.log(io.sockets.clients(userId).map(function(a){return a.id})); //[0].map(function(a))
	io.sockets.in(userId).emit(eventName, data);
}



