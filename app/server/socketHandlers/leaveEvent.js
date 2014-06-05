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
  console.log('in leave event');
  // check.is(data, {eid: 'posInt'});

  var user = getUserSession(socket);
  var eid = data.eid;
  var uid = user.uid;

  async.parallel({
    leave :    function(cb){ events.leave(eid, uid, cb) },
    invited : function(cb){ events.getInviteList(eid, cb) }
  },
  function (err, results) {
    console.log('done with leave event', !!err, !!cb);
    if (cb) cb (err)
    else if (err) logError(err)
    else if (socket.emit) {
      emit({
        eventName : 'removeGuest',
        data      : { eid: eid, uid: uid },
        recipients: results.invited
      });
    }
  });
}

