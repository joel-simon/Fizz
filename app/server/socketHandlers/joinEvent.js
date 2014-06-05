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
  check = require('easy-types').addTypes(types),
  pg = require('pg'),
  db = require('./../db.js');
var dbstring = 'postgres://Fizz:derptopia@fizzdbinstance.cdzhdhngrg63.us-east-1.rds.amazonaws.com:5432/fizzdb';
  
function getUserSession(socket) {
  var user = socket.handshake.user;
  // check.is(user, 'user');
  return user;
}
exports.joinEvent = function(data, socket) {
  check.is(data, {eid: 'posInt'});

  var user = getUserSession(socket);
  var eid = data.eid;
  var uid = user.uid;

  async.parallel({
    join :    function(cb){ events.join(eid, uid, cb) },
    invited : function(cb){ events.getInviteList(eid, cb) }
  },
  function (err, results) {
    if (err) return logError(err);
    emit({
      eventName : 'addGuest',
      data      : { eid: eid, uid: uid },
      recipients: results.invited
    });
  });
}