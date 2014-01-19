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
  log('newUser', user.name);
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
      log('visible beacons:',beaconIds);
      socket.emit('newBeacons', bArr);   
    });    
  });
}
/**
 * Handle joinBeacon socket
 * @param {Object} Data - contains .id and .admin
 */
exports.joinBeacon = function(data, socket) {

  var user = getUser(socket);
  var id = data.id;
  var host = data.host;

  async.parallel({
    add     : function(cb){ beacons.add_guest( id, user.id, cb) },
    attends : function(cb){ beacons.getInvited(id, cb) }
  }, done);

  function done(err, results) {
    if (err) return logError('join beacon', err);
    log(user.name, 'joined beacon', id);
    emit({
      host      : host,
      eventName : 'addGuest',
      data      : {'id':id, 'guest':user.id },
      message   : null, //send no sms/push
      recipients: results.attends
    });
  }
}

/**
 * Handle deleteBeacon socket
 * @param {Object} Data - contains .host, .pub
 * @param {Object} Socket - contains user user socket
 * @param {Object} Beacons - object for managing all beacons
 */
exports.deleteBeacon = function(data, socket) {
    var
        user = getUser(socket),
        hostId = data.host,
        bId = data.id;
    if (!hostId || !bId) return logError("invalid delete call", data);
    async.parallel({
      delete  : function(cb){ beacons.remove( bId, hostId , cb) },
      recipients : function(cb){ beacons.getInvited(bId, cb) },
      delVis  : function(cb){ users.deleteVisible(hostId, bId, cb) }
    }, done);

  function done(err, results) {
    if (err) return logError(err);
    var recipients = results.recipients;
    async.each(recipients, function(friend, callback) {
        users.deleteVisible(friend.id, bId, callback);
    });
    emit({
      host      : hostId,
      eventName : 'deleteBeacon',
      data      : {id:bId, host:hostId},
      message   : null,
      recipients: recipients
    });
    log(user.name,'deleted beacon', bId);
  }
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

  async.parallel({
    delGuest: function(cb){ beacons.del_guest( id, user.id, cb) },
    recipients: function(cb){ beacons.getInvited(id, cb) }
  }, done);

  function done(err, results) {
    emit({
      host: host,
      eventName: 'removeGuest',
      data: {'id':id, 'guest':user.id },
      message: null,
      recipients: results.recipients
    });  
    if (err) return logError('leave beacon', err);
    log(user.name, 'left beacon', id);
  } 
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
  B.pub = false;
  B.host = +B.host;
  var message = user.name+':'+B.comments[0].comment+'\n'+"Reply 'y' if you can make it and 'n' otherwise.";

  async.parallel({
    bId: function(cb){ beacons.getNextId(cb)},
    recipients: function(cb) {
      if (B.invited) return cb(null, B.invited)
      users.getUser(user.id, function(err, userData) {
        cb(err, err ? null : userData.group);
      });
    }
  },
  function(err, data) {
      if (err) return logError(err, B);
      withIdAndRecipients(data.bId, data.recipients);
  });

  function withIdAndRecipients(bId, recipients) {
    B.invited = recipients;
    B.id = bId;

    async.parallel({
      insert  : function(cb) {
        beacons.insert(B, cb)
      },
      addVisSelf: function(cb) { users.addVisible(user.id, bId, cb) },
      addVisible: function(cb) {
        function add(friend, cb2) {
          users.addVisible(friend.id, bId, function(err){
            if (err) cb2(err);
            else cb2 (null);
            
          });
        }
        async.each(B.invited, add, cb);
      }   
    }, done);
  }
  function done (err, results) {
    emit({
      host: B.host,
      eventName: 'newBeacon',
      data: {"beacon" : B},
      message: message,
      recipients: B.invited
    });
    log('New beacon by', user.name);
  }
}

// async.parallel({
//   a: function(cb){ },
//   b: function(cb) {}
//   }
// },
// function(err, data) {
// });
exports.newComment = function(data, socket) {

  var 
    bId = data.id,
    host = data.host,
    comment = data.comment.comment,
    poster = data.comment.user;

  async.parallel({
    add        : function(cb){ beacons.addComment(bId, poster, comment, cb) },
    recipients : function(cb){ beacons.getInvited(bId, cb)                  }
  },
  function(err, results) {
    data.comment = results.add;
    emit({
      host: host,
      eventName: 'newComment',
      data: data,
      message: null,
      recipients: results.recipients
    });
    log('new comment', data); 
  });
}

exports.updateGroup = function(data, socket) {
  // try {
    var self = this;
    var user = getUser(socket);
    var group = data;
    if (!group) return logError('invalid change group', data);
    log(user.name, 'changed their group.', group);
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
  async.parallel({
    update     : function(cb){ beacons.updateFields(data, cb) },
    recipients : function(cb){ beacons.getInvited(bId, cb)    }
  }, 
  function(err, results) {
    if (err) return logError(err);
    log(user.name, 'updated beacon', data.id);
    emit({
      host : data.host,
      eventName : 'updateBeacon',
      data : data,
      message : null,
      recipients : results.recipients
    });
  });
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
