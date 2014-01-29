'use strict';
var 
  io, 
  events   = require('./Events.js'),
  utils     = require('./utilities.js'),
  logError  = utils.logError,
  log       = utils.log,
  debug     = utils.debug,
  fb        = require('./fb.js'),
  users     = require('./Users.js'),
  async     = require('async'),
  output    = require('./output.js'),
  emit      = output.emit,
  exports = module.exports,
  types = require('./beaconTypes.js'),
  check = require('easy-types').addTypes(types);



  
/**
 * Handle login socket
 * @param {Object} Data - contains .id and .admin
 * @param {Object} Socket - contains user user socket
 * @param {Object} events - object for managing all events
 */
exports.login = function(socket) {
  var user = getUserSession(socket);
  console.log(user.name, 'has connected.');
  socket.join(''+user.uid);
  socket.emit('myInfo', user);
  events.isInvitedTo(user.uid, function(err, eventList) {
    if (err) return logError('getEvents:', err);
    log('eventList',eventList);
    check.is(eventList, '[event]');
    
    socket.emit('eventList', {'eventList': eventList});
  });
  return;
  setTimeout(function(){
    var me = {
      uid:1,
      fbid:100007033064024,
      pn:'',
      name:"Joel Simon",
      "hasApp":''
    }
    var event = {
      eid : 1,
      host : 1,
      guestList : [1],
      inviteList : [me],
      message : null
    }
    exports.newEvent(event, socket);
  }, 1000)
}

// function existingUser(user, userData, socket) {
//   if(!io) io = require('../../app.js').io;
//   log(user.name, "has connected.");
  
  
//   // console.log('existing user', id, 'has', friends.length,'friends');
//   users.getVisible(user.id, function(err, beaconIds) {
//     if (err) return logError('getVisible Err:', err);
//     async.map(beaconIds, events.get, function(err2, bArr) {
//       if (err2) return logError(err2);
//       log('visible events:',beaconIds);
//       socket.emit('newevents', bArr);   
//     });    
//   });
// }



/**
 * Handle newBeacon socket
 * @param {Object} B - the beacon object
 * @param {Object} Socket - contains user user socket
 * @param {Object} events - object for managing all events
 */
exports.newEvent = function (newEvent, socket) {
  // try {
    // New event is a event without an event id (eid)
    check.is(newEvent, 'newEvent');
    var self = this,
        user = getUserSession(socket);
    log('New beacon by', getUserSession(socket).name);
    events.add(newEvent, function(err, event){
      if (err) return logError(err);
      emit({
        eventName: 'newEvent',
        data: {'event' : event},
        // message: message,
        recipients: event.inviteList
      });
      // event contains new eid.
    });

  // } catch(e) {
  //   logError('newEvent:', e);
  // }
}

/**
 * Handle joinBeacon socket
 * @param {Object} Data - contains .id and .admin
 */
exports.joinEvent = function(data, socket) {
  try {
    check.is(data, {
      eid : 'posInt',
      uid : 'posInt'
    });
    var user = getUserSession(socket);

    async.parallel({
      add     : function(cb){ events.addGuest( data.eid, user.id, cb) },
      attends : function(cb){ events.getInvited(id, cb) }
    }, 
    function (err, results) {
      if (err) return logError('join beacon', err);
      log(user.name, 'joined beacon', id);
      emit({
        eventName : 'addGuest',
        data      : {'id':id, 'guest':user.id },
        message   : null, //send no sms/push
        recipients: results.attends
      });
    });
  } catch(e) {
    logError('joinEvent', e);
  }
}
/**
 * Handle leaveBeacon socket
 * @param {Object} data - contains .host and .guest
 * @param {Object} Socket - contains user user socket
 * @param {Object} events - object for managing all events
 */
exports.leaveBeacon = function(data, socket) {
  try {
    check.is(data, {eid: 'posInt'});
    var user = getUserSession(socket);

    async.parallel({
      delGuest:   function(cb){ events.removeGuest( data.eid, user.uid, cb) },
      recipients: function(cb){ events.getInvited(data.eid, cb) }
    },
    function (err, results) {
      emit({
        eventName: 'removeGuest',
        data: {'uid':user.uid, 'eid':data.eid },
        recipients: results.recipients
      });  
      if (err) return logError('leave beacon', err);
      log(user.name, 'left beacon', id);
    });
  } catch (e) {
    logError('leave beacon', e);
  }
}


exports.newMessage = function(data, socket) {
  try {
    type.is(data.message, 'message');
    var user = getUserSession(socket),
        msg = data.message;

    async.parallel({
      add        : function(cb) { 
        events.addMessage(msg, cb);
      },
      recipients : function(cb) {
        events.getInvited(msg.eid, cb);
      }
    },
    function(err, results) {
      // add will generate the messages ID. 
      type.is(results, {add: 'posInt', recipients: '[user]'});
      msg.mid = results.add;
      emit({
        eventName: 'newMessage',
        data: data,
        recipients: results.recipients
      });
      log('new comment', data); 
    });
  } catch(e){

  }
}
exports.newUserLocation = function(data, socket) {
  try {
    type.is(data, {uid: 'posInt', latlng: 'latlng'});
    var user = getUserSession(socket);
    async.parallel({
      a: function(cb){
        users.updateLocation(data.uid, data.latlng, cb)
      },
      recipients : function(cb) {
        events.getInvited(data.eid, cb);
      }
    },
    function(err, results) {
      type.is(results, {recipients: '[user]'});
      emit({
        eventName: 'newUserLocationList',
        'data': [{uid: user.uid, latlng: data.latlng}],
        recipients: results.recipients
      });
    });
    
  } catch(e) {
    logError('newEvent', e);
  }
}

function getEidAndRecipients (e, callback) {
  async.parallel({
    eid: function(cb){ 
      events.getNextId(cb)
    },
    recipients: function(cb) {
      if (e.inviteList.length) return cb(null, e.inviteList)
      users.getFriendsList(user, function(err, friendsList) {
        cb(err, err ? null : friendsList);
      });
    }
  },
  callback);
}
function shareEvent(e, callback) {
  async.parallel([
    function(cb) { users.addVisible(e.host, e, cb) },
    function(cb) { 
      async.each(e.inviteList, add, cb);
      function add(friend, cb2) {
        users.addVisible(friend, e, function(err) {
          if (err) cb2(err);
          else cb2 (null);   
        });
      }
    },
    function(cb) {
      emit({
        host: B.host,
        eventName: 'newBeacon',
        data: {"beacon" : B},
        message: message,
        recipients: B.invited
      });
      cb(null);
    }   
  ],
  callback);
}


// async.parallel({
//   a: function(cb){ },
//   b: function(cb) {}
//   }
// },
// function(err, data) {
// });

exports.getFriendsList = function(socket) {
  var user = getUserSession(socket);
  var idArr = [];
  fb.get(user.token, '/me/friends', function(err, friends) {
    if (err) return logError('from facebook.get:', err);
    friends = friends.map(function(fbuser){return fbuser.id});
    async.map(friends, Users.get, function(err, friendsList) {
      if (err) {
        logError(err);
      } else {
        socket.emit('friendsList', friendsList);
      }
    })
  });
}

exports.disconnect = function(socket) {
  var self = this, user = getUserSession(socket)
  log(user.name, "has disconnected.")
}


function newUser(user, socket) {
  log('newUser', user.name);
  var idArr = [];
  var userData;
  fb.get(user.token, '/me/friends', function(err, res) {
    if (err) return logError('from facebook.get', err);
    userData = { friends:res.data, 'group':[] };
    users.addUser(user.id, userData, function(err2, doc) {
      if (err2) return logError(err2);
      existingUser(user, userData, socket);
    });
  });
}



function getUserSession(socket) {
  var user = socket.handshake.user;
  check.is(user, 'user');
  return user;
}

/**
 * Handle deleteBeacon socket
 * @param {Object} Data - contains .host, .pub
 * @param {Object} Socket - contains user user socket
 * @param {Object} events - object for managing all events
 */
exports.deleteEvent = function(data, socket) {
  // try {
  //   check.is(data, { eid : 'posInt' });
  //   var user = getUserSession(socket);
    
  //   async.parallel({
  //     delete  : function(cb){ events.remove( bId, hostId , cb) },
  //     recipients : function(cb){ events.getInvited(bId, cb) },
  //     delVis  : function(cb){ users.deleteVisible(hostId, bId, cb) }
  //   }, done);

  //   function done(err, results) {
  //     if (err) return logError(err);
  //     var recipients = results.recipients;
  //     async.each(recipients, function(friend, callback) {
  //         users.deleteVisible(friend.id, bId, callback);
  //     });
  //     emit({
  //       host      : hostId,
  //       eventName : 'deleteBeacon',
  //       data      : {id:bId, host:hostId},
  //       message   : null,
  //       recipients: recipients
  //     });
  //     log(user.name,'deleted beacon', bId);
  //   }
  // } catch(e) {
  //   logError('deleteEvent', e);
  // }
}
