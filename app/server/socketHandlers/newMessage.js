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

function getUserSession(socket) {
  var user = socket.handshake.user;
  // check.is(user, 'user');
  return user;
}
module.exports = function(data, socket, cb) {
  // check.is(data, {eid: 'posInt', text:'string'});
  var user = getUserSession(socket),
      eid  = data.eid,
      text = data.text;

  async.parallel({
    newMsg        : function(cb) {
      events.addMessage(eid, user.uid, text, cb);
    },
    inviteList : function(cb) {
      events.getInviteList(eid, cb);
    }
  },
  function(err, results) {
    var msg = results.newMsg;
    var inviteList = results.inviteList;
    if (err) return cb(err);
    else if (cb) return cb(null);
    var out = {};
    out[eid] = [msg];
    emit({
      eventName: 'newMessages',
      recipients: inviteList,
      "data": {"data":out}
    });
    pushIos({
      msg: nameShorten(user.name)+': '+text,
      eid: eid,
      userList: inviteLists
    });
  });
}