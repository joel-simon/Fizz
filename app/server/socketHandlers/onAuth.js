var fb = require('./../fb.js')
var users = require('./../users.js')
var dbstring = 'postgres://Fizz:derptopia@fizzdbinstance.cdzhdhngrg63.us-east-1.rds.amazonaws.com:5432/fizzdb';

function getUserSession(socket) {
  var user = socket.handshake.user;
  check.is(user, 'user');
  return user;
}
/**
 * Handle a socket connection.
 */
module.exports = function(profile, pn, fbToken, phoneToken, cb) {
  console.log('ONAUTH');
  fb.extendToken(fbToken, function(err, longToken) {
    if (err) return cb(err);
    users.getOrAddMember(profile, longToken, pn, 'ios', phoneToken, function(err, user) {
      if(err) cb(err);
      else {
        cb(null, user);
      }
    });
  });
}
