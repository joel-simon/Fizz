var io, beacons, users;
var utils = require('./utilities.js');
var logError = utils.logError;
var log = utils.log;
var debug = utils.debug;
var fb = require('./fb.js');
// var applePush = require('./applePush.js');

module.exports.set = function(sio, b, u) {
  io = sio;
  beacons = b;
  users = u;
  return module.exports;
}

/**
 * Handle login socket
 * @param {Object} Data - contains .id and .admin
 * @param {Object} Socket - contains user user socket
 * @param {Object} Beacons - object for managing all beacons
 */
module.exports.login = function(socket) {
  try {
    var user = getUser(socket);
    var idArr = [];
    fb.get(user.token, '/me/friends', function(err, friends){
      if (err) return logError('from facebook.get()', err); 
      friends.data.forEach(function(elem, i) {
        idArr.push(elem.id);
      });
      existingUser(user.id, idArr, socket, beacons);
    });
  } catch (e) {
    logError('login', e);
  }
}

/**
 * Handle joinBeacon socket
 * @param {Object} Data - contains .id and .admin
 * @param {Object} Beacons - object for managing all beacons
 */
module.exports.joinBeacon = function(data, socket) {
  try {
    var user = getUser(socket);
    var id = data.id;
    var host = data.host;

    beacons.add_guest( id, user.id, function(err) {
      if (err) return logError('join beacon', err);
      log(user.name, 'joined beacon', id);
      emit(host, 'addGuest', {'id':id, 'guest':user.id });  
    }); 
  } catch (e) {
    logError('joinBeacon', e);
  }
}

/**
 * Handle deleteBeacon socket
 * @param {Object} Data - contains .host, .pub
 * @param {Object} Socket - contains user user socket
 * @param {Object} Beacons - object for managing all beacons
 */
module.exports.deleteBeacon = function(data, socket) {
  try {
    var host = data.host;
    var id = data.id;
    var pub = data.pub;
    if (!host) return logError("invalid delete call", data);
    if (!id)  return logError("invalid delete call", data);

    beacons.remove( id, host, pub );
    if (pub) emitPublic('deleteBeacon', {host: host});
    else emit(host, 'deleteBeacon', {id:id, host:host});
    log('Deleted beacon', host);
  } catch (e) {
    logError('deleteBeacon', e);
  }
}

/**
 * Handle leaveBeacon socket
 * @param {Object} data - contains .host and .guest
 * @param {Object} Socket - contains user user socket
 * @param {Object} Beacons - object for managing all beacons
 */
module.exports.leaveBeacon = function(data, socket) {
  try {

    var user = getUser(socket);
    var id = data.id;
    var host = data.host;

    beacons.del_guest( id, user.id, function(err) {
      if (err) return logError('leave beacon', err);
      log(user.name, 'left beacon', id);
      emit(host, 'removeGuest', {'id':id, 'guest':user.id });  
    }); 
  } catch (e) {
    logError('leaveBeacon', e);
  }
  // try {
  //   var host  = data.host,
  //       id    = data.id,
  //       guest = getUser(socket);
  //   beacons.del_guest( id, guest.id, function(err) {
  //     if (err) logError(err);
  //     beacons.get(host, function(err1, b){
  //       if (err1) return error(err1);
  //       if (false) {
  //         emitPublic('removeGuest', {'id': id, 'guest': guest.id});  
  //       } else {
  //         log(guest.name, 'left', host);
  //         emit(host, 'removeGuest', {'id': id, 'guest': guest.id}); 
  //         // emit(host, 'newBeacon', {'beacon': b});  
  //       }
  //     });
  //   });
  // } catch (e) {
  //   logError('leaveBeacon', e);
  // }
}

/**
 * Handle newBeacon socket
 * @param {Object} B - the beacon object
 * @param {Object} Socket - contains user user socket
 * @param {Object} Beacons - object for managing all beacons
 */
module.exports.newBeacon = function (B, socket) {
  try {
    var user = getUser(socket);
    beacons.getNextId(function(err1, id){
      if (err1) return logError(err1, B);
      B.id = id;
      B.pub = false;
      beacons.insert(B, function(err2) {
        if (err2) return logError(err2, B);
        if (B.pub) io.sockets.emit('newBeacon', {"beacon" : B});
        else emit(B.host, 'newBeacon', {"beacon" : B});
        log('New beacon by', user.name);
      });
    }); 
  } catch (e) {
    logError('newBeacon', e);
  }
}

module.exports.newComment = function(data, socket) {
  try {
    var BID = data.id,
        host = data.host,
        comment = data.comment.comment,
        poster = data.comment.user;

      beacons.addComment(BID, poster, comment, function(err) {  
        emit(data.host, 'newComment', data);
        log('new comment', data); 
    });
  } catch (e) {
    logError('newComment', e);
  }
}

module.exports.moveBeacon = function(data, socket) {
  try {
    var id = data.id;
    var lat = data.lat;
    var lng = data.lng; 
    if(!id || !lat || !lng) logError('Invalid move beacon call', data);
    beacons.moveBeacon(id, lat, lng);
  } catch (e) {
    logError('moveBeacon', e);
  }
}

module.exports.changeGroup = function(data, socket) {
  try {
    var self = this;
    var user = getUser(socket);
  } catch (e) {
    logError('changeGroup', e);
  }

}


/**
 * Handle a new user login in
 * @param {Number} id - the users id
 * @param {Object} Socket - contains user user socket
 * @param {Object} Beacons - object for managing all beacons
 */
function newUser (id, socket) {
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
function existingUser(id, friends, socket) {
  var user = getUser(socket);
  log(user.name, "has logged in.");
  socket.join(''+id);
  friends.forEach(function(friend) {
    socket.join(''+friend);
  });
  // console.log('existing user', id, 'has', friends.length,'friends');
  beacons.getVisible(friends, id, function(err, allBeacons) {
    if (err) {
      logError('getVisible Err:', err);
    } else {
      // console.log('all beacons', allBeacons);

      socket.emit('newBeacons', allBeacons);
      
      
    }
  });
}

function getUser(socket) {
  return socket.handshake.user;
}

/**
 * Emit from a certain person
 * @param {Number} userId
 * @param {String} eventName
 * @param {Object} Data
 */
function emit(userId, eventName, data) {
  // console.log('PUSHING DATA',userId, eventName+':',data, 'to', io.sockets.clients(userId).length);
  io.sockets.in(''+userId).emit(eventName, data);
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
