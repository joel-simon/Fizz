var
  events   = require('./../events.js'),
  utils     = require('./../utilities.js'),
  logError  = utils.logError,
  log       = utils.log,
  debug     = utils.debug,
  fb        = require('./../fb.js'),
  users     = require('./../users.js'),
  async     = require('async'),
  output    = require('./../output.js'),
  emit      = output.emit,
  pushIos   = output.pushIos,
  exports = module.exports,
  types = require('./../fizzTypes.js'),
  check = require('easy-types').addTypes(types);
var dbstring = 'postgres://Fizz:derptopia@fizzdbinstance.cdzhdhngrg63.us-east-1.rds.amazonaws.com:5432/fizzdb';

var nameShorten = utils.nameShorten;
function getUserSession(socket) {
  var user = socket.handshake.user;
  check.is(user, 'user');
  return user;
}
module.exports = function(data, socket, cb) {
  check.is(data, {
    eid: 'posInt',
    inviteList: '[user]'
    // invitePnList: 'array'
  });

  var eid = data.eid;
  var newInvites = data.inviteList;
  // var invitePnList = data.invitePnList;
  var user = getUserSession(socket);

  async.parallel({
    // pnUsers : function(cb){ users.getOrAddPNList(invitePnList, cb) },
    invited : function(cb){ events.getInviteList(eid, cb) },
    messages: function(cb){ events.getMoreMessages(eid, 0, cb) },
    e: function(cb) {events.get(eid, cb)} 
  },
  function(err, results) {
    if (err) return console.log('ERR:', err);
    var messages = results.messages;
    var e = results.e;
    var oldInvites = results.invited;
    // var newInvitedUsers = inviteList.concat(results.pnUsers);

    
    events.addInvites(eid, user.uid, newInvites, true, function(err) {
      if (err) return logError(err);
      var msgOut = nameShorten(user.name)+' has invited you to: '+messages[0].text;
      
      var inviteList = oldInvites.concat(newInvites);
      if (cb) cb();
      // Emit to people that they are invited.
      // emit({ 
      //   eventName: 'newEvents',
      //   data: [{
      //     eid : e.eid,
      //     creator : e.creator,
      //     creationTime : e.creation_time,
      //     messages : messages
      //   }],
      //   recipients: newInvites
      // })
      
      // // Push to people that they are invited.
      // pushIos({
      //   msg: msgOut,
      //   userList : newInvites,
      //   eid: eid
      // });

      // var data = {}
      // data[e.eid] = inviteList;
      // emit({ // Let other people that new people have been invited. 
      //   eventName: 'updateInvitees',
      //   data: data,
      //   recipients: inviteList
      // });
      // sms those smsUers who have been invited. 
      // output.sendGroupSms(results.pnUsers , eid, function(user) {
      //   return msgOut+'\nRespond to join the event.\n'+server+user.key;
      // });
    });
  });
}
