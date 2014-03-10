'use strict';
var
  io,
  events   = require('./Events.js'),
  utils     = require('./utilities.js'),
  logError  = utils.logError,
  log       = utils.log,
  debug     = utils.debug,
  fb        = require('./fb.js'),
  users     = require('./users.js'),
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

  socket.join(''+user.uid);
  socket.emit('myInfo', user);
  events.isInvitedTo(user.uid, function(err, eventList) {
    if (err) return logError('getEvents:', err);
    var str = user.name+' has connected. uid:'+user.uid+'\n\t\t';
    str += eventList.length + ' visible events.'
    log(str);
    check.is(eventList, '[event]');
    emit({
      eventName: 'eventList',
      data: {'eventList': eventList},
      recipients: [user]
    });
  });
  return;
}

/**
 * Handle newBeacon socket
 * @param {Object} B - the beacon object
 * @param {Object} Socket - contains user user socket
 * @param {Object} events - object for managing all events
 */
exports.newEvent = function (newEvent, socket) {
  log('New beacon by', getUserSession(socket).name+'\n\t\t',newEvent.message.text);
  // log(newEvent);
  // New event is a event without an event id (eid)
  check.is(newEvent, 'newEvent');
  var self = this,
      user = getUserSession(socket);

  newEvent.host = user.uid;
  newEvent.guestList = [user.uid];
  newEvent.inviteList = [user];
  newEvent.messageList = [newEvent.message];

  events.add(newEvent, function(err, eid) {
    if (err) return logError(err);
    newEvent.eid = eid;
    check.is(newEvent, 'event');
    emit({
      eventName: 'newEvent',
      data: {'event' : newEvent},
      // message: message,
      recipients: newEvent.inviteList
    });
  });
}

/**
 * Handle joinBeacon socket
 * @param {Object} Data - contains .id and .admin
 */
exports.joinEvent = function(data, socket) {
  check.is(data, {
    eid : 'posInt'
  });
  var user = getUserSession(socket);
  var eid = data.eid;
  var uid = user.uid;

  async.parallel({
    add     : function(cb){ events.addGuest( eid, uid, cb) },
    attends : function(cb){ events.getInviteList(uid, cb) }
  },
  function (err, results) {
    if (err) return logError(err);
    var data =     {'eid':eid,'uid':uid };
    check.is(data, {'eid':'posInt', 'uid':'posInt' } );
    emit({
      eventName : 'addGuest',
      data      : data,
      message   : null, //send no sms/push
      recipients: results.attends
    });
    log(user.name, 'joined event', uid);
  });
}

/**
 * Handle leaveBeacon socket
 * @param {Object} data - contains .host and .guest
 * @param {Object} Socket - contains user user socket
 * @param {Object} events - object for managing all events
 */
exports.leaveEvent = function(data, socket) {

  check.is(data, {eid: 'posInt'});
  var user = getUserSession(socket);
  var eid = data.eid;
  var uid = user.uid;

  async.parallel({
    delGuest:   function(cb){ events.removeGuest( eid, uid, cb) },
    recipients: function(cb){ events.getInviteList(eid, cb) }
  },
  function (err, results) {
    var data = {'uid':uid, 'eid':eid };
    check.is(data, {'uid':'posInt', 'eid':'posInt' });
    emit({
      eventName: 'removeGuest',
      data: data,
      recipients: results.recipients
    });
    if (err) return logError('leave beacon', err);
    log(user.name, 'left beacon', uid);
  });
}

exports.newMessage = function(data, socket) {
  check.is(data, {message: 'newMessage'});
  var user = getUserSession(socket),
      msg = data.message;

  async.parallel({
    add        : function(cb) {
      events.addMessage(msg, cb);
    },
    recipients : function(cb) {
      events.getInviteList(msg.eid, cb);
    }
  },
  function(err, results) {
    log(results);
    // add will generate the messages mid.
    check.is(results, {add: 'posInt', recipients: '[user]'});
    msg.mid = results.add;
    check.is(data, {message:'message'});
    emit({
      eventName: 'newMessage',
      data: data,
      recipients: results.recipients
    });
    log('new message', data);
  });
}

exports.newUserLocation = function(dataIn, socket) {
  check.is(dataIn, {uid: 'posInt', latlng: 'latlng'});
  var user = getUserSession(socket);

  async.parallel({
    a: function(cb){
      users.updateLocation(dataIn.uid, dataIn.latlng, cb)
    },
    recipients: function(cb) {
      events.getInviteList(dataIn.eid, cb);
    }
  },
  function(err, results) {
    check.is(results, {recipients: '[user]'});
    var dataOut = [{uid: user.uid, latlng: data.latlng}];
    emit({
      eventName: 'newUserLocationList',
      data: dataOut,
      recipients: results.recipients
    });
  });
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

exports.getFBFriendList = function(socket) {
  var user = getUserSession(socket);
  var idArr = [];
  fb.get(user.accessToken, '/me/friends', function(err, friends) {
    err = err || friends.error;
    if (err) return logError('from facebook.get:', err);
    if (!friends.data) return logError('no friends data')
    friends = friends.data.map(function(fbuser){return fbuser.id});
    async.map(friends, users.get, function(err, friendsList) {
      if (err) {
        logError(err);
      } else {
        socket.emit('friendList', friendsList);
      }
    })
  });
}

exports.getFriendList = function(socket) {
  var user = getUserSession(socket);
  users.getFriendIdList(user, function(err, friendIdList) {
    if (err) return logError(err);
    async.map(friendIdList, users.get, function(err, friendsList) {
      if (err) {
        logError(err);
      } else {
        socket.emit('friendList', friendsList);
      }
    });
  });
}

exports.newFriend = function(data, socket) {
  var user = getUserSession(socket);
  if (data.fbId) {
    users.addFriend(user, data.fbId, function(err){if(err)logError(err)});
  } else if(data.pn) {
    console.log('Adding phone numbers coming soon!');
    return;
    users.getOrAddFromPn(data.pn, data.name || data.pn, function(friend) {
      users.addFriend(user, friend.fbId, function(err){if(err)logError(err)});
    });
  } else {
    logError('invalid newFriend data', data);
  }
}

exports.disconnect = function(socket) {
  var self = this, user = getUserSession(socket)
  log(user.name, "has disconnected.")
}

exports.benchMark = function(socket) {
  // console.log('test');
  var start = new Date().getTime();
  var store = require('./redisStore.js');
  store.incr('foo', 1, function(err, x){
    store.get('foo', function(err2, y){
      socket.emit('benchMark', {"creationTime":1392785614748,"inviteList":[{"uid":1,"fbid":1380180579,"pn":"","name":"Joel Simon","hasApp":"","accessToken":"CAAClyP2DrA0BAHuZAgZCpZBvZCSRoPn2nsZAA5CN8pyKsXqBenB59Od219yypJJ9HJoShoeTyNdPgbOjiFffpsEfZBCvuT3ZBbzhMsGvjI2WfmhOnMQllRD1ZBUoC8GQoILC4WelThIoidHotRrNOHRUJcjYZCF8VVBYATZAdXA2lQTiHiS63khbUb","logged_in":true}],"invitePnList":[],"message":{"mid":2,"eid":2,"uid":1,"text":"Description!","creationTime":1392785614748,"marker":null,"deletePastMarker":0},"host":1,"guestList":[1],"eid":2});
      var end = (new Date().getTime()) - start;
    });
  });

}

// exports.test = function(socket) {
//   var user = getUserSession(socket);
// }

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



// for (var func in exports) {
//   console.log(func, typeof exports[func]);
//   var newFun = function() {
//     var old = exports[func];
//     log('here')
//     var start = new Date().getTime();
//     // try{
//     old.apply(null, arguments);
//     // }catch(e){
//     //   logError(e)
//     // }
//     var time = (new Date().getTime()) - start;
//     log(func+' in ' + time);
//   }
//   exports[''+func] = newFun;
// }
/**
 * Handle deleteBeacon socket
 * @param {Object} Data - contains .host, .pub
 * @param {Object} Socket - contains user user socket
 * @param {Object} events - object for managing all events
 */
// exports.deleteEvent = function(data, socket) {
//   // try {
//   //   check.is(data, { eid : 'posInt' });
//   //   var user = getUserSession(socket);

//   //   async.parallel({
//   //     delete  : function(cb){ events.remove( bId, hostId , cb) },
//   //     recipients : function(cb){ events.getInviteList(bId, cb) },
//   //     delVis  : function(cb){ users.deleteVisible(hostId, bId, cb) }
//   //   }, done);

//   //   function done(err, results) {
//   //     if (err) return logError(err);
//   //     var recipients = results.recipients;
//   //     async.each(recipients, function(friend, callback) {
//   //         users.deleteVisible(friend.id, bId, callback);
//   //     });
//   //     emit({
//   //       host      : hostId,
//   //       eventName : 'deleteBeacon',
//   //       data      : {id:bId, host:hostId},
//   //       message   : null,
//   //       recipients: recipients
//   //     });
//   //     log(user.name,'deleted beacon', bId);
//   //   }
//   // } catch(e) {
//   //   logError('deleteEvent', e);
//   // }
// }
