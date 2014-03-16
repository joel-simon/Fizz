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
  types = require('./fizzTypes.js'),
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

  async.parallel({
    eventList:function(cb) { events.canSee(user.uid, cb) },
    friendList:function(cb){ users.getFriendUserList(user.uid, cb) }

  },
  function(err, results){
    if (err) return logError(err);
    var str = user.name+' has connected. uid:'+user.uid+'\n\t\t';
    str += results.eventList.length + ' visible events.'
    log(str);

    check.is(results.eventList, '[event]');
    emit({
      eventName: 'onLogin',
      data: {
        eventList: results.eventList,
        me:   user,
        friendList:results.friendList
      },
      recipients: [user]
    });

  });
}

/**
 * Handle newBeacon socket
 * @param {Object} B - the beacon object
 * @param {Object} Socket - contains user user socket
 * @param {Object} events - object for managing all events
 */
exports.newEvent = function (e, socket) {
  check.is(e, 'newEvent');
  var user          = getUserSession(socket),
      inviteOnly    = e.inviteOnly,
      text       = e.text,
      inviteOnly = e.inviteOnly;

  var newE = {
    eid: 0,
    creator: user.uid,
    guestList: [user.uid],
    inviteList: [user],
    seats: 2,
    inviteOnly: inviteOnly,
    messageList: [{uid:user.uid, text:text}]
  };
  // if (inviteOnly) {
     events.add(newE, user, function(err, eid) {
      if(err)return logError(err);
      check.is(newE, 'event');
      emit({
        eventName: 'newEvent',
        data: {'event' : newE},
        recipients: newE.inviteList,
        message: user.name+'has invited you to an event.\n'+text+
        '\n More info @ '+'fakeUrl@extraFizzy.com'
      });
      log('New fizzlevent by', user.name+'\n\t\t',text);
    }); 

  // } else {
  //   getFriendUserList(user.uid, function(err, fizzFriends){
  //     newE.
  //   });
  // }
}

/**
 * Handle joinBeacon socket
 * @param {Object} Data - contains .id and .admin
 */
exports.joinEvent = function(data, socket) {
  check.is(data, { eid : 'posInt' });
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

exports.invite = function(data, socket) {
  check.is(data, {
    eid: 'posInt',
    inviteList: '[user]',
    invitePnList: '[string]'
  });
  var eid=data.eid,
      inviteList=data.inviteList,
      invitePnList=data.invitePnList;

  users.getOrAddPhoneList(invitePnList, function(err, newUsers) {
    if (err) return logError(err);
    inviteList = inviteList.concat(newUsers)
    events.addInvitees(eid, inviteList, function(err) {
      emit({
        eventName: 'newEvent',
        data: {'event' : newE},
        recipients: inviteList,
        message: user.name+'has invited you to an event.\n'+message.text+
        '\n More info @ '+'fakeUrl@extraFizzy.com'
      });
    });
  });
}

exports.request = function(data, socket) {
  check.is(data, {eid: 'posInt'});
}

exports.newMessage = function(data, socket) {
  check.is(data, {eid: 'posInt', text:'string'});
  var user = getUserSession(socket),
      eid  = data.eid,
      text = data.text;

  async.parallel({
    add        : function(cb) {
      events.addMessage(eid, user.uid, text, cb);
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

exports.getFriendList = function(socket) {
  var user = getUserSession(socket);
  users.getFriendUserList(user.uid, function(err, userList){
    if (err) return logError(err);
    socket.emit('friendList', userList);
  });
}

exports.addFriendList = function(data, socket) {
  var user = getUserSession(socket);
  check.is(data, { uid: 'posInt' });
  users.addFriend(user, data.uid, function(err){if(err)logError(err)});
}

exports.removeFriendList = function(data, socket)  {
  var user = getUserSession(socket);
  check.is(data, {'friendList': '[user]' });
  async.each(data.friendList,
  function(f, cb){
    users.removeFriend(user, f.uid, cb);
  },
  function(err){
    if(err)logError(err);
  });
}

exports.setSeatCapacity = function(data, socket) {
  var user = getUserSession(socket);
  check.is(data, {eid: 'posInt', seats: 'posInt'});
  events.setSeatCapacity(eid, seats, function(err) {
    if(err)logError(err);
  });
}



// exports.newUserLocation = function(dataIn, socket) {
//   check.is(dataIn, {uid: 'posInt', latlng: 'latlng'});
//   var user = getUserSession(socket);

//   async.parallel({
//     a: function(cb){
//       users.updateLocation(dataIn.uid, dataIn.latlng, cb)
//     },
//     recipients: function(cb) {
//       events.getInviteList(dataIn.eid, cb);
//     }
//   },
//   function(err, results) {
//     check.is(results, {recipients: '[user]'});
//     var dataOut = [{uid: user.uid, latlng: data.latlng}];
//     emit({
//       eventName: 'newUserLocationList',
//       data: dataOut,
//       recipients: results.recipients
//     });
//   });
// }

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
  fb.get(user.fbToken, '/me/friends', function(err, friends) {
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

exports.disconnect = function(socket) {
  var self = this, user = getUserSession(socket)
  log(user.name, "has disconnected.")
}

function getUserSession(socket) {
  var user = socket.handshake.user;
  check.is(user, 'user');
  return user;
}

// function newUser(user, socket) {
//   log('newUser', user.name);
//   var idArr = [];
//   var userData;
//   fb.get(user.token, '/me/friends', function(err, res) {
//     if (err) return logError('from facebook.get', err);
//     userData = { friends:res.data, 'group':[] };
//     users.addUser(user.id, userData, function(err2, doc) {
//       if (err2) return logError(err2);
//       existingUser(user, userData, socket);
//     });
//   });
// }

