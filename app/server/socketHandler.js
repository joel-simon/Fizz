var io, beacons;
var utils = require('./utilities.js');
var logError = utils.logError;
var log = utils.log;
var debug = utils.debug;

module.exports.set = function(sio) {
  io = sio;
  return module.exports;
}

/**
 * Handle login socket
 * @param {Object} Data - contains .id and .admin
 * @param {Object} Socket - contains user user socket
 * @param {Object} Beacons - object for managing all beacons
 */
module.exports.login = function(data, socket, beacons) {
  var id = data.id || null,
      admin = data.admin || null,
      friends = data.friends || null;
  if (id) {
    log(id, "has logged in.");
    existingUser(id, friends, socket, beacons);

  } else if (admin) {
    log("Admin has logged in!");
    socket.join('admins');
    beacons.getAll(function(err, allBeacons){
      if (err) return logError(err);
      console.log('all beacons', allBeacons);
      socket.emit('newBeacons', allBeacons);
    }); 
  }
}

/**
 * Handle joinBeacon socket
 * @param {Object} Data - contains .id and .admin
 * @param {Object} Beacons - object for managing all beacons
 */
module.exports.joinBeacon = function(data, socket, beacons) {
  var host = data.host;
  var userId = data.userId;
  if ( host == userId ) return;
  // adds guest to global beacon keeper. 
  beacons.add_guest( host, userId, function(err){
    beacons.get(host, function(err, b){
      if (err) return error(err);
      if (b.pub) {
        emitPublic('newBeacon', {'beacon': b});  
      } else {
        log(userId,'joined', host);
        emit(host, 'newBeacon', {'beacon': b});  
      }
    });
  }); 
}

/**
 * Handle deleteBeacon socket
 * @param {Object} Data - contains .host, .pub
 * @param {Object} Socket - contains user user socket
 * @param {Object} Beacons - object for managing all beacons
 */
module.exports.deleteBeacon = function(data, socket, beacons) {
  var host = data.host;
  var pub = data.pub;

  if (!host) return logError("invalid delete call", data);
  beacons.remove( host );
  if (pub) emitPublic('deleteBeacon', {host: host});
  else emit(host, 'deleteBeacon', {host: host});
  log('Deleted beacon', host);
}

/**
 * Handle leaveBeacon socket
 * @param {Object} data - contains .host and .guest
 * @param {Object} Socket - contains user user socket
 * @param {Object} Beacons - object for managing all beacons
 */
module.exports.leaveBeacon = function(data, socket, beacons) {
  var host = data.host,
      guest = data.guest;
  beacons.del_guest( host, guest, function() {
    beacons.get(host, function(err, b){
      emit(data.host, 'newBeacon', {'beacon': b});
      log(guest,'left', host);
    });
  });
}

/**
 * Handle newBeacon socket
 * @param {Object} B - the beacon object
 * @param {Object} Socket - contains user user socket
 * @param {Object} Beacons - object for managing all beacons
 */
module.exports.newBeacon = function (B, socket, beacons) {
  beacons.insert(B, function(err){
    if (err) logError(err, B);
    else {
      if (B.pub) io.sockets.emit('newBeacon', {"beacon" : B});
      else emit(B.host, 'newBeacon', {"beacon" : B});
      log('New beacon by', B.host);
      beacons.addComment(B.host, '123', 'hello world', function(){});
    }
    
  }); 
}

module.exports.comment = function(data, socket, beacons) {
  beacons.addComment(hostId, guestId, comment, function(){
    
  });
}


/**
 * Handle a new user login in
 * @param {Number} id - the users id
 * @param {Object} Socket - contains user user socket
 * @param {Object} Beacons - object for managing all beacons
 */
function newUser (id, socket, beacons) {
  console.log('New user registration', id);
  socket.emit('getFriends', {});
  socket.on('friendsList', function (friends) {
    db.addPlayer (id, friends);
    existingUser(id, friends, socket, beacons);
  });
}


/**
 * Handle and existing user logging in. 
 * @param {Number} id - the users id
 * @param {Array} - the users friends as an int array of their id's
 * @param {Object} Socket - contains user user socket
 * @param {Object} Beacons - object for managing all beacons
 */
function existingUser(id, friends, socket, beacons) {
  // console.log('existing user', id, 'has', friends.length,'friends');
  beacons.getVisible(friends, id, function(err, allBeacons) {
    if (err) {
      logError('getVisible Err:', err);
    } else {
      // console.log('all beacons', allBeacons);
      socket.emit('newBeacons', allBeacons);
      friends.forEach(function(friend) {
        socket.join(friend);
      });
      socket.join(id);
    }
  });
}



/**
 * Emit from a certain person
 * @param {Number} userId
 * @param {String} eventName
 * @param {Object} Data
 */
function emit(userId, eventName, data) {
  debug('PUSHING DATA', data);
  io.sockets.in(userId).emit(eventName, data);
  io.sockets.in('admins').emit(eventName, data);
}

/**
 * Emit to everyone
 * @param {String} eventName
 * @param {Object} Data
 */
function emitPublic(eventName, data) {
  debug('PUSHING PUB DATA', data);
  io.sockets.emit(eventName, data);
}
