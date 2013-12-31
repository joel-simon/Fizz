var io, 
    beacons   = require('./beaconKeeper.js'),
    utils     = require('./utilities.js'),
    logError  = utils.logError,
    log       = utils.log,
    debug     = utils.debug,
    fb        = require('./fb.js'),
    users     = require('./users.js'),
    async = require('async');

// var applePush = require('./applePush.js');

module.exports.set = function(sio, b, u) {
  io = sio;
  // users = u;
  return module.exports;
}

/**
 * Handle login socket
 * @param {Object} Data - contains .id and .admin
 * @param {Object} Socket - contains user user socket
 * @param {Object} Beacons - object for managing all beacons
 */
module.exports.login = function(socket) {
  var user = getUser(socket);
  var friends = [];
  users.incConnections(user.id, function(err, conn) {
    if (err) logError(err);
    else log(conn)
  });
  users.getUser(user.id, function(err, userData) {
    if (err) logError(err);
    else if (!userData || !userData.friends) newUser(user, socket);
    else existingUser(user, userData, socket);
  });
}

function newUser(user, socket) {
  console.log('newUser', user.name);
  var idArr = [];
  var userData;
  fb.get(user.token, '/me/friends', function(err, res) {
    if (err) return logError('from facebook.get', err);
    // for (var i = 0; i < friends.data.length; i++) {
    //   idArr.push(friends.data[i].id)
    // };
    userData = { friends:res.data, 'group':[] };
    users.addUser(user.id, userData, function(err2, doc) {
      if (err2) return logError(err2);
      existingUser(user, userData, socket);
    });
   });
}
function existingUser(user, userData, socket) {
  // console.log(userData)
  log(user.name, "has logged in.");
  socket.join(''+user.id);
  socket.emit('userData', userData);
  // console.log('existing user', id, 'has', friends.length,'friends');
  users.getVisible(user.id, function(err, beaconIds) {
    if (err) return logError('getVisible Err:', err);
    console.log(beaconIds);
    async.map(beaconIds, beacons.get, function(err2, bArr) {
      if (err2) return logError(err2);
      // console.log('visible beacons:',bArr);
      socket.emit('newBeacons', bArr);   
    });    
  });
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
    emit(host, 'deleteBeacon', {id:id, host:host});
    users.getUser(host, function(err3, userData) {
        if (err3) return logError(err3);
        users.deleteVisible(host, id, function(){});
        async.each(userData.group, function(friendId, callback) {
          users.deleteVisible(friendId, id, callback);
        });
      });
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

  var user = getUser(socket);
  var self = this;
  beacons.getNextId(function(err1, id) {
    if (err1) return logError(err1, B);
    B.id = id;
    B.pub = false;
    B.host = +B.host;
    beacons.insert(B, function(err2) {
      if (err2) return logError(err2, B);
      
      emit(B.host, 'newBeacon', {"beacon" : B});
      users.getUser(user.id, function(err3, userData) {
        if (err3) return logError(err3);
        users.addVisible(user.id, id, function(){});
        async.each(userData.group, function(friendId, callback) {
          users.addVisible(friendId, id, callback);
        });
      });
      log('New beacon by', user.name);
    });
  }); 

}

module.exports.newComment = function(data, socket) {
  try {
    var BID = data.id,
        host = data.host,
        comment = data.comment.comment,
        poster = data.comment.user;

      beacons.addComment(BID, poster, comment, function(err, commentWithId) { 
        data.comment = commentWithId;
        emit(data.host, 'newComment', data);
        log('new comment', data); 
    });
  } catch (e) {
    logError('newComment', e);
  }
}

module.exports.updateGroup = function(data, socket) {
  // try {
    var self = this;
    var user = getUser(socket);
    var group = data;
    if (!group) return logError('invalid change group', data);
    log(user.name, 'changed group to', group);
    // fb.get(user.token, '/me/friends', function(err, res) {
    //   if (err) return logError('from facebook.get()', err); 

      // if (!utils.isSubSet(group, friends)) {
      //   logError('adding a non fb friend');
      // } else {
        users.setGroup(user.id, group);
      // }
    // });
  // } catch (e) {
  //   logError('changeGroup', e);
  // }
}

module.exports.updateBeacon = function(data, socket) {
  var user = getUser(socket);
  if (!verify()) return logError('invalid updateBeacon', data);
  // try {
    
    beacons.updateFields(data, function(err){
      if (err) logError('updateBeacon..', err);
      else {
        log(user.name, 'updated beacon', data.id);
        emit(data.host, 'updateBeacon', data);
      }
    });
  // } catch (e) {
  //   logError('updateBeacon', e);
  // }
  function verify() {
    if (!data.host || !data.id) return false;
    if (data.location) {
      if (!data.location.lng || typeof data.location.lng !== 'number') return false;
      if (!data.location.lat || typeof data.location.lat !== 'number') return false;
    }
    if (data.title && typeof data.title !== 'string') return false;
    return true;
  }
}

module.exports.getFriendsList = function(socket) {
  var user = getUser(socket);
  var idArr = [];
  fb.get(user.token, '/me/friends', function(err, friends) {
    if (err) return logError('from facebook.get()', err); 
    // for (var i = 0; i < friends.length; i++) {
    //   idArr.push(friends[i].id);
    // }
    // socket.emit('friendsList', idArr);
    socket.emit('friendsList', friends);
  });
}

module.exports.disconnect = function(socket) {
  var self = this, user = getUser(socket);
  users.decConnections(user.id, function(err){
    if(err) logError(err);
  });
}
// module.exports.followBeacon = function(data, socket) {
//   var user = getUser(socket);
//   var id = data.id;
  
// }


function getUser(socket) {
  if (!socket || !socket.handshake) return null;
  return socket.handshake.user || null;
}

/**
 * Emit from a certain person
 * @param {Number} userId
 * @param {String} eventName
 * @param {Object} Data
 */
function emit(userId, eventName, data) {
  io.sockets.in(userId).emit(eventName, data);
  users.getUser(userId, function(err, userData) {
    if (err) return logError(err);
    if (!userData) return logError('no userData found');
    async.each(userData.group, function(id, callback){
      // users.isConnected(id, function(err, isCon) {
      //   if (isCon) {
          io.sockets.in(id).emit(eventName, data);
        // }
      // });
    });
  });
  // io.sockets.in(''+userId).emit(eventName, data);
  // io.sockets.in('admins').emit(eventName, data);
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
