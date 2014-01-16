var 
  io, 
  beacons   = require('./beaconKeeper.js'),
  utils     = require('./utilities.js'),
  logError  = utils.logError,
  log       = utils.log,
  debug     = utils.debug,
  fb        = require('./fb.js'),
  users     = require('./users.js'),
  async = require('async'),
  output = require('./output.js'),
  emit = output.emit;
  module.exports = exports;

/**
 * Handle login socket
 * @param {Object} Data - contains .id and .admin
 * @param {Object} Socket - contains user user socket
 * @param {Object} Beacons - object for managing all beacons
 */
exports.login = function(socket) {
  var user = getUser(socket);
  var friends = [];
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
  if(!io) io = require('../../app.js').io;
  log(user.name, "has connected.");
  socket.join(''+user.id);
  socket.emit('userData', userData);
  // console.log('existing user', id, 'has', friends.length,'friends');
  users.getVisible(user.id, function(err, beaconIds) {
    if (err) return logError('getVisible Err:', err);
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
exports.joinBeacon = function(data, socket) {
  try {
    var user = getUser(socket);
    var id = data.id;
    var host = data.host;
    var options;
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
exports.deleteBeacon = function(data, socket) {

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
  // } catch (e) {
  //   logError('deleteBeacon', e);
  // }
}

/**
 * Handle leaveBeacon socket
 * @param {Object} data - contains .host and .guest
 * @param {Object} Socket - contains user user socket
 * @param {Object} Beacons - object for managing all beacons
 */
exports.leaveBeacon = function(data, socket) {
  var user = getUser(socket);
  var id = data.id;
  var host = data.host;

  beacons.del_guest( id, user.id, function(err) {
    if (err) return logError('leave beacon', err);
    log(user.name, 'left beacon', id);
    emit(host, 'removeGuest', {'id':id, 'guest':user.id });  
  }); 
}

/**
 * Handle newBeacon socket
 * @param {Object} B - the beacon object
 * @param {Object} Socket - contains user user socket
 * @param {Object} Beacons - object for managing all beacons
 */
exports.newBeacon = function (B, socket) {
  var user = getUser(socket);
  var self = this;
  var message = user.name+':'+B.comments[0].comment+'\n'+"Reply 'y' if you can make it and 'n' otherwise.";
  // console.log(B);
  beacons.getNextId(function(err1, id) {
    if (err1) return logError(err1, B);
    B.id = id;
    B.pub = false;
    B.host = +B.host;

    beacons.insert(B, function(err2) {
      if (err2) return logError(err2, B);  
      emit(B.host, 'newBeacon', {"beacon" : B}, message);
      users.getUser(user.id, function(err3, userData) {
        if (err3) return logError(err3);
        users.addVisible(user.id, id, function(){});
        async.each(userData.group, function(friend, callback) {
          users.addVisible(friend.id, id, callback);
        });
      });
      log('New beacon by', user.name);
    });
  }); 

}

exports.newComment = function(data, socket) {
  try {
    var 
      BID = data.id,
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

exports.updateGroup = function(data, socket) {
  // try {
    var self = this;
    var user = getUser(socket);
    var group = data;
    if (!group) return logError('invalid change group', data);
    log(user.name, 'changed their group.');
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

exports.updateBeacon = function(data, socket) {
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

exports.getFriendsList = function(socket) {
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

exports.disconnect = function(socket) {
  var self = this, user = getUser(socket)
  log(user.name, "has disconnected.")
}



function getUser(socket) {
  if (!socket || !socket.handshake) return null;
  return socket.handshake.user || null;
}
