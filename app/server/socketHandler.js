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
  pushIos   = output.pushIos,
  exports = module.exports,
  types = require('./fizzTypes.js'),
  check = require('easy-types').addTypes(types);
var nameShorten = utils.nameShorten;

/**
 * Handle a socket connection.
 */
exports.connect = function(socket) {
  console.log('connection success!');
  try {var user = getUserSession(socket);}
  catch(e) {
    console.log('Failure to get user:', e);
    return;
  }
  socket.join(''+user.uid);
  var andrew = {
    uid: 1,
    pn: '+13107102956',
    name: 'Andrew Sweet',
    appUserDetails: {
      fbid: '100000157939878'
    }
  }
  var joel = {
    uid: 2, 
    pn:'+13475346100',
    displayName: 'Joel Simon',
    appUserDetails: {
      fbid: '1380180579'
    }
  }
  var message0 = {
    mid: 1,
    eid: 1,
    uid: 1,
    text: 'Picnic?',
    marker: null,
    creationTime : (+new Date()) - 10000
  }
  var event1 = {
    eid : 1,
    creator : 1,
    guestList: [2],
    inviteList: [andrew, joel],
    messageList : message0,
    clusterList : [[1,2]]
  }
  var response = {
    me: user,
    newFriendList : [],
    newEventList: [event1],
    newMessageList: [],
    fbToken: 'FAKE_FB_TOKEN',
    friendScoreMap : {},
    clusters : {},
    guestList : {},
    newInvites : {}
  }
  socket.emit('onLogin', response);
  return;

  // async.parallel({
  //   eventList:function(cb) { events.canSee(user.uid, cb) },
  //   friendList:function(cb){ users.getFriendUserList(user.uid, cb) }
  // },
  // function(err, results) {    
  //   if (err) return logError(err);
  //   // var str1 = nameShorten(user.name)+' has connected.';
  //   // var str2 = results.eventList.length + ' visible events:'
  //   // str2 += JSON.stringify(results.eventList.map(function(e){return e.messageList[0].text}));
  //   // log(str1, 'uid:'+user.uid, str2);
  //   check.is(results.eventList, '[event]');
  //   emit({
  //     eventName: 'onLogin',
  //     data: {
  //       eventList: results.eventList,
  //       me:   user,
  //       friendList:results.friendList,
  //       fbToken: user.fbToken
  //     },
  //     recipients: [user]
  //   });

  // });
}

exports.onAuth = function(profile, pn, fbToken, iosToken, cb) {
  fb.extendToken(fbToken, function(err, longToken) {
    if (err) return cb(err);
    users.getOrAddMember(profile, longToken, pn, iosToken, function(err, user) {
      if(err) cb(err);
      else cb(null, user);
    });
  });
}
/**
 * Handle newBeacon socket
 * @param {Object} B - the beacon object
 * @param {Object} Socket - contains user user socket
 * @param {Object} events - object for managing all events
 */
exports.newEvent = function(data, socket) {
  console.log('newEvent data:', data);
  return;
  check.is(data, 'newEvent');
  
  var user       = getUserSession(socket),
      text       = data.text,
      inviteOnly = data.inviteOnly;
  log('New fizzlevent by'+nameShorten(user.name),'Msg:'+text);
  var ful;
  async.waterfall([
    function(cb) { users.getFriendUserList(user.uid, cb) },
    function(FUL, cb) { ful = FUL; events.add(text, user, FUL, inviteOnly, cb) }
  ],
  function(err, e) {
    if (err) return logError(err);
    check.is(e, 'event');

    if (inviteOnly) {
      emit({
        eventName:  'newEvent',
        data:       {'event' : e},
        recipients: e.inviteList
      });
     
    } else {
      users.getFizzFriendsUidsOf(ful, function(err, fof) {
        if(err) return logError(err);
        events.addVisibleList(Object.keys(fof), e.eid, function(err){
          if(err) return logError(err);
          emit({
            eventName:  'newEvent',
            data:       {'event' : e},
            recipients: e.inviteList,
          });
          pushIos({
            msg: nameShorten(user.name)+': '+e.messageList[0].text,
            userList: e.inviteList,
            eid: e.eid,
          });
        });
      });
    }
  });
}


exports.getEvents = function(data, socket) {
  console.log('getEvents data:', data);
  return;
}
/**
 * Handle joinBeacon socket
 * @param {Object} Data - contains .id and .admin
 */
exports.joinEvent = function(data, socket) {
  console.log('newEvent data:', data);
  check.is(data, {eid: 'posInt'});
  return;

  check.is(data, { eid : 'posInt' });
  var user = getUserSession(socket);
  var eid = data.eid;
  var uid = user.uid;

  async.parallel({
    invited : function(cb){ events.getInviteList(eid, cb) },
    seats   : function(cb){ events.getSeatCapacity(eid, cb) },
    guests  : function(cb){ events.getGuestList(eid, cb) } 
  },
  function (err, results) {
    if (err) return logError(err);
    // check.is(results, {'invited':'[user]', 'seats':'posInt', 'guests':'[posInt]'});
    if (results.guests.length < results.seats) {
      events.addGuest( eid, uid, function(err) {
        if (err) return logError(err);
        log(nameShorten(user.name)+' joined event '+uid);
        emit({
          eventName : 'addGuest',
          data      : { eid: eid, uid: uid },
          recipients: results.invited
        });
      });
    } else { 
      log(nameShorten(user.name)+' COULD NOT JOIN event '+uid);
      exports.newServerMessage({
        eid: eid,
        text: nameShorten(user.name)+' tried to join this event and there were not enough seats.'
      });
      if (user.type === 'Phone') {
        output.sendSms(user, eid, '*There were not enough seats*');
      }
    }

    
  });
}

/**
 * Handle leaveBeacon socket
 * @param {Object} data - contains .host and .guest
 * @param {Object} Socket - contains user user socket
 * @param {Object} events - object for managing all events
 */
exports.leaveEvent = function(data, socket) {
  log('leaveEventd data:', data);
  check.is(data, {eid: 'posInt'});
  return;

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
    if (err) return logError('leave event', err);
    log(nameShorten(user.name)+'left event '+uid);
  });
}

exports.newInvites = function(data, socket) {
  console.log('newInvites data:', data);
  return;

  check.is(data, {
    eid: 'posInt',
    inviteList: '[user]',
    invitePnList: 'array'
  });
  var eid=data.eid,
      inviteList=data.inviteList,
      invitePnList=data.invitePnList;
  var user = getUserSession(socket);
  var server = 'http://fzz.bz/';

  async.parallel({
    pnUsers : function(cb){ users.getOrAddPhoneList(invitePnList, cb) },
    e : function(cb){ events.get(eid, cb) }
  },
  function(err, results){
    if (err) return logError(err);
    var e = results.e;
    var newInvitedUsers = inviteList.concat(results.pnUsers);
    // newInvitedUsers = newInvitedUsers.filter(function(u){
    //   return e.inviteList
    // })
    var oldInvitedUsers = e.inviteList;

    events.addInvitees(eid, newInvitedUsers, function(err) {
      if (err) return logError(err);
      var message0 = results.e.messageList[0].text;
      var msgOut = nameShorten(user.name)+':'+message0;
      e.inviteList = e.inviteList.concat(newInvitedUsers); //update local copy.
      emit({ // Emit to people that they are invited.
        eventName: 'newEvent',
        data: {'event' : e},
        recipients: newInvitedUsers
      })
      pushIos({
        msg: nameShorten(user.name)+': '+message0,
        userList : newInvitedUsers,
        eid: eid
      });
      emit({ // Let other people that new people have been invited. 
        eventName: 'newInviteList',
        data: {'eid' : e.eid, inviteList: newInvitedUsers},
        recipients: oldInvitedUsers
      });
      // sms those smsUers who have been invited. 
      output.sendGroupSms(results.pnUsers , eid, function(user) {
        return msgOut+'\nRespond to join the event.\n'+server+user.key;
      });
    });
  });
}

exports.suggestInvitedList = function(data, socket) {
  console.log('suggestInvitedList data:', data);
  return;
}

exports.newMessage = function(data, socket) {
  console.log('newMessage data:', data);
  return;
  check.is(data, {eid: 'posInt', text:'string'});
  var user = getUserSession(socket),
      eid  = data.eid,
      text = data.text;

  async.parallel({
    newMsg        : function(cb) {
      events.addMessage(eid, user.uid, text, cb);
    },
    e : function(cb) {
      events.get(eid, cb);
    }
  },
  function(err, results) {
    var e = results.e;
    var gl = results.e.guestList;
    var il = results.e.inviteList;
    check.is(e, 'event');
    // Emit to everyone connected.
    emit({
      eventName: 'newMessage',
      recipients: results.e.inviteList,
      data: {message: results.newMsg}
    });
    pushIos({
      msg: nameShorten(user.name)+': '+text,
      eid: eid,
      userList: il.filter(function(el){
        return (gl.indexOf(el.uid) >= 0);
      })
    });
    // Sms everyone else who is going. 
    // console.log(results.e.inviteList);
    var smsRecipients = results.e.inviteList.filter(function(u) {
      return (u.type === 'Phone' && e.guestList.indexOf(u.uid) >=0 && u.uid != user.uid);
    });
    var smsMessage = nameShorten( user.name )+':'+text;
    // log(smsMessage)
    output.sendGroupSms(smsRecipients, e.eid, function(u){
      return smsMessage;
    });

  });
}

exports.getMoreMessages = function(data, socket) {
  console.log('getMoreMessages data:', data);
  return;
}

exports.newMarker = function(data, socket) {
  console.log('newMarker: data', data);
  check.is(data, {eid: 'posInt', latlng: 'latlng'});
  return;
}

exports.locationChange = function(data, socket) {
  console.log('locationChange: data', data);
  return;
}
// exports.getFriendList = function(socket) {
//   var user = getUserSession(socket);
//   users.getFriendUserList(user.uid, function(err, userList){
//     if (err) return logError(err);
//     socket.emit('friendList', userList);
//   });
// }

// exports.addFriendList = function(data, socket) {
//   var user = getUserSession(socket);
//   check.is(data, '[posInt]');
//   async.map(data, function(uid, cb) {
//     cb(null, ''+uid);
//   }, 
//   function(err, uidList) {
//     users.addFriendList(user, data.uid, function(err) {
//       if (err) logError(err)
//       else log('Added friends list for '+nameShorten(user.name));
//     });
//   });
// }

// exports.removeFriendList = function(data, socket)  {
//   var user = getUserSession(socket);
//   check.is(data, {'friendList': '[user]' });
//   async.each(data.friendList,
//   function(f, cb){
//     users.removeFriend(user, f.uid, cb);
//   },
//   function(err){
//     if(err)logError(err);
//   });
// }

// exports.setSeatCapacity = function(data, socket) {
//   check.is(data, {eid: 'posInt', seats: 'posInt'});
//   var
//     user  = getUserSession(socket),
//     eid   = data.eid,
//     seats = data.seats;
//   log(nameShorten(user.name)+'set seat capacity','eid: '+eid,'To: '+seats);
//   async.parallel({
//     set: function(cb){  events.setSeatCapacity(eid, seats,cb) },
//     recipients: function(cb){ events.getInviteList(eid, cb) }
//   }, function(err, results) {
//     if(err) return logError(err);
//     var msg = {
//       eid:  eid,
//       text: nameShorten(user.name)+' set seat capacity to '+seats+'.'
//     }
//     var data = {
//       eid: eid,
//       seats: seats
//     }
//     exports.newServerMessage(msg);
//     emit({
//       eventName: 'setSeatCapacity',
//       data: data,
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
  log(nameShorten(user.name)+" has disconnected.")
}

function getUserSession(socket) {
  var user = socket.handshake.user;
  // console.log(user);
  check.is(user, 'user');
  return user;
}

exports.newServerMessage = function(data) {
  check.is(data, {eid: 'posInt', text:'string'});
  var eid  = data.eid, text = data.text;
  async.parallel({
    newMsg: function(cb){ events.addMessage(eid, -1, text, cb) },
    e: function(cb) {events.get(eid, cb) }
  },
  function(err, results) {
    var e = results.e;
    check.is(e, 'event');
    emit({
      eventName: 'newMessage',
      recipients: results.e.inviteList,
      data: {message: results.newMsg}
    });
  });
}